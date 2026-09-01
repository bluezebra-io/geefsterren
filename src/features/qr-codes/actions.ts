'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';

import { writeAuditLog } from '@/features/audit/service';
import { requireActor } from '@/features/auth/guards';
import { clientEnv } from '@/lib/env';
import { isExpectedError } from '@/lib/errors';
import { describeError, logger } from '@/lib/observability/logger';
import { decryptValue, encryptValue } from '@/lib/security/encryption';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { toFieldErrors } from '@/lib/validation/field-errors';
import { actionErrors } from '@/lib/i18n/errors';
import { actionError, actionOk, type ActionResult } from '@/types/domain';

import { feedbackUrlFor, isValidFeedbackCodeFormat, normalizeFeedbackCode } from './service';
import { generateFeedbackCode, generateQrToken, hashSecret } from './tokens';

const SOURCE_CHANNELS = [
  'packaging',
  'flyer',
  'receipt',
  'counter',
  'table',
  'email',
  'other',
] as const;

const createSchema = z.object({
  locationId: z.uuid(),
  campaignId: z.uuid(),
  sourceChannel: z.enum(SOURCE_CHANNELS),
  label: z.string().trim().max(200).optional(),
});

export type CreatedQrCode = {
  qrCodeId: string;
  /** Returned once, so it can be shown and printed. */
  token: string;
  feedbackCode: string;
  url: string;
};

/**
 * Creates a QR code and returns its secrets once.
 *
 * The row keeps a hash for lookup and a ciphertext for reprinting; the plain
 * values live only in this response and in whatever gets printed.
 */
export async function createQrCodeAction(
  _previous: ActionResult<CreatedQrCode> | null,
  formData: FormData,
): Promise<ActionResult<CreatedQrCode>> {
  const parsed = createSchema.safeParse({
    locationId: formData.get('locationId'),
    campaignId: formData.get('campaignId'),
    sourceChannel: formData.get('sourceChannel'),
    label: formData.get('label') || undefined,
  });

  if (!parsed.success) {
    return actionError((await actionErrors()).checkForm, toFieldErrors(parsed.error));
  }

  const input = parsed.data;

  try {
    await requireActor();

    const token = generateQrToken();
    const feedbackCode = generateFeedbackCode();

    const supabase = await createSupabaseServerClient();

    // The organization is read from the campaign, never taken from the form, and
    // the RLS insert policy checks `can_manage_location` on top of that.
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('id, organization_id, location_id')
      .eq('id', input.campaignId)
      .eq('location_id', input.locationId)
      .maybeSingle();

    if (campaignError) throw campaignError;
    if (!campaign) return actionError('That campaign does not belong to this location');

    const { data, error } = await supabase
      .from('qr_codes')
      .insert({
        organization_id: campaign.organization_id,
        location_id: campaign.location_id,
        campaign_id: campaign.id,
        token_hash: hashSecret(token),
        feedback_code_hash: hashSecret(feedbackCode),
        token_encrypted: encryptValue(token),
        feedback_code_encrypted: encryptValue(feedbackCode),
        source_channel: input.sourceChannel,
        label: input.label || null,
      })
      .select('id')
      .single();

    if (error) throw error;

    await writeAuditLog({
      action: 'qr_code.created',
      entityType: 'qr_code',
      entityId: data.id,
      organizationId: campaign.organization_id,
      locationId: campaign.location_id,
      // Never the token or the code: an audit row is not a place to leak a
      // credential that is otherwise only stored hashed and encrypted.
      after: { source_channel: input.sourceChannel, label: input.label ?? null },
    });

    /*
     * Deliberately no `revalidatePath` here.
     *
     * Revalidating replaces the RSC payload for this route, which discards the
     * `useActionState` result — and that result is the only place the plain token
     * and code ever exist. Refreshing the list is worth less than showing the
     * secret the operator has to write down, so the list catches up on the next
     * navigation instead.
     */
    return actionOk({
      qrCodeId: data.id,
      token,
      feedbackCode,
      url: feedbackUrlFor(clientEnv().NEXT_PUBLIC_REVIEW_URL, token),
    });
  } catch (error) {
    if (isExpectedError(error)) return actionError(error.message);
    logger.error('qr code creation failed', {
      location_id: input.locationId,
      ...describeError(error),
    });
    return actionError((await actionErrors()).qrCreate);
  }
}

const rotateSchema = z.object({ qrCodeId: z.uuid(), locationId: z.uuid() });

/**
 * Issues a fresh token and code for an existing QR record.
 *
 * Needed for two real cases: a sticker whose secrets were never stored
 * encrypted (the seeded demo rows), and a printed code that has to be
 * invalidated. The old token stops working the moment this returns, so the
 * printed material it is on becomes dead.
 */
export async function rotateQrCodeAction(
  _previous: ActionResult<CreatedQrCode> | null,
  formData: FormData,
): Promise<ActionResult<CreatedQrCode>> {
  const parsed = rotateSchema.safeParse({
    qrCodeId: formData.get('qrCodeId'),
    locationId: formData.get('locationId'),
  });
  if (!parsed.success) return actionError((await actionErrors()).invalidRequest);

  try {
    await requireActor();

    const token = generateQrToken();
    const feedbackCode = generateFeedbackCode();
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from('qr_codes')
      .update({
        token_hash: hashSecret(token),
        feedback_code_hash: hashSecret(feedbackCode),
        token_encrypted: encryptValue(token),
        feedback_code_encrypted: encryptValue(feedbackCode),
      })
      .eq('id', parsed.data.qrCodeId)
      .select('id, organization_id, location_id')
      .maybeSingle();

    if (error) throw error;
    if (!data) return actionError((await actionErrors()).noPermission);

    await writeAuditLog({
      action: 'qr_code.rotated',
      entityType: 'qr_code',
      entityId: data.id,
      organizationId: data.organization_id,
      locationId: data.location_id,
      metadata: { reason: 'reissued from the portal' },
    });

    // Same reason as above: revalidating would wipe the secrets this returns.
    return actionOk({
      qrCodeId: data.id,
      token,
      feedbackCode,
      url: feedbackUrlFor(clientEnv().NEXT_PUBLIC_REVIEW_URL, token),
    });
  } catch (error) {
    if (isExpectedError(error)) return actionError(error.message);
    logger.error('qr code rotation failed', { ...describeError(error) });
    return actionError((await actionErrors()).qrRotate);
  }
}

/* ------------------------------------------------- public code resolution --- */

export type FeedbackCodeState = 'idle' | 'invalid';

/**
 * Resolves a hand-typed feedback code and sends the guest into the flow.
 *
 * The answer is deliberately uniform. A malformed code, an expired campaign, a
 * paused QR and a code that never existed all produce the same message, so the
 * form cannot be used to enumerate which campaigns exist or when they ran. That
 * is why there is no "this code has expired" branch.
 */
export async function resolveFeedbackCodeAction(
  _previous: FeedbackCodeState | null,
  formData: FormData,
): Promise<FeedbackCodeState> {
  const raw = formData.get('code');
  if (typeof raw !== 'string') return 'invalid';

  const code = normalizeFeedbackCode(raw);
  if (!isValidFeedbackCodeFormat(code)) return 'invalid';

  const token = await lookupTokenForCode(code);
  if (!token) return 'invalid';

  redirect(feedbackUrlFor(clientEnv().NEXT_PUBLIC_REVIEW_URL, token));
}

/**
 * Looks up the URL token for a printed feedback code.
 *
 * Matches on the code's hash, then decrypts the stored token so the guest can be
 * sent to the same URL a scan would have opened. Uses the service-role client
 * because the caller is anonymous — this is one of the two paths that legitimately
 * needs it.
 *
 * A code alone is weaker than a scan (about 40 bits), so this must stay rate
 * limited; that lands with the abuse controls.
 */
async function lookupTokenForCode(code: string): Promise<string | null> {
  const admin = createSupabaseAdminClient();
  const now = new Date().toISOString();

  const { data, error } = await admin
    .from('qr_codes')
    .select('id, token_encrypted, status, active_from, active_until, campaigns(status)')
    .eq('feedback_code_hash', hashSecret(code))
    .maybeSingle();

  if (error) {
    logger.warn('feedback code lookup failed', { ...describeError(error) });
    return null;
  }

  // Every rejection below returns the same null, so the caller cannot tell an
  // unknown code from a paused campaign.
  if (!data) return null;
  if (data.status !== 'active') return null;
  if (data.active_from > now) return null;
  if (data.active_until !== null && data.active_until <= now) return null;
  if (data.campaigns?.status !== 'active') return null;
  if (!data.token_encrypted) return null;

  try {
    return decryptValue(data.token_encrypted);
  } catch (decryptionError) {
    logger.error('stored qr token could not be decrypted', {
      qr_code_id: data.id,
      ...describeError(decryptionError),
    });
    return null;
  }
}

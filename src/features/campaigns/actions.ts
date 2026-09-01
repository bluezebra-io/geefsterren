'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { writeAuditLog } from '@/features/audit/service';
import { requireActor } from '@/features/auth/guards';
import { ConflictError, isExpectedError, isTransientDatabaseError, NotFoundError } from '@/lib/errors';
import { describeError, logger } from '@/lib/observability/logger';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { toFieldErrors } from '@/lib/validation/field-errors';
import { actionErrors } from '@/lib/i18n/errors';
import { actionError, actionOk, type ActionResult } from '@/types/domain';

const createSchema = z.object({
  locationId: z.uuid(),
  name: z.string().trim().min(1, 'Enter a name').max(200),
  questionnaireVersionId: z.uuid(),
  /** Active straight away is the common case; a draft is for preparing ahead. */
  activate: z.coerce.boolean().optional(),
});

const setStatusSchema = z.object({
  campaignId: z.uuid(),
  locationId: z.uuid(),
  status: z.enum(['draft', 'active', 'paused', 'completed']),
});

/**
 * Creates a campaign for a location.
 *
 * A campaign is what a QR code points at, so this is the step that has to exist
 * before a sticker can be printed. The organization is read from the location
 * rather than the form, and the RLS insert policy checks `can_manage_location` on
 * top of that — so a location manager can run their own campaigns.
 */
export async function createCampaignAction(
  _previous: ActionResult<{ campaignId: string }> | null,
  formData: FormData,
): Promise<ActionResult<{ campaignId: string }>> {
  const parsed = createSchema.safeParse({
    locationId: formData.get('locationId'),
    name: formData.get('name'),
    questionnaireVersionId: formData.get('questionnaireVersionId'),
    activate: formData.get('activate') === 'on',
  });

  if (!parsed.success) {
    return actionError((await actionErrors()).checkForm, toFieldErrors(parsed.error));
  }

  const input = parsed.data;

  try {
    await requireActor();
    const supabase = await createSupabaseServerClient();

    const { data: location, error: locationError } = await supabase
      .from('locations')
      .select('id, organization_id')
      .eq('id', input.locationId)
      .maybeSingle();

    if (locationError) throw locationError;
    if (!location) throw new NotFoundError((await actionErrors()).notFound);

    // A draft questionnaire could still change, which would move the ground under
    // answers already given, so only published versions are accepted.
    const { data: version, error: versionError } = await supabase
      .from('questionnaire_versions')
      .select('id, status')
      .eq('id', input.questionnaireVersionId)
      .maybeSingle();

    if (versionError) throw versionError;
    if (!version) throw new NotFoundError((await actionErrors()).notFound);
    if (version.status !== 'published') {
      throw new ConflictError((await actionErrors()).campaignQuestionnaireNotPublished);
    }

    const { data, error } = await supabase
      .from('campaigns')
      .insert({
        organization_id: location.organization_id,
        location_id: location.id,
        name: input.name,
        questionnaire_version_id: input.questionnaireVersionId,
        status: input.activate ? 'active' : 'draft',
        starts_at: input.activate ? new Date().toISOString() : null,
      })
      .select('id')
      .single();

    if (error) throw error;

    await writeAuditLog({
      action: 'campaign.created',
      entityType: 'campaign',
      entityId: data.id,
      organizationId: location.organization_id,
      locationId: location.id,
      after: { name: input.name, status: input.activate ? 'active' : 'draft' },
    });

    revalidatePath(`/app/locations/${input.locationId}/campaigns`);
    revalidatePath(`/app/locations/${input.locationId}/qr-codes`);
    return actionOk({ campaignId: data.id });
  } catch (error) {
    if (isExpectedError(error)) return actionError(error.message);
    if (isTransientDatabaseError(error)) {
      logger.warn('transient database error', { ...describeError(error) });
      return actionError((await actionErrors()).temporary);
    }
    logger.error('campaign creation failed', {
      location_id: input.locationId,
      ...describeError(error),
    });
    return actionError((await actionErrors()).campaignCreate);
  }
}

/**
 * Activates, pauses or completes a campaign.
 *
 * A paused campaign stops new sessions: `resolveQrToken` refuses anything whose
 * campaign is not active, so its QR codes go quiet without being reprinted.
 */
export async function setCampaignStatusAction(
  _previous: ActionResult<void> | null,
  formData: FormData,
): Promise<ActionResult<void>> {
  const parsed = setStatusSchema.safeParse({
    campaignId: formData.get('campaignId'),
    locationId: formData.get('locationId'),
    status: formData.get('status'),
  });
  if (!parsed.success) return actionError((await actionErrors()).invalidRequest);

  try {
    await requireActor();
    const supabase = await createSupabaseServerClient();

    const { data: before, error: readError } = await supabase
      .from('campaigns')
      .select('id, organization_id, location_id, status')
      .eq('id', parsed.data.campaignId)
      .maybeSingle();

    if (readError) throw readError;
    if (!before) throw new NotFoundError((await actionErrors()).notFound);

    const { data, error } = await supabase
      .from('campaigns')
      .update({
        status: parsed.data.status,
        // Stamp the start the first time it goes live, so reporting has a real
        // beginning rather than the row's creation date.
        ...(parsed.data.status === 'active' ? { starts_at: new Date().toISOString() } : {}),
      })
      .eq('id', parsed.data.campaignId)
      .select('id')
      .maybeSingle();

    if (error) throw error;
    if (!data) return actionError((await actionErrors()).noPermission);

    await writeAuditLog({
      action: 'campaign.status_changed',
      entityType: 'campaign',
      entityId: parsed.data.campaignId,
      organizationId: before.organization_id,
      locationId: before.location_id,
      before: { status: before.status },
      after: { status: parsed.data.status },
    });

    revalidatePath(`/app/locations/${parsed.data.locationId}/campaigns`);
    return actionOk();
  } catch (error) {
    if (isExpectedError(error)) return actionError(error.message);
    if (isTransientDatabaseError(error)) {
      logger.warn('transient database error', { ...describeError(error) });
      return actionError((await actionErrors()).temporary);
    }
    logger.error('campaign status change failed', { ...describeError(error) });
    return actionError((await actionErrors()).campaignStatus);
  }
}

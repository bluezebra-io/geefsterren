'use server';

import { redirect } from 'next/navigation';

import { clientEnv } from '@/lib/env';
import { logger } from '@/lib/observability/logger';

import { feedbackUrlFor, isValidFeedbackCodeFormat, normalizeFeedbackCode } from './service';

export type FeedbackCodeState = 'idle' | 'invalid';

/**
 * Resolves a hand-typed feedback code and sends the guest into the flow.
 *
 * The response is deliberately uniform. A malformed code, an expired campaign,
 * a paused QR and a code that never existed all produce the same message, so
 * the form cannot be used to enumerate which campaigns exist or when they ran.
 * That is why there is no "this code has expired" branch — it would leak
 * exactly what the neutral message protects.
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
 * Not implemented yet: `qr_codes` arrives with Phase 2, and until a campaign
 * exists there is genuinely no code that could resolve. Returning null means
 * the form shows its normal neutral message instead of pretending to work.
 *
 * Phase 2 replaces the body with a hashed lookup — the code is stored hashed,
 * like the token — plus checks that the QR record is active and its campaign is
 * running. Nothing above this function has to change.
 */
async function lookupTokenForCode(code: string): Promise<string | null> {
  // The code itself is never logged: it is a credential for one guest session.
  logger.info('feedback code lookup', { code_length: code.length, resolved: false });
  return null;
}

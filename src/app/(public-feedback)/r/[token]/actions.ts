'use server';

import { headers } from 'next/headers';
import { z } from 'zod';

import { resolveQrToken } from '@/features/feedback/resolve';
import { submitFeedback } from '@/features/feedback/submit';

export type GuestSubmitState =
  | { status: 'idle' }
  | { status: 'done'; score: number }
  | { status: 'invalid' }
  | { status: 'failed' };

const schema = z.object({
  token: z.string().min(4).max(64),
  overallScore: z.coerce.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
  idempotencyKey: z.string().min(8).max(200),
});

/**
 * Submits a guest's feedback.
 *
 * The token is re-resolved here rather than trusted from the form: a hidden field
 * is attacker-controlled, and the whole campaign, location and questionnaire come
 * off the back of it.
 *
 * The idempotency key is generated in the browser when the form is first
 * rendered, so a double tap sends the same key twice and the second insert loses
 * to a unique constraint.
 */
export async function submitGuestFeedbackAction(
  _previous: GuestSubmitState | null,
  formData: FormData,
): Promise<GuestSubmitState> {
  const selections: Record<string, string[]> = {};
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith('q:') || typeof value !== 'string') continue;
    const questionKey = key.slice(2);
    (selections[questionKey] ??= []).push(value);
  }

  const parsed = schema.safeParse({
    token: formData.get('token'),
    overallScore: formData.get('overallScore'),
    comment: formData.get('comment') || undefined,
    idempotencyKey: formData.get('idempotencyKey'),
  });

  if (!parsed.success) return { status: 'invalid' };

  const context = await resolveQrToken(parsed.data.token);
  if (!context) return { status: 'invalid' };

  const headerList = await headers();

  const result = await submitFeedback({
    context,
    overallScore: parsed.data.overallScore,
    selections,
    comment: parsed.data.comment?.trim() ? parsed.data.comment.trim() : null,
    idempotencyKey: parsed.data.idempotencyKey,
    // Behind Vercel the client address is in x-forwarded-for; both are hashed
    // before storage.
    ipAddress: headerList.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null,
    userAgent: headerList.get('user-agent'),
  });

  if (result.status === 'failed') return { status: 'failed' };

  // A duplicate is a success from the guest's side: their feedback did arrive.
  return { status: 'done', score: parsed.data.overallScore };
}

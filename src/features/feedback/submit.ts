import 'server-only';

import { createHash } from 'node:crypto';

import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import type { Json } from '@/types/database.generated';
import { describeError, logger } from '@/lib/observability/logger';

import { questionsForScore, type ResolvedQrContext } from './resolve';

/**
 * Writing a submission.
 *
 * Two properties matter more than anything else here:
 *
 * 1. **Idempotency.** A double tap on "send" must not produce two submissions.
 *    The session's `idempotency_key` is unique, so the second attempt loses the
 *    race at the database rather than in application logic.
 *
 * 2. **Only answers the questionnaire actually asked.** Answers are filtered
 *    through the same evaluator the flow rendered with, so a hand-crafted POST
 *    cannot slip in an answer to a question this respondent never saw — which
 *    would otherwise quietly distort the aggregate for that question.
 */

export type SubmitInput = {
  context: ResolvedQrContext;
  overallScore: number;
  /** Selected option keys per question key. */
  selections: Record<string, string[]>;
  comment: string | null;
  idempotencyKey: string;
  ipAddress: string | null;
  userAgent: string | null;
};

export type SubmitResult =
  | { status: 'created'; submissionId: string }
  | { status: 'duplicate' }
  | { status: 'failed' };

/** Hashed, never stored raw: an IP is personal data we only ever compare. */
function hashOrNull(value: string | null): string | null {
  return value ? createHash('sha256').update(value, 'utf8').digest('hex') : null;
}

export async function submitFeedback(input: SubmitInput): Promise<SubmitResult> {
  const admin = createSupabaseAdminClient();
  const { context } = input;

  if (input.overallScore < 1 || input.overallScore > 5 || !Number.isInteger(input.overallScore)) {
    return { status: 'failed' };
  }

  const now = new Date();
  const startedAt = now.toISOString();

  const { data: session, error: sessionError } = await admin
    .from('feedback_sessions')
    .insert({
      organization_id: context.organizationId,
      location_id: context.locationId,
      campaign_id: context.campaignId,
      qr_code_id: context.qrCodeId,
      status: 'completed',
      started_at: startedAt,
      completed_at: startedAt,
      expires_at: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(),
      ip_hash: hashOrNull(input.ipAddress),
      user_agent_hash: hashOrNull(input.userAgent),
      idempotency_key: input.idempotencyKey,
    })
    .select('id')
    .single();

  if (sessionError) {
    // 23505 is a unique violation, which here means this exact submission already
    // landed. That is a success from the guest's point of view, not an error.
    if (sessionError.code === '23505') return { status: 'duplicate' };
    logger.error('feedback session insert failed', {
      location_id: context.locationId,
      ...describeError(sessionError),
    });
    return { status: 'failed' };
  }

  const { data: submission, error: submissionError } = await admin
    .from('feedback_submissions')
    .insert({
      feedback_session_id: session.id,
      organization_id: context.organizationId,
      location_id: context.locationId,
      campaign_id: context.campaignId,
      questionnaire_version_id: context.questionnaireVersionId,
      overall_score: input.overallScore,
      free_text_comment: input.comment,
      submitted_at: startedAt,
    })
    .select('id')
    .single();

  if (submissionError) {
    logger.error('feedback submission insert failed', {
      location_id: context.locationId,
      ...describeError(submissionError),
    });
    return { status: 'failed' };
  }

  // Only the questions this score actually reaches.
  const visible = questionsForScore(context.questions, input.overallScore, input.selections);
  const visibleByKey = new Map(visible.map((question) => [question.questionKey, question]));

  const rows: Array<{
    feedback_submission_id: string;
    organization_id: string;
    question_id: string;
    selected_option_id: string | null;
    answer_json: Json;
  }> = [];

  for (const question of visible) {
    if (question.questionType === 'rating') {
      rows.push({
        feedback_submission_id: submission.id,
        organization_id: context.organizationId,
        question_id: question.id,
        selected_option_id: null,
        answer_json: { rating: input.overallScore },
      });
      continue;
    }

    if (question.questionType === 'long_text' || question.questionType === 'short_text') {
      if (input.comment) {
        rows.push({
          feedback_submission_id: submission.id,
          organization_id: context.organizationId,
          question_id: question.id,
          selected_option_id: null,
          answer_json: { text: input.comment },
        });
      }
      continue;
    }

    const chosen = input.selections[question.questionKey] ?? [];
    for (const optionKey of chosen) {
      const option = question.options.find((candidate) => candidate.optionKey === optionKey);
      // An unknown option key is dropped rather than stored: it can only come
      // from a forged request, and a fabricated option would corrupt the counts.
      if (!option) continue;
      rows.push({
        feedback_submission_id: submission.id,
        organization_id: context.organizationId,
        question_id: question.id,
        selected_option_id: option.id,
        answer_json: null,
      });
    }
  }

  // Answers offered for questions this respondent never saw are ignored, not
  // rejected: the submission itself is still valid and worth keeping.
  const ignored = Object.keys(input.selections).filter((key) => !visibleByKey.has(key));
  if (ignored.length > 0) {
    logger.warn('answers for questions that were not asked were ignored', {
      location_id: context.locationId,
      ignored_count: ignored.length,
    });
  }

  if (rows.length > 0) {
    const { error: answerError } = await admin.from('feedback_answers').insert(rows);
    if (answerError) {
      logger.error('feedback answers insert failed', {
        location_id: context.locationId,
        ...describeError(answerError),
      });
      // The submission stands; losing the detail rows is worse than nothing but
      // better than discarding the score too.
    }
  }

  await admin.rpc('increment_qr_scan', { p_qr_code_id: context.qrCodeId }).then(
    () => undefined,
    (scanError: unknown) =>
      logger.warn('scan counter not incremented', { ...describeError(scanError) }),
  );

  return { status: 'created', submissionId: submission.id };
}

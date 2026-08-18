import 'server-only';

import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { hashSecret } from '@/features/qr-codes/tokens';
import { selectVisibleQuestions, type QuestionForEvaluation } from '@/features/questionnaires/service';
import { describeError, logger } from '@/lib/observability/logger';

/**
 * Resolving a QR token into everything the guest flow needs.
 *
 * Uses the service-role client because the caller is anonymous — `anon` has no
 * policies on any of these tables, by design. This is one of the two paths that
 * legitimately needs it, and it is why the resolution lives in one audited module
 * instead of being spread across policies.
 *
 * Every refusal returns the same null. A paused campaign, an expired QR, an
 * unknown token and a location without a questionnaire are indistinguishable from
 * outside, so the URL cannot be used to map which campaigns exist.
 */

export type ResolvedQuestion = {
  id: string;
  questionKey: string;
  label: string;
  helpText: string | null;
  questionType: string;
  required: boolean;
  displayOrder: number;
  conditionJson: unknown;
  options: Array<{ id: string; optionKey: string; label: string }>;
};

export type ResolvedQrContext = {
  qrCodeId: string;
  organizationId: string;
  locationId: string;
  locationName: string;
  locationCity: string | null;
  campaignId: string;
  campaignName: string;
  questionnaireVersionId: string;
  questions: ResolvedQuestion[];
};

type AddressJson = { city?: string } | null;

export async function resolveQrToken(token: string): Promise<ResolvedQrContext | null> {
  const admin = createSupabaseAdminClient();
  const now = new Date().toISOString();

  const { data: qr, error } = await admin
    .from('qr_codes')
    .select(
      `id, organization_id, location_id, campaign_id, status, active_from, active_until,
       campaigns(id, name, status, starts_at, ends_at, questionnaire_version_id),
       locations(name, status, address_json)`,
    )
    .eq('token_hash', hashSecret(token))
    .maybeSingle();

  if (error) {
    logger.error('qr token resolution failed', { ...describeError(error) });
    return null;
  }

  if (!qr) return null;
  if (qr.status !== 'active') return null;
  if (qr.active_from > now) return null;
  if (qr.active_until !== null && qr.active_until <= now) return null;

  const campaign = qr.campaigns;
  const location = qr.locations;
  if (!campaign || !location) return null;
  if (campaign.status !== 'active') return null;
  if (location.status !== 'active') return null;
  if (campaign.starts_at !== null && campaign.starts_at > now) return null;
  if (campaign.ends_at !== null && campaign.ends_at <= now) return null;

  const { data: questions, error: questionError } = await admin
    .from('questions')
    .select('id, question_key, label, help_text, question_type, required, display_order, condition_json')
    .eq('questionnaire_version_id', campaign.questionnaire_version_id)
    .order('display_order');

  if (questionError) {
    logger.error('questionnaire load failed', { ...describeError(questionError) });
    return null;
  }

  /*
   * Options are fetched separately rather than embedded.
   *
   * `question_options` reaches `questions` through a *composite* foreign key
   * (question_id, organization_id). For a platform template organization_id is
   * NULL on both sides, and NULL never equals NULL — so the embed silently
   * returned zero options and the guest saw a follow-up question with no answers
   * to choose from. Two queries and a join in code cannot go quiet like that.
   */
  const questionIds = (questions ?? []).map((question) => question.id);
  const { data: options, error: optionError } = questionIds.length
    ? await admin
        .from('question_options')
        .select('id, question_id, option_key, label, display_order')
        .in('question_id', questionIds)
        .order('display_order')
    : { data: [], error: null };

  if (optionError) {
    logger.error('question options load failed', { ...describeError(optionError) });
    return null;
  }

  const optionsByQuestion = new Map<string, ResolvedQuestion['options']>();
  for (const option of options ?? []) {
    const list = optionsByQuestion.get(option.question_id) ?? [];
    list.push({ id: option.id, optionKey: option.option_key, label: option.label });
    optionsByQuestion.set(option.question_id, list);
  }

  // A campaign pointing at a questionnaire with no questions would open a flow
  // that asks nothing. The publish trigger prevents it; refusing here too means a
  // hand-edited row cannot produce a broken guest experience.
  if (!questions || questions.length === 0) return null;

  const address = location.address_json as AddressJson;

  return {
    qrCodeId: qr.id,
    organizationId: qr.organization_id,
    locationId: qr.location_id,
    locationName: location.name,
    locationCity: address?.city ?? null,
    campaignId: campaign.id,
    campaignName: campaign.name,
    questionnaireVersionId: campaign.questionnaire_version_id,
    questions: questions.map((question) => ({
      id: question.id,
      questionKey: question.question_key,
      label: question.label,
      helpText: question.help_text,
      questionType: question.question_type,
      required: question.required,
      displayOrder: question.display_order,
      conditionJson: question.condition_json,
      options: optionsByQuestion.get(question.id) ?? [],
    })),
  };
}

/**
 * The questions to show for a given score, using the shared evaluator so the
 * guest flow and any preview cannot disagree about the branching.
 */
export function questionsForScore(
  questions: ResolvedQuestion[],
  overallScore: number | null,
  answers: Record<string, string[] | null> = {},
): ResolvedQuestion[] {
  const forEvaluation: Array<QuestionForEvaluation & ResolvedQuestion> = questions.map((q) => ({
    ...q,
  }));

  return selectVisibleQuestions(forEvaluation, { overallScore, answers });
}

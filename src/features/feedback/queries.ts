import 'server-only';

import { createSupabaseServerClient } from '@/lib/supabase/server';

/**
 * Reads for feedback results.
 *
 * Every number comes from the SQL functions in migration 0011, so a table, an
 * export and a chart cannot drift apart — and RLS applies to the caller, which
 * means a location manager asking about somebody else's location gets nothing
 * rather than an aggregate they should not see.
 */

export type LocationMetrics = {
  responseCount: number;
  averageScore: number | null;
  lowScorePercentage: number | null;
  sessionCount: number;
  completionPercentage: number | null;
  distribution: Array<{ score: 1 | 2 | 3 | 4 | 5; count: number }>;
};

export async function getLocationMetrics(
  locationId: string,
  from?: Date,
  to?: Date,
): Promise<LocationMetrics> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .rpc('location_period_metrics', {
      p_location_id: locationId,
      p_from: from?.toISOString() ?? undefined,
      p_to: to?.toISOString() ?? undefined,
    })
    .single();

  if (error) throw error;

  return {
    responseCount: Number(data.response_count ?? 0),
    averageScore: data.average_score === null ? null : Number(data.average_score),
    lowScorePercentage:
      data.low_score_percentage === null ? null : Number(data.low_score_percentage),
    sessionCount: Number(data.session_count ?? 0),
    completionPercentage:
      data.completion_percentage === null ? null : Number(data.completion_percentage),
    distribution: [
      { score: 1, count: Number(data.score_1 ?? 0) },
      { score: 2, count: Number(data.score_2 ?? 0) },
      { score: 3, count: Number(data.score_3 ?? 0) },
      { score: 4, count: Number(data.score_4 ?? 0) },
      { score: 5, count: Number(data.score_5 ?? 0) },
    ],
  };
}

export type QuestionResult = {
  questionId: string;
  questionKey: string;
  label: string;
  questionType: string;
  category: string | null;
  displayOrder: number;
  respondentCount: number;
  averageRating: number | null;
  options: Array<{
    optionId: string;
    optionKey: string;
    label: string;
    count: number;
    share: number | null;
  }>;
};

/**
 * Results per question.
 *
 * The SQL returns one row per question/option pair; this folds it into one entry
 * per question. Grouping in SQL with `json_agg` would work too, but a flat result
 * keeps the function usable from a CSV export without unpacking JSON.
 */
export async function getQuestionResults(
  locationId: string,
  from?: Date,
  to?: Date,
): Promise<QuestionResult[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc('question_results', {
    p_location_id: locationId,
    p_from: from?.toISOString() ?? undefined,
    p_to: to?.toISOString() ?? undefined,
  });

  if (error) throw error;

  const byQuestion = new Map<string, QuestionResult>();

  for (const row of data ?? []) {
    let entry = byQuestion.get(row.question_id);

    if (!entry) {
      entry = {
        questionId: row.question_id,
        questionKey: row.question_key,
        label: row.question_label,
        questionType: row.question_type,
        category: row.category,
        displayOrder: row.display_order,
        respondentCount: Number(row.respondent_count ?? 0),
        averageRating: row.average_rating === null ? null : Number(row.average_rating),
        options: [],
      };
      byQuestion.set(row.question_id, entry);
    }

    if (row.option_id) {
      entry.options.push({
        optionId: row.option_id,
        optionKey: row.option_key ?? '',
        label: row.option_label ?? '',
        count: Number(row.option_count ?? 0),
        share: row.option_share === null ? null : Number(row.option_share),
      });
    }
  }

  return [...byQuestion.values()].sort((a, b) => a.displayOrder - b.displayOrder);
}

export type RecentComment = {
  submissionId: string;
  score: number;
  comment: string;
  submittedAt: string;
};

export async function getRecentComments(
  locationId: string,
  limit = 8,
): Promise<RecentComment[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('feedback_submissions')
    .select('id, overall_score, free_text_comment, submitted_at')
    .eq('location_id', locationId)
    .not('free_text_comment', 'is', null)
    .order('submitted_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data ?? [])
    .filter((row): row is typeof row & { free_text_comment: string } => row.free_text_comment !== null)
    .map((row) => ({
      submissionId: row.id,
      score: row.overall_score,
      comment: row.free_text_comment,
      submittedAt: row.submitted_at,
    }));
}

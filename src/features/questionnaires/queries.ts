import 'server-only';

import { NotFoundError } from '@/lib/errors';

import { getVersionLabels } from './labels';
import { createSupabaseServerClient } from '@/lib/supabase/server';

/**
 * Reads for questionnaire management.
 *
 * Options are fetched in their own query rather than embedded. `question_options`
 * reaches `questions` through a composite foreign key that includes the nullable
 * `organization_id`, and for a platform template that column is NULL on both
 * sides — NULL never equals NULL, so the embed silently returns nothing.
 */

export type QuestionnaireSummary = {
  templateId: string;
  name: string;
  description: string | null;
  industry: string | null;
  /** null means a platform template, shared with every organization. */
  organizationId: string | null;
  versions: Array<{
    id: string;
    versionNumber: number;
    status: 'draft' | 'published' | 'archived';
    publishedAt: string | null;
    questionCount: number;
    assignedLocationCount: number;
    assignedOrgWide: boolean;
  }>;
};

export async function listQuestionnaires(organizationId: string): Promise<QuestionnaireSummary[]> {
  const supabase = await createSupabaseServerClient();

  // RLS already limits templates to this organization's own plus the platform
  // ones, so no organization filter is needed — and adding one would hide the
  // platform templates an operator is meant to be able to start from.
  const [templates, versions, questions, assignments] = await Promise.all([
    supabase.from('questionnaire_templates').select('*').eq('status', 'active').order('name'),
    supabase
      .from('questionnaire_versions')
      .select('id, questionnaire_template_id, version_number, status, published_at')
      .order('version_number', { ascending: false }),
    supabase.from('questions').select('id, questionnaire_version_id'),
    supabase
      .from('location_questionnaire_assignments')
      .select('questionnaire_version_id, location_id, status')
      .eq('organization_id', organizationId)
      .eq('status', 'active'),
  ]);

  if (templates.error) throw templates.error;
  if (versions.error) throw versions.error;
  if (questions.error) throw questions.error;
  if (assignments.error) throw assignments.error;

  const questionCounts = new Map<string, number>();
  for (const question of questions.data ?? []) {
    questionCounts.set(
      question.questionnaire_version_id,
      (questionCounts.get(question.questionnaire_version_id) ?? 0) + 1,
    );
  }

  const locationCounts = new Map<string, number>();
  const orgWide = new Set<string>();
  for (const assignment of assignments.data ?? []) {
    if (assignment.location_id === null) {
      orgWide.add(assignment.questionnaire_version_id);
    } else {
      locationCounts.set(
        assignment.questionnaire_version_id,
        (locationCounts.get(assignment.questionnaire_version_id) ?? 0) + 1,
      );
    }
  }

  return (templates.data ?? []).map((template) => ({
    templateId: template.id,
    name: template.name,
    description: template.description,
    industry: template.industry,
    organizationId: template.organization_id,
    versions: (versions.data ?? [])
      .filter((version) => version.questionnaire_template_id === template.id)
      .map((version) => ({
        id: version.id,
        versionNumber: version.version_number,
        status: version.status as 'draft' | 'published' | 'archived',
        publishedAt: version.published_at,
        questionCount: questionCounts.get(version.id) ?? 0,
        assignedLocationCount: locationCounts.get(version.id) ?? 0,
        assignedOrgWide: orgWide.has(version.id),
      })),
  }));
}

export type QuestionDetail = {
  id: string;
  questionKey: string;
  label: string;
  helpText: string | null;
  category: string | null;
  questionType: string;
  required: boolean;
  displayOrder: number;
  conditionJson: unknown;
  options: Array<{ id: string; optionKey: string; label: string; displayOrder: number }>;
};

export type QuestionnaireVersionDetail = {
  versionId: string;
  templateId: string;
  templateName: string;
  organizationId: string | null;
  versionNumber: number;
  status: 'draft' | 'published' | 'archived';
  publishedAt: string | null;
  questions: QuestionDetail[];
  assignment: { orgWide: boolean; locationIds: string[] };
};

export async function getQuestionnaireVersion(
  versionId: string,
  organizationId: string,
): Promise<QuestionnaireVersionDetail> {
  const supabase = await createSupabaseServerClient();

  const { data: version, error } = await supabase
    .from('questionnaire_versions')
    .select('id, questionnaire_template_id, organization_id, version_number, status, published_at')
    .eq('id', versionId)
    .maybeSingle();

  if (error) throw error;
  if (!version) throw new NotFoundError('Questionnaire version not found');

  const { data: questions, error: questionError } = await supabase
    .from('questions')
    .select('id, question_key, label, help_text, category, question_type, required, display_order, condition_json')
    .eq('questionnaire_version_id', versionId)
    .order('display_order');

  if (questionError) throw questionError;

  const questionIds = (questions ?? []).map((question) => question.id);
  const { data: options, error: optionError } = questionIds.length
    ? await supabase
        .from('question_options')
        .select('id, question_id, option_key, label, display_order')
        .in('question_id', questionIds)
        .order('display_order')
    : { data: [], error: null };

  if (optionError) throw optionError;

  const optionsByQuestion = new Map<string, QuestionDetail['options']>();
  for (const option of options ?? []) {
    const list = optionsByQuestion.get(option.question_id) ?? [];
    list.push({
      id: option.id,
      optionKey: option.option_key,
      label: option.label,
      displayOrder: option.display_order,
    });
    optionsByQuestion.set(option.question_id, list);
  }

  const { data: assignments, error: assignmentError } = await supabase
    .from('location_questionnaire_assignments')
    .select('location_id')
    .eq('organization_id', organizationId)
    .eq('questionnaire_version_id', versionId)
    .eq('status', 'active');

  if (assignmentError) throw assignmentError;

  return {
    versionId: version.id,
    templateId: version.questionnaire_template_id,
    templateName: (await getVersionLabels()).get(version.id)?.templateName ?? '—',
    organizationId: version.organization_id,
    versionNumber: version.version_number,
    status: version.status as 'draft' | 'published' | 'archived',
    publishedAt: version.published_at,
    questions: (questions ?? []).map((question) => ({
      id: question.id,
      questionKey: question.question_key,
      label: question.label,
      helpText: question.help_text,
      category: question.category,
      questionType: question.question_type,
      required: question.required,
      displayOrder: question.display_order,
      conditionJson: question.condition_json,
      options: optionsByQuestion.get(question.id) ?? [],
    })),
    assignment: {
      orgWide: (assignments ?? []).some((row) => row.location_id === null),
      locationIds: (assignments ?? [])
        .map((row) => row.location_id)
        .filter((id): id is string => id !== null),
    },
  };
}

import 'server-only';

import { formatVersionLabel, getVersionLabels } from '@/features/questionnaires/labels';
import { resolveAssignmentForLocation } from '@/features/questionnaires/service';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export type CampaignRow = {
  id: string;
  name: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
  startsAt: string | null;
  endsAt: string | null;
  questionnaireVersionId: string;
  questionnaireName: string;
  questionnaireVersion: number;
  qrCodeCount: number;
  submissionCount: number;
};

export async function listCampaignsForLocation(locationId: string): Promise<CampaignRow[]> {
  const supabase = await createSupabaseServerClient();

  // Names come from `getVersionLabels`, not from an embed: the questionnaire
  // tables are chained by composite foreign keys with a nullable column, and such
  // an embed silently returns null.
  const [campaigns, qrCodes, submissions, labels] = await Promise.all([
    supabase
      .from('campaigns')
      .select('id, name, status, starts_at, ends_at, questionnaire_version_id')
      .eq('location_id', locationId)
      .order('created_at', { ascending: false }),
    supabase.from('qr_codes').select('campaign_id').eq('location_id', locationId),
    supabase.from('feedback_submissions').select('campaign_id').eq('location_id', locationId),
    getVersionLabels(),
  ]);

  if (campaigns.error) throw campaigns.error;
  if (qrCodes.error) throw qrCodes.error;
  if (submissions.error) throw submissions.error;

  const tally = (rows: Array<{ campaign_id: string }>) => {
    const counts = new Map<string, number>();
    for (const row of rows) counts.set(row.campaign_id, (counts.get(row.campaign_id) ?? 0) + 1);
    return counts;
  };

  const qrCounts = tally(qrCodes.data ?? []);
  const submissionCounts = tally(submissions.data ?? []);

  return (campaigns.data ?? []).map((campaign) => ({
    id: campaign.id,
    name: campaign.name,
    status: campaign.status as CampaignRow['status'],
    startsAt: campaign.starts_at,
    endsAt: campaign.ends_at,
    questionnaireVersionId: campaign.questionnaire_version_id,
    questionnaireName: labels.get(campaign.questionnaire_version_id)?.templateName ?? '—',
    questionnaireVersion: labels.get(campaign.questionnaire_version_id)?.versionNumber ?? 0,
    qrCodeCount: qrCounts.get(campaign.id) ?? 0,
    submissionCount: submissionCounts.get(campaign.id) ?? 0,
  }));
}

export type QuestionnaireChoice = {
  versionId: string;
  label: string;
  /** True for the version currently assigned to this location. */
  assigned: boolean;
};

/**
 * The questionnaires a campaign may use.
 *
 * Only published versions: a draft can still change, and a campaign pointing at
 * one would let the questions shift under answers already collected.
 *
 * The version assigned to this location is marked so the form can preselect it —
 * running a campaign on a questionnaire the location is not set up for is
 * possible but almost never what someone means.
 */
export async function listQuestionnaireChoices(
  organizationId: string,
  locationId: string,
): Promise<QuestionnaireChoice[]> {
  const supabase = await createSupabaseServerClient();

  const [labels, assignments] = await Promise.all([
    getVersionLabels(),
    supabase
      .from('location_questionnaire_assignments')
      .select('questionnaire_version_id, location_id, status, active_from, active_until, id')
      .eq('organization_id', organizationId)
      .eq('status', 'active'),
  ]);

  if (assignments.error) throw assignments.error;

  const active = resolveAssignmentForLocation(
    (assignments.data ?? []).map((row) => ({
      id: row.id,
      locationId: row.location_id,
      questionnaireVersionId: row.questionnaire_version_id,
      status: row.status as 'active' | 'inactive',
      activeFrom: row.active_from,
      activeUntil: row.active_until,
    })),
    locationId,
    new Date(),
  );

  return [...labels.values()]
    .filter((label) => label.status === 'published')
    .sort((a, b) => b.versionNumber - a.versionNumber)
    .map((label) => ({
      versionId: label.versionId,
      label: formatVersionLabel(label),
      assigned: active?.questionnaireVersionId === label.versionId,
    }));
}

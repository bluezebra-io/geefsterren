import 'server-only';

import { createSupabaseServerClient } from '@/lib/supabase/server';

/**
 * Names for questionnaire versions, fetched without an embed.
 *
 * The four questionnaire tables are chained by **composite** foreign keys that
 * include `organization_id`, and that column is NULL for a platform template.
 * NULL never equals NULL, so a PostgREST embed across them returns `null` for the
 * parent — no error, just a missing name. It showed up in the portal as a
 * questionnaire called "—".
 *
 * This has now bitten in three separate places, so the join lives here once:
 * anything that needs a version's name calls this instead of embedding.
 */

export type VersionLabel = {
  versionId: string;
  templateId: string;
  templateName: string;
  versionNumber: number;
  status: string;
  /** null for a platform template, shared with every organization. */
  organizationId: string | null;
};

function format(label: Pick<VersionLabel, 'templateName' | 'versionNumber'>): string {
  return `${label.templateName} · v${label.versionNumber}`;
}

export { format as formatVersionLabel };

/**
 * Every version the caller may see, keyed by version id.
 *
 * RLS decides what comes back, so this is safe to call without an organization
 * filter — and filtering would hide the platform templates an organization is
 * meant to be able to use.
 */
export async function getVersionLabels(): Promise<Map<string, VersionLabel>> {
  const supabase = await createSupabaseServerClient();

  const [versions, templates] = await Promise.all([
    supabase
      .from('questionnaire_versions')
      .select('id, questionnaire_template_id, version_number, status, organization_id'),
    supabase.from('questionnaire_templates').select('id, name'),
  ]);

  if (versions.error) throw versions.error;
  if (templates.error) throw templates.error;

  const nameById = new Map((templates.data ?? []).map((row) => [row.id, row.name]));

  return new Map(
    (versions.data ?? []).map((version) => [
      version.id,
      {
        versionId: version.id,
        templateId: version.questionnaire_template_id,
        templateName: nameById.get(version.questionnaire_template_id) ?? '—',
        versionNumber: version.version_number,
        status: version.status,
        organizationId: version.organization_id,
      },
    ]),
  );
}

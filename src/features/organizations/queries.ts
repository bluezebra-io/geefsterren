import 'server-only';

import { NotFoundError } from '@/lib/errors';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Organization } from '@/types/domain';

/**
 * Reads go through the RLS-scoped server client, so a query for an organization the caller cannot
 * see returns nothing rather than another tenant's row. The guards in `features/auth/guards.ts`
 * turn that into an explicit error.
 */

export async function listAccessibleOrganizations(): Promise<Organization[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .is('archived_at', null)
    .order('name');

  if (error) throw error;
  return data ?? [];
}

export async function getOrganization(organizationId: string): Promise<Organization> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', organizationId)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new NotFoundError('Organization not found');
  return data;
}

export type OrganizationSummary = {
  locationCount: number;
  activeLocationCount: number;
  memberCount: number;
};

/**
 * Dashboard counters.
 *
 * `head: true` with an exact count asks PostgreSQL for the count and transfers no rows — the
 * alternative, fetching rows to call `.length`, moves data across the wire for nothing.
 */
export async function getOrganizationSummary(organizationId: string): Promise<OrganizationSummary> {
  const supabase = await createSupabaseServerClient();

  const [locations, activeLocations, members] = await Promise.all([
    supabase
      .from('locations')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .is('archived_at', null),
    supabase
      .from('locations')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .eq('status', 'active')
      .is('archived_at', null),
    supabase
      .from('organization_memberships')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .eq('status', 'active'),
  ]);

  if (locations.error) throw locations.error;
  if (activeLocations.error) throw activeLocations.error;
  if (members.error) throw members.error;

  return {
    locationCount: locations.count ?? 0,
    activeLocationCount: activeLocations.count ?? 0,
    memberCount: members.count ?? 0,
  };
}

export type OrganizationWithCounts = Organization & {
  locationCount: number;
  memberCount: number;
};

/**
 * Every organization the caller may see, with location and member counts.
 *
 * For platform staff RLS makes that "all of them", which is what the platform
 * overview needs. Counts are aggregated in one pass over two queries rather than
 * two counts per organization — at MVP scale the N+1 would be dozens of
 * round-trips for a page that shows a handful of numbers.
 */
export async function listOrganizationsWithCounts(): Promise<OrganizationWithCounts[]> {
  const supabase = await createSupabaseServerClient();

  const [organizations, locations, memberships] = await Promise.all([
    supabase.from('organizations').select('*').is('archived_at', null).order('name'),
    supabase.from('locations').select('organization_id').is('archived_at', null),
    supabase.from('organization_memberships').select('organization_id').eq('status', 'active'),
  ]);

  if (organizations.error) throw organizations.error;
  if (locations.error) throw locations.error;
  if (memberships.error) throw memberships.error;

  const tally = (rows: Array<{ organization_id: string }>) => {
    const counts = new Map<string, number>();
    for (const row of rows) counts.set(row.organization_id, (counts.get(row.organization_id) ?? 0) + 1);
    return counts;
  };

  const locationCounts = tally(locations.data ?? []);
  const memberCounts = tally(memberships.data ?? []);

  return (organizations.data ?? []).map((organization) => ({
    ...organization,
    locationCount: locationCounts.get(organization.id) ?? 0,
    memberCount: memberCounts.get(organization.id) ?? 0,
  }));
}

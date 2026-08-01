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

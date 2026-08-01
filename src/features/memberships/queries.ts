import 'server-only';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { LocationRole, MembershipStatus, OrganizationRole } from '@/types/domain';

export type OrganizationMemberRow = {
  membershipId: string;
  userId: string;
  fullName: string | null;
  role: OrganizationRole;
  status: MembershipStatus;
  createdAt: string;
  locations: Array<{ locationId: string; name: string; role: LocationRole }>;
};

/**
 * Members of an organization, with their location assignments.
 *
 * Email addresses are not returned. They live in `auth.users`, which the portal client cannot
 * read, and displaying them is not needed for the members list.
 */
export async function listOrganizationMembers(
  organizationId: string,
): Promise<OrganizationMemberRow[]> {
  const supabase = await createSupabaseServerClient();

  const [{ data: memberships, error: membershipError }, { data: assignments, error: assignmentError }] =
    await Promise.all([
      supabase
        .from('organization_memberships')
        .select('id, user_id, role, status, created_at, profiles(full_name)')
        .eq('organization_id', organizationId)
        .order('created_at'),
      supabase
        .from('location_memberships')
        .select('user_id, location_id, role, locations(name)')
        .eq('organization_id', organizationId),
    ]);

  if (membershipError) throw membershipError;
  if (assignmentError) throw assignmentError;

  const byUser = new Map<string, OrganizationMemberRow['locations']>();
  for (const row of assignments ?? []) {
    const entry = byUser.get(row.user_id) ?? [];
    entry.push({
      locationId: row.location_id,
      name: row.locations?.name ?? 'Unknown location',
      role: row.role,
    });
    byUser.set(row.user_id, entry);
  }

  return (memberships ?? []).map((row) => ({
    membershipId: row.id,
    userId: row.user_id,
    fullName: row.profiles?.full_name ?? null,
    role: row.role,
    status: row.status,
    createdAt: row.created_at,
    locations: (byUser.get(row.user_id) ?? []).sort((a, b) => a.name.localeCompare(b.name)),
  }));
}

export async function listLocationAssignments(
  organizationId: string,
  userId: string,
): Promise<Array<{ locationId: string; role: LocationRole }>> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('location_memberships')
    .select('location_id, role')
    .eq('organization_id', organizationId)
    .eq('user_id', userId);

  if (error) throw error;
  return (data ?? []).map((row) => ({ locationId: row.location_id, role: row.role }));
}

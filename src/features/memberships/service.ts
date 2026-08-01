import type { LocationRole, OrganizationRole } from '@/types/domain';

/**
 * Pure membership rules. No I/O, so these are directly unit-testable.
 */

/**
 * Organization administrators reach every location in their organization by role, so giving them
 * per-location rows would be redundant state that can silently disagree with the role.
 */
export function requiresLocationAssignments(role: OrganizationRole): boolean {
  return role !== 'org_admin';
}

/** The location-level role implied by an organization role. */
export function locationRoleFor(role: OrganizationRole): LocationRole | null {
  switch (role) {
    case 'org_admin':
      return null;
    case 'location_manager':
      return 'location_manager';
    case 'viewer':
      return 'viewer';
  }
}

export type AssignmentDiff = {
  toAdd: string[];
  toRemove: string[];
  toUpdate: string[];
};

/**
 * Computes the minimal change between current and desired location assignments.
 *
 * Replacing all rows on every save would churn `created_at`, which is how "when did this person
 * get access?" stops being answerable.
 */
export function diffLocationAssignments(
  current: Array<{ locationId: string; role: LocationRole }>,
  desiredLocationIds: string[],
  desiredRole: LocationRole,
): AssignmentDiff {
  const desired = new Set(desiredLocationIds);
  const currentById = new Map(current.map((row) => [row.locationId, row.role]));

  const toAdd = desiredLocationIds.filter((id) => !currentById.has(id));
  const toRemove = current.filter((row) => !desired.has(row.locationId)).map((row) => row.locationId);
  const toUpdate = current
    .filter((row) => desired.has(row.locationId) && row.role !== desiredRole)
    .map((row) => row.locationId);

  return { toAdd, toRemove, toUpdate };
}

/**
 * Guards the "an organization must keep at least one active administrator" invariant at the
 * application layer so the user sees a sensible message.
 *
 * The database trigger `app.guard_last_org_admin()` is what actually enforces it — this check
 * races under concurrency and is not trusted for correctness.
 */
export function wouldRemoveLastAdmin(
  admins: Array<{ membershipId: string; role: OrganizationRole; status: string }>,
  targetMembershipId: string,
  nextRole: OrganizationRole | null,
  nextStatus: string | null,
): boolean {
  const remaining = admins.filter((member) => {
    if (member.membershipId === targetMembershipId) {
      if (nextRole === null || nextStatus === null) return false; // removal
      return nextRole === 'org_admin' && nextStatus === 'active';
    }
    return member.role === 'org_admin' && member.status === 'active';
  });

  return remaining.length === 0;
}

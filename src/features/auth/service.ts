import type { OrganizationRole, PortalActor } from '@/types/domain';

/**
 * Pure authorization predicates.
 *
 * These take an actor as an argument and touch no I/O, which is what makes the permission model
 * unit-testable. The server-side guards in `guards.ts` are thin wrappers that resolve an actor and
 * then call these.
 */

export function isPlatformAdmin(actor: PortalActor): boolean {
  return actor.platformRole === 'platform_admin';
}

/** Platform admins are included: every read support may perform, an admin may perform too. */
export function isPlatformStaff(actor: PortalActor): boolean {
  return actor.platformRole === 'platform_admin' || actor.platformRole === 'platform_support';
}

export function organizationRole(
  actor: PortalActor,
  organizationId: string,
): OrganizationRole | null {
  return (
    actor.organizations.find((org) => org.organizationId === organizationId)?.role ?? null
  );
}

export function isOrganizationMember(actor: PortalActor, organizationId: string): boolean {
  return organizationRole(actor, organizationId) !== null;
}

export function isOrganizationAdmin(actor: PortalActor, organizationId: string): boolean {
  return organizationRole(actor, organizationId) === 'org_admin';
}

/** Read access to an organization's data. Platform staff may read everything. */
export function canReadOrganization(actor: PortalActor, organizationId: string): boolean {
  return isPlatformStaff(actor) || isOrganizationMember(actor, organizationId);
}

/**
 * Write access to an organization's configuration.
 *
 * Platform *support* is deliberately excluded: support may look, not change. Only a platform
 * admin or the organization's own admin may write.
 */
export function canManageOrganization(actor: PortalActor, organizationId: string): boolean {
  return isPlatformAdmin(actor) || isOrganizationAdmin(actor, organizationId);
}

/** Membership changes are an organization-administrator power. */
export function canManageMembers(actor: PortalActor, organizationId: string): boolean {
  return canManageOrganization(actor, organizationId);
}

/**
 * The organization to show when none is specified.
 *
 * Most customers have exactly one. Returning null for platform staff with no memberships is
 * correct: they pick an organization explicitly rather than being dropped into an arbitrary one.
 */
export function defaultOrganizationId(actor: PortalActor): string | null {
  return actor.organizations[0]?.organizationId ?? null;
}

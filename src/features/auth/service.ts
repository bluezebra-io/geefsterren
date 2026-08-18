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

/**
 * May this actor look at this organization at all?
 *
 * Membership is the normal route. Platform staff qualify without a membership,
 * which is what makes "open a participant" possible — and it is the same rule
 * the RLS policies already apply, so the UI cannot show more than the database
 * would hand over.
 */
export function mayViewOrganization(actor: PortalActor, organizationId: string): boolean {
  return isPlatformStaff(actor) || isOrganizationMember(actor, organizationId);
}

/**
 * The organization the portal should render.
 *
 * `requested` comes from a cookie, so it is attacker-controlled: it is only
 * honoured when the actor is actually allowed to see it, otherwise we fall back
 * to their own default. A stale or forged cookie therefore degrades to "your own
 * organization", never to someone else's.
 */
export function resolveActiveOrganizationId(
  actor: PortalActor,
  requested: string | null | undefined,
): string | null {
  if (requested && mayViewOrganization(actor, requested)) return requested;
  return defaultOrganizationId(actor);
}

/**
 * True when the actor is inside this organization purely by platform privilege,
 * not by membership.
 *
 * Drives the banner. Someone acting outside their own tenant should never be
 * left guessing whose data is on screen.
 */
export function isPlatformContext(
  actor: PortalActor,
  organizationId: string | null,
): boolean {
  if (!organizationId) return false;
  return isPlatformStaff(actor) && !isOrganizationMember(actor, organizationId);
}

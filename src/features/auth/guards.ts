import 'server-only';

import { AuthenticationError, AuthorizationError } from '@/lib/errors';
import type { PortalActor } from '@/types/domain';

import { getPortalActor } from './queries';
import { canManageMembers, canManageOrganization, canReadOrganization, isPlatformAdmin } from './service';

/**
 * Server-side authorization guards.
 *
 * These are the application-layer check. RLS is the enforcement layer underneath — a guard that is
 * forgotten produces an empty result rather than a leak. Guards exist so the failure is an
 * explicit 403 instead of a confusing blank page.
 */

export async function requireActor(): Promise<PortalActor> {
  const actor = await getPortalActor();
  if (!actor) throw new AuthenticationError();
  return actor;
}

export async function requirePlatformAdmin(): Promise<PortalActor> {
  const actor = await requireActor();
  if (!isPlatformAdmin(actor)) throw new AuthorizationError('Platform administrator access required');
  return actor;
}

export async function requireOrganizationRead(organizationId: string): Promise<PortalActor> {
  const actor = await requireActor();
  if (!canReadOrganization(actor, organizationId)) {
    throw new AuthorizationError('You do not have access to this organization');
  }
  return actor;
}

export async function requireOrganizationManage(organizationId: string): Promise<PortalActor> {
  const actor = await requireActor();
  if (!canManageOrganization(actor, organizationId)) {
    throw new AuthorizationError('Organization administrator access required');
  }
  return actor;
}

export async function requireMemberManage(organizationId: string): Promise<PortalActor> {
  const actor = await requireActor();
  if (!canManageMembers(actor, organizationId)) {
    throw new AuthorizationError('Organization administrator access required');
  }
  return actor;
}

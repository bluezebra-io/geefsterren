import 'server-only';

import { cookies } from 'next/headers';
import { cache } from 'react';

import type { PortalActor } from '@/types/domain';

import { getPortalActor } from './queries';
import { resolveActiveOrganizationId } from './service';

/**
 * Which organization the portal is currently showing.
 *
 * Platform staff have no membership of their own, so without this they land on
 * "no organization selected" and the portal is unusable to them. The selection
 * lives in a cookie rather than the URL so it survives navigation, and it is
 * validated on every read — see `resolveActiveOrganizationId`.
 *
 * This is a *context switch*, not session impersonation. The signed-in user
 * stays themselves: RLS evaluates their real `auth.uid()`, and audit entries
 * name them. Nothing here mints a session for somebody else.
 */
export const ORGANIZATION_COOKIE = 'gs_org';

/** Read the requested organization without validating it. */
export async function readOrganizationCookie(): Promise<string | null> {
  const store = await cookies();
  return store.get(ORGANIZATION_COOKIE)?.value ?? null;
}

/**
 * The active organization for this request, already authorised.
 *
 * Cached per request so several server components resolve it once.
 */
export const getActiveOrganizationId = cache(async (): Promise<string | null> => {
  const actor = await getPortalActor();
  if (!actor) return null;
  return resolveActiveOrganizationId(actor, await readOrganizationCookie());
});

/** Actor plus active organization, the pair nearly every portal page needs. */
export const getPortalContext = cache(
  async (): Promise<{ actor: PortalActor | null; organizationId: string | null }> => {
    const actor = await getPortalActor();
    if (!actor) return { actor: null, organizationId: null };
    return {
      actor,
      organizationId: resolveActiveOrganizationId(actor, await readOrganizationCookie()),
    };
  },
);

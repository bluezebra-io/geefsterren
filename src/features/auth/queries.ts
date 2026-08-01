import 'server-only';

import { cache } from 'react';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { ActorOrganization, PortalActor } from '@/types/domain';

/**
 * Resolves the current portal actor: identity plus every organization membership.
 *
 * Wrapped in React `cache` so a page rendering several server components resolves the actor once
 * per request instead of once per component.
 *
 * Returns null when unauthenticated. Callers that require a session use the guards in `guards.ts`.
 */
export const getPortalActor = cache(async (): Promise<PortalActor | null> => {
  const supabase = await createSupabaseServerClient();

  // getUser() revalidates against the auth server. getSession() only decodes a cookie the client
  // controls, so it must never back an authorization decision.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [{ data: profile }, { data: memberships }] = await Promise.all([
    supabase.from('profiles').select('full_name, platform_role').eq('user_id', user.id).maybeSingle(),
    supabase
      .from('organization_memberships')
      .select('organization_id, role, status, organizations(name, slug)')
      .eq('user_id', user.id)
      .eq('status', 'active'),
  ]);

  const organizations: ActorOrganization[] = (memberships ?? [])
    .filter((row): row is typeof row & { organizations: { name: string; slug: string } } =>
      row.organizations !== null,
    )
    .map((row) => ({
      organizationId: row.organization_id,
      name: row.organizations.name,
      slug: row.organizations.slug,
      role: row.role,
      status: row.status,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return {
    userId: user.id,
    email: user.email ?? null,
    fullName: profile?.full_name ?? null,
    platformRole: profile?.platform_role ?? 'none',
    organizations,
  };
});

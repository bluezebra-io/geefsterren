import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '@/types/database.generated';

/**
 * Helpers for RLS integration tests.
 *
 * These deliberately use the **anon key** plus a real signed-in session, because that is the only
 * configuration in which policies actually apply. A test written against the service-role client
 * bypasses the thing under test and would pass while the system leaks.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function requireLocalSupabase(): { url: string; anonKey: string; serviceKey: string } {
  if (!SUPABASE_URL || !ANON_KEY || !SERVICE_KEY) {
    throw new Error(
      'Integration tests need a running local Supabase. Run `npm run db:start` and `npm run db:reset`.',
    );
  }
  return { url: SUPABASE_URL, anonKey: ANON_KEY, serviceKey: SERVICE_KEY };
}

/** Seed identities. Passwords are local-only literals from supabase/seed.sql. */
export const SEED = {
  password: 'LocalDev!2026',
  users: {
    platformAdmin: 'platform.admin@geefsterren.test',
    platformSupport: 'platform.support@geefsterren.test',
    orgAdminA: 'org.admin@bakkerij.test',
    locationManagerLeiden: 'manager.leiden@bakkerij.test',
    viewerA: 'viewer@bakkerij.test',
    orgAdminB: 'org.admin@pizzeria.test',
  },
  organizations: {
    a: '22222222-2222-4222-8222-000000000001',
    b: '22222222-2222-4222-8222-000000000002',
  },
  locations: {
    leiden: '33333333-3333-4333-8333-000000000001',
    rotterdam: '33333333-3333-4333-8333-000000000002',
    napoli: '33333333-3333-4333-8333-000000000003',
  },
  memberships: {
    orgAdminA: '44444444-4444-4444-8444-000000000001',
    viewerA: '44444444-4444-4444-8444-000000000003',
  },
  userIds: {
    platformAdmin: '11111111-1111-4111-8111-000000000001',
    viewerA: '11111111-1111-4111-8111-000000000005',
  },
} as const;

export type TestClient = SupabaseClient<Database>;

/** A client with no session at all — the `anon` role. */
export function anonClient(): TestClient {
  const { url, anonKey } = requireLocalSupabase();
  return createClient<Database>(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** A client authenticated as a seeded user, subject to RLS. */
export async function signedInClient(email: string): Promise<TestClient> {
  const { url, anonKey } = requireLocalSupabase();
  const client = createClient<Database>(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error } = await client.auth.signInWithPassword({ email, password: SEED.password });
  if (error) throw new Error(`Could not sign in as ${email}: ${error.message}`);

  return client;
}

/** Service-role client. Used only to arrange state, never to assert policy behaviour. */
export function serviceClient(): TestClient {
  const { url, serviceKey } = requireLocalSupabase();
  return createClient<Database>(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

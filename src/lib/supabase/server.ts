import 'server-only';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

import { appConfig } from '@/lib/env';
import type { Database } from '@/types/database.generated';

import { fetchWithClockSkewRetry } from './retry-fetch';

/**
 * Supabase client for Server Components, Server Actions and route handlers.
 *
 * Uses the anon key plus the caller's session cookie, so RLS applies with the user's identity.
 * This is the default client for anything acting on behalf of a signed-in user.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const env = appConfig();

  return createServerClient<Database>(
    env.SUPABASE_URL,
    env.SUPABASE_ANON_KEY,
    {
      global: { fetch: fetchWithClockSkewRetry },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Server Components cannot set cookies. Session refresh is handled by middleware,
            // so ignoring this is correct rather than a swallowed error.
          }
        },
      },
    },
  );
}

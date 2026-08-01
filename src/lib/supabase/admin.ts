import 'server-only';

import { createClient } from '@supabase/supabase-js';

import { clientEnv, serverEnv } from '@/lib/env';
import type { Database } from '@/types/database.generated';

/**
 * Service-role Supabase client. **Bypasses Row Level Security entirely.**
 *
 * Legitimate uses are narrow:
 *   1. The public feedback write path, which has no authenticated user.
 *   2. Internal cron and queue workers.
 *
 * Everything acting on behalf of a signed-in user must use `createSupabaseServerClient()` so RLS
 * remains the enforcement layer. Reaching for this client to "make a query work" is how tenant
 * isolation gets lost.
 *
 * `import 'server-only'` above makes importing this from a Client Component a build error; an
 * ESLint rule additionally blocks the path from `src/components/**`.
 */
export function createSupabaseAdminClient() {
  const { NEXT_PUBLIC_SUPABASE_URL } = clientEnv();
  const { SUPABASE_SERVICE_ROLE_KEY } = serverEnv();

  return createClient<Database>(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      // A service client has no user session; persisting or refreshing one would be meaningless
      // and, in a shared server process, actively dangerous.
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

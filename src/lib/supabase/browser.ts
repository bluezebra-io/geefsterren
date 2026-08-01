import { createBrowserClient } from '@supabase/ssr';

import { clientEnv } from '@/lib/env';
import type { Database } from '@/types/database.generated';

/**
 * Supabase client for Client Components. Uses the anon key, so every query is constrained by RLS.
 */
export function createSupabaseBrowserClient() {
  const env = clientEnv();
  return createBrowserClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

import { appConfig } from '@/lib/env';
import type { Database } from '@/types/database.generated';

/**
 * Refreshes the Supabase session and returns both the response carrying updated auth cookies and
 * the resolved user.
 *
 * Server Components cannot write cookies, so token refresh has to happen here. Skipping it means
 * sessions silently expire mid-visit.
 */
export async function updateSupabaseSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const env = appConfig();

  const supabase = createServerClient<Database>(
    env.SUPABASE_URL,
    env.SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // getUser() revalidates the token with the auth server. getSession() only decodes the cookie,
  // which a client can forge, so it must not be used for an authorization decision.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user };
}

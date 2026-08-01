import { NextResponse, type NextRequest } from 'next/server';

import { describeError, logger } from '@/lib/observability/logger';
import { createSupabaseServerClient } from '@/lib/supabase/server';

/**
 * Supabase auth callback.
 *
 * Exchanges the one-time code from a magic link or invitation email for a session cookie. This is
 * the only place that runs the exchange.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');
  const next = safeNextPath(searchParams.get('next'));

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/auth-error?reason=missing_code`);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    logger.warn('auth code exchange failed', { ...describeError(error) });
    return NextResponse.redirect(`${origin}/auth/auth-error?reason=invalid_code`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}

/**
 * `next` arrives from a URL, so it is attacker-influenced. Only same-origin relative paths are
 * accepted; anything else would make this route an open redirect.
 */
function safeNextPath(value: string | null): string {
  if (!value) return '/app';
  if (!value.startsWith('/') || value.startsWith('//')) return '/app';
  return value;
}

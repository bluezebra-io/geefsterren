import { NextResponse, type NextRequest } from 'next/server';

import { clientEnv } from '@/lib/env';
import { classifyHost } from '@/lib/hosts';
import { updateSupabaseSession } from '@/lib/supabase/middleware';

/**
 * Host routing and session refresh.
 *
 * This is the Next.js 16 `proxy` convention, the replacement for `middleware`. It runs before
 * every matched request.
 *
 * Portal routes live under /app and require a session. Marketing and the public feedback flow
 * (/r/{token}) must never require one — a customer scanning a QR code has no account and never
 * will.
 */

const PORTAL_PREFIX = '/app';
const AUTH_PREFIX = '/auth';

/** Paths that must stay reachable without a session, even on the portal host. */
function isPublicPath(pathname: string): boolean {
  return (
    pathname.startsWith(AUTH_PREFIX) ||
    pathname.startsWith('/r/') ||
    pathname.startsWith('/api/public/') ||
    pathname.startsWith('/api/internal/')
  );
}

export default async function proxy(request: NextRequest) {
  const { nextUrl } = request;
  const env = clientEnv();
  const hostKind = classifyHost(request.headers.get('host'), env.NEXT_PUBLIC_PORTAL_URL);

  // The public feedback flow is deliberately handled before any auth work: no session lookup, no
  // cookie refresh, nothing that could turn a QR scan into a redirect.
  if (nextUrl.pathname.startsWith('/r/')) {
    return NextResponse.next();
  }

  if (hostKind === 'marketing') {
    // The portal is not served from the marketing host; send those requests to the real portal
    // rather than rendering a second copy under a different origin.
    if (nextUrl.pathname.startsWith(PORTAL_PREFIX)) {
      const target = new URL(nextUrl.pathname + nextUrl.search, env.NEXT_PUBLIC_PORTAL_URL);
      return NextResponse.redirect(target);
    }
    return NextResponse.next();
  }

  // --- Portal host -------------------------------------------------------
  const { response, user } = await updateSupabaseSession(request);

  if (isPublicPath(nextUrl.pathname)) {
    return response;
  }

  // The portal host's root is the dashboard, not a marketing page.
  if (nextUrl.pathname === '/') {
    const target = nextUrl.clone();
    target.pathname = user ? PORTAL_PREFIX : `${AUTH_PREFIX}/sign-in`;
    return NextResponse.redirect(target);
  }

  if (!user && nextUrl.pathname.startsWith(PORTAL_PREFIX)) {
    const target = nextUrl.clone();
    target.pathname = `${AUTH_PREFIX}/sign-in`;
    // Preserve the intended destination so sign-in can return the user to it.
    target.searchParams.set('next', nextUrl.pathname + nextUrl.search);
    return NextResponse.redirect(target);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Everything except static assets and image optimisation. Running middleware on those would
     * add a session lookup to every asset request for no benefit.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)',
  ],
};

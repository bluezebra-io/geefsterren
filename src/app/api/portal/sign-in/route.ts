import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';

import { describeError, logger } from '@/lib/observability/logger';
import { createSupabaseServerClient } from '@/lib/supabase/server';

/**
 * Password sign-in.
 *
 * A route handler rather than a Server Action for the same reason as the
 * organization switch: an action that writes cookies and then redirects has Next
 * render the destination inside the action's own response, and that render does
 * not see the session it just created. A plain 303 makes the browser send a clean
 * follow-up request with the auth cookies attached.
 *
 * Magic links stay available and remain the route for invitations. This exists so
 * the portal does not *depend* on mail delivery to let someone in.
 */

const schema = z.object({
  email: z.string().trim().toLowerCase().email().max(320),
  // Deliberately only a presence check. Length rules belong at the point a
  // password is *chosen*; enforcing them at sign-in would tell an attacker which
  // guesses were too short to be real.
  password: z.string().min(1).max(200),
  next: z.string().max(500).optional(),
});

/** Only same-origin relative paths, so this cannot become an open redirect. */
function safeNextPath(value: string | undefined): string {
  if (!value) return '/app';
  if (!value.startsWith('/') || value.startsWith('//')) return '/app';
  return value;
}

/** Relative Location: `request.nextUrl.origin` reports the wrong host here. */
function seeOther(path: string): NextResponse {
  return new NextResponse(null, { status: 303, headers: { Location: path } });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const form = await request.formData();
  const parsed = schema.safeParse({
    email: form.get('email'),
    password: form.get('password'),
    next: form.get('next') ?? undefined,
  });

  if (!parsed.success) {
    return seeOther('/auth/sign-in?error=invalid');
  }

  const { email, password, next } = parsed.data;
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // One message for wrong password, unknown address and unconfirmed account
    // alike, so the form cannot be used to discover which addresses exist.
    logger.warn('password sign-in failed', { ...describeError(error) });
    return seeOther('/auth/sign-in?error=credentials');
  }

  return seeOther(safeNextPath(next));
}

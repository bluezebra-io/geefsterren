import { NextResponse, type NextRequest } from 'next/server';

import { writeAuditLog } from '@/features/audit/service';
import { getPortalActor } from '@/features/auth/queries';
import { ORGANIZATION_COOKIE, readOrganizationCookie } from '@/features/auth/organization-context';
import { isPlatformContext, mayViewOrganization } from '@/features/auth/service';
import { describeError, logger } from '@/lib/observability/logger';

/**
 * Switches the portal into an organization, or leaves it again.
 *
 * A route handler rather than a Server Action, and that is the whole point. An
 * action that sets a cookie *and* redirects has Next render the destination
 * inside the action's own response, and that render did not see the session —
 * the portal came back as the sign-in page while a manual reload was fine. A
 * route handler answers with a plain 303, so the browser makes a clean follow-up
 * request carrying both cookies.
 *
 * It also means the control works without JavaScript: a plain form post, no
 * hydration to race.
 */

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax',
  path: '/',
  secure: process.env.NODE_ENV === 'production',
  // Session-scoped on purpose: opening a participant should not quietly persist
  // for weeks after the support question is answered.
  maxAge: 60 * 60 * 8,
} as const;

/**
 * Redirect with a **relative** Location, resolved by the browser against the
 * current origin.
 *
 * `NextResponse.redirect` needs an absolute URL, and building one from
 * `request.nextUrl.origin` produced `http://localhost:5010` for a request that
 * arrived at `app.localhost:5010`. The session cookie belongs to the portal host,
 * so the redirect landed on the marketing host and looked like a logged-out
 * user. A relative Location keeps the host the client is actually on.
 */
function seeOther(path: string): NextResponse {
  return new NextResponse(null, { status: 303, headers: { Location: path } });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const actor = await getPortalActor();
  if (!actor) return seeOther('/auth/sign-in');

  const form = await request.formData();
  const intent = form.get('intent');

  if (intent === 'exit') {
    const current = await readOrganizationCookie();
    const response = seeOther('/admin');
    response.cookies.delete(ORGANIZATION_COOKIE);

    if (current && isPlatformContext(actor, current)) {
      await writeAuditLog({
        action: 'platform.organization_closed',
        entityType: 'organization',
        entityId: current,
        organizationId: current,
      });
    }
    return response;
  }

  const organizationId = form.get('organizationId');
  if (typeof organizationId !== 'string' || organizationId.length === 0) {
    return seeOther('/admin');
  }

  // The cookie is attacker-controlled, so refuse here rather than write a value
  // we would only have to reject on read.
  if (!mayViewOrganization(actor, organizationId)) {
    logger.warn('organization switch refused', {
      organization_id: organizationId,
      platform_role: actor.platformRole,
    });
    return seeOther('/app');
  }

  const response = seeOther('/app');
  response.cookies.set(ORGANIZATION_COOKIE, organizationId, COOKIE_OPTIONS);

  // A platform user entering somebody else's tenant is audited. That entry is
  // what makes the feature defensible: access outside your own organization
  // leaves a trace naming you.
  if (isPlatformContext(actor, organizationId)) {
    try {
      await writeAuditLog({
        action: 'platform.organization_opened',
        entityType: 'organization',
        entityId: organizationId,
        organizationId,
        metadata: { platform_role: actor.platformRole },
      });
    } catch (error) {
      logger.error('audit write failed on organization switch', { ...describeError(error) });
    }
  }

  return response;
}

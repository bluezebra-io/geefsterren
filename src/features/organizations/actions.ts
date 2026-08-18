'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { writeAuditLog } from '@/features/audit/service';
import { requireActor } from '@/features/auth/guards';
import { ORGANIZATION_COOKIE } from '@/features/auth/organization-context';
import { isPlatformContext, mayViewOrganization } from '@/features/auth/service';
import { AuthorizationError, isExpectedError } from '@/lib/errors';
import { describeError, logger } from '@/lib/observability/logger';
import { actionError, type ActionResult } from '@/types/domain';

const enterSchema = z.object({ organizationId: z.uuid() });

/**
 * Opens a participant's organization in the portal.
 *
 * Platform staff may open any organization; ordinary users may only switch
 * between organizations they belong to. The check is not a formality — the
 * cookie is attacker-controlled, so refusing here keeps a forged value from ever
 * being written in the first place, and `resolveActiveOrganizationId` refuses it
 * again on read.
 *
 * A platform user entering somebody else's tenant is audited. That entry is the
 * point of the feature being safe: access outside your own organization leaves a
 * trace naming you.
 */
export async function enterOrganizationAction(
  _previous: ActionResult<void> | null,
  formData: FormData,
): Promise<ActionResult<void>> {
  const parsed = enterSchema.safeParse({ organizationId: formData.get('organizationId') });
  if (!parsed.success) return actionError('Invalid request');

  const { organizationId } = parsed.data;

  try {
    const actor = await requireActor();

    if (!mayViewOrganization(actor, organizationId)) {
      throw new AuthorizationError('You do not have access to this organization');
    }

    const store = await cookies();
    store.set(ORGANIZATION_COOKIE, organizationId, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      // Session-scoped on purpose: opening a participant should not quietly
      // persist for weeks after the support question is answered.
      maxAge: 60 * 60 * 8,
    });

    if (isPlatformContext(actor, organizationId)) {
      await writeAuditLog({
        action: 'platform.organization_opened',
        entityType: 'organization',
        entityId: organizationId,
        organizationId,
        metadata: { platform_role: actor.platformRole },
      });
    }
  } catch (error) {
    if (isExpectedError(error)) return actionError(error.message);
    logger.error('enter organization failed', { ...describeError(error) });
    return actionError('Could not open this organization');
  }

  redirect('/app');
}

/** Leaves the participant context and returns to the platform overview. */
export async function exitOrganizationAction(): Promise<void> {
  const actor = await requireActor();
  const store = await cookies();
  const current = store.get(ORGANIZATION_COOKIE)?.value ?? null;

  store.delete(ORGANIZATION_COOKIE);

  if (current && isPlatformContext(actor, current)) {
    await writeAuditLog({
      action: 'platform.organization_closed',
      entityType: 'organization',
      entityId: current,
      organizationId: current,
    });
  }

  redirect('/admin');
}

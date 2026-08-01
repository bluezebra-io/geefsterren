'use server';

import { revalidatePath } from 'next/cache';

import { writeAuditLog } from '@/features/audit/service';
import { requireMemberManage } from '@/features/auth/guards';
import { clientEnv } from '@/lib/env';
import { ConflictError, isExpectedError, NotFoundError } from '@/lib/errors';
import { describeError, logger } from '@/lib/observability/logger';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { toFieldErrors } from '@/lib/validation/field-errors';
import { actionError, actionOk, type ActionResult } from '@/types/domain';

import { listLocationAssignments } from './queries';
import {
  inviteMemberSchema,
  removeMembershipSchema,
  setLocationAssignmentsSchema,
  updateMembershipSchema,
} from './schemas';
import { diffLocationAssignments, locationRoleFor, requiresLocationAssignments } from './service';

/**
 * Invites a user to an organization.
 *
 * Uses the admin client for exactly one thing: creating or finding the Supabase Auth user, which
 * requires the auth admin API. Every subsequent write goes through the RLS-scoped client, so the
 * caller's own permissions still constrain what is written.
 */
export async function inviteMemberAction(
  _previous: ActionResult<{ userId: string }> | null,
  formData: FormData,
): Promise<ActionResult<{ userId: string }>> {
  const parsed = inviteMemberSchema.safeParse({
    organizationId: formData.get('organizationId'),
    email: formData.get('email'),
    role: formData.get('role'),
    fullName: formData.get('fullName') || undefined,
    locationIds: formData.getAll('locationIds').filter((v): v is string => typeof v === 'string'),
  });

  if (!parsed.success) {
    return actionError('Check the form and try again', toFieldErrors(parsed.error));
  }

  const input = parsed.data;

  try {
    await requireMemberManage(input.organizationId);

    const admin = createSupabaseAdminClient();
    const portalUrl = clientEnv().NEXT_PUBLIC_PORTAL_URL;

    const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(
      input.email,
      {
        redirectTo: new URL('/auth/callback?next=/app', portalUrl).toString(),
        data: input.fullName ? { full_name: input.fullName } : undefined,
      },
    );

    let userId = invited?.user?.id ?? null;

    if (inviteError) {
      // Already registered is not a failure: the person simply already has an account, and we
      // still want to add them to this organization.
      const existing = await findUserIdByEmail(input.email);
      if (!existing) {
        logger.warn('invite failed', {
          organization_id: input.organizationId,
          ...describeError(inviteError),
        });
        return actionError('Could not send the invitation');
      }
      userId = existing;
    }

    if (!userId) return actionError('Could not resolve the invited user');

    const supabase = await createSupabaseServerClient();

    const { error: membershipError } = await supabase.from('organization_memberships').insert({
      organization_id: input.organizationId,
      user_id: userId,
      role: input.role,
      status: 'invited',
    });

    if (membershipError) {
      if (membershipError.code === '23505') {
        throw new ConflictError('That person is already a member of this organization');
      }
      throw membershipError;
    }

    if (requiresLocationAssignments(input.role) && input.locationIds.length > 0) {
      await replaceLocationAssignments(
        input.organizationId,
        userId,
        input.locationIds,
        input.role,
      );
    }

    await writeAuditLog({
      action: 'membership.invited',
      entityType: 'organization_membership',
      organizationId: input.organizationId,
      after: { user_id: userId, role: input.role, location_count: input.locationIds.length },
    });

    revalidatePath('/app/settings/users');
    return actionOk({ userId });
  } catch (error) {
    if (isExpectedError(error)) return actionError(error.message);
    logger.error('invite member failed', {
      organization_id: input.organizationId,
      ...describeError(error),
    });
    return actionError('Could not invite this person');
  }
}

export async function updateMembershipAction(
  _previous: ActionResult<void> | null,
  formData: FormData,
): Promise<ActionResult<void>> {
  const parsed = updateMembershipSchema.safeParse({
    membershipId: formData.get('membershipId'),
    role: formData.get('role'),
    status: formData.get('status'),
  });

  if (!parsed.success) {
    return actionError('Check the form and try again', toFieldErrors(parsed.error));
  }

  const input = parsed.data;

  try {
    const supabase = await createSupabaseServerClient();

    // The organization comes from the stored membership, never from the form, so authorization
    // cannot be pointed at a different organization than the write.
    const { data: before, error: readError } = await supabase
      .from('organization_memberships')
      .select('id, organization_id, user_id, role, status')
      .eq('id', input.membershipId)
      .maybeSingle();

    if (readError) throw readError;
    if (!before) throw new NotFoundError('Membership not found');

    await requireMemberManage(before.organization_id);

    const { error } = await supabase
      .from('organization_memberships')
      .update({ role: input.role, status: input.status })
      .eq('id', input.membershipId);

    if (error) {
      // Raised by app.guard_last_org_admin(). Surfaced verbatim because the message is written for
      // a human to read.
      if (error.code === '23514') {
        throw new ConflictError('An organization must keep at least one active administrator');
      }
      throw error;
    }

    // Promotion to org_admin makes per-location rows redundant, and leaving them behind means a
    // later demotion silently restores stale access.
    if (input.role === 'org_admin') {
      await supabase
        .from('location_memberships')
        .delete()
        .eq('organization_id', before.organization_id)
        .eq('user_id', before.user_id);
    }

    await writeAuditLog({
      action: 'membership.updated',
      entityType: 'organization_membership',
      entityId: input.membershipId,
      organizationId: before.organization_id,
      before: { role: before.role, status: before.status },
      after: { role: input.role, status: input.status },
    });

    revalidatePath('/app/settings/users');
    return actionOk();
  } catch (error) {
    if (isExpectedError(error)) return actionError(error.message);
    logger.error('membership update failed', { ...describeError(error) });
    return actionError('Could not update this membership');
  }
}

export async function removeMembershipAction(
  _previous: ActionResult<void> | null,
  formData: FormData,
): Promise<ActionResult<void>> {
  const parsed = removeMembershipSchema.safeParse({ membershipId: formData.get('membershipId') });
  if (!parsed.success) return actionError('Invalid request');

  try {
    const supabase = await createSupabaseServerClient();

    const { data: before, error: readError } = await supabase
      .from('organization_memberships')
      .select('id, organization_id, user_id, role, status')
      .eq('id', parsed.data.membershipId)
      .maybeSingle();

    if (readError) throw readError;
    if (!before) throw new NotFoundError('Membership not found');

    await requireMemberManage(before.organization_id);

    // Location assignments first: they are the narrower grant, so removing them first means a
    // failure halfway through leaves less access, not more.
    await supabase
      .from('location_memberships')
      .delete()
      .eq('organization_id', before.organization_id)
      .eq('user_id', before.user_id);

    const { error } = await supabase
      .from('organization_memberships')
      .delete()
      .eq('id', parsed.data.membershipId);

    if (error) {
      if (error.code === '23514') {
        throw new ConflictError('An organization must keep at least one active administrator');
      }
      throw error;
    }

    await writeAuditLog({
      action: 'membership.removed',
      entityType: 'organization_membership',
      entityId: parsed.data.membershipId,
      organizationId: before.organization_id,
      before: { user_id: before.user_id, role: before.role, status: before.status },
    });

    revalidatePath('/app/settings/users');
    return actionOk();
  } catch (error) {
    if (isExpectedError(error)) return actionError(error.message);
    logger.error('membership removal failed', { ...describeError(error) });
    return actionError('Could not remove this membership');
  }
}

export async function setLocationAssignmentsAction(
  _previous: ActionResult<void> | null,
  formData: FormData,
): Promise<ActionResult<void>> {
  const parsed = setLocationAssignmentsSchema.safeParse({
    organizationId: formData.get('organizationId'),
    userId: formData.get('userId'),
    role: formData.get('role'),
    locationIds: formData.getAll('locationIds').filter((v): v is string => typeof v === 'string'),
  });

  if (!parsed.success) {
    return actionError('Check the form and try again', toFieldErrors(parsed.error));
  }

  const input = parsed.data;

  try {
    await requireMemberManage(input.organizationId);
    await replaceLocationAssignments(
      input.organizationId,
      input.userId,
      input.locationIds,
      input.role,
    );

    await writeAuditLog({
      action: 'membership.locations_updated',
      entityType: 'location_membership',
      organizationId: input.organizationId,
      after: { user_id: input.userId, role: input.role, location_ids: input.locationIds },
    });

    revalidatePath('/app/settings/users');
    return actionOk();
  } catch (error) {
    if (isExpectedError(error)) return actionError(error.message);
    logger.error('location assignment failed', {
      organization_id: input.organizationId,
      ...describeError(error),
    });
    return actionError('Could not update location access');
  }
}

/**
 * Applies the minimal set of changes to reach the desired assignments.
 *
 * The caller must already be authorized; this helper does not check permissions itself. RLS is
 * still the backstop.
 */
async function replaceLocationAssignments(
  organizationId: string,
  userId: string,
  locationIds: string[],
  role: 'org_admin' | 'location_manager' | 'viewer',
): Promise<void> {
  const locationRole = locationRoleFor(role);
  if (locationRole === null) return; // org_admin needs no per-location rows

  const supabase = await createSupabaseServerClient();
  const current = await listLocationAssignments(organizationId, userId);
  const { toAdd, toRemove, toUpdate } = diffLocationAssignments(current, locationIds, locationRole);

  if (toRemove.length > 0) {
    const { error } = await supabase
      .from('location_memberships')
      .delete()
      .eq('organization_id', organizationId)
      .eq('user_id', userId)
      .in('location_id', toRemove);
    if (error) throw error;
  }

  if (toUpdate.length > 0) {
    const { error } = await supabase
      .from('location_memberships')
      .update({ role: locationRole })
      .eq('organization_id', organizationId)
      .eq('user_id', userId)
      .in('location_id', toUpdate);
    if (error) throw error;
  }

  if (toAdd.length > 0) {
    const { error } = await supabase.from('location_memberships').insert(
      toAdd.map((locationId) => ({
        organization_id: organizationId,
        location_id: locationId,
        user_id: userId,
        role: locationRole,
        status: 'active' as const,
      })),
    );
    if (error) throw error;
  }
}

/**
 * Resolves an existing auth user by email.
 *
 * The Admin API has no direct get-by-email, so this pages through users. Acceptable at MVP scale
 * (portal staff, not consumers) and confined here so it can be replaced without touching callers.
 */
async function findUserIdByEmail(email: string): Promise<string | null> {
  const admin = createSupabaseAdminClient();
  const target = email.trim().toLowerCase();

  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;

    const match = data.users.find((user) => user.email?.toLowerCase() === target);
    if (match) return match.id;
    if (data.users.length < 200) break;
  }

  return null;
}

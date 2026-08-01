'use server';

import { revalidatePath } from 'next/cache';

import { writeAuditLog } from '@/features/audit/service';
import { requireOrganizationManage } from '@/features/auth/guards';
import { canManageOrganization } from '@/features/auth/service';
import { requireActor } from '@/features/auth/guards';
import { ConflictError, isExpectedError } from '@/lib/errors';
import { describeError, logger } from '@/lib/observability/logger';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { toFieldErrors } from '@/lib/validation/field-errors';
import { actionError, actionOk, type ActionResult } from '@/types/domain';

import { getLocation, slugExists } from './queries';
import { createLocationSchema, updateLocationSchema } from './schemas';

export async function createLocationAction(
  _previous: ActionResult<{ locationId: string }> | null,
  formData: FormData,
): Promise<ActionResult<{ locationId: string }>> {
  const parsed = createLocationSchema.safeParse({
    organizationId: formData.get('organizationId'),
    name: formData.get('name'),
    slug: formData.get('slug'),
    timezone: formData.get('timezone') || undefined,
    googleReviewUrl: formData.get('googleReviewUrl') || undefined,
    externalReference: formData.get('externalReference') || undefined,
    address: {
      street: (formData.get('street') as string) || undefined,
      postal_code: (formData.get('postalCode') as string) || undefined,
      city: (formData.get('city') as string) || undefined,
      country: (formData.get('country') as string) || undefined,
    },
  });

  if (!parsed.success) {
    return actionError('Check the form and try again', toFieldErrors(parsed.error));
  }

  const input = parsed.data;

  try {
    await requireOrganizationManage(input.organizationId);

    // Checked here so the user gets a field-level message. The unique constraint on
    // (organization_id, slug) is still what guarantees it under concurrency.
    if (await slugExists(input.organizationId, input.slug)) {
      throw new ConflictError('That slug is already used by another location');
    }

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('locations')
      .insert({
        organization_id: input.organizationId,
        name: input.name,
        slug: input.slug,
        timezone: input.timezone,
        address_json: input.address ?? {},
        google_review_url: input.googleReviewUrl || null,
        external_reference: input.externalReference || null,
      })
      .select('id, name, slug, status, timezone')
      .single();

    if (error) {
      if (error.code === '23505') {
        return actionError('That slug is already used by another location', {
          slug: ['Already in use'],
        });
      }
      throw error;
    }

    await writeAuditLog({
      action: 'location.created',
      entityType: 'location',
      entityId: data.id,
      organizationId: input.organizationId,
      locationId: data.id,
      after: data,
    });

    revalidatePath('/app/locations');
    return actionOk({ locationId: data.id });
  } catch (error) {
    if (isExpectedError(error)) return actionError(error.message);
    logger.error('location create failed', {
      organization_id: input.organizationId,
      ...describeError(error),
    });
    return actionError('Could not create the location');
  }
}

export async function updateLocationAction(
  _previous: ActionResult<void> | null,
  formData: FormData,
): Promise<ActionResult<void>> {
  const parsed = updateLocationSchema.safeParse({
    locationId: formData.get('locationId'),
    name: formData.get('name'),
    timezone: formData.get('timezone'),
    status: formData.get('status'),
    googleReviewUrl: formData.get('googleReviewUrl') || undefined,
    externalReference: formData.get('externalReference') || undefined,
    address: {
      street: (formData.get('street') as string) || undefined,
      postal_code: (formData.get('postalCode') as string) || undefined,
      city: (formData.get('city') as string) || undefined,
      country: (formData.get('country') as string) || undefined,
    },
  });

  if (!parsed.success) {
    return actionError('Check the form and try again', toFieldErrors(parsed.error));
  }

  const input = parsed.data;

  try {
    // The organization is read from the stored location, never from the submitted form. Trusting a
    // submitted organizationId here would let a caller authorise against an organization they
    // administer while writing to a location in one they do not.
    const before = await getLocation(input.locationId);
    const actor = await requireActor();

    const permitted =
      canManageOrganization(actor, before.organization_id) ||
      (await callerCanManageLocation(input.locationId));

    if (!permitted) {
      return actionError('You do not have permission to edit this location');
    }

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('locations')
      .update({
        name: input.name,
        timezone: input.timezone,
        status: input.status,
        address_json: input.address ?? before.address_json,
        google_review_url: input.googleReviewUrl || null,
        external_reference: input.externalReference || null,
        archived_at: input.status === 'archived' ? new Date().toISOString() : null,
      })
      .eq('id', input.locationId)
      .select('id, name, slug, status, timezone, google_review_url')
      .single();

    if (error) throw error;

    await writeAuditLog({
      action: 'location.updated',
      entityType: 'location',
      entityId: input.locationId,
      organizationId: before.organization_id,
      locationId: input.locationId,
      before: {
        name: before.name,
        status: before.status,
        timezone: before.timezone,
        google_review_url: before.google_review_url,
      },
      after: data,
    });

    revalidatePath('/app/locations');
    revalidatePath(`/app/locations/${input.locationId}`);
    return actionOk();
  } catch (error) {
    if (isExpectedError(error)) return actionError(error.message);
    logger.error('location update failed', {
      location_id: input.locationId,
      ...describeError(error),
    });
    return actionError('Could not save the location');
  }
}

/**
 * Asks the database whether the caller may manage this location, reusing the same
 * `app.can_manage_location()` predicate the RLS policies use.
 *
 * Re-implementing the rule in TypeScript would create two sources of truth that could drift; this
 * way the application check and the enforcement check are literally the same function.
 */
async function callerCanManageLocation(locationId: string): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc('can_manage_location', {
    p_location_id: locationId,
  });

  if (error) {
    logger.warn('can_manage_location check failed', {
      location_id: locationId,
      ...describeError(error),
    });
    return false;
  }

  return data === true;
}

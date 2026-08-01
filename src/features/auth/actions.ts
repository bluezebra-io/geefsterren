'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

import { clientEnv } from '@/lib/env';
import { logger, describeError } from '@/lib/observability/logger';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { toFieldErrors } from '@/lib/validation/field-errors';
import { actionError, actionOk, type ActionResult } from '@/types/domain';

import { requireActor } from './guards';
import { signInSchema, updateProfileSchema } from './schemas';

/**
 * Only relative paths are accepted as a post-sign-in destination. Accepting an absolute URL here
 * would turn the sign-in form into an open redirect.
 */
function safeNextPath(value: string | undefined): string {
  if (!value) return '/app';
  if (!value.startsWith('/') || value.startsWith('//')) return '/app';
  return value;
}

export async function sendMagicLinkAction(
  _previous: ActionResult<{ email: string }> | null,
  formData: FormData,
): Promise<ActionResult<{ email: string }>> {
  const parsed = signInSchema.safeParse({
    email: formData.get('email'),
    next: formData.get('next') ?? undefined,
  });

  if (!parsed.success) {
    return actionError('Check the form and try again', toFieldErrors(parsed.error));
  }

  const { email, next } = parsed.data;
  const supabase = await createSupabaseServerClient();
  const portalUrl = clientEnv().NEXT_PUBLIC_PORTAL_URL;
  const callback = new URL('/auth/callback', portalUrl);
  callback.searchParams.set('next', safeNextPath(next));

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: callback.toString(),
      // Portal accounts are created by invitation. Allowing sign-up here would let anyone with the
      // URL mint an account with no organization, which is noise at best.
      shouldCreateUser: false,
    },
  });

  if (error) {
    logger.warn('magic link request failed', { ...describeError(error) });
    // The response is identical whether or not the address exists, so the form cannot be used to
    // enumerate which email addresses have portal accounts.
  }

  return actionOk({ email });
}

export async function signOutAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect('/auth/sign-in');
}

export async function updateProfileAction(
  _previous: ActionResult<void> | null,
  formData: FormData,
): Promise<ActionResult<void>> {
  const actor = await requireActor();

  const parsed = updateProfileSchema.safeParse({ fullName: formData.get('fullName') });
  if (!parsed.success) {
    return actionError('Check the form and try again', toFieldErrors(parsed.error));
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from('profiles')
    .update({ full_name: parsed.data.fullName })
    .eq('user_id', actor.userId);

  if (error) {
    logger.error('profile update failed', { ...describeError(error) });
    return actionError('Could not save your profile');
  }

  revalidatePath('/app', 'layout');
  return actionOk();
}

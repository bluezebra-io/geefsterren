import { redirect } from 'next/navigation';

import { SignInForm } from '@/components/portal/sign-in-form';
import { getPortalActor } from '@/features/auth/queries';

export const metadata = { title: 'Sign in — GeefSterren' };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const actor = await getPortalActor();
  if (actor) redirect('/app');

  const { next, error } = await searchParams;
  return <SignInForm next={next} error={error} />;
}

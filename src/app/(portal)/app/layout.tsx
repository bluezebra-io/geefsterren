import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

import { Sidebar } from '@/components/portal/sidebar';
import { SignOutButton } from '@/components/portal/sign-out-button';
import { Alert } from '@/components/ui';
import { signOutAction } from '@/features/auth/actions';
import { getPortalActor } from '@/features/auth/queries';
import { defaultOrganizationId, isPlatformStaff } from '@/features/auth/service';
import { getMessages } from '@/lib/i18n/locale';
import { resolveLocale } from '@/lib/i18n/locale';
import { I18nProvider } from '@/lib/i18n/provider';

export default async function PortalLayout({ children }: { children: ReactNode }) {
  const actor = await getPortalActor();

  // The proxy already redirects unauthenticated requests. This is the second
  // check, for a direct RSC request that bypasses it — cheap, and the
  // alternative is a crash on `actor.userId`.
  if (!actor) redirect('/auth/sign-in');

  const [t, locale] = await Promise.all([getMessages(), resolveLocale()]);
  const organizationId = defaultOrganizationId(actor);
  const hasContext = organizationId !== null || isPlatformStaff(actor);

  const roleLabel =
    actor.platformRole === 'platform_admin'
      ? t.roles.platformAdmin
      : actor.platformRole === 'platform_support'
        ? t.roles.platformSupport
        : null;

  return (
    <I18nProvider locale={locale} messages={t}>
      <div className="flex min-h-screen bg-[var(--color-background)]">
        <Sidebar>
          <div className="px-3 py-1">
            <p className="truncate text-sm font-medium text-[var(--color-text-inverse)]">
              {actor.fullName ?? actor.email}
            </p>
            {roleLabel ? (
              <p className="mt-0.5 text-xs text-[var(--color-text-inverse-muted)]">{roleLabel}</p>
            ) : null}
          </div>
          <form action={signOutAction} className="mt-2 px-1">
            <SignOutButton label={t.common.signOut} />
          </form>
        </Sidebar>

        <div className="flex min-w-0 flex-1 flex-col">
          <main className="mx-auto w-full max-w-portal flex-1 px-8 py-8">
            {hasContext ? (
              children
            ) : (
              <Alert tone="warning">{t.overview.notLinked}</Alert>
            )}
          </main>
        </div>
      </div>
    </I18nProvider>
  );
}

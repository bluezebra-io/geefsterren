import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

import { Sidebar } from '@/components/portal/sidebar';
import { SignOutButton } from '@/components/portal/sign-out-button';
import { Alert } from '@/components/ui';
import { signOutAction } from '@/features/auth/actions';
import { getPortalActor } from '@/features/auth/queries';
import { getActiveOrganizationId } from '@/features/auth/organization-context';
import { getOrganization } from '@/features/organizations/queries';
import { PlatformContextBanner } from '@/components/portal/platform-context-banner';
import { format } from '@/lib/i18n/locale';
import { isPlatformContext, isPlatformStaff } from '@/features/auth/service';
import { getMessages } from '@/lib/i18n/locale';
import { resolveLocale } from '@/lib/i18n/locale';
import { PortalI18nProvider } from '@/lib/i18n/provider';
import { pickPortalMessages } from '@/lib/i18n/scope';

export default async function PortalLayout({ children }: { children: ReactNode }) {
  const actor = await getPortalActor();

  // The proxy already redirects unauthenticated requests. This is the second
  // check, for a direct RSC request that bypasses it — cheap, and the
  // alternative is a crash on `actor.userId`.
  if (!actor) redirect('/auth/sign-in');

  const [t, locale, organizationId] = await Promise.all([
    getMessages(),
    resolveLocale(),
    getActiveOrganizationId(),
  ]);

  const hasContext = organizationId !== null || isPlatformStaff(actor);

  // Only look up the name when the banner will actually be shown.
  const platformContext = isPlatformContext(actor, organizationId);
  const viewedOrganization =
    platformContext && organizationId ? await getOrganization(organizationId) : null;

  const roleLabel =
    actor.platformRole === 'platform_admin'
      ? t.roles.platformAdmin
      : actor.platformRole === 'platform_support'
        ? t.roles.platformSupport
        : null;

  return (
    <PortalI18nProvider locale={locale} messages={pickPortalMessages(t)}>
      <div className="flex min-h-screen bg-[var(--color-background)]">
        <Sidebar showPlatformLink={isPlatformStaff(actor)}>
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
          {viewedOrganization ? (
            <PlatformContextBanner
              message={format(t.platform.contextBanner, {
                organization: viewedOrganization.name,
              })}
              exitLabel={t.platform.contextExit}
            />
          ) : null}

          <main className="mx-auto w-full max-w-portal flex-1 px-8 py-8">
            {hasContext ? (
              children
            ) : (
              <Alert tone="warning">{t.overview.notLinked}</Alert>
            )}
          </main>
        </div>
      </div>
    </PortalI18nProvider>
  );
}

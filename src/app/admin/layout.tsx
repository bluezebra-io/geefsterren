import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

import { Logo } from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import { signOutAction } from '@/features/auth/actions';
import { getPortalActor } from '@/features/auth/queries';
import { isPlatformStaff } from '@/features/auth/service';
import { getMessages, resolveLocale } from '@/lib/i18n/locale';
import { PortalI18nProvider } from '@/lib/i18n/provider';
import { pickPortalMessages } from '@/lib/i18n/scope';

/**
 * Platform administration.
 *
 * Guarded here rather than per page: everything under `/admin` is platform-only,
 * so the check belongs at the boundary. RLS is still the enforcement layer — a
 * non-staff user who reached a page anyway would simply see nothing.
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const actor = await getPortalActor();
  if (!actor) redirect('/auth/sign-in');
  if (!isPlatformStaff(actor)) redirect('/app');

  const [t, locale] = await Promise.all([getMessages(), resolveLocale()]);

  return (
    <PortalI18nProvider locale={locale} messages={pickPortalMessages(t)}>
      <div className="min-h-screen bg-[var(--color-background)]">
        <header className="bg-[var(--color-surface-inverse)]">
          <div className="mx-auto flex h-17 max-w-portal items-center justify-between px-8">
            <div className="flex items-center gap-4">
              <Logo inverse />
              <span className="rounded-sm bg-[rgba(253,251,247,.12)] px-2 py-0.5 text-xs font-semibold text-[var(--color-text-inverse)]">
                {t.platform.adminLink}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-[var(--color-text-inverse-muted)]">
                {actor.fullName ?? actor.email}
              </span>
              <form action={signOutAction}>
                <Button type="submit" variant="onDark" size="sm">
                  {t.common.signOut}
                </Button>
              </form>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-portal px-8 py-8">{children}</main>
      </div>
    </PortalI18nProvider>
  );
}

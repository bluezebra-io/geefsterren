import type { ReactNode } from 'react';

import { Logo } from '@/components/ui/logo';
import { getMessages, resolveLocale } from '@/lib/i18n/locale';
import { I18nProvider } from '@/lib/i18n/provider';

export default async function AuthLayout({ children }: { children: ReactNode }) {
  const [t, locale] = await Promise.all([getMessages(), resolveLocale()]);

  return (
    <I18nProvider locale={locale} messages={t}>
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)] px-5 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex flex-col items-center gap-2">
            <Logo />
            <p className="text-sm text-[var(--color-text-secondary)]">{t.auth.portalTitle}</p>
          </div>
          {children}
        </div>
      </div>
    </I18nProvider>
  );
}

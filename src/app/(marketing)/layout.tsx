import Link from 'next/link';
import type { ReactNode } from 'react';

import { Logo } from '@/components/ui/logo';
import { buttonVariants } from '@/components/ui/button';
import { clientEnv } from '@/lib/env';
import { getMessages } from '@/lib/i18n/locale';

/**
 * Public website shell — design system §8.
 *
 * Sticky navigation, 68px tall, cream at 88% with a 10px blur. The consumer is
 * the primary audience here; the business route is secondary and sits on the
 * right.
 */
export default async function MarketingLayout({ children }: { children: ReactNode }) {
  const t = await getMessages();
  const portalUrl = clientEnv().NEXT_PUBLIC_PORTAL_URL;

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <header className="sticky top-0 z-10 border-b border-[var(--color-border)] bg-[rgba(249,245,237,.88)] backdrop-blur-[10px]">
        <div className="mx-auto flex h-17 max-w-6xl items-center justify-between px-5">
          <Link href="/" aria-label={t.brand.name}>
            <Logo />
          </Link>

          <div className="flex items-center gap-2">
            <a
              href={portalUrl}
              className="rounded-md px-3 py-2 text-sm font-semibold text-[var(--color-text-link)] hover:text-[var(--color-text-link-hover)]"
            >
              {t.marketing.signInLink}
            </a>
            <Link
              href="/bedrijven"
              className={buttonVariants({ variant: 'primary', size: 'sm' })}
            >
              {t.marketing.forBusinesses}
            </Link>
          </div>
        </div>
      </header>

      {children}

      <footer className="mt-24 bg-ink-950 py-12 text-[var(--color-text-inverse-muted)]">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5">
          <Logo inverse />
          <p className="text-sm">{t.brand.tagline}</p>
        </div>
      </footer>
    </div>
  );
}

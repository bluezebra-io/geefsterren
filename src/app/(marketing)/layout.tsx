import Link from 'next/link';
import type { ReactNode } from 'react';

import { buttonVariants } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { appConfig } from '@/lib/env';
import { getMessages, resolveLocale } from '@/lib/i18n/locale';
import { PublicI18nProvider } from '@/lib/i18n/provider';
import { pickPublicMessages } from '@/lib/i18n/scope';

/**
 * Public website shell — design system §8.
 *
 * Sticky navigation, 68px tall, cream at 88% with a 10px blur. Logo left,
 * section links centre, sign-in and the business CTA right. The consumer is the
 * primary audience; the business route is the only amber element up here,
 * because amber marks the action.
 */
export default async function MarketingLayout({ children }: { children: ReactNode }) {
  const [t, locale] = await Promise.all([getMessages(), resolveLocale()]);
  const portalUrl = appConfig().PORTAL_URL;

  const sections = [
    { href: '/hoe-het-werkt', label: t.marketing.navHowItWorks },
    { href: '/verbeteringen', label: t.marketing.navImprovements },
    { href: '/bedrijven', label: t.marketing.forBusinesses },
  ];

  // The public site has Client Components too — the feedback code field and the
  // FAQ accordion — so it needs the catalogue across the boundary just like the
  // portal does.
  return (
    <PublicI18nProvider locale={locale} messages={pickPublicMessages(t)}>
      <div className="min-h-screen bg-[var(--color-background)]">
        <header className="sticky top-0 z-10 border-b border-[var(--color-border)] bg-[rgba(249,245,237,.88)] backdrop-blur-[10px]">
          <div className="mx-auto flex h-17 max-w-6xl items-center gap-8 px-6">
            <Link href="/" aria-label={t.brand.name} className="shrink-0">
              <Logo />
            </Link>

            <nav className="hidden items-center gap-7 md:flex">
              {sections.map((section) => (
                <Link
                  key={section.href}
                  href={section.href}
                  className="text-[0.95rem] font-semibold text-[var(--color-text-primary)] transition-colors duration-140 hover:text-ink-700"
                >
                  {section.label}
                </Link>
              ))}
            </nav>

            <div className="ml-auto flex shrink-0 items-center gap-3">
              <a
                href={portalUrl}
                className="text-[0.95rem] font-semibold text-[var(--color-text-primary)] transition-colors duration-140 hover:text-ink-700"
              >
                {t.marketing.signInLink}
              </a>
              <Link href="/bedrijven" className={buttonVariants({ variant: 'primary' })}>
                {t.marketing.forBusinesses}
              </Link>
            </div>
          </div>
        </header>

        {children}

        <footer className="bg-ink-950 py-12 text-[var(--color-text-inverse-muted)]">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6">
            <Logo inverse />
            <p className="text-sm">{t.brand.tagline}</p>
          </div>
        </footer>
      </div>
    </PublicI18nProvider>
  );
}

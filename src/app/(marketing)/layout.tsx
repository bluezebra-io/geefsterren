import Link from 'next/link';
import type { ReactNode } from 'react';

import { buttonVariants } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { SiteNav } from '@/components/website/site-nav';
import { appConfig } from '@/lib/env';
import { getMessages, resolveLocale } from '@/lib/i18n/locale';
import { PublicI18nProvider } from '@/lib/i18n/provider';
import { pickPublicMessages } from '@/lib/i18n/scope';

/**
 * Public website shell — design system §8 and handoff "Global chrome".
 *
 * Sticky navigation, 68px tall, cream at 88% with a 10px blur. This is the only
 * place in the brand where `backdrop-filter` is allowed, alongside the modal
 * scrim — no glass effects anywhere else.
 *
 * The consumer is the primary audience; the business route is the only amber
 * element up here, because amber marks the action.
 *
 * `SiteNav` is a Client Component only so the active underline can follow the
 * current route. Its copy still arrives as props.
 */
export default async function MarketingLayout({ children }: { children: ReactNode }) {
  const [t, locale] = await Promise.all([getMessages(), resolveLocale()]);
  const portalUrl = appConfig().PORTAL_URL;

  const sections = [
    { href: '/hoe-het-werkt', label: t.marketing.navHowItWorks },
    { href: '/verbeteringen', label: t.marketing.navImprovements },
    { href: '/voor-bedrijven', label: t.chrome.navForBusinesses },
  ];

  const footerColumns = [
    {
      title: t.chrome.footerGuests,
      links: [
        { href: '/hoe-het-werkt', label: t.chrome.footerGuestsHowItWorks },
        { href: '/verbeteringen', label: t.chrome.footerGuestsImprovements },
        { href: '/hoe-het-werkt', label: t.chrome.footerGuestsCode },
      ],
    },
    {
      title: t.chrome.footerBusiness,
      links: [
        { href: '/voor-bedrijven', label: t.chrome.footerBusinessProduct },
        {
          href: 'mailto:support@geefsterren.nl?subject=Demo%20GeefSterren',
          label: t.chrome.footerBusinessDemo,
        },
        { href: portalUrl, label: t.chrome.footerBusinessSignIn },
      ],
    },
    {
      title: t.chrome.footerLegal,
      links: [
        { href: '/privacy', label: t.chrome.footerLegalPrivacy },
        { href: '/gegevens', label: t.chrome.footerLegalData },
        { href: '/voorwaarden', label: t.chrome.footerLegalTerms },
      ],
    },
    {
      title: t.chrome.footerContact,
      links: [
        { href: 'mailto:support@geefsterren.nl', label: t.chrome.footerContactForm },
        { href: 'mailto:support@geefsterren.nl', label: t.chrome.footerContactEmail },
      ],
    },
  ];

  // The public site has Client Components too — the feedback code field and the
  // FAQ accordion — so it needs the catalogue across the boundary just like the
  // portal does. The three page scopes stay out of it: those pages are
  // server-rendered, so their copy never has to reach the browser.
  return (
    <PublicI18nProvider locale={locale} messages={pickPublicMessages(t)}>
      <div className="flex min-h-screen flex-col bg-[var(--color-background)]">
        <header className="sticky top-0 z-20 border-b border-[var(--color-border)] bg-[rgba(249,245,237,.88)] backdrop-blur-[10px]">
          <div className="mx-auto flex h-17 max-w-6xl items-center gap-7 px-6">
            <Link href="/" aria-label={t.brand.name} className="shrink-0">
              <Logo />
            </Link>

            <SiteNav sections={sections} label={t.marketing.navHowItWorks} />

            <div className="ml-auto flex shrink-0 items-center gap-3">
              <a
                href={portalUrl}
                className="hidden text-[0.95rem] font-medium text-[var(--color-text-primary)] transition-colors duration-140 hover:text-ink-700 sm:block"
              >
                {t.marketing.signInLink}
              </a>
              {/* Kept visible at every width — it is the business route's only entry. */}
              <Link
                href="/voor-bedrijven"
                className={buttonVariants({ variant: 'primary', size: 'sm' })}
              >
                {t.chrome.ctaDemo}
              </Link>
            </div>
          </div>
        </header>

        <div className="flex-1">{children}</div>

        <footer className="bg-ink-950 pt-12 pb-6.5 text-[var(--color-text-inverse-muted)]">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.5fr_repeat(4,1fr)]">
              <div className="flex flex-col gap-3">
                <Logo inverse />
                <p className="max-w-[15.625rem] text-[0.84375rem] leading-relaxed">
                  {t.chrome.footerTagline}
                </p>
              </div>

              {footerColumns.map((column) => (
                <div key={column.title} className="flex flex-col gap-2.5">
                  <p className="text-[0.71875rem] font-bold tracking-widest text-[rgba(253,251,247,.5)] uppercase">
                    {column.title}
                  </p>
                  {column.links.map((link) => (
                    <Link
                      key={`${column.title}-${link.label}`}
                      href={link.href}
                      /*
                       * The three legal routes are not built yet. Prefetching
                       * them would fire a 404 from every page in the site;
                       * they still belong in the footer, so the link stays and
                       * the prefetch goes.
                       */
                      prefetch={false}
                      className="text-[0.84375rem] text-[var(--color-text-inverse-muted)] transition-colors duration-140 hover:text-[var(--color-text-inverse)]"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              ))}
            </div>

            <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-border-inverse)] pt-4.5 text-xs text-[rgba(253,251,247,.55)]">
              <p>{t.chrome.footerCopyright}</p>
              <p>{t.chrome.footerRegistration}</p>
            </div>
          </div>
        </footer>
      </div>
    </PublicI18nProvider>
  );
}

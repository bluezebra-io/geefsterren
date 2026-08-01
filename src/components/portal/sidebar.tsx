'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BadgeCheck,
  LayoutDashboard,
  MapPin,
  MessageSquareQuote,
  Settings,
  Sparkles,
  Users,
  type LucideIcon,
} from 'lucide-react';

import { Logo } from '@/components/ui/logo';
import { useMessages } from '@/lib/i18n/provider';
import { cn } from '@/lib/utils';

/**
 * Portal sidebar — design system §7.
 *
 * 256px wide, ink background. This is the only inversion in the system; every
 * other surface is cream or white.
 *
 * Icon names come from the fixed product set in §11 — no synonyms.
 */

type NavEntry = { href: string; label: string; icon: LucideIcon; exact?: boolean };

export function Sidebar({ children }: { children?: React.ReactNode }) {
  const t = useMessages();
  const pathname = usePathname();

  const main: NavEntry[] = [
    { href: '/app', label: t.nav.overview, icon: LayoutDashboard, exact: true },
    { href: '/app/locations', label: t.nav.locations, icon: MapPin },
  ];

  // Listed but not yet routed: these land with their own phases. Showing them
  // as disabled would be noise, so they simply are not rendered yet.
  const manage: NavEntry[] = [
    { href: '/app/settings/users', label: t.nav.users, icon: Users },
  ];

  return (
    <aside className="flex w-sidebar shrink-0 flex-col bg-[var(--color-surface-inverse)] px-4 py-5 text-[var(--color-text-inverse)]">
      <Link href="/app" className="mb-6 inline-flex px-3">
        <Logo inverse />
      </Link>

      <NavGroup label={t.nav.sectionMain} />
      <Nav entries={main} pathname={pathname} />

      <NavGroup label={t.nav.sectionManage} />
      <Nav entries={manage} pathname={pathname} />

      <div className="mt-auto border-t border-[var(--color-border-inverse)] pt-4">{children}</div>
    </aside>
  );
}

function NavGroup({ label }: { label: string }) {
  return (
    <p className="mt-5 mb-2 px-3 text-xs font-bold tracking-widest text-[rgba(253,251,247,.5)] uppercase first:mt-0">
      {label}
    </p>
  );
}

function Nav({ entries, pathname }: { entries: NavEntry[]; pathname: string }) {
  return (
    <nav className="flex flex-col gap-0.5">
      {entries.map((entry) => {
        const active = entry.exact ? pathname === entry.href : pathname.startsWith(entry.href);
        const Icon = entry.icon;

        return (
          <Link
            key={entry.href}
            href={entry.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex min-h-11 items-center gap-3 rounded-md px-3 py-2 text-sm font-medium',
              'transition-colors duration-140 ease-[cubic-bezier(.2,.8,.2,1)]',
              active
                ? 'bg-[rgba(253,251,247,.12)] font-semibold text-[var(--color-text-inverse)]'
                : 'text-[var(--color-text-inverse-muted)] hover:bg-[rgba(253,251,247,.08)] hover:text-[var(--color-text-inverse)]',
            )}
          >
            <Icon
              aria-hidden="true"
              className={cn('size-[18px] shrink-0', active && 'text-[var(--color-brand-primary)]')}
            />
            {entry.label}
          </Link>
        );
      })}
    </nav>
  );
}

/** Exported so future phases can extend the nav without touching this file. */
export const PRODUCT_ICONS = {
  feedback: MessageSquareQuote,
  reviewReadiness: BadgeCheck,
  analyses: Sparkles,
  settings: Settings,
} as const;

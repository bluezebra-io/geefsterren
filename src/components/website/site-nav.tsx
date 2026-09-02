'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

/**
 * The public site's main navigation.
 *
 * A Client Component only because the active underline has to follow the
 * current route, which the server layout cannot know. Copy still arrives as
 * props, so no message catalogue crosses the boundary for this.
 *
 * Inactive links carry a transparent 2px bottom border rather than none, so
 * gaining the active border never shifts the text by a pixel.
 */
export function SiteNav({
  sections,
  label,
}: {
  sections: ReadonlyArray<{ href: string; label: string }>;
  label: string;
}) {
  const pathname = usePathname();

  return (
    <nav aria-label={label} className="hidden flex-1 items-center gap-6 md:flex">
      {sections.map((section) => {
        const active = pathname === section.href || pathname.startsWith(`${section.href}/`);
        return (
          <Link
            key={section.href}
            href={section.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'border-b-2 pb-0.5 text-[0.95rem] font-medium text-[var(--color-text-primary)]',
              'transition-colors duration-140 ease-[cubic-bezier(.2,.8,.2,1)] hover:text-ink-700',
              active ? 'border-[var(--color-brand-primary)]' : 'border-transparent',
            )}
          >
            {section.label}
          </Link>
        );
      })}
    </nav>
  );
}

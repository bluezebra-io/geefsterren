import { cn } from '@/lib/utils';

/**
 * The brand lockup: an amber tile holding a white star, followed by the
 * wordmark.
 *
 * The star path is copied verbatim from `assets/star-plain.svg` in the handoff
 * and inlined rather than loaded as an `<img>`, so it can take a fill per
 * surface.
 *
 * The wordmark is deliberately **not** an SVG: it is Plus Jakarta Sans 800 at
 * `letter-spacing: -0.024em`, with "Geef" in ink and "Sterren" in amber. As
 * text it stays selectable and matches the loaded font exactly.
 */

const STAR_PATH =
  'M 57.8 11.1 Q 60.0 5.0 62.2 11.1 L 70.5 33.5 Q 72.9 40.2 80.1 40.5 L 103.9 41.4 Q 110.4 41.6 105.3 45.6 L 86.5 60.4 Q 80.9 64.8 82.9 71.7 L 89.4 94.6 Q 91.2 100.9 85.8 97.3 L 65.9 84.0 Q 60.0 80.0 54.1 84.0 L 34.2 97.3 Q 28.8 100.9 30.6 94.6 L 37.1 71.7 Q 39.1 64.8 33.5 60.4 L 14.7 45.6 Q 9.6 41.6 16.1 41.4 L 39.9 40.5 Q 47.1 40.2 49.5 33.5 L 57.8 11.1 Z';

/** The star on its own, for the rating row and the empty-state art. */
export function Star({
  className,
  filled = true,
}: {
  className?: string;
  filled?: boolean;
}) {
  return (
    <svg viewBox="0 0 120 120" aria-hidden="true" className={cn('size-5', className)}>
      <path
        d={STAR_PATH}
        fill={filled ? 'currentColor' : 'none'}
        stroke={filled ? undefined : 'currentColor'}
        strokeWidth={filled ? undefined : 9}
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** The amber tile with the star inside. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'grid size-9 shrink-0 place-items-center rounded-[0.5rem] bg-[var(--color-brand-primary)] text-white',
        className,
      )}
    >
      <Star className="size-[60%]" />
    </span>
  );
}

export function Logo({
  className,
  inverse = false,
  markClassName,
  wordmarkClassName,
}: {
  className?: string;
  inverse?: boolean;
  markClassName?: string;
  wordmarkClassName?: string;
}) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark className={markClassName} />
      <span
        className={cn('font-display text-xl font-extrabold', wordmarkClassName)}
        style={{ letterSpacing: '-0.024em' }}
      >
        <span style={{ color: inverse ? 'var(--color-text-inverse)' : 'var(--gs-ink-900)' }}>
          Geef
        </span>
        <span
          style={{ color: inverse ? 'var(--color-brand-primary)' : 'var(--gs-amber-600)' }}
        >
          Sterren
        </span>
      </span>
    </span>
  );
}

/** Attribution at the bottom of every guest-facing screen. */
export function PoweredBy({ label }: { label: string }) {
  return <p className="text-center text-xs text-[var(--color-text-muted)]">{label}</p>;
}

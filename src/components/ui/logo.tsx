import { cn } from '@/lib/utils';

/**
 * The brand lockup — design system §11.
 *
 * The mark is "De Feedbackster": a speech bubble with a star cut out of it,
 * tail bottom-left. One path with `fill-rule: evenodd`, so it renders in any
 * single colour and stays legible from 16px. The path below is copied verbatim
 * from `assets/logo-mark.svg` in the handoff — inlined rather than loaded as an
 * `<img>` so it can inherit a colour per surface.
 *
 * The wordmark is deliberately **not** an SVG: it is Plus Jakarta Sans 800 at
 * `letter-spacing: -0.024em`, with "Geef" in ink and "Sterren" in amber-700.
 * As text it stays selectable and matches the loaded font exactly.
 */

const MARK_PATH =
  'M 24 2 H 96 A 22 22 0 0 1 118 24 V 78 A 22 22 0 0 1 96 100 H 46 L 33 116 Q 27 121 28 113 L 30 100 H 24 A 22 22 0 0 1 2 78 V 24 A 22 22 0 0 1 24 2 Z M 58.27 19.69 Q 60.00 15.00 61.73 19.69 L 66.82 33.47 Q 68.82 38.86 74.56 39.09 L 89.24 39.68 Q 94.24 39.88 90.31 42.97 L 78.78 52.07 Q 74.27 55.64 75.82 61.17 L 79.81 75.31 Q 81.16 80.12 77.00 77.35 L 64.78 69.19 Q 60.00 66.00 55.22 69.19 L 43.00 77.35 Q 38.84 80.12 40.19 75.31 L 44.18 61.17 Q 45.73 55.64 41.22 52.07 L 29.69 42.97 Q 25.76 39.88 30.76 39.68 L 45.44 39.09 Q 51.18 38.86 53.18 33.47 L 58.27 19.69 Z';

const TONE_FILL = {
  amber: 'var(--color-brand-primary)',
  ink: 'var(--gs-ink-900)',
  cream: 'var(--gs-cream-50)',
} as const;

export type LogoTone = keyof typeof TONE_FILL;

export function LogoMark({
  className,
  tone = 'amber',
  title = 'GeefSterren',
}: {
  className?: string;
  tone?: LogoTone;
  title?: string;
}) {
  return (
    <svg viewBox="0 0 120 120" role="img" aria-label={title} className={cn('size-7', className)}>
      <path d={MARK_PATH} fill={TONE_FILL[tone]} fillRule="evenodd" clipRule="evenodd" />
    </svg>
  );
}

export function Logo({
  className,
  inverse = false,
}: {
  className?: string;
  inverse?: boolean;
}) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <LogoMark tone="amber" className="size-7" />
      <span className="font-display text-lg font-extrabold" style={{ letterSpacing: '-0.024em' }}>
        <span style={{ color: inverse ? 'var(--color-text-inverse)' : 'var(--gs-ink-900)' }}>
          Geef
        </span>
        <span style={{ color: inverse ? 'var(--color-brand-primary)' : 'var(--gs-amber-700)' }}>
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

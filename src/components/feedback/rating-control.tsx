'use client';

import { useRef, useState } from 'react';

import { Star } from '@/components/ui/logo';
import { cn } from '@/lib/utils';

/**
 * RatingControl — the product signature, design system §5.2.
 *
 * Built by hand rather than with a library, because the behaviour *is* the
 * product:
 *
 * - **Cumulative fill.** At a score of 4, stars 1–4 are filled amber and star 5
 *   is an outline. Shape carries the meaning; colour only supports it, which is
 *   what makes it readable for someone who cannot distinguish amber from grey.
 * - **A real radiogroup.** Arrow keys move, Space and Enter choose, and only the
 *   selected option is in the tab order — so the whole scale is one tab stop, not
 *   five.
 * - **Nothing is preselected.** A default answer is an answer the guest did not
 *   give.
 * - **No reaction to a low score.** No colour shift, no wobble, no doubt. A low
 *   score is data, not a mistake.
 *
 * The animation is 6% of scale on the chosen star, once. That is the entire
 * motion budget.
 */

const LABEL_KEYS = ['veryPoor', 'poor', 'fair', 'good', 'excellent'] as const;

export type RatingLabels = {
  veryPoor: string;
  poor: string;
  fair: string;
  good: string;
  excellent: string;
  /** `"{score} of {total} stars, {label}"` for the accessible name. */
  optionLabel: string;
  scaleLow: string;
  scaleHigh: string;
};

export function RatingControl({
  name,
  labels,
  value,
  onChange,
  size = 'lg',
}: {
  name: string;
  labels: RatingLabels;
  value: number | null;
  onChange: (score: number) => void;
  size?: 'md' | 'lg';
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);

  // Hover and focus preview the fill, so the control explains itself before a
  // choice is made.
  const preview = hovered ?? value;

  function move(delta: number) {
    const current = value ?? 1;
    const next = Math.min(5, Math.max(1, current + delta));
    onChange(next);
    buttons.current[next - 1]?.focus();
  }

  return (
    <div>
      <div
        role="radiogroup"
        aria-label={labels.optionLabel.replace('{score}', '1').replace('{total}', '5').split(',')[0]}
        className="flex gap-2"
        onMouseLeave={() => setHovered(null)}
      >
        {[1, 2, 3, 4, 5].map((score) => {
          const label = labels[LABEL_KEYS[score - 1]];
          const filled = preview !== null && score <= preview;
          const chosen = value === score;

          return (
            <button
              key={score}
              ref={(node) => {
                buttons.current[score - 1] = node;
              }}
              type="button"
              role="radio"
              aria-checked={chosen}
              aria-label={labels.optionLabel
                .replace('{score}', String(score))
                .replace('{total}', '5')
                .replace('{label}', label)}
              // One tab stop for the whole scale: the selected option, or the
              // first when nothing is chosen yet.
              tabIndex={chosen || (value === null && score === 1) ? 0 : -1}
              onClick={() => onChange(score)}
              onMouseEnter={() => setHovered(score)}
              onFocus={() => setHovered(score)}
              onBlur={() => setHovered(null)}
              onKeyDown={(event) => {
                if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
                  event.preventDefault();
                  move(-1);
                } else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
                  event.preventDefault();
                  move(1);
                }
              }}
              className={cn(
                'relative flex flex-1 flex-col items-center gap-1 rounded-md border-2 pb-2 transition-colors duration-140',
                'active:scale-[0.97]',
                size === 'lg' ? 'min-h-16 pt-3' : 'min-h-11 pt-2.5',
                chosen
                  ? 'border-ink-900 bg-[var(--color-surface-brand-soft)]'
                  : 'border-cream-400 bg-[var(--color-surface)] hover:bg-[var(--color-surface-brand-soft)]',
              )}
            >
              <Star
                filled={filled}
                className={cn(
                  size === 'lg' ? 'size-10' : 'size-6',
                  filled ? 'text-[var(--color-rating-star)]' : 'text-cream-300',
                  chosen && 'motion-safe:scale-[1.06]',
                  'transition-transform duration-200 ease-[cubic-bezier(.34,1.4,.64,1)]',
                )}
              />
              <span className="tabular text-xs font-bold text-[var(--color-text-secondary)]">
                {score}
              </span>
              {chosen ? (
                <span className="absolute inset-x-2 -bottom-px h-[3px] rounded-full bg-ink-900" />
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="mt-2 flex justify-between text-xs text-[var(--color-text-muted)]">
        <span>{labels.scaleLow}</span>
        <span>{labels.scaleHigh}</span>
      </div>

      {/* Announced on change, so a screen reader confirms the choice. */}
      <p aria-live="polite" className="mt-2 min-h-5 text-sm font-medium text-[var(--color-text-primary)]">
        {value === null ? '' : `${value} — ${labels[LABEL_KEYS[value - 1]]}`}
      </p>

      <input type="hidden" name={name} value={value ?? ''} />
    </div>
  );
}

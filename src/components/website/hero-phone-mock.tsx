import { Check } from 'lucide-react';

import { Star } from '@/components/ui/logo';
import type { PublicMessages } from '@/lib/i18n/scope';
import { cn } from '@/lib/utils';

/**
 * The hero illustration: the guest flow as it appears on a phone.
 *
 * Entirely decorative — `aria-hidden`, no interactivity, no state. It shows what
 * the product looks like; the real, keyboard-operable `RatingControl` is built
 * with the guest flow in Phase 3.
 *
 * Even so it follows the rating rules, because a mock that contradicts the
 * product teaches the wrong thing: fill is **cumulative** (a score of 4 fills
 * stars 1–4 and leaves star 5 outlined), the selected option carries an ink
 * border plus an ink bar, and the numeral and legend do the work colour cannot.
 *
 * The screen is locked to a real handset aspect ratio (9:19.5, roughly an
 * iPhone 14). Letting the height follow the content produced a squat, nearly
 * square slab that read as a tablet — so the frame sets the proportion and the
 * content fills it.
 */
const SELECTED_SCORE = 4;
const TOTAL_STARS = 5;

export function HeroPhoneMock({ t }: { t: PublicMessages }) {
  const m = t.marketing;
  const topics = [m.mockTopic1, m.mockTopic2, m.mockTopic3, m.mockTopic4];

  return (
    <div aria-hidden="true" className="relative mx-auto w-fit select-none">
      {/*
        Two rotated amber planes behind the device. They have to reach past both
        edges of the frame — inset within its width and they are simply covered.
      */}
      <div className="absolute -inset-x-7 top-14 bottom-14 -rotate-2 rounded-2xl bg-amber-200" />
      <div className="absolute -inset-x-4 top-24 bottom-8 rotate-3 rounded-2xl bg-amber-100" />

      <div className="relative w-[17.5rem] rounded-[2.5rem] border-[7px] border-ink-900 bg-ink-900 shadow-[var(--shadow-lg)]">
        <div className="flex aspect-[9/19.5] flex-col overflow-hidden rounded-[2rem] bg-[var(--color-surface)]">
          {/* Location header */}
          <div className="flex items-center gap-2.5 px-4 pt-5">
            <span className="font-display grid size-8 shrink-0 place-items-center rounded-md bg-ink-800 text-[0.65rem] font-extrabold text-cream-50">
              DH
            </span>
            <div className="min-w-0">
              <p className="font-display truncate text-[0.9rem] leading-tight font-extrabold text-[var(--color-text-primary)]">
                {m.mockLocationName}
              </p>
              <p className="truncate text-[0.68rem] text-[var(--color-text-muted)]">
                {m.mockLocationMeta}
              </p>
            </div>
          </div>

          {/* Progress: a 6px bar with the step count beside it. */}
          <div className="mt-4 flex items-center gap-2 px-4">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-cream-200">
              <div className="h-full w-1/2 rounded-full bg-[var(--color-brand-primary)]" />
            </div>
            <span className="tabular text-[0.68rem] font-semibold text-[var(--color-text-secondary)]">
              2/4
            </span>
          </div>

          {/*
            Three groups with `justify-between`, so the leftover height of the
            fixed-ratio screen spreads across the gaps instead of collecting in
            one void above the button.
          */}
          <div className="mt-4 flex flex-1 flex-col justify-between border-t border-[var(--color-border)] px-4 pt-5 pb-5">
            <div>
              <p className="font-display text-[1.05rem] leading-snug font-bold text-[var(--color-text-primary)]">
                {m.mockRatingQuestion}
              </p>

              <div className="mt-4 flex gap-1.5">
                {Array.from({ length: TOTAL_STARS }, (_, index) => {
                  const value = index + 1;
                  const filled = value <= SELECTED_SCORE;
                  const chosen = value === SELECTED_SCORE;

                  return (
                    <div
                      key={value}
                      className={cn(
                        'relative flex flex-1 flex-col items-center gap-1 rounded-md border-2 pt-3 pb-2.5',
                        chosen
                          ? 'border-ink-900 bg-[var(--color-surface-brand-soft)]'
                          : 'border-cream-400 bg-[var(--color-surface)]',
                      )}
                    >
                      <Star
                        filled={filled}
                        className={cn(
                          'size-[1.15rem]',
                          filled ? 'text-[var(--color-rating-star)]' : 'text-cream-300',
                        )}
                      />
                      <span className="tabular text-[0.65rem] font-bold text-[var(--color-text-secondary)]">
                        {value}
                      </span>
                      {chosen ? (
                        <span className="absolute inset-x-2 -bottom-px h-[3px] rounded-full bg-ink-900" />
                      ) : null}
                    </div>
                  );
                })}
              </div>

              <div className="mt-2 flex justify-between text-[0.65rem] text-[var(--color-text-muted)]">
                <span>{m.mockScaleLow}</span>
                <span>{m.mockScaleHigh}</span>
              </div>
            </div>

            <div>
              <p className="text-[0.82rem] font-semibold text-[var(--color-text-primary)]">
                {m.mockFollowUpQuestion}
              </p>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {topics.map((topic, index) => {
                  const selected = index === 0;
                  return (
                    <span
                      key={topic}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[0.76rem] font-medium',
                        selected
                          ? 'border-ink-900 bg-ink-900 text-cream-50'
                          : 'border-cream-400 bg-[var(--color-surface)] text-[var(--color-text-primary)]',
                      )}
                    >
                      {selected ? (
                        <Check className="size-3.5 text-[var(--color-brand-primary)]" />
                      ) : null}
                      {topic}
                    </span>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="flex h-12 items-center justify-center rounded-full bg-[var(--color-brand-primary)] text-[0.95rem] font-semibold text-[var(--color-brand-primary-ink)]">
                {m.mockNext}
              </div>

              <div className="mt-3 flex items-end justify-between gap-2">
                <p className="max-w-[9.5rem] text-[0.63rem] leading-tight text-[var(--color-text-muted)]">
                  {t.brand.poweredBy}
                </p>
                <span className="font-display text-[0.7rem] font-extrabold whitespace-nowrap">
                  <span className="text-ink-900">Geef</span>
                  <span className="text-amber-600">Sterren</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

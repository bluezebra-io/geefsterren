import Link from 'next/link';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

/**
 * Public website components — design system §5.3 and `components/website.css`.
 *
 * These carry the credibility rules of the public site, which are functional
 * requirements rather than styling choices. Each one is noted at its component.
 */

/* ------------------------------------------------------------- Eyebrow --- */

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-bold tracking-widest text-amber-700 uppercase">{children}</p>
  );
}

/* -------------------------------------------------------- ExampleLabel --- */

/**
 * Marks demonstration data. Required on every figure that is not a verified
 * customer result.
 *
 * Dashed outline and no fill on purpose: it must read as a caveat, not as a
 * badge of quality. It belongs next to the heading of the block it applies to,
 * never hidden in a footnote.
 */
export function ExampleLabel({ children }: { children?: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-sm border border-dashed border-ink-300 px-2 py-0.5 text-xs font-bold tracking-[0.04em] text-[var(--color-text-muted)] uppercase">
      {children ?? 'Example · demonstration data'}
    </span>
  );
}

/* ------------------------------------------------------------ StepFlow --- */

export type FlowStep = { title: string; text?: string };

/**
 * The Feedback → Insight → Improvement → Result progression.
 *
 * Numbers are ink circles; only the payoff step may be amber, because amber
 * means "this is the action or the outcome" and using it four times would say
 * nothing. One sentence per step — if a step needs two, it is two steps.
 */
export function StepFlow({ steps, brandLast = false }: { steps: FlowStep[]; brandLast?: boolean }) {
  return (
    <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((step, index) => {
        const isPayoff = brandLast && index === steps.length - 1;
        return (
          <li key={step.title}>
            <span
              className={cn(
                'tabular grid size-9 place-items-center rounded-full text-sm font-bold',
                isPayoff
                  ? 'bg-[var(--color-brand-primary)] text-[var(--color-brand-primary-ink)]'
                  : 'bg-ink-900 text-[var(--color-text-inverse)]',
              )}
            >
              {index + 1}
            </span>
            <h3 className="mt-4 text-lg font-semibold text-[var(--color-text-primary)]">
              {step.title}
            </h3>
            {step.text ? (
              <p className="mt-2 text-sm leading-[1.55] text-[var(--color-text-secondary)]">
                {step.text}
              </p>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

/* --------------------------------------------------------- BeforeAfter --- */

/**
 * The evidence unit of the public site: one metric, before and after a change.
 *
 * The old value is struck through and muted; the new value is the large one. No
 * arrows that scream growth.
 *
 * `note` is typed as required rather than optional: a before/after without a
 * period and a response count is a marketing claim, not evidence. Making it
 * optional in the type would make it optional in practice.
 *
 * Copy must state sequence, never causation — "after the change the score for
 * temperature rose", not "the new packaging caused +24%".
 */
export function BeforeAfter({
  label,
  from,
  to,
  unit,
  note,
  progress,
}: {
  label: string;
  from: string | number;
  to: string | number;
  unit?: string;
  note: string;
  progress?: number;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium text-[var(--color-text-secondary)]">{label}</p>
      <div className="flex items-baseline gap-3">
        <span className="tabular text-2xl font-bold text-[var(--color-text-muted)] line-through decoration-1">
          {from}
          {unit}
        </span>
        <span aria-hidden="true" className="text-amber-600">
          →
        </span>
        <span className="tabular text-4xl leading-none font-bold tracking-snug text-[var(--color-text-primary)]">
          {to}
          {unit}
        </span>
      </div>
      {typeof progress === 'number' ? (
        <div className="h-2 overflow-hidden rounded-full bg-cream-300">
          <div
            className="h-full rounded-full bg-[var(--color-success)]"
            style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
          />
        </div>
      ) : null}
      <p className="text-xs text-[var(--color-text-muted)]">{note}</p>
    </div>
  );
}

/* -------------------------------------------------------- PublicMetric --- */

/**
 * A summary number on a public page.
 *
 * Public metrics lead with volume and improvement, never with a star average as
 * the single dominant figure. `context` is required for the same reason as
 * BeforeAfter's `note`: no metric without its period and its base.
 */
export function PublicMetric({
  value,
  label,
  context,
}: {
  value: ReactNode;
  label: string;
  context: string;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <p className="tabular text-3xl leading-[1.05] font-bold text-[var(--color-text-primary)]">
        {value}
      </p>
      <p className="text-sm font-medium text-[var(--color-text-primary)]">{label}</p>
      <p className="text-xs text-[var(--color-text-muted)]">{context}</p>
    </div>
  );
}

/* -------------------------------------------------------- LocationCard --- */

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');
}

/**
 * One public improvement update from a business.
 *
 * No score, no stars, no ranking — this grid is not a leaderboard. Two
 * sentences only: what customers asked for, and what changed. Anything longer
 * belongs on the location page.
 */
export function LocationCard({
  name,
  city,
  topic,
  change,
  date,
  href,
}: {
  name: string;
  city?: string;
  topic: string;
  change: string;
  date?: string;
  href?: string;
}) {
  const content = (
    <>
      <div className="flex items-center gap-3">
        <span className="font-display grid size-10 shrink-0 place-items-center rounded-md bg-ink-800 text-sm font-extrabold text-cream-50">
          {initialsOf(name)}
        </span>
        <div className="min-w-0">
          <p className="font-display text-base leading-tight font-bold text-[var(--color-text-primary)]">
            {name}
          </p>
          {city ? <p className="text-xs text-[var(--color-text-muted)]">{city}</p> : null}
        </div>
      </div>
      <p className="text-sm leading-[1.55] text-[var(--color-text-secondary)]">“{topic}”</p>
      <p className="text-sm leading-[1.55] text-[var(--color-text-primary)]">{change}</p>
      {date ? <p className="text-xs text-[var(--color-text-muted)]">{date}</p> : null}
    </>
  );

  const className =
    'flex flex-col gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5 transition-[border-color,box-shadow] duration-140 ease-[cubic-bezier(.2,.8,.2,1)]';

  if (href) {
    return (
      <Link
        href={href}
        className={cn(className, 'hover:border-[var(--color-border-strong)] hover:shadow-[var(--shadow-sm)]')}
      >
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}

/* --------------------------------------------------- TransparencyBlock --- */

/**
 * How the numbers on this page were produced, and what is not shown.
 *
 * Never in the footer only — on a data page it sits directly under the data it
 * explains. It must also say what GeefSterren does *not* do: no independent
 * audit, no verification of every improvement.
 */
export function TransparencyBlock({
  title,
  items,
  footer,
}: {
  title: string;
  items: string[];
  footer?: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface-muted)] p-6">
      <h3 className="text-base font-semibold text-[var(--color-text-primary)]">{title}</h3>
      <ul className="mt-3 flex flex-col gap-2">
        {items.map((item) => (
          <li
            key={item}
            className="flex gap-2 text-sm leading-[1.55] text-[var(--color-text-secondary)]"
          >
            <span aria-hidden="true" className="text-[var(--color-text-muted)]">
              •
            </span>
            {item}
          </li>
        ))}
      </ul>
      {footer ? <div className="mt-4 text-sm">{footer}</div> : null}
    </div>
  );
}

import { CircleCheck, CircleDashed, TrendingDown, TrendingUp } from 'lucide-react';
import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  LabelHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';

import { cn } from '@/lib/utils';

/**
 * Surface and form primitives — design system §5 and `components/*.css`.
 *
 * Values here are from the handoff and are not preferences: cards are 14px
 * round with a 1px cream border and a whisper-soft shadow; inputs and buttons
 * are 10px round and 44px tall; focus is a 2px ink outline plus a 3px amber
 * halo on form controls.
 */

/* ---------------------------------------------------------------- Card --- */

export function Card({
  className,
  tone = 'default',
  ...props
}: HTMLAttributes<HTMLDivElement> & { tone?: 'default' | 'muted' | 'brand' | 'inverse' }) {
  const tones = {
    default: 'bg-[var(--color-surface)] border-[var(--color-border)] shadow-[var(--shadow-xs)]',
    muted: 'bg-[var(--color-surface-muted)] border-[var(--color-border-strong)]',
    brand: 'bg-[var(--color-surface-brand-soft)] border-amber-200',
    inverse:
      'bg-[var(--color-surface-inverse)] border-[var(--color-border-inverse)] text-[var(--color-text-inverse)]',
  } as const;

  return <div className={cn('rounded-lg border', tones[tone], className)} {...props} />;
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-start justify-between gap-4 px-5 pt-5 pb-0', className)}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn('font-sans text-lg leading-snug font-semibold text-[var(--color-text-primary)]', className)}
      {...props}
    />
  );
}

export function CardSubtitle({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('mt-0.5 text-sm text-[var(--color-text-secondary)]', className)} {...props} />;
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5', className)} {...props} />;
}

/* --------------------------------------------------------------- Forms --- */

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn('block text-sm leading-[1.35] font-semibold text-[var(--color-text-primary)]', className)}
      {...props}
    />
  );
}

const fieldBase = [
  'w-full bg-[var(--color-surface)] text-[var(--color-text-primary)]',
  'border border-[var(--color-border-strong)] rounded-md',
  'font-sans text-base',
  'placeholder:text-[var(--color-text-muted)]',
  'transition-[border-color,box-shadow] duration-140 ease-[cubic-bezier(.2,.8,.2,1)]',
  'hover:border-ink-300',
  // The amber halo sits on top of the global 2px ink focus outline.
  'focus:outline-none focus:border-ink-900 focus:shadow-[var(--shadow-focus)]',
  'aria-invalid:border-2 aria-invalid:border-[var(--color-error)]',
  'disabled:bg-[var(--color-surface-muted)] disabled:text-[var(--color-text-muted)] disabled:cursor-not-allowed',
].join(' ');

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldBase, 'h-control-md px-4', className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(fieldBase, 'min-h-26 resize-y px-4 py-3 leading-normal', className)} {...props} />;
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative block">
      <select className={cn(fieldBase, 'h-control-md cursor-pointer appearance-none pr-10 pl-4', className)} {...props}>
        {children}
      </select>
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-[var(--color-text-secondary)]"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  );
}

export function Checkbox({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="checkbox"
      className={cn(
        'size-[1.375rem] shrink-0 rounded-sm border-2 border-ink-300 bg-[var(--color-surface)]',
        'accent-ink-900 checked:border-ink-900 checked:bg-ink-900',
        'focus-visible:shadow-[var(--shadow-focus)]',
        className,
      )}
      {...props}
    />
  );
}

/** Error text bound to its input by `id`, so screen readers announce it. */
export function FieldError({ id, messages }: { id?: string; messages?: string[] }) {
  if (!messages || messages.length === 0) return null;
  return (
    <p id={id} className="mt-1.5 text-sm font-medium text-[var(--color-error-text)]">
      {messages.join('. ')}
    </p>
  );
}

/* --------------------------------------------------------------- Alert --- */

const alertTones = {
  info: 'bg-[var(--color-info-soft)] border-blue-100 text-[var(--color-info-text)]',
  success: 'bg-[var(--color-success-soft)] border-green-100 text-[var(--color-success-text)]',
  warning: 'bg-[var(--color-warning-soft)] border-amber-200 text-amber-800',
  error: 'bg-[var(--color-error-soft)] border-coral-100 text-[var(--color-error-text)]',
  neutral:
    'bg-[var(--color-surface-muted)] border-[var(--color-border-strong)] text-[var(--color-text-primary)]',
} as const;

export function Alert({
  tone = 'neutral',
  title,
  children,
  className,
  role = 'status',
}: {
  tone?: keyof typeof alertTones;
  title?: string;
  children?: ReactNode;
  className?: string;
  role?: 'status' | 'alert';
}) {
  return (
    <div className={cn('flex gap-3 rounded-lg border p-4 text-sm', alertTones[tone], className)} role={role}>
      <div className="flex flex-col gap-1">
        {title ? <p className="text-base leading-[1.35] font-semibold">{title}</p> : null}
        {children ? <div className="leading-[1.55]">{children}</div> : null}
      </div>
    </div>
  );
}

/** Form-level error. `role="alert"` because it appears in response to an action. */
export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <Alert tone="error" role="alert">
      {message}
    </Alert>
  );
}

export function FormSuccess({ message }: { message?: string }) {
  if (!message) return null;
  return <Alert tone="success">{message}</Alert>;
}

/* --------------------------------------------------------------- Badge --- */

const badgeTones = {
  neutral: 'bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)]',
  brand: 'bg-amber-100 text-amber-800',
  success: 'bg-[var(--color-success-soft)] text-[var(--color-success-text)]',
  warning: 'bg-[var(--color-warning-soft)] text-amber-800',
  error: 'bg-[var(--color-error-soft)] text-[var(--color-error-text)]',
  info: 'bg-[var(--color-info-soft)] text-[var(--color-info-text)]',
} as const;

const badgeDotTones = {
  neutral: 'bg-[var(--color-text-muted)]',
  brand: 'bg-[var(--color-brand-primary)]',
  success: 'bg-[var(--color-success)]',
  warning: 'bg-[var(--color-warning)]',
  error: 'bg-[var(--color-error)]',
  info: 'bg-[var(--color-info)]',
} as const;

export function Badge({
  tone = 'neutral',
  dot = false,
  children,
}: {
  tone?: keyof typeof badgeTones;
  /** A status dot. Decorative — the label beside it carries the meaning. */
  dot?: boolean;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-xs font-semibold',
        badgeTones[tone],
      )}
    >
      {dot ? (
        <span
          aria-hidden="true"
          className={cn('size-1.5 shrink-0 rounded-full', badgeDotTones[tone])}
        />
      ) : null}
      {children}
    </span>
  );
}

/* ---------------------------------------------------------- Empty state --- */

/** One Lucide icon in a 112px amber disc — design system §11. */
export function EmptyState({
  title,
  description,
  icon,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
      {icon ? (
        <div className="grid size-28 place-items-center rounded-full bg-[var(--color-surface-brand-soft)] text-amber-700">
          {icon}
        </div>
      ) : null}
      <p className="font-display text-xl font-bold tracking-snug text-[var(--color-text-primary)]">{title}</p>
      {description ? (
        <p className="max-w-104 text-sm leading-[1.55] text-[var(--color-text-secondary)]">{description}</p>
      ) : null}
    </div>
  );
}

/* ----------------------------------------------------------- Stat card --- */

/**
 * A KPI tile. Every number carries an evidence line — design system §7: "elk
 * getal krijgt een bewijsregel".
 */
export function StatCard({
  label,
  value,
  evidence,
  delta,
  deltaDirection,
}: {
  label: string;
  value: string | number;
  evidence?: string;
  /** Pre-formatted, Dutch notation, U+2212 for a negative. */
  delta?: string;
  deltaDirection?: 'up' | 'down';
}) {
  const Trend = deltaDirection === 'down' ? TrendingDown : TrendingUp;

  return (
    <Card>
      <CardBody>
        <p className="text-sm text-[var(--color-text-secondary)]">{label}</p>
        {/* Wraps rather than clips: three of these fit in a 380px preview panel,
            where "1.248" and "+18%" cannot share a line. */}
        <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <p className="tabular text-4xl leading-none font-bold tracking-snug text-[var(--color-text-primary)]">
            {value}
          </p>
          {delta ? (
            <span
              className={cn(
                'tabular inline-flex items-center gap-1 text-sm font-semibold',
                deltaDirection === 'down'
                  ? 'text-[var(--color-error-text)]'
                  : 'text-[var(--color-success-text)]',
              )}
            >
              <Trend aria-hidden="true" className="size-3.5" />
              {delta}
            </span>
          ) : null}
        </div>
        {evidence ? (
          <p className="mt-2 text-xs text-[var(--color-text-muted)]">{evidence}</p>
        ) : null}
      </CardBody>
    </Card>
  );
}

/* ---------------------------------------------------------- Choice chip --- */

/**
 * A single-select filter chip — design system `components/controls.css`.
 *
 * `aria-pressed` rather than a radiogroup: the chips sit in a filter bar
 * alongside a search field and a sort select, and a radiogroup there would
 * capture the arrow keys a user expects to move the caret.
 *
 * Selected is ink on cream, never amber. Amber marks the action on a screen and
 * a filter row of four amber chips would say nothing.
 */
export function ChoiceChip({
  selected = false,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        'inline-flex min-h-11 items-center gap-1.5 rounded-sm border px-3 text-sm font-medium',
        'transition-[background-color,border-color,color] duration-140 ease-[cubic-bezier(.2,.8,.2,1)]',
        selected
          ? 'border-ink-900 bg-ink-900 text-cream-50'
          : 'border-[var(--color-border-strong)] bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-muted)]',
        className,
      )}
      {...props}
    />
  );
}

/* ----------------------------------------------------- Distribution bars --- */

/** Fixed Dutch rating vocabulary — design system §7. Index 0 is one star. */
const RATING_LABELS = ['Zeer slecht', 'Onvoldoende', 'Redelijk', 'Goed', 'Uitstekend'] as const;

/**
 * How responses spread across the five scores.
 *
 * Rendered high-to-low so five stars sits at the top, which is how people read
 * a distribution. Bars use the per-score rating colours, but the numeral and
 * the Dutch word carry the meaning first — colour is the third signal.
 *
 * The `aria-label` spells out every data point plus the conclusion, because a
 * screen reader user gets nothing from a row of divs. Design system
 * accessibility criteria, not a nicety.
 */
export function DistributionBars({
  counts,
  showLabels = true,
}: {
  counts: readonly [number, number, number, number, number];
  showLabels?: boolean;
}) {
  const total = counts.reduce((sum, count) => sum + count, 0);
  const peak = Math.max(...counts, 1);

  const spoken = counts
    .map((count, index) => `${index + 1} ${RATING_LABELS[index]}: ${count}`)
    .reverse()
    .join(', ');
  const topIndex = counts.indexOf(peak);

  return (
    <div
      role="img"
      aria-label={`Scoreverdeling over ${total} reacties. ${spoken}. De meeste reacties gaven ${topIndex + 1} van 5.`}
      className="flex flex-col gap-1.5"
    >
      {counts
        .map((count, index) => ({ count, score: index + 1 }))
        .reverse()
        .map(({ count, score }) => (
          <div key={score} className="flex items-center gap-2.5">
            <span className="tabular w-3 shrink-0 text-xs font-bold text-[var(--color-text-secondary)]">
              {score}
            </span>
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-cream-200">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(count / peak) * 100}%`,
                  background: `var(--color-rating-${score})`,
                }}
              />
            </div>
            {showLabels ? (
              <span className="w-20 shrink-0 text-xs text-[var(--color-text-muted)]">
                {RATING_LABELS[score - 1]}
              </span>
            ) : null}
            <span className="tabular w-10 shrink-0 text-right text-xs text-[var(--color-text-secondary)]">
              {count}
            </span>
          </div>
        ))}
    </div>
  );
}

/* ----------------------------------------------------------- Data table --- */

export type DataTableColumn<Row> = {
  key: string;
  header: string;
  align?: 'left' | 'right';
  width?: string;
  render: (row: Row) => ReactNode;
};

/**
 * A dense comparison table — design system `components/surfaces.css`.
 *
 * Scrolls horizontally inside its own container with the first column pinned,
 * which is the only way seven columns of location figures survive a tablet. The
 * pinned cell needs an opaque background of its own, otherwise the scrolling
 * columns show through it.
 */
export function DataTable<Row>({
  columns,
  rows,
  rowKey,
  caption,
}: {
  columns: ReadonlyArray<DataTableColumn<Row>>;
  rows: readonly Row[];
  rowKey: (row: Row) => string;
  caption?: string;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[44rem] border-collapse text-left">
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th
                key={column.key}
                scope="col"
                style={column.width ? { width: column.width } : undefined}
                className={cn(
                  'border-b border-[var(--color-border)] px-3 py-3 text-xs font-bold tracking-widest text-[var(--color-text-muted)] uppercase',
                  column.align === 'right' && 'text-right',
                  index === 0 && 'sticky left-0 bg-[var(--color-surface)]',
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)}>
              {columns.map((column, index) => (
                <td
                  key={column.key}
                  className={cn(
                    'border-b border-[var(--color-border)] px-3 py-3 text-sm text-[var(--color-text-primary)]',
                    column.align === 'right' && 'text-right',
                    index === 0 &&
                      'sticky left-0 bg-[var(--color-surface)] font-medium',
                  )}
                >
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------- Readiness meter --- */

export type ReadinessCriterion = {
  label: string;
  value: string;
  target: string;
  met: boolean;
};

/**
 * Review-acquisition readiness for one location.
 *
 * Every criterion shows its measured value *and* its target, because "not yet
 * met" without the threshold is a verdict rather than information. Unmet rows
 * use `circle-dashed` and met rows `circle-check` — the fixed product
 * vocabulary — so the state never rests on colour alone.
 */
export function ReadinessMeter({
  progress,
  window,
  mode,
  criteria,
  metLabel,
  unmetLabel,
}: {
  progress: number;
  window: string;
  mode: string;
  criteria: readonly ReadinessCriterion[];
  metLabel: string;
  unmetLabel: string;
}) {
  const bounded = Math.max(0, Math.min(100, progress));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div
          role="img"
          aria-label={`Voortgang ${bounded}%`}
          className="h-2 flex-1 overflow-hidden rounded-full bg-cream-200"
        >
          <div
            className="h-full rounded-full bg-[var(--color-brand-primary)]"
            style={{ width: `${bounded}%` }}
          />
        </div>
        <span className="tabular text-xs font-semibold text-[var(--color-text-secondary)]">
          {bounded}%
        </span>
      </div>

      <p className="text-xs text-[var(--color-text-muted)]">
        {window} · {mode}
      </p>

      <ul className="flex flex-col gap-2">
        {criteria.map((criterion) => (
          <li key={criterion.label} className="flex items-center gap-2.5">
            {criterion.met ? (
              <CircleCheck
                aria-hidden="true"
                className="size-4 shrink-0 text-[var(--color-success)]"
              />
            ) : (
              <CircleDashed
                aria-hidden="true"
                className="size-4 shrink-0 text-[var(--color-text-muted)]"
              />
            )}
            <span className="flex-1 text-sm text-[var(--color-text-primary)]">
              {criterion.label}
            </span>
            <span className="tabular text-sm font-semibold text-[var(--color-text-primary)]">
              {criterion.value}
            </span>
            <span className="tabular w-24 text-right text-xs text-[var(--color-text-muted)]">
              {criterion.target}
            </span>
            <span className="sr-only">
              {criterion.met ? metLabel : unmetLabel}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

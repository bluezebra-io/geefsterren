import type {
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

export function Badge({
  tone = 'neutral',
  children,
}: {
  tone?: keyof typeof badgeTones;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-xs font-semibold',
        badgeTones[tone],
      )}
    >
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
}: {
  label: string;
  value: string | number;
  evidence?: string;
}) {
  return (
    <Card>
      <CardBody>
        <p className="text-sm text-[var(--color-text-secondary)]">{label}</p>
        <p className="tabular mt-2 text-4xl leading-none font-bold tracking-snug text-[var(--color-text-primary)]">
          {value}
        </p>
        {evidence ? (
          <p className="mt-2 text-xs text-[var(--color-text-muted)]">{evidence}</p>
        ) : null}
      </CardBody>
    </Card>
  );
}

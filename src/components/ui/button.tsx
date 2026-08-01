import { cva, type VariantProps } from 'class-variance-authority';
import type { ButtonHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

/**
 * Button — design system §5.1.
 *
 * Heights 36/44/52, radius 10, weight 600, 16px, 8px gap, 140ms transition.
 *
 * Two rules that are not cosmetic:
 *   - Text on amber is ink (#142334), never white. White on amber fails AA.
 *   - One primary per screen. Amber means "this is the action", not "this is
 *     good".
 *
 * Hover darkens or takes a cream surface. Never opacity, never a shift in
 * position.
 */
const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap',
    'font-sans font-semibold leading-none',
    'border border-transparent',
    'transition-[background-color,border-color,color,box-shadow] duration-140 ease-[cubic-bezier(.2,.8,.2,1)]',
    'disabled:cursor-not-allowed disabled:opacity-50',
  ].join(' '),
  {
    variants: {
      variant: {
        primary:
          'bg-[var(--color-brand-primary)] text-[var(--color-brand-primary-ink)] shadow-[var(--shadow-xs)] hover:not-disabled:bg-[var(--color-brand-primary-hover)] active:not-disabled:bg-[var(--color-brand-primary-active)] active:not-disabled:shadow-none',
        secondary:
          'bg-[var(--color-brand-secondary)] text-[var(--color-text-inverse)] shadow-[var(--shadow-xs)] hover:not-disabled:bg-[var(--color-brand-secondary-hover)] active:not-disabled:bg-ink-700 active:not-disabled:shadow-none',
        outline:
          'bg-[var(--color-surface)] text-[var(--color-text-primary)] border-[var(--color-border-strong)] hover:not-disabled:bg-[var(--color-surface-muted)] hover:not-disabled:border-ink-300 active:not-disabled:bg-cream-300',
        ghost:
          'bg-transparent text-[var(--color-text-primary)] hover:not-disabled:bg-[var(--color-surface-muted)] active:not-disabled:bg-cream-300',
        danger:
          'bg-[var(--color-error)] text-white hover:not-disabled:bg-coral-700',
        // For the ink sidebar and other inverted surfaces.
        onDark:
          'bg-transparent text-[var(--color-text-inverse)] border-[var(--color-border-inverse)] hover:not-disabled:bg-[rgba(253,251,247,.1)]',
      },
      size: {
        sm: 'min-h-control-sm px-3 text-sm rounded-sm',
        md: 'min-h-control-md px-5 text-base rounded-md',
        lg: 'min-h-control-lg px-7 text-lg rounded-md',
      },
      // The only pill in the system is the consumer flow's primary CTA.
      pill: { true: 'rounded-full', false: '' },
      block: { true: 'w-full', false: '' },
    },
    defaultVariants: { variant: 'primary', size: 'md', pill: false, block: false },
  },
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    /** Shows a spinner and disables the button. */
    loading?: boolean;
  };

export function Button({
  className,
  variant,
  size,
  pill,
  block,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, pill, block }), className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Spinner /> : null}
      {children}
    </button>
  );
}

/** 1em ring of `currentColor`, 0.7s linear — design system §5.1. */
function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="size-[1em] animate-spin rounded-full border-2 border-current border-r-transparent [animation-duration:0.7s]"
    />
  );
}

export { buttonVariants };

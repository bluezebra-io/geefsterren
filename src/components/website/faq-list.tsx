'use client';

import { ChevronDown } from 'lucide-react';
import { useId, useState } from 'react';

export type FaqItem = { q: string; a: string };

/**
 * FAQ accordion — design system §5.3.
 *
 * The first item opens by default so the pattern is obvious without a click.
 * One item open at a time; `-1` closes everything.
 *
 * Questions are in the consumer's words and answers stay under 40 words —
 * enforced by editing, not by code, but worth stating where the copy lives.
 */
export function FaqList({ items, defaultOpen = 0 }: { items: FaqItem[]; defaultOpen?: number }) {
  const [open, setOpen] = useState(defaultOpen);
  const baseId = useId();

  return (
    <div className="border-t border-[var(--color-border)]">
      {items.map((item, index) => {
        const expanded = open === index;
        const panelId = `${baseId}-panel-${index}`;
        const buttonId = `${baseId}-button-${index}`;

        return (
          <div key={item.q} className="border-b border-[var(--color-border)]">
            <h3>
              <button
                type="button"
                id={buttonId}
                aria-expanded={expanded}
                aria-controls={panelId}
                onClick={() => setOpen(expanded ? -1 : index)}
                className="font-display flex w-full items-center justify-between gap-4 py-4 text-left text-lg font-bold text-[var(--color-text-primary)] hover:text-ink-700"
              >
                {item.q}
                <ChevronDown
                  aria-hidden="true"
                  className={`size-5 shrink-0 text-[var(--color-text-secondary)] transition-transform duration-200 ease-[cubic-bezier(.2,.8,.2,1)] ${
                    expanded ? 'rotate-180' : ''
                  }`}
                />
              </button>
            </h3>
            {expanded ? (
              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                className="max-w-176 pb-5 text-base leading-[1.65] text-[var(--color-text-secondary)]"
              >
                {item.a}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

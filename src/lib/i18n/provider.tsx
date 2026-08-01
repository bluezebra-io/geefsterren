'use client';

import { createContext, useContext, type ReactNode } from 'react';

import type { Locale } from './config';
import type { Messages } from './messages/en';

/**
 * Makes the request's message catalogue available to Client Components.
 *
 * Server Components read messages directly via `getMessages()`. Client
 * Components cannot, so a server layout resolves the catalogue once and passes
 * it across the boundary here — a plain serialisable object, no duplicated
 * fetch and no prop drilling through every form.
 */

type I18nValue = { locale: Locale; messages: Messages };

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({
  locale,
  messages,
  children,
}: {
  locale: Locale;
  messages: Messages;
  children: ReactNode;
}) {
  return <I18nContext.Provider value={{ locale, messages }}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const value = useContext(I18nContext);
  if (!value) {
    throw new Error('useI18n must be used inside an I18nProvider');
  }
  return value;
}

/** Convenience hook for the common case of only needing the catalogue. */
export function useMessages(): Messages {
  return useI18n().messages;
}

/** Client-side counterpart of `format()` in `locale.ts`. */
export function format(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

import 'server-only';

import { cookies, headers } from 'next/headers';
import { cache } from 'react';

import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE, negotiateLocale, type Locale } from './config';
import { en } from './messages/en';
import { nl } from './messages/nl';
import type { Messages } from './messages/en';

const CATALOGUES: Record<Locale, Messages> = { en, nl };

/**
 * Resolves the request locale.
 *
 * Precedence: an explicit cookie choice, then Accept-Language, then the
 * default. An explicit choice must win over the browser header — otherwise a
 * user who deliberately switched language is switched back on every visit.
 *
 * Cached per request so a page rendering several server components resolves it
 * once.
 */
export const resolveLocale = cache(async (): Promise<Locale> => {
  const cookieStore = await cookies();
  const chosen = cookieStore.get(LOCALE_COOKIE)?.value;
  if (isLocale(chosen)) return chosen;

  const headerList = await headers();
  return negotiateLocale(headerList.get('accept-language')) ?? DEFAULT_LOCALE;
});

/** Message catalogue for the current request. */
export const getMessages = cache(async (): Promise<Messages> => {
  return CATALOGUES[await resolveLocale()];
});

export function messagesFor(locale: Locale): Messages {
  return CATALOGUES[locale];
}

/**
 * Substitutes `{name}` placeholders.
 *
 * Deliberately minimal: no pluralisation and no date formatting. Those need
 * real `Intl` handling, and a half-implementation that silently produces "1
 * reacties" is worse than not having one. Add `Intl.PluralRules` at the point
 * the first plural message actually appears.
 */
export function format(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

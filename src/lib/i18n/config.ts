/**
 * Locale configuration.
 *
 * English is the source language: message keys are authored in `en`, and `nl`
 * is a full translation of it.
 *
 * One caveat worth carrying forward: the design system treats Dutch consumer
 * copy as a *functional* requirement, not a preference — the tone-of-voice
 * rules (je/jij, sentence case, no exclamation marks) are part of the brand
 * promise. When the guest flow ships in Phase 3, it should default to `nl` for
 * Dutch locations regardless of the portal's locale.
 */

export const LOCALES = ['en', 'nl'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

/** Cookie the portal writes when a user picks a language explicitly. */
export const LOCALE_COOKIE = 'gs_locale';

export function isLocale(value: string | undefined | null): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

/**
 * Picks the best supported locale from an Accept-Language header.
 *
 * Quality values are honoured, and a regional tag such as `nl-BE` matches the
 * base language `nl` — refusing it would send a Flemish visitor to English for
 * no reason.
 */
export function negotiateLocale(acceptLanguage: string | null | undefined): Locale | null {
  if (!acceptLanguage) return null;

  const ranked = acceptLanguage
    .split(',')
    .map((part) => {
      const [tag, ...params] = part.trim().split(';');
      const q = params.find((p) => p.trim().startsWith('q='));
      const quality = q ? Number.parseFloat(q.split('=')[1]) : 1;
      return { tag: tag.trim().toLowerCase(), quality: Number.isNaN(quality) ? 0 : quality };
    })
    .filter((entry) => entry.tag.length > 0)
    .sort((a, b) => b.quality - a.quality);

  for (const { tag } of ranked) {
    const base = tag.split('-')[0];
    if (isLocale(base)) return base;
  }

  return null;
}

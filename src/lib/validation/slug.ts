/**
 * Slug generation and validation.
 *
 * Mirrors `app.is_valid_slug()` in the database. The database constraint is authoritative; this
 * exists so a user gets a form error instead of a constraint violation.
 */

export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
export const SLUG_MIN_LENGTH = 2;
export const SLUG_MAX_LENGTH = 64;

export function isValidSlug(value: string): boolean {
  return (
    value.length >= SLUG_MIN_LENGTH &&
    value.length <= SLUG_MAX_LENGTH &&
    SLUG_PATTERN.test(value)
  );
}

/**
 * Derives a slug from a display name.
 *
 * Accents are decomposed and stripped rather than dropped, so "Café Zuid" becomes "cafe-zuid" and
 * not "caf-zuid" — Dutch and other European names hit this constantly.
 */
export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, SLUG_MAX_LENGTH)
    .replace(/-+$/g, '');
}

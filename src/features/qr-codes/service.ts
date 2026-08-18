/**
 * Feedback codes — the human-typed alternative to scanning the QR.
 *
 * Two representations of the same QR record, deliberately different:
 *
 *   - The **URL token** in `geefsterren.nl/r/{token}` is opaque and
 *     case-sensitive. Nobody types it; it only has to be unguessable.
 *   - The **feedback code** is printed next to the QR for people who cannot
 *     scan. It is typed by hand, on a phone, sometimes in bad light.
 *
 * The design system displays the code uppercase, which rules out a
 * case-sensitive alphabet. The code therefore uses **Crockford Base32**: the
 * digits and letters minus `I`, `L`, `O` and `U`, with the first three folded
 * onto the digits they resemble and `U` onto `V`. Someone who reads `0` off a
 * sticker and types `O` still gets through, which is the entire point.
 *
 * Following the published Crockford alphabet rather than inventing a variant
 * matters: it is what makes the encoder, the printed sticker and this parser
 * agree without a shared table.
 *
 * Phase 2 issues both values per QR record and stores a hash of each.
 *
 * Pure functions only — no I/O, so the rules are directly testable.
 */

/** Crockford Base32: 0-9 and A-Z without I, L, O, U. */
export const FEEDBACK_CODE_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

export const FEEDBACK_CODE_LENGTH = 8;

/**
 * Cleans up what a person actually types.
 *
 * Uppercases, drops the separators people add out of habit (spaces, hyphens,
 * dots), then applies the Crockford substitutions.
 */
export function normalizeFeedbackCode(input: string): string {
  return input
    .trim()
    .toUpperCase()
    .replace(/[\s\-._]/g, '')
    .replace(/O/g, '0')
    .replace(/[IL]/g, '1')
    .replace(/U/g, 'V');
}

/**
 * Whether the normalised value could be a code at all.
 *
 * A format check only. It never proves a code exists — that needs a lookup, and
 * the answer shown to the user is identical either way.
 */
export function isValidFeedbackCodeFormat(normalized: string): boolean {
  if (normalized.length !== FEEDBACK_CODE_LENGTH) return false;
  return [...normalized].every((char) => FEEDBACK_CODE_ALPHABET.includes(char));
}

/**
 * The public URL a resolved code leads to.
 *
 * Built from the URL token, never from the typed code: the code is a lookup
 * key, the token is the address.
 */
export function feedbackUrlFor(reviewBaseUrl: string, token: string): string {
  return new URL(`/r/${token}`, reviewBaseUrl).toString();
}

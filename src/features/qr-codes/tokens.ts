import 'server-only';

import { createHash, randomInt } from 'node:crypto';

import { FEEDBACK_CODE_ALPHABET, FEEDBACK_CODE_LENGTH } from './service';

/**
 * QR secrets.
 *
 * Server-only because it uses `node:crypto`; the isomorphic parts of the feature
 * (alphabet, normalisation, URL building) stay in `service.ts` so the sign-in
 * form and the code field can import them without pulling crypto into the
 * browser bundle.
 *
 * Two secrets per QR record, for two audiences:
 *   - the **URL token**, in `geefsterren.nl/r/{token}`, which nobody types and
 *     therefore only has to be unguessable;
 *   - the **feedback code**, printed beside the QR for people who cannot scan,
 *     which is short and unambiguous at the cost of entropy.
 *
 * Only hashes are stored. The plain values are returned once, at creation, so
 * they can be printed — a database dump does not hand over the ability to submit
 * feedback as that QR.
 */

/** URL-safe, case-sensitive, no lookalike stripping — it is never typed. */
const TOKEN_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const TOKEN_LENGTH = 16;

/**
 * `randomInt` rather than `randomBytes % alphabet.length`: the modulo of a byte
 * over a 62-character alphabet is biased towards the first characters, which
 * quietly costs entropy. `randomInt` rejects and retries instead.
 */
function randomFrom(alphabet: string, length: number): string {
  let out = '';
  for (let i = 0; i < length; i += 1) out += alphabet[randomInt(alphabet.length)];
  return out;
}

/** ~95 bits of entropy. Unguessable, and short enough for a readable QR. */
export function generateQrToken(): string {
  return randomFrom(TOKEN_ALPHABET, TOKEN_LENGTH);
}

/**
 * ~40 bits. Deliberately weaker than the token, because a human types it — which
 * is why a code alone must never be enough to do anything but open a
 * questionnaire, and why lookups are rate limited.
 */
export function generateFeedbackCode(): string {
  return randomFrom(FEEDBACK_CODE_ALPHABET, FEEDBACK_CODE_LENGTH);
}

/**
 * SHA-256, unsalted and deliberately so: the lookup is `hash(input) = stored`,
 * which a per-row salt would make impossible. Safe here because both values are
 * high-entropy random strings, not passwords — there is no dictionary to run.
 */
export function hashSecret(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}

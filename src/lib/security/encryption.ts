import 'server-only';

import { createHash } from 'node:crypto';

import { serverEnv } from '@/lib/env';

import { CIPHERTEXT_VERSION, decryptWithKey, encryptWithKey } from './aes-gcm';

/**
 * Application-level encryption for values that must be readable again.
 *
 * Used for the two things the product has to be able to reproduce but must not
 * keep in the clear:
 *
 *   - QR tokens and printed feedback codes, so a sticker can be reprinted;
 *   - consumer email addresses, when rewards arrive in Phase 4.
 *
 * A hash cannot do this — hashing is one-way, which is exactly why the QR
 * *lookup* uses a hash and the *reprint* uses this.
 *
 * The envelope itself lives in `aes-gcm.ts`, which has no imports, so the seed
 * helper can produce the identical format without a second implementation.
 */

function key(): Buffer {
  return Buffer.from(serverEnv().APP_ENCRYPTION_KEY, 'base64');
}

export function encryptValue(plaintext: string): string {
  return encryptWithKey(plaintext, key());
}

/**
 * Throws on any tampering, on an unknown version, and on a malformed payload.
 *
 * Treat a throw as "this value is unusable", never as "close enough": it means
 * either the wrong key or altered data, and neither has a safe fallback.
 */
export function decryptValue(payload: string): string {
  return decryptWithKey(payload, key());
}

/** True when a stored value looks like something this module can read. */
export function isEncryptedValue(value: string | null | undefined): boolean {
  return (
    typeof value === 'string' &&
    value.startsWith(`${CIPHERTEXT_VERSION}:`) &&
    value.split(':').length === 4
  );
}

/**
 * SHA-256, unsalted and deliberately so: the lookup is `hash(input) = stored`,
 * which a per-row salt would make impossible. Safe here because the values are
 * high-entropy random strings, not passwords — there is no dictionary to run.
 */
export function hashSecret(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}

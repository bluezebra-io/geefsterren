import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

/**
 * The ciphertext format, with no dependencies at all.
 *
 * Kept free of imports on purpose: the seed helper in `scripts/` runs outside the
 * Next.js build and imports this file directly, so both it and the application
 * produce exactly one format. A second implementation of "our AES envelope"
 * living in a script is how you end up with rows nothing can read.
 *
 * AES-256-GCM: authenticated, so a tampered ciphertext fails to decrypt rather
 * than quietly returning different bytes. The version prefix is here from the
 * first line so key rotation can be added without a data migration — a `v2:`
 * reader can keep decrypting `v1:` rows.
 */

export const CIPHERTEXT_VERSION = 'v1';

const IV_BYTES = 12; // 96 bits, the size GCM is specified for
const ALGORITHM = 'aes-256-gcm';

export function assertKey(raw: Buffer): Buffer {
  if (raw.length !== 32) {
    throw new Error('APP_ENCRYPTION_KEY must decode to exactly 32 bytes');
  }
  return raw;
}

/** Returns `v1:<iv>:<tag>:<ciphertext>`, each part base64. */
export function encryptWithKey(plaintext: string, key: Buffer): string {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITHM, assertKey(key), iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);

  return [
    CIPHERTEXT_VERSION,
    iv.toString('base64'),
    cipher.getAuthTag().toString('base64'),
    ciphertext.toString('base64'),
  ].join(':');
}

/** Throws on tampering, an unknown version, or a malformed payload. */
export function decryptWithKey(payload: string, key: Buffer): string {
  const parts = payload.split(':');
  if (parts.length !== 4) throw new Error('Malformed ciphertext');

  const [version, ivB64, tagB64, dataB64] = parts;
  if (version !== CIPHERTEXT_VERSION) {
    throw new Error(`Unsupported ciphertext version: ${version}`);
  }

  const decipher = createDecipheriv(ALGORITHM, assertKey(key), Buffer.from(ivB64, 'base64'));
  decipher.setAuthTag(Buffer.from(tagB64, 'base64'));

  return Buffer.concat([
    decipher.update(Buffer.from(dataB64, 'base64')),
    decipher.final(),
  ]).toString('utf8');
}

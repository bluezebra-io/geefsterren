import 'server-only';

import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

import { serverEnv } from '@/lib/env';

/**
 * Application-level encryption for values that must be readable again.
 *
 * AES-256-GCM: authenticated, so a tampered ciphertext fails to decrypt instead
 * of silently returning different bytes. Used for the two things the MVP has to
 * be able to reproduce but must not keep in the clear:
 *
 *   - QR tokens and printed feedback codes, so a sticker can be reprinted;
 *   - consumer email addresses, when rewards arrive in Phase 4.
 *
 * A hash alone cannot do this — hashing is one-way, which is exactly why the QR
 * *lookup* uses a hash and the *reprint* uses this.
 *
 * The format is versioned from the first line so key rotation can be added later
 * without a data migration: a `v2:` reader can keep decrypting `v1:` rows.
 */

const VERSION = 'v1';
const IV_BYTES = 12; // 96 bits, the size GCM is specified for
const ALGORITHM = 'aes-256-gcm';

function key(): Buffer {
  const raw = Buffer.from(serverEnv().APP_ENCRYPTION_KEY, 'base64');
  // Env validation already checks this; repeated here because a wrong key length
  // would otherwise surface as an opaque OpenSSL error at the call site.
  if (raw.length !== 32) {
    throw new Error('APP_ENCRYPTION_KEY must decode to exactly 32 bytes');
  }
  return raw;
}

/** Returns `v1:<iv>:<tag>:<ciphertext>`, each part base64. */
export function encryptValue(plaintext: string): string {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITHM, key(), iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [
    VERSION,
    iv.toString('base64'),
    tag.toString('base64'),
    ciphertext.toString('base64'),
  ].join(':');
}

/**
 * Throws on any tampering, on an unknown version, and on a malformed payload.
 *
 * Callers should treat a throw as "this value is unusable", never as "close
 * enough" — a decryption failure means either the wrong key or altered data, and
 * neither has a safe fallback.
 */
export function decryptValue(payload: string): string {
  const parts = payload.split(':');
  if (parts.length !== 4) throw new Error('Malformed ciphertext');

  const [version, ivB64, tagB64, dataB64] = parts;
  if (version !== VERSION) throw new Error(`Unsupported ciphertext version: ${version}`);

  const decipher = createDecipheriv(ALGORITHM, key(), Buffer.from(ivB64, 'base64'));
  decipher.setAuthTag(Buffer.from(tagB64, 'base64'));

  return Buffer.concat([
    decipher.update(Buffer.from(dataB64, 'base64')),
    decipher.final(),
  ]).toString('utf8');
}

/** True when a stored value looks like something this module can read. */
export function isEncryptedValue(value: string | null | undefined): boolean {
  return typeof value === 'string' && value.startsWith(`${VERSION}:`) && value.split(':').length === 4;
}

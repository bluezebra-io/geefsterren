import { describe, expect, it } from 'vitest';

import { decryptValue, encryptValue, isEncryptedValue } from '@/lib/security/encryption';

describe('encryptValue / decryptValue', () => {
  it('round-trips a value', () => {
    const secret = 'DemoLeiden00001';
    expect(decryptValue(encryptValue(secret))).toBe(secret);
  });

  it('round-trips unicode and empty strings', () => {
    for (const value of ['', 'crème brûlée', 'жет', '🙂 not copy but data']) {
      expect(decryptValue(encryptValue(value))).toBe(value);
    }
  });

  it('produces a different ciphertext every time', () => {
    // A fresh IV per call, so identical plaintexts do not reveal that they match.
    const a = encryptValue('same');
    const b = encryptValue('same');
    expect(a).not.toBe(b);
    expect(decryptValue(a)).toBe(decryptValue(b));
  });

  it('is versioned so rotation can be added later', () => {
    expect(encryptValue('x').startsWith('v1:')).toBe(true);
    expect(encryptValue('x').split(':')).toHaveLength(4);
  });
});

describe('decryptValue rejects anything it cannot trust', () => {
  it('refuses a tampered ciphertext instead of returning different bytes', () => {
    const payload = encryptValue('original');
    const [version, iv, tag, data] = payload.split(':');
    const flipped = Buffer.from(data, 'base64');
    flipped[0] ^= 0xff;
    const tampered = [version, iv, tag, flipped.toString('base64')].join(':');

    expect(() => decryptValue(tampered)).toThrow();
  });

  it('refuses a swapped authentication tag', () => {
    const [v, iv, , data] = encryptValue('one').split(':');
    const otherTag = encryptValue('two').split(':')[2];
    expect(() => decryptValue([v, iv, otherTag, data].join(':'))).toThrow();
  });

  it('refuses an unknown version', () => {
    const payload = encryptValue('x').split(':');
    payload[0] = 'v9';
    expect(() => decryptValue(payload.join(':'))).toThrow(/Unsupported ciphertext version/);
  });

  it('refuses a malformed payload', () => {
    expect(() => decryptValue('not-ciphertext')).toThrow(/Malformed ciphertext/);
    expect(() => decryptValue('v1:only:three')).toThrow(/Malformed ciphertext/);
  });
});

describe('isEncryptedValue', () => {
  it('recognises this modules output', () => {
    expect(isEncryptedValue(encryptValue('x'))).toBe(true);
  });

  it('rejects plaintext and empty values', () => {
    expect(isEncryptedValue('DemoLeiden00001')).toBe(false);
    expect(isEncryptedValue(null)).toBe(false);
    expect(isEncryptedValue(undefined)).toBe(false);
    expect(isEncryptedValue('')).toBe(false);
  });
});

import { describe, expect, it } from 'vitest';

import { isValidSlug, slugify } from '@/lib/validation/slug';

describe('slugify', () => {
  it('lowercases and hyphenates', () => {
    expect(slugify('Restaurant Leiden')).toBe('restaurant-leiden');
  });

  it('strips accents rather than dropping the letter', () => {
    // "Café Zuid" must not become "caf-zuid".
    expect(slugify('Café Zuid')).toBe('cafe-zuid');
    expect(slugify('Bäckerei Müller')).toBe('backerei-muller');
    expect(slugify('Crème Brûlée')).toBe('creme-brulee');
  });

  it('collapses runs of separators', () => {
    expect(slugify('De  Korenaar --- Leiden')).toBe('de-korenaar-leiden');
    expect(slugify("Joe's Diner & Bar")).toBe('joe-s-diner-bar');
  });

  it('trims leading and trailing separators', () => {
    expect(slugify('  Leiden  ')).toBe('leiden');
    expect(slugify('---Leiden---')).toBe('leiden');
  });

  it('never leaves a trailing hyphen after truncation', () => {
    const long = `${'a'.repeat(63)} extra`;
    const result = slugify(long);
    expect(result.length).toBeLessThanOrEqual(64);
    expect(result.endsWith('-')).toBe(false);
  });

  it('produces an empty string for input with nothing usable', () => {
    expect(slugify('!!!')).toBe('');
  });
});

describe('isValidSlug', () => {
  it('accepts well-formed slugs', () => {
    expect(isValidSlug('leiden')).toBe(true);
    expect(isValidSlug('de-korenaar-leiden')).toBe(true);
    expect(isValidSlug('a1')).toBe(true);
  });

  it('rejects malformed slugs', () => {
    expect(isValidSlug('')).toBe(false);
    expect(isValidSlug('a')).toBe(false);
    expect(isValidSlug('-leiden')).toBe(false);
    expect(isValidSlug('leiden-')).toBe(false);
    expect(isValidSlug('de--korenaar')).toBe(false);
    expect(isValidSlug('Leiden')).toBe(false);
    expect(isValidSlug('de korenaar')).toBe(false);
    expect(isValidSlug('a'.repeat(65))).toBe(false);
  });

  it('agrees with slugify for realistic names', () => {
    for (const name of ['Café Zuid', 'De Korenaar Leiden', 'Pizzeria Napoli']) {
      expect(isValidSlug(slugify(name))).toBe(true);
    }
  });
});

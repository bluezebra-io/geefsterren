import { describe, expect, it } from 'vitest';

import { needsOptions, parseOptions } from '@/features/questionnaires/schemas';

describe('parseOptions', () => {
  it('turns lines into options with derived keys', () => {
    expect(parseOptions('Bezorgtijd\nTemperatuur')).toEqual([
      { optionKey: 'bezorgtijd', label: 'Bezorgtijd' },
      { optionKey: 'temperatuur', label: 'Temperatuur' },
    ]);
  });

  it('ignores blank lines and trims', () => {
    expect(parseOptions('  Smaak  \n\n\n  Prijs\n')).toEqual([
      { optionKey: 'smaak', label: 'Smaak' },
      { optionKey: 'prijs', label: 'Prijs' },
    ]);
  });

  it('strips accents and punctuation from the key but keeps the label', () => {
    expect(parseOptions('Crème brûlée')).toEqual([
      { optionKey: 'creme_brulee', label: 'Crème brûlée' },
    ]);
    expect(parseOptions('Compleetheid van de bestelling')).toEqual([
      { optionKey: 'compleetheid_van_de_bestelling', label: 'Compleetheid van de bestelling' },
    ]);
  });

  it('drops duplicates rather than failing', () => {
    // Two identically named options would be indistinguishable in the results.
    expect(parseOptions('Smaak\nsmaak\nSMAAK')).toHaveLength(1);
  });

  it('drops a line with no usable key', () => {
    expect(parseOptions('!!!\n???')).toEqual([]);
    // A key must start with a letter, which the database also enforces.
    expect(parseOptions('123')).toEqual([]);
  });

  it('returns nothing for empty input', () => {
    expect(parseOptions(undefined)).toEqual([]);
    expect(parseOptions('')).toEqual([]);
    expect(parseOptions('   \n  ')).toEqual([]);
  });
});

describe('needsOptions', () => {
  it('is true only for the choice types', () => {
    expect(needsOptions('single_choice')).toBe(true);
    expect(needsOptions('multiple_choice')).toBe(true);
    for (const type of ['rating', 'boolean', 'short_text', 'long_text']) {
      expect(needsOptions(type)).toBe(false);
    }
  });
});

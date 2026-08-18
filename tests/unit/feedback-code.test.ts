import { describe, expect, it } from 'vitest';

import {
  FEEDBACK_CODE_ALPHABET,
  FEEDBACK_CODE_LENGTH,
  feedbackUrlFor,
  isValidFeedbackCodeFormat,
  normalizeFeedbackCode,
} from '@/features/qr-codes/service';

describe('normalizeFeedbackCode', () => {
  it('uppercases', () => {
    expect(normalizeFeedbackCode('abcd2345')).toBe('ABCD2345');
  });

  it('strips the separators people add out of habit', () => {
    expect(normalizeFeedbackCode('ABCD-2345')).toBe('ABCD2345');
    expect(normalizeFeedbackCode('ABCD 2345')).toBe('ABCD2345');
    expect(normalizeFeedbackCode(' ABCD.2345 ')).toBe('ABCD2345');
    expect(normalizeFeedbackCode('AB_CD 23-45')).toBe('ABCD2345');
  });

  it('applies the Crockford substitutions', () => {
    // O reads as zero, I and L read as one, U is folded onto V.
    expect(normalizeFeedbackCode('OOOO2345')).toBe('00002345');
    expect(normalizeFeedbackCode('IIII2345')).toBe('11112345');
    expect(normalizeFeedbackCode('LLLL2345')).toBe('11112345');
    expect(normalizeFeedbackCode('UUUU2345')).toBe('VVVV2345');
  });

  it('is idempotent — normalising twice changes nothing', () => {
    for (const input of ['abcd-2345', 'OIL U234', ' 2345ABCD ']) {
      const once = normalizeFeedbackCode(input);
      expect(normalizeFeedbackCode(once)).toBe(once);
    }
  });

  it('never produces a character outside the alphabet', () => {
    // The substitutions must map onto the alphabet, not away from it — the bug
    // this test exists to prevent is folding O onto a character the alphabet
    // excludes, which would make every code invalid.
    const normalized = normalizeFeedbackCode('OIL-UOIL');
    for (const char of normalized) {
      expect(FEEDBACK_CODE_ALPHABET).toContain(char);
    }
  });
});

describe('isValidFeedbackCodeFormat', () => {
  it('accepts a well-formed code', () => {
    expect(isValidFeedbackCodeFormat('ABCD2345')).toBe(true);
    expect(isValidFeedbackCodeFormat('23456789')).toBe(true);
  });

  it('rejects the wrong length', () => {
    expect(isValidFeedbackCodeFormat('ABCD234')).toBe(false);
    expect(isValidFeedbackCodeFormat('ABCD23456')).toBe(false);
    expect(isValidFeedbackCodeFormat('')).toBe(false);
  });

  it('rejects characters outside the alphabet', () => {
    expect(isValidFeedbackCodeFormat('ABCD234!')).toBe(false);
    expect(isValidFeedbackCodeFormat('abcd2345')).toBe(false);
    // The excluded letters, un-normalised.
    for (const excluded of ['I', 'L', 'O', 'U']) {
      expect(isValidFeedbackCodeFormat(`ABCD234${excluded}`)).toBe(false);
    }
  });

  it('accepts anything normalisation produces from valid-length input', () => {
    // Eight ambiguous characters in, eight alphabet characters out.
    expect(normalizeFeedbackCode('oilu-oilu')).toBe('011V011V');
    expect(isValidFeedbackCodeFormat(normalizeFeedbackCode('oilu-oilu'))).toBe(true);
  });

  it('agrees with the declared length', () => {
    expect('ABCD2345'.length).toBe(FEEDBACK_CODE_LENGTH);
  });
});

describe('the excluded characters', () => {
  it('are genuinely absent from the alphabet', () => {
    for (const excluded of ['I', 'L', 'O', 'U']) {
      expect(FEEDBACK_CODE_ALPHABET).not.toContain(excluded);
    }
  });

  it('leaves a 32-character alphabet', () => {
    expect(FEEDBACK_CODE_ALPHABET).toHaveLength(32);
    expect(new Set(FEEDBACK_CODE_ALPHABET).size).toBe(32);
  });
});

describe('feedbackUrlFor', () => {
  it('builds the public review URL from the token', () => {
    expect(feedbackUrlFor('https://geefsterren.nl', '6cHd9KpR7mQ2')).toBe(
      'https://geefsterren.nl/r/6cHd9KpR7mQ2',
    );
  });

  it('works with a base URL that has a trailing path', () => {
    expect(feedbackUrlFor('http://localhost:5010/', 'abc123')).toBe(
      'http://localhost:5010/r/abc123',
    );
  });
});

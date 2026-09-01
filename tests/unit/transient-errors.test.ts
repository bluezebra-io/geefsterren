import { describe, expect, it } from 'vitest';

import { ConflictError, isTransientDatabaseError } from '@/lib/errors';

describe('isTransientDatabaseError', () => {
  it('recognises a clock-skew rejection', () => {
    // The exact shape PostgREST returns, which previously surfaced to operators as
    // "Could not create this campaign" and sent everyone hunting a campaign bug.
    expect(
      isTransientDatabaseError({
        code: 'PGRST303',
        details: null,
        hint: null,
        message: 'JWT issued at future',
      }),
    ).toBe(true);
  });

  it('recognises connection and concurrency failures', () => {
    for (const code of ['08000', '08003', '08006', '57P03', '40001', '40P01']) {
      expect(isTransientDatabaseError({ code, message: 'x' }), code).toBe(true);
    }
  });

  it('does not treat a permission or constraint failure as transient', () => {
    // These mean the request itself was wrong. Retrying or telling someone to
    // "try again in a moment" would hide a real authorization or data problem.
    for (const code of ['42501', '23505', '23514', 'PGRST116']) {
      expect(isTransientDatabaseError({ code, message: 'x' }), code).toBe(false);
    }
  });

  it('ignores domain errors and non-objects', () => {
    expect(isTransientDatabaseError(new ConflictError('taken'))).toBe(false);
    expect(isTransientDatabaseError(null)).toBe(false);
    expect(isTransientDatabaseError('PGRST303')).toBe(false);
    expect(isTransientDatabaseError({ code: 303 })).toBe(false);
  });
});

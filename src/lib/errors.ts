/**
 * Domain error types.
 *
 * These model expected failures. Anything not represented here is a bug and should propagate.
 */

export class AuthenticationError extends Error {
  readonly code = 'authentication_required';
  constructor(message = 'Authentication required') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  readonly code = 'forbidden';
  constructor(message = 'You do not have permission to perform this action') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends Error {
  readonly code = 'not_found';
  constructor(message = 'Not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends Error {
  readonly code = 'validation_failed';
  readonly fieldErrors: Record<string, string[]>;
  constructor(message = 'Validation failed', fieldErrors: Record<string, string[]> = {}) {
    super(message);
    this.name = 'ValidationError';
    this.fieldErrors = fieldErrors;
  }
}

export class ConflictError extends Error {
  readonly code = 'conflict';
  constructor(message = 'Conflicting state') {
    super(message);
    this.name = 'ConflictError';
  }
}

/**
 * True for errors whose message is safe to show a user. Everything else gets a generic message,
 * because an unexpected error's text may contain internals.
 */
export function isExpectedError(
  error: unknown,
): error is AuthenticationError | AuthorizationError | NotFoundError | ValidationError | ConflictError {
  return (
    error instanceof AuthenticationError ||
    error instanceof AuthorizationError ||
    error instanceof NotFoundError ||
    error instanceof ValidationError ||
    error instanceof ConflictError
  );
}

/**
 * Codes that mean "the infrastructure hiccuped", not "your request was wrong".
 *
 * `PGRST303` is *JWT issued at future*: PostgREST rejects a token whose `iat` is
 * ahead of its own clock. It happens with sub-second drift between containers —
 * on Docker Desktop the very first request after signing in can trip it — and it
 * succeeds on the next attempt with the same input.
 *
 * Worth separating because the alternative is what actually happened here: a
 * clock problem surfaced as "Could not create this campaign", which sent everyone
 * looking for a bug in the campaign code.
 */
const TRANSIENT_DATABASE_CODES = new Set([
  'PGRST303', // JWT issued at future — clock skew
  '08000', // connection exception
  '08003', // connection does not exist
  '08006', // connection failure
  '57P03', // cannot connect now, server starting up
  '40001', // serialization failure
  '40P01', // deadlock detected
]);

export function isTransientDatabaseError(error: unknown): boolean {
  if (error === null || typeof error !== 'object') return false;
  const code = (error as { code?: unknown }).code;
  return typeof code === 'string' && TRANSIENT_DATABASE_CODES.has(code);
}

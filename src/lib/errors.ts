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

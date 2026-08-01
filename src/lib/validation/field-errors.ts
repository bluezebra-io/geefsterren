import type { ZodError } from 'zod';

/**
 * Converts a ZodError into the `{ field: [messages] }` shape our forms render.
 *
 * Zod 4 removed `error.flatten()`, and nested paths are flattened to their first segment because
 * that is the level forms bind to.
 */
export function toFieldErrors(error: ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? '_form');
    (fieldErrors[key] ??= []).push(issue.message);
  }
  return fieldErrors;
}

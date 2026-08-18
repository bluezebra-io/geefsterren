/**
 * Stub for the `server-only` package under Vitest.
 *
 * The real module throws when imported outside a React Server Component, which is
 * how a service-role client or an encryption key is kept out of the browser
 * bundle. Tests run in Node with no client boundary at all, so importing it there
 * is a false positive. The production guarantees — the build error and the
 * ESLint `no-restricted-imports` rule — are untouched by this alias.
 */
export {};

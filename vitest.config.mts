import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
    // Integration tests share one local database, so running files in parallel would let them
    // clobber each other's rows. Unit tests are pure and unaffected by running sequentially.
    fileParallelism: false,
    setupFiles: ['tests/setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/features/**/service.ts', 'src/lib/**/*.ts'],
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // `server-only` throws on import outside a React Server Component, which is
      // its whole job — it guards the bundler. Under Vitest there is no bundler
      // and no client boundary, so it is stubbed out. The protection that matters
      // in production (the build error, plus the ESLint rule) is unaffected.
      'server-only': fileURLToPath(new URL('./tests/stubs/server-only.ts', import.meta.url)),
    },
  },
});

import { config } from 'dotenv';
import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration.
 *
 * Assumes a dev server is already running on 5010 and reuses it, so a local run
 * does not fight the server you already have open.
 */
// The platform-context spec signs in against the local Supabase.
config({ path: '.env.local', quiet: true });

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:5010',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5010',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});

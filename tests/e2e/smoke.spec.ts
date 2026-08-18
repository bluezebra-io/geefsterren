import { expect, test } from '@playwright/test';

/**
 * Render smoke tests.
 *
 * These exist because of a specific failure: every route in this app is
 * dynamic, so `next build` compiles and type-checks pages without ever
 * executing them. A layout missing its i18n provider passed the build, the
 * typecheck and the lint, and returned 500 on every request. Only a real
 * request caught it.
 *
 * So this suite asserts the cheapest thing that build-time checks cannot: each
 * surface actually responds, in both languages, with no console errors.
 */

const PORTAL_HOST = 'http://app.localhost:5010';

test.describe('public site', () => {
  for (const locale of ['en', 'nl'] as const) {
    test(`homepage renders in ${locale}`, async ({ browser }) => {
      const context = await browser.newContext({ locale });
      const page = await context.newPage();

      const errors: string[] = [];
      page.on('console', (message) => {
        if (message.type() === 'error') errors.push(message.text());
      });

      const response = await page.goto('http://localhost:5010/');
      expect(response?.status()).toBe(200);

      // One h1, and the hero's primary action is present and inline.
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('input[name="code"]')).toBeVisible();

      // Every section heading rendered.
      expect(await page.locator('h2').count()).toBeGreaterThanOrEqual(5);

      expect(errors).toEqual([]);
      await context.close();
    });
  }

  test('an unknown feedback code is refused without saying why', async ({ page }) => {
    await page.goto('http://localhost:5010/');
    await page.locator('input[name="code"]').fill('ABCD2345');
    await page.getByRole('button', { name: /continue|doorgaan/i }).click();

    const error = page.getByText(/not valid or no longer active|niet geldig of niet meer actief/i);
    await expect(error).toBeVisible();
    // The message must not hint at the reason — no "expired", no "unknown".
    await expect(error).not.toContainText(/expired|verlopen|unknown|onbekend/i);
  });
});

test.describe('portal', () => {
  test('sign-in renders', async ({ page }) => {
    const response = await page.goto(`${PORTAL_HOST}/auth/sign-in`);
    expect(response?.status()).toBe(200);
    await expect(page.locator('input[name="email"]')).toBeVisible();
  });

  test('an unauthenticated visit to /app redirects to sign-in', async ({ page }) => {
    await page.goto(`${PORTAL_HOST}/app`);
    await expect(page).toHaveURL(/\/auth\/sign-in/);
  });
});

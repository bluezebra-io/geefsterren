import { expect, test } from '@playwright/test';

const PORTAL = 'http://app.localhost:5010';

/**
 * Password sign-in.
 *
 * The portal must not depend on mail delivery to let someone in, so this is the
 * path that has to keep working without an email provider configured.
 */
test('signing in with a password reaches the portal', async ({ page }) => {
  await page.goto(`${PORTAL}/auth/sign-in`);

  await page.getByLabel(/e-mailadres|email address/i).fill('org.admin@bakkerij.test');
  await page.getByLabel(/wachtwoord|password/i).fill('LocalDev!2026');
  await page.getByRole('button', { name: /^(inloggen|sign in)$/i }).click();

  await expect(page).toHaveURL(/\/app$/, { timeout: 15_000 });
  await expect(
    page.getByRole('heading', { level: 1, name: 'Bakkerij De Korenaar' }),
  ).toBeVisible();
});

test('a wrong password is refused without revealing whether the account exists', async ({ page }) => {
  await page.goto(`${PORTAL}/auth/sign-in`);

  await page.getByLabel(/e-mailadres|email address/i).fill('org.admin@bakkerij.test');
  await page.getByLabel(/wachtwoord|password/i).fill('definitely-not-the-password');
  await page.getByRole('button', { name: /^(inloggen|sign in)$/i }).click();

  const error = page.getByRole('alert');
  await expect(error).toBeVisible();

  // Same message for a wrong password as for an unknown address, so the form is
  // not an account-enumeration oracle.
  await expect(error).not.toContainText(/bestaat niet|not found|unknown|onbekend|onjuist wachtwoord/i);
  await expect(page).toHaveURL(/\/auth\/sign-in/);
});

test('an unknown address gets the identical message', async ({ page }) => {
  await page.goto(`${PORTAL}/auth/sign-in`);

  await page.getByLabel(/e-mailadres|email address/i).fill('nobody@example.test');
  await page.getByLabel(/wachtwoord|password/i).fill('LocalDev!2026');
  await page.getByRole('button', { name: /^(inloggen|sign in)$/i }).click();

  await expect(page.getByRole('alert')).toContainText(
    /horen niet bij een account|do not match an account/i,
  );
});

test('the sign-in form works with JavaScript disabled', async ({ browser }) => {
  // The password path is a plain form post, so it must not need hydration.
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();

  await page.goto(`${PORTAL}/auth/sign-in`);
  await page.getByLabel(/e-mailadres|email address/i).fill('eigenaar@sushinoord.test');
  await page.getByLabel(/wachtwoord|password/i).fill('LocalDev!2026');
  await page.getByRole('button', { name: /^(inloggen|sign in)$/i }).click();

  await expect(page).toHaveURL(/\/app$/, { timeout: 15_000 });
  await expect(page.getByRole('heading', { level: 1, name: 'Sushi Noord' })).toBeVisible();

  await context.close();
});

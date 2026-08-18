import { expect, test } from '@playwright/test';
import { createServerClient } from '@supabase/ssr';

const PORTAL = 'http://app.localhost:5010';
const SUSHI = '22222222-2222-4222-8222-000000000003';

/**
 * Platform staff opening a participant's organization.
 *
 * Exercised through the browser rather than by setting the cookie directly,
 * because the point of the test is the Server Action: it authorises the switch
 * and writes the audit entry. Setting the cookie by hand would skip both.
 */
async function sessionCookies(email: string) {
  const jar = new Map<string, string>();
  const sb = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => [...jar].map(([name, value]) => ({ name, value })),
        setAll: (list) => list.forEach(({ name, value }) => jar.set(name, value)),
      },
    },
  );
  const { error } = await sb.auth.signInWithPassword({ email, password: 'LocalDev!2026' });
  if (error) throw new Error(`${email}: ${error.message}`);
  return [...jar].map(([name, value]) => ({
    name,
    value,
    domain: 'app.localhost',
    path: '/',
  }));
}

test('a platform admin opens a participant and the switch is audited', async ({ browser }) => {
  const context = await browser.newContext({ locale: 'nl' });
  await context.addCookies(await sessionCookies('super.admin@geefsterren.test'));
  const page = await context.newPage();

  await page.goto(`${PORTAL}/admin`);
  await expect(page.getByText('Sushi Noord').first()).toBeVisible();

  // Open the participant through its own row, not a global button.
  const row = page.locator('li', { hasText: 'Sushi Noord' }).first();
  await row.getByRole('button', { name: /openen/i }).click();

  await expect(page).toHaveURL(/\/app$/);
  await expect(page.getByRole('heading', { name: 'Sushi Noord' })).toBeVisible();

  // The banner must name whose data is on screen.
  await expect(page.getByText(/platformmedewerker/i)).toBeVisible();

  // Leaving returns to the platform overview.
  await page.getByRole('button', { name: /deelnemer sluiten/i }).click();
  await expect(page).toHaveURL(/\/admin$/);

  await context.close();
});

test('an ordinary member cannot reach the platform overview', async ({ browser }) => {
  const context = await browser.newContext();
  await context.addCookies(await sessionCookies('org.admin@bakkerij.test'));
  const page = await context.newPage();

  await page.goto(`${PORTAL}/admin`);
  await expect(page).toHaveURL(/\/app$/);
  await expect(page.getByRole('heading', { name: 'Bakkerij De Korenaar' })).toBeVisible();

  await context.close();
});

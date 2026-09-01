import { expect, test } from '@playwright/test';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

const PORTAL = 'http://app.localhost:5010';
const NAPOLI = '33333333-3333-4333-8333-000000000003';

/**
 * The path from a location with nothing to a printable QR code.
 *
 * Pizzeria Napoli is seeded with a location but no campaign, which is what a new
 * customer looks like. Before this existed the QR page said "create a campaign
 * first" and there was nowhere to do it — a dead end, and the reason this test
 * exists.
 */
test.describe.configure({ mode: 'serial' });

async function sessionCookies(email: string) {
  const jar = new Map<string, string>();
  const sb = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => [...jar].map(([name, value]) => ({ name, value })),
        setAll: (list) => list.forEach(({ name, value }) => jar.set(name, value)),
      },
    },
  );
  const { error } = await sb.auth.signInWithPassword({ email, password: 'LocalDev!2026' });
  if (error) throw new Error(`${email}: ${error.message}`);
  return [...jar].map(([name, value]) => ({ name, value, domain: 'app.localhost', path: '/' }));
}

/** Shared between the serial tests below: the QR link created in one, used in the next. */
let guestUrl: string | null = null;

/**
 * A location this spec owns outright, used for the empty-state test.
 *
 * That test asserts a location has *no* campaign yet. Pointing it at a seeded location made it fail
 * the moment anyone used the local app for real — including creating a campaign for Napoli by hand
 * — which is a test reporting on the developer's habits rather than on the product.
 */
let emptyLocationId: string | null = null;

function admin() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}

test.beforeAll(async () => {
  const { data, error } = await admin()
    .from('locations')
    .insert({
      organization_id: '22222222-2222-4222-8222-000000000002',
      name: 'E2E lege vestiging',
      slug: `e2e-empty-${Date.now()}`,
      timezone: 'Europe/Amsterdam',
    })
    .select('id')
    .single();

  if (error) throw new Error(`Could not create the empty test location: ${error.message}`);
  emptyLocationId = data.id;
});

test.afterAll(async () => {
  const service = admin();

  if (emptyLocationId) await service.from('locations').delete().eq('id', emptyLocationId);

  const { data: campaigns } = await service
    .from('campaigns')
    .select('id')
    .eq('location_id', NAPOLI)
    .like('name', 'E2E %');

  for (const campaign of campaigns ?? []) {
    await service.from('qr_codes').delete().eq('campaign_id', campaign.id);
    await service.from('campaigns').delete().eq('id', campaign.id);
  }
});

test('a location without a campaign is not a dead end', async ({ browser }) => {
  const context = await browser.newContext({ locale: 'nl' });
  await context.addCookies(await sessionCookies('org.admin@pizzeria.test'));
  const page = await context.newPage();

  // The QR page cannot do anything yet, and says where to go.
  await page.goto(`${PORTAL}/app/locations/${emptyLocationId}/qr-codes`);
  await expect(page.getByText(/Maak eerst een campagne/)).toBeVisible();

  await page.getByRole('link', { name: /Nieuwe campagne/ }).click();
  await expect(page).toHaveURL(new RegExp(`/app/locations/${emptyLocationId}/campaigns$`));
  await expect(page.getByText('Nog geen campagnes')).toBeVisible();

  await context.close();
});

test('creating a campaign makes a QR code possible', async ({ browser }) => {
  const context = await browser.newContext({ locale: 'nl' });
  await context.addCookies(await sessionCookies('org.admin@pizzeria.test'));
  const page = await context.newPage();

  const name = `E2E ${Date.now()}`;

  await page.goto(`${PORTAL}/app/locations/${NAPOLI}/campaigns`);

  // The questionnaire assigned to this location is preselected, so the operator
  // does not have to match it up by hand.
  await expect(page.getByRole('combobox', { name: 'Vragenlijst' })).toContainText(
    /Toegewezen aan deze vestiging/,
  );

  await page.getByLabel('Naam').fill(name);
  await page.getByRole('button', { name: /Campagne aanmaken/ }).click();

  await expect(page.getByText(name)).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText('Actief', { exact: true })).toBeVisible();

  // Now a QR code can be made, and downloaded immediately.
  await page.goto(`${PORTAL}/app/locations/${NAPOLI}/qr-codes`);
  await expect(page.getByText(/Maak eerst een campagne/)).toHaveCount(0);

  await page.getByLabel(/Intern label/).fill('E2E sticker');
  await page.getByRole('button', { name: /QR-code aanmaken/ }).click();

  const panel = page.getByRole('status').first();
  await expect(panel).toContainText('Feedbackcode', { timeout: 15_000 });

  const link = (await panel.innerText()).match(/http:\/\/localhost:5010\/r\/[A-Za-z0-9]+/);
  expect(link).not.toBeNull();
  guestUrl = link![0];

  // The QR resolves to a working guest flow, which is the whole point of the loop.
  const guest = await context.newPage();
  await guest.goto(link![0]);
  await expect(guest.getByRole('radiogroup')).toBeVisible();
  await expect(guest.getByText('Napoli Centrum', { exact: true })).toBeVisible();

  await context.close();
});

test('pausing a campaign stops its QR codes', async ({ browser }) => {
  expect(guestUrl, 'the previous test must have created a QR').not.toBeNull();

  const context = await browser.newContext({ locale: 'nl' });
  await context.addCookies(await sessionCookies('org.admin@pizzeria.test'));
  const page = await context.newPage();

  // Working before.
  const before = await context.newPage();
  await before.goto(guestUrl!);
  await expect(before.getByRole('radiogroup')).toBeVisible();
  await before.close();

  await page.goto(`${PORTAL}/app/locations/${NAPOLI}/campaigns`);
  await page.getByRole('button', { name: /^Pauzeren$/ }).first().click();
  await expect(page.getByText('Gepauzeerd', { exact: true })).toBeVisible({ timeout: 15_000 });

  // The guest flow now refuses — with the same neutral message an unknown code
  // gets, so a paused campaign is not distinguishable from a wrong link.
  const after = await context.newPage();
  await after.goto(guestUrl!);
  await expect(after.getByText(/niet actief/)).toBeVisible();
  await expect(after.getByRole('radiogroup')).toHaveCount(0);

  // The sticker itself is untouched: reactivating brings it back rather than
  // forcing a reprint.
  await page.getByRole('button', { name: /^Activeren$/ }).first().click();
  await expect(page.getByText('Actief', { exact: true })).toBeVisible({ timeout: 15_000 });

  const revived = await context.newPage();
  await revived.goto(guestUrl!);
  await expect(revived.getByRole('radiogroup')).toBeVisible();

  await context.close();
});

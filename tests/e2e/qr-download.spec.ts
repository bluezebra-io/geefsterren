import { expect, test } from '@playwright/test';
import { createServerClient } from '@supabase/ssr';

const PORTAL = 'http://app.localhost:5010';
const LEIDEN = '33333333-3333-4333-8333-000000000001';

/**
 * Downloading a QR code.
 *
 * The seeded codes only carried a hash at first, which made the very thing an
 * operator tries first — download the demo QR — the one thing that failed. The
 * post-seed helper now fills in the ciphertext, and this guards that.
 */
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

test('the seeded QR code downloads as SVG and PNG straight after a reset', async ({ browser }) => {
  const context = await browser.newContext({ locale: 'nl' });
  await context.addCookies(await sessionCookies('org.admin@bakkerij.test'));
  const page = await context.newPage();

  await page.goto(`${PORTAL}/app/locations/${LEIDEN}/qr-codes`);

  const row = page.locator('main li', { hasText: 'Bezorgdoos Leiden' }).first();
  await expect(row).toBeVisible();

  // No "reissue first" hint, because the token is recoverable.
  await expect(page.getByText(/Geef hem opnieuw uit om te downloaden/)).toHaveCount(0);

  const svg = row.getByRole('link', { name: 'SVG' });
  const png = row.getByRole('link', { name: 'PNG' });
  await expect(svg).toBeVisible();
  await expect(png).toBeVisible();

  // Follow the links as the browser would and check what comes back.
  for (const [link, type] of [
    [svg, 'image/svg+xml'],
    [png, 'image/png'],
  ] as const) {
    const href = await link.getAttribute('href');
    const response = await page.request.get(`${PORTAL}${href}`);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain(type);
    // A filename an operator can still recognise in a folder months later.
    expect(response.headers()['content-disposition']).toContain('geefsterren-bakkerij-de-korenaar');
    expect((await response.body()).byteLength).toBeGreaterThan(1000);
  }

  await context.close();
});

test('a QR code from another organization is not downloadable', async ({ browser }) => {
  const context = await browser.newContext({ locale: 'nl' });
  await context.addCookies(await sessionCookies('org.admin@bakkerij.test'));
  const page = await context.newPage();

  // Read the other organization's QR id with the service role, then try it as the
  // bakery administrator: RLS must make it indistinguishable from a missing row.
  const sushi = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } },
  );
  const { data } = await sushi
    .from('qr_codes')
    .select('id')
    .eq('label', 'Tafelkaart Groningen')
    .single();

  const response = await page.request.get(
    `${PORTAL}/api/portal/qr-codes/${data!.id}/download?format=svg`,
  );
  expect(response.status()).toBe(404);

  await context.close();
});

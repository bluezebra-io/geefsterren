import { chromium } from '@playwright/test';
import { createServerClient } from '@supabase/ssr';
import { config } from 'dotenv';
config({ path: '.env.local', quiet: true });

const jar = new Map();
const sb = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
  cookies: {
    getAll: () => [...jar].map(([name, value]) => ({ name, value })),
    setAll: (l) => l.forEach(({ name, value }) => jar.set(name, value)),
  },
});
await sb.auth.signInWithPassword({ email: 'super.admin@geefsterren.test', password: 'LocalDev!2026' });
console.log('cookies uit ssr:', [...jar.keys()]);

const browser = await chromium.launch();
const context = await browser.newContext({ locale: 'nl' });
await context.addCookies([...jar].map(([name, value]) => ({ name, value, domain: 'app.localhost', path: '/' })));
const page = await context.newPage();

await page.goto('http://app.localhost:5010/admin');
console.log('na /admin  ->', page.url());
console.log('  cookies:', (await context.cookies()).map((c) => c.name).join(', '));

const row = page.locator('li', { hasText: 'Sushi Noord' }).first();
await row.getByRole('button', { name: /openen/i }).click();
await page.waitForLoadState('networkidle');
console.log('na klik   ->', page.url());
console.log('  cookies:', (await context.cookies()).map((c) => `${c.name}(${c.domain})`).join(', '));
console.log('  h1:', await page.locator('h1').first().textContent().catch(() => '-'));
await browser.close();

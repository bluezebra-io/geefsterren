import { createServerClient } from '@supabase/ssr';
import { config } from 'dotenv';
config({ path: '.env.local', quiet: true });

const BASE = 'http://app.localhost:5010';

async function login(email) {
  const jar = new Map();
  const sb = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => [...jar].map(([name, value]) => ({ name, value })),
      setAll: (l) => l.forEach(({ name, value }) => jar.set(name, value)),
    },
  });
  const { error } = await sb.auth.signInWithPassword({ email, password: 'LocalDev!2026' });
  if (error) throw new Error(`${email}: ${error.message}`);
  return jar;
}
const header = (jar) => [...jar].map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('; ');
const text = (html) => {
  const s = html.indexOf('<main'), e = html.indexOf('</main>');
  return (s < 0 ? html : html.slice(s, e)).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
};

// --- 1. super admin sees the platform overview -------------------------------
const jar = await login('super.admin@geefsterren.test');
let res = await fetch(`${BASE}/admin`, { headers: { Cookie: header(jar) } });
let body = await res.text();
console.log('1. /admin als super admin:', res.status);
for (const org of ['Bakkerij De Korenaar', 'Pizzeria Napoli', 'Sushi Noord']) {
  console.log(`   ziet ${org}:`, text(body).includes(org) ? 'ja' : 'NEE');
}

// --- 2. portal without a chosen organization --------------------------------
res = await fetch(`${BASE}/app`, { headers: { Cookie: header(jar) }, redirect: 'manual' });
console.log('2. /app zonder keuze:', res.status, '->', text(await res.text()).includes('No organization selected') ? 'vraagt om keuze' : 'onverwacht');

// --- 3. open the participant -------------------------------------------------
const SUSHI = '22222222-2222-4222-8222-000000000003';
const withOrg = `${header(jar)}; gs_org=${SUSHI}`;
res = await fetch(`${BASE}/app`, { headers: { Cookie: withOrg } });
const opened = text(await res.text());
console.log('3. /app met deelnemer geopend:', res.status);
console.log('   organisatie:', opened.includes('Sushi Noord') ? 'Sushi Noord ✓' : 'NIET gevonden');
console.log('   vestigingen:', ['Sushi Noord Groningen', 'Sushi Noord Assen'].filter((n) => opened.includes(n)).join(', ') || 'geen');
res = await fetch(`${BASE}/app`, { headers: { Cookie: withOrg } });
const full = await res.text();
console.log('   banner aanwezig:', /platformmedewerker|platform staff/.test(full) ? 'ja ✓' : 'NEE');

// --- 4. an ordinary member cannot forge the cookie --------------------------
const memberJar = await login('org.admin@bakkerij.test');
res = await fetch(`${BASE}/app`, { headers: { Cookie: `${header(memberJar)}; gs_org=${SUSHI}` } });
const forged = text(await res.text());
console.log('4. lid met gespoofde cookie:', res.status);
console.log('   ziet Sushi Noord:', forged.includes('Sushi Noord') ? 'JA — LEK!' : 'nee ✓');
console.log('   ziet eigen organisatie:', forged.includes('Bakkerij De Korenaar') ? 'ja ✓' : 'NEE');

// --- 5. non-staff cannot reach /admin ---------------------------------------
res = await fetch(`${BASE}/admin`, { headers: { Cookie: header(memberJar) }, redirect: 'manual' });
console.log('5. /admin als gewoon lid:', res.status, res.headers.get('location') ?? '');

import { createServerClient } from '@supabase/ssr';
import { config } from 'dotenv';
import { writeFileSync } from 'node:fs';
config({ path: '.env.local', quiet: true });

const jar = new Map();
const sb = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
  cookies: { getAll: () => [...jar].map(([n,v]) => ({ name:n, value:v })), setAll: (l) => l.forEach(({name,value}) => jar.set(name,value)) },
});
await sb.auth.signInWithPassword({ email: 'org.admin@bakkerij.test', password: 'LocalDev!2026' });
const cookie = [...jar].map(([k,v]) => `${k}=${encodeURIComponent(v)}`).join('; ');

// The seeded QR has no ciphertext, so it must be reissued before it can be
// downloaded. Do that the way the portal does: via the action's underlying update.
const svc = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  cookies: { getAll: () => [], setAll: () => {} },
});
const { data: qr } = await svc.from('qr_codes').select('id, token_encrypted').eq('label','Bezorgdoos Leiden').single();
console.log('seed-QR heeft ciphertext:', qr.token_encrypted ? 'ja' : 'nee (verwacht)');

for (const fmt of ['svg','png']) {
  const res = await fetch(`http://app.localhost:5010/api/portal/qr-codes/${qr.id}/download?format=${fmt}`, { headers: { Cookie: cookie } });
  const body = Buffer.from(await res.arrayBuffer());
  console.log(`${fmt}: status=${res.status} type=${res.headers.get('content-type')} bytes=${body.length}`);
  if (res.status === 409) console.log('   ->', JSON.parse(body.toString()).error);
  if (res.status === 200) {
    console.log('   filename:', res.headers.get('content-disposition'));
    writeFileSync(`/tmp/qr.${fmt}`, body);
  }
}

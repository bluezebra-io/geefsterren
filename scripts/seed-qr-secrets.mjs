/**
 * Gives the seeded QR codes usable secrets.
 *
 * `supabase/seed.sql` can hash a token with pgcrypto but cannot produce our
 * AES-GCM envelope, so seeded rows used to carry only a hash. A hash cannot be
 * reversed, which meant the three demo QR codes could never be downloaded — the
 * first thing anyone tries in the portal was the one thing that did not work.
 *
 * This runs after `supabase db reset` and fills in both the hash and the
 * ciphertext from fixed plaintexts, exactly as the portal does when it mints a
 * new code. It imports the application's own envelope from
 * `src/lib/security/aes-gcm.ts`, so there is no second implementation to drift.
 *
 * Local development only: these plaintexts are published in the seed file.
 */
import { createHash } from 'node:crypto';
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

import { encryptWithKey } from '../src/lib/security/aes-gcm.ts';

config({ path: '.env.local', quiet: true });

/** Must match the labels and tokens documented in supabase/seed.sql. */
const SEEDED = [
  { label: 'Bezorgdoos Leiden', token: 'DemoLeiden00001', code: 'KRN2AB34' },
  { label: 'Kassabon Rotterdam', token: 'DemoRotterdam001', code: 'RTM5CD67' },
  { label: 'Tafelkaart Groningen', token: 'DemoGroningen001', code: 'GRN4GH56' },
];

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const encryptionKey = process.env.APP_ENCRYPTION_KEY;

if (!url || !serviceKey || !encryptionKey) {
  console.error(
    'Missing NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY or APP_ENCRYPTION_KEY in .env.local',
  );
  process.exit(1);
}

const key = Buffer.from(encryptionKey, 'base64');
const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
const sha256 = (value) => createHash('sha256').update(value, 'utf8').digest('hex');

let updated = 0;

for (const entry of SEEDED) {
  const { data, error } = await admin
    .from('qr_codes')
    .update({
      token_hash: sha256(entry.token),
      feedback_code_hash: sha256(entry.code),
      token_encrypted: encryptWithKey(entry.token, key),
      feedback_code_encrypted: encryptWithKey(entry.code, key),
    })
    .eq('label', entry.label)
    .select('id');

  if (error) {
    console.error(`  ${entry.label}: ${error.message}`);
    process.exitCode = 1;
    continue;
  }

  if ((data ?? []).length === 0) {
    console.warn(`  ${entry.label}: no such QR code — run "supabase db reset" first`);
    continue;
  }

  updated += data.length;
  console.log(`  ${entry.label.padEnd(22)} code ${entry.code}  /r/${entry.token}`);
}

console.log(`\n${updated} QR code(s) ready to download.`);

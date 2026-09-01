# Security

## Tenant isolation

One shared PostgreSQL database. Every tenant-owned row carries `organization_id`; every
location-scoped row also carries `location_id`. Application filtering is a convenience, never the
control. **Row Level Security is the control.**

Assume application code will eventually be missing an `.eq('organization_id', …)`. RLS makes that
bug return zero rows instead of another tenant's data.

### Composite foreign keys

Because `organization_id` is denormalised onto child tables, a child row could in principle name a
location belonging to a different organization. Prevented with composite foreign keys:

```sql
foreign key (organization_id, location_id)
  references locations (organization_id, id)
```

The pair must exist together, so it cannot be forged.

## Authorisation helpers

`SECURITY DEFINER` functions in the `app` schema:

```text
app.current_user_id()
app.is_platform_admin()
app.is_platform_support()
app.is_organization_member(uuid)
app.has_organization_role(uuid, text[])
app.can_access_location(uuid)
app.can_manage_location(uuid)
```

Hardening — all of these are required, not optional:

- `SET search_path = pg_catalog, public` on every function, so a caller cannot shadow `public`.
- `STABLE`, so results are cached per statement instead of re-evaluated per row.
- `revoke all on function ... from public, anon;` then `grant execute ... to authenticated;`
- The `app` schema is not exposed through PostgREST.
- RLS integration tests assert `anon` cannot execute them.

### Who `can_manage_location` admits

| Caller | May manage | Why |
| --- | --- | --- |
| Platform administrator | yes | Runs the platform; acts on a participant's behalf during support |
| Platform support | **no** | Deliberately read-only; the whole point of the separate role |
| Organization administrator | yes, within their organization | |
| Location manager | yes, for their assigned locations | |
| Viewer | no | |

The platform-administrator branch was missing at first, which made the SQL rule disagree with the
TypeScript check the portal uses to decide whether to render a form: the form appeared and the
insert was refused with `42501`. Two rules describing one permission will drift, so a check that
cannot reuse this function should *call* it — `updateLocationAction` does — instead of restating it.

`SECURITY DEFINER` is also what breaks policy recursion: a policy on `organization_memberships`
that queried `organization_memberships` directly would loop. The helper bypasses RLS on the tables
it reads, ending the cycle.

## Key handling

| Key | Exposure | Location |
| --- | --- | --- |
| `SUPABASE_ANON_KEY` | not secret, RLS-constrained | server only |
| `SUPABASE_SERVICE_ROLE_KEY` | **secret, bypasses RLS** | `lib/supabase/admin.ts` only |
| `APP_ENCRYPTION_KEY` | secret | `lib/security/encryption.ts` only |
| `CRON_SECRET` | secret | `/api/internal/*` verification |

Containment for the service-role key:

1. `lib/supabase/admin.ts` begins with `import 'server-only'` — importing it from a Client
   Component is a build error.
2. An ESLint `no-restricted-imports` rule blocks the path from `src/components/**`.
3. `lib/env.ts` keeps three schemas apart; only the client schema knows `NEXT_PUBLIC_*`, and it
   holds no secrets. The host URLs sit in their own schema so the proxy and the public feedback
   flow never have to read a secret to route a request.
4. Environment validation rejects a service-role JWT (`"role":"service_role"` in the payload) in
   the anon-key slot. Substituting one there would turn every user-scoped query into an
   RLS-bypassing one — quieter, and worse, than exposure.
5. No browser-side Supabase client exists. All access runs through Server Components and server
   actions, so the anon key never leaves the server and needs no `NEXT_PUBLIC_` prefix. Adding a
   browser client would make RLS the only remaining check and is a deliberate decision, not a
   convenience.

## Public feedback flow

`anon` gets **no** policies on feedback tables — no insert, no select. The QR flow writes through
validated server endpoints using the admin client.

This is a considered trade-off. Anon-insert policies for an unauthenticated, deliberately abusable
write path are hard to get right, and the token → campaign resolution has to happen server-side
regardless. Concentrating the write path in one audited endpoint is more defensible than spreading
it across policies.

Controls on that endpoint:

- Cryptographically secure, URL-safe QR tokens. Only a **hash** is stored.
- Session expiry.
- Idempotency keys on submission and reward issuance.
- Rate limiting by hashed IP + QR code.
- Repeated-email-claim detection via deterministic email hash.
- Cloudflare Turnstile for suspicious traffic.
- Zod validation and input length limits on every field.

## Consumer PII

Consumer email addresses are needed for reward delivery and nothing else.

- Normalised (lowercase, trimmed) before use.
- Stored twice: a deterministic HMAC hash for abuse checks, and an AES-256-GCM ciphertext for
  delivery.
- Never logged, in any form, at any level.
- Ciphertext is versioned (`v1:` prefix) so key rotation can be added without a data migration.

Consumers never get Supabase Auth accounts.

## Constraints over validation

TypeScript validates intent; the database enforces reality. Critical invariants are database
constraints:

```sql
overall_score integer not null check (overall_score between 1 and 5)
individual_score_used boolean not null default false check (individual_score_used = false)
unique (organization_id, slug)
unique (idempotency_key)
```

## Logging

Never logged: raw consumer emails, reward codes, access tokens, Supabase keys, QR tokens, or full
AI prompts containing customer comments unless scrubbed.

Always logged where available: `request_id`, `organization_id`, `location_id`, `campaign_id`,
`job_id`, `analysis_run_id`.

## Headers

Set in `next.config.ts`: HSTS, `X-Content-Type-Options: nosniff`, `Referrer-Policy`,
`X-Frame-Options: DENY`, and a restrictive `Permissions-Policy`.

## Conflict rule

When convenience and tenant isolation conflict, tenant isolation wins.

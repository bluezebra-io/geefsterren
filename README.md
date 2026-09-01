# GeefSterren

Multi-tenant feedback and improvement platform for restaurants, delivery restaurants and
hospitality businesses.

A guest scans a QR code, answers a short questionnaire that adapts to their overall rating, and the
business gets structured private feedback, trends per location, AI summaries with sources, and a
clear decision about when it is ready to start asking for public Google reviews.

> A guest's individual score never decides whether they see the Google invitation. See
> [docs/review-acquisition-readiness.md](docs/review-acquisition-readiness.md).

Current state: **Phase 1 (foundation) complete**, built on the GeefSterren design system. See
[IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md).

---

## Prerequisites

| Requirement | Version | Notes |
| --- | --- | --- |
| Node.js | 22 LTS | `.nvmrc` pins it. Newer works locally; CI and Vercel use 22. |
| npm | 10+ | |
| Docker | running | Required by the Supabase CLI for the local stack. |

The Supabase CLI is a dev dependency — no global install needed.

## Local setup

```bash
git clone git@github.com:bluezebra-io/geefsterren.git
cd geefsterren
npm install

npm run db:start            # start local Postgres, Auth, Storage (first run pulls images)
cp .env.example .env.local  # then fill in the values printed by db:start
npm run db:reset            # apply migrations + seed
npm run dev                 # http://localhost:5010
```

### Filling in `.env.local`

`npm run db:start` prints `ANON_KEY` and `SERVICE_ROLE_KEY`. Generate the two secrets yourself:

```bash
openssl rand -base64 32   # APP_ENCRYPTION_KEY (must decode to exactly 32 bytes)
openssl rand -hex 32      # CRON_SECRET
```

Environment variables are validated at startup by `src/lib/env.ts`. A missing or malformed value
fails the boot with a specific message rather than surfacing later as a confusing runtime error.

### Local URLs

| URL | Serves |
| --- | --- |
| http://localhost:5010 | public website and the `/r/{token}` guest flow |
| http://app.localhost:5010 | portal (`app.localhost` resolves to 127.0.0.1 on macOS and Linux) |
| http://127.0.0.1:54323 | Supabase Studio |
| http://127.0.0.1:54324 | Mailpit — every local email lands here |

> **Why 5010 and not 5000.** On macOS, AirPlay Receiver (ControlCenter) binds port 5000 and answers
> every request with `403`, which looks exactly like an application error. Port 5010 avoids it.
> If you change the port, update the three `NEXT_PUBLIC_*_URL` values to match — the proxy decides
> marketing vs portal by comparing the request host to `NEXT_PUBLIC_PORTAL_URL`.

## Design system

The UI is built on the GeefSterren design handoff. Its rules are treated as functional
requirements, not preferences:

- **Tokens** live in [src/app/globals.css](src/app/globals.css), copied one-to-one from the handoff
  and exposed to Tailwind through `@theme`. Product code references semantic aliases
  (`--color-surface`, `--color-text-muted`), never a raw ramp step.
- **Two fonts**: Plus Jakarta Sans for display, DM Sans for body, UI and every number. Self-hosted
  through `next/font`. All numbers are tabular.
- **Colour rules**: one amber accent per screen; amber means "this is the action", not "this is
  good". Text on amber is ink, never white. A low guest score is data, not an error, so it is never
  coral.
- **Focus** is a 2px ink outline at 2px offset, plus a 3px amber halo on form controls.
  `outline: none` is forbidden.
- **Accessibility** is an acceptance criterion: WCAG 2.2 AA, 44px touch targets, no status carried
  by colour alone, `prefers-reduced-motion` honoured.

Reference docs copied into the repo: [docs/design-system.md](docs/design-system.md),
[docs/design-component-specs.md](docs/design-component-specs.md),
[docs/design-contrast.json](docs/design-contrast.json). Brand assets are in
[public/brand/](public/brand/).

`RatingControl` — the product signature — is deliberately not built yet. It belongs with the guest
flow in Phase 3, where it can be tested with a keyboard and a screen reader against real screens.

## Language

English is the source language; `nl` is a full translation. Locale resolution is cookie →
`Accept-Language` → default, in [src/lib/i18n/](src/lib/i18n/).

Adding a key to `messages/en.ts` without translating it in `messages/nl.ts` is a **type error**, so
English cannot silently leak into the Dutch UI.

One thing to carry forward: the design system treats Dutch consumer copy as a functional
requirement — the tone rules (je/jij, sentence case, no exclamation marks) are part of the brand
promise. When the guest flow ships, it should default to `nl` for Dutch locations regardless of the
portal's locale.

## Database

```bash
npm run db:start                        # start the local stack
npm run db:reset                        # rebuild from migrations + seed
npm run db:types                        # regenerate src/types/database.generated.ts
npx supabase migration new <name>       # create a migration
npm run db:push                         # apply to the linked remote project
```

Migrations are forward-only. Regenerate types after every schema change — the generated file is the
single source of truth for row shapes in TypeScript.

Details in [docs/database.md](docs/database.md).

## Seed accounts

Local only. Password for all of them: `LocalDev!2026`.

| Email | Role |
| --- | --- |
| `platform.admin@geefsterren.test` | Platform administrator (super admin) |
| `super.admin@geefsterren.test` | Platform administrator (super admin) |
| `platform.support@geefsterren.test` | Platform support (read-only) |
| `org.admin@bakkerij.test` | Organization administrator, Bakkerij De Korenaar |
| `manager.leiden@bakkerij.test` | Location manager, Leiden only |
| `viewer@bakkerij.test` | Viewer |
| `org.admin@pizzeria.test` | Organization administrator, Pizzeria Napoli |
| `eigenaar@sushinoord.test` | Organization administrator, Sushi Noord |
| `manager@sushinoord.test` | Location manager, Sushi Noord Groningen only |

Three organizations exist on purpose: cross-tenant isolation is not testable without a neighbour to
leak to.

### Signing in

Two routes, both live:

- **Password** — email plus password on the sign-in form. Needs no mail delivery, works with
  JavaScript disabled. This is the practical route locally.
- **Magic link** — "Mail mij een inloglink". Locally the mail lands in Mailpit at
  http://127.0.0.1:54324; there is no external mail server to configure for local development.

Invitations still go out by email, so a real provider (`EMAIL_PROVIDER=resend` plus
`RESEND_API_KEY`) is required before staging and production. Until one is configured, create
accounts through the seed or promote them with SQL, and use password sign-in.

Wrong password, unknown address and unconfirmed account all return the same message on purpose, so
the form cannot be used to discover which addresses have accounts.

### The feedback loop

The seed ships a published Dutch hospitality questionnaire, assigned organization-wide, plus a
campaign and QR code per location and about 170 sample responses.

1. **See results.** Sign in and open a location — headline KPIs, score distribution and results per
   question, each with the base it is calculated on.
2. **Set up a campaign.** Location → **Campagnes** → create one. A campaign is what a QR code
   points at: it sets the questionnaire and whether feedback is being collected. Pausing it stops
   new feedback without invalidating anything already printed.
3. **Get a QR.** Location → **QR-codes** → create one. The plain token and printed code are shown
   **once**; both are stored hashed for lookup and encrypted for reprinting.
4. **Leave feedback.** Open the review link, or type the printed code in the field on the homepage.
5. **Watch it land.** The answer appears in the results per question straight away.

`npm run db:reset` finishes by running `scripts/seed-qr-secrets.mjs`, which gives the seeded QR
codes their tokens and printed codes — so they are downloadable immediately. It prints them:

```text
Bezorgdoos Leiden      code KRN2AB34  /r/DemoLeiden00001
Kassabon Rotterdam     code RTM5CD67  /r/DemoRotterdam001
Tafelkaart Groningen   code GRN4GH56  /r/DemoGroningen001
```

The step is separate because `seed.sql` can hash a token with pgcrypto but cannot produce the
AES-GCM envelope the reprint needs.

**Editing the questions.** Portal → **Vragenlijsten**. Start a new draft from the platform
template or create your own, add questions, publish, then assign it to every location or to a
selection. Only an organization administrator or a platform administrator can author.

Published questionnaire versions are immutable. That is what lets a response from six months ago
still be read correctly: answers reference question ids, so a label or option that could change
afterwards would quietly rewrite history. Changing questions means a new version.

### Opening a participant as a super admin

Sign in as a platform administrator and go to **http://app.localhost:5010/admin**. Every
organization is listed; "Openen" switches the portal into it and an amber banner names whose data
you are looking at.

This is a context switch, not impersonation — you stay yourself, RLS still evaluates your own user,
and both entering and leaving are written to `audit_logs`.

## Tests

```bash
npm run test              # unit tests
npm run test:integration  # RLS + database policies (needs the local stack running)
npm run typecheck
npm run lint
```

`supabase db reset` restarts the auth container, so a suite started immediately after it will fail
on sign-in — integration tests report as *skipped*, end-to-end tests redirect to the sign-in page.
Give GoTrue a few seconds.

RLS tests run against real PostgreSQL through the anon key with real sessions. Policies cannot be
mocked — a mocked policy proves nothing. Details in [docs/testing.md](docs/testing.md).

## Deployment

One Vercel deployment serves all hostnames; `src/proxy.ts` routes by host. Region `fra1`,
co-located with the Frankfurt database.

Full procedure, cron configuration and recovery steps in [docs/deployment.md](docs/deployment.md).

## Creating the first platform administrator

`platform_role` can only be changed by someone who already holds it, so the first one is created
from a trusted server-side context. Requests arriving as `anon` or `authenticated` are blocked by
`app.guard_platform_role()`; migrations, the seed and the service-role client are not.

1. Have the person sign up or be invited so an `auth.users` row exists.
2. Run this against the target database with the service role or a database connection:

```sql
update public.profiles
set platform_role = 'platform_admin'
where user_id = (select id from auth.users where email = 'person@example.com');
```

3. Verify, then grant any further administrators through the portal.

Locally, the seed does this already.

## Documentation

| Document | Contents |
| --- | --- |
| [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md) | Assessment, phases, risks |
| [docs/architecture.md](docs/architecture.md) | Layering, module boundaries |
| [docs/security.md](docs/security.md) | Tenancy, RLS, key handling, PII |
| [docs/review-acquisition-readiness.md](docs/review-acquisition-readiness.md) | The review gate, and why it is not review filtering |
| [docs/database.md](docs/database.md) | Schema, conventions, migrations |
| [docs/background-jobs.md](docs/background-jobs.md) | Queues, workers, retries |
| [docs/deployment.md](docs/deployment.md) | Environments, release, recovery |
| [docs/testing.md](docs/testing.md) | Test strategy and mandatory coverage |
| [docs/design-system.md](docs/design-system.md) | Full design system guide (from the handoff) |
| [docs/design-component-specs.md](docs/design-component-specs.md) | Prop contracts for all 48 components |

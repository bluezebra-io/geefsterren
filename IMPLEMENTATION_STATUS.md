# GeefSterren — Implementation Status

Last updated: 2026-08-01

---

## 1. Repository assessment

The repository was **empty** at handoff: a bare `git init` on branch `production`, no commits,
remote `git@github.com:bluezebra-io/geefsterren.git`. There was no existing application code,
no migrations, no CI and no dependency lockfile.

Consequences:

- **No conflicts with the specification.** Nothing had to be migrated, adapted or removed.
- **No Prisma or Drizzle dependency existed**, so the "avoid unless already heavily depended on"
  escape hatch does not apply. We use the Supabase client plus raw SQL migrations.
- The default branch is `production`, but the stated main branch for PRs is `main`. Feature work
  should target `main`; `production` should become a deploy branch only.

### Toolchain found on the machine

| Tool | Version | Note |
| --- | --- | --- |
| Node | 25.2.1 | Above Next.js 16's supported floor; fine locally. Pin Vercel + CI to Node 22 LTS. |
| npm | 11.6.2 | |
| Supabase CLI | not installed globally | Installed as a dev dependency; invoke via `npx supabase`. |

### Scaffolded baseline

`create-next-app` with App Router, `src/` directory, TypeScript, Tailwind and ESLint:

| Package | Version |
| --- | --- |
| next | 16.2.12 |
| react / react-dom | 19.2.4 |
| tailwindcss | 4.x |
| typescript | 5.x |
| zod | 4.x |
| @supabase/supabase-js | 2.x |
| @supabase/ssr | 0.12.x |
| vitest | 4.x |

---

## 2. Proposed folder structure

Matches the specification, with two deliberate refinements noted below.

```text
src/
  app/
    (marketing)/                  # geefsterren.nl — public site
    (public-feedback)/r/[token]/  # QR entry point, no auth
    (portal)/app/                 # app.geefsterren.nl — authenticated portal
    (auth)/                       # sign-in, invite acceptance, callback
    admin/                        # platform administration
    api/
      public/                     # unauthenticated, rate limited, Zod validated
      portal/                     # session authenticated
      internal/                   # CRON_SECRET protected

  components/{ui,feedback,portal,charts}/

  features/
    organizations/ locations/ memberships/ questionnaires/ campaigns/
    feedback/ rewards/ review-readiness/ external-reviews/ analytics/
    ai-analysis/ qr-codes/ audit/ privacy/

  lib/
    supabase/{browser,server,admin,middleware}.ts
    ai/{provider,anthropic-provider,schemas}.ts
    email/ queue/ security/ validation/ observability/

  types/{database.generated.ts,domain.ts}

supabase/{migrations,seed.sql,functions}/
tests/{unit,integration,e2e}/
docs/
```

### Refinement 1 — feature module shape

Each `features/<domain>/` folder uses a fixed internal layout so boundaries stay enforceable:

```text
features/<domain>/
  schemas.ts     # Zod input/output contracts
  types.ts       # domain types derived from schemas + generated DB types
  queries.ts     # read paths (RLS-scoped server client)
  service.ts     # business rules — pure where possible, no React, no Next imports
  actions.ts     # Server Actions: authorize -> validate -> call service -> revalidate
```

Rule: `service.ts` never imports from `app/` or `components/`. Anything a unit test needs to
exercise lives in `service.ts` and takes its inputs as arguments.

### Refinement 2 — a separate `(auth)` route group

The spec lists auth as a domain but not a route group. Sign-in, invite acceptance and the
Supabase code-exchange callback need a layout without the portal chrome and without a session
requirement, so they get their own group rather than being wedged into `(portal)`.

---

## 3. Entity relationship overview

```text
organizations 1──∞ locations
organizations 1──∞ organization_memberships ∞──1 profiles(user_id)
locations     1──∞ location_memberships     ∞──1 profiles(user_id)

questionnaire_templates 1──∞ questionnaire_versions 1──∞ questions 1──∞ question_options
questionnaire_versions  1──∞ location_questionnaire_assignments ∞──1 locations

locations 1──∞ campaigns ∞──1 questionnaire_versions
campaigns ∞──1 reward_campaigns
campaigns 1──∞ qr_codes

qr_codes  1──∞ feedback_sessions 1──1 feedback_submissions 1──∞ feedback_answers
feedback_answers ∞──1 questions / question_options

feedback_submissions 1──0..1 reward_issuances        ∞──1 reward_campaigns
feedback_submissions 1──0..1 external_review_invitations
feedback_submissions 1──0..1 feedback_classifications

locations 1──1 review_acquisition_settings (per platform)
locations 1──1 review_activation_rules
review_acquisition_settings 1──∞ review_activation_evaluations

organizations 1──∞ analysis_runs 1──1 analysis_results
organizations 1──∞ audit_logs
organizations 1──∞ privacy_requests
```

Every tenant-owned table carries `organization_id`; every location-scoped table also carries
`location_id`. These are stored redundantly (denormalised) on child tables on purpose: RLS
policies must be able to authorise a row without a join, and joins inside policies are both slow
and a common source of recursive-policy bugs. Composite foreign keys keep the redundant columns
honest — for example `feedback_submissions(organization_id, location_id)` references
`locations(organization_id, id)`, so a mismatched pair cannot be inserted.

### The one non-obvious constraint

`external_review_invitations.individual_score_used` is `boolean NOT NULL DEFAULT false` with a
`CHECK (individual_score_used = false)`. It stores no information. It exists so that the
"a customer's own score never decides whether they see the Google CTA" rule is visible in the
schema and falsifiable by a test, rather than living only in reviewers' heads.

---

## 4. Migration plan

Migrations are plain SQL under `supabase/migrations/`, applied with the Supabase CLI, ordered by
timestamp prefix. They are forward-only: a mistake in an applied migration is corrected by a new
migration, never by editing an applied one.

| # | File | Contents |
| --- | --- | --- |
| 01 | `0001_extensions_and_enums.sql` | `pgcrypto`, `citext`; the `app` schema; stable enums |
| 02 | `0002_core_tenancy.sql` | `organizations`, `locations`, `profiles`, memberships, `handle_new_user` trigger |
| 03 | `0003_rls_helpers.sql` | `SECURITY DEFINER` authorisation helpers in `app` schema |
| 04 | `0004_core_rls_policies.sql` | RLS enabled + policies for phase-1 tables |
| 05 | `0005_audit_logs.sql` | `audit_logs` + `app.write_audit_log()` |
| 06 | `0006_questionnaires.sql` | templates, versions, questions, options, immutability triggers |
| 07 | `0007_campaigns_and_qr.sql` | `campaigns`, `qr_codes` |
| 08 | `0008_feedback.sql` | sessions, submissions, answers |
| 09 | `0009_rewards.sql` | reward campaigns and issuances |
| 10 | `0010_review_readiness.sql` | settings, rules, evaluations, external invitations |
| 11 | `0011_ai_analysis.sql` | analysis runs, results, classifications |
| 12 | `0012_privacy.sql` | privacy requests |
| 13 | `0013_analytics_views.sql` | metric views and SQL functions |
| 14 | `0014_queues.sql` | Supabase Queues setup |

Migrations 01–05 belong to Phase 1 and are implemented. 06 onward land with their phases.

Rules:

- Every table gets `enable row level security` **in the same migration that creates it**. A table
  is never briefly readable.
- `updated_at` is maintained by a shared trigger, not by application code.
- Deletion is soft (`archived_at`) for tenant-visible entities; hard deletes are reserved for
  privacy erasure.

---

## 5. RLS strategy

### Threat model

The database is shared by all tenants. Assume application code will eventually contain a missing
`.eq('organization_id', …)`. RLS must make that bug a "no rows" result rather than a cross-tenant
data leak.

### Helper functions

Authorisation predicates live in the `app` schema as `SECURITY DEFINER` functions with
`SET search_path = pg_catalog, public` and `STABLE` volatility:

```text
app.current_user_id()
app.is_platform_admin()
app.is_platform_support()
app.is_organization_member(organization_id uuid)
app.has_organization_role(organization_id uuid, allowed_roles text[])
app.can_access_location(location_id uuid)
app.can_manage_location(location_id uuid)
```

They exist for three reasons: policies stay readable, membership lookups are cached per statement
instead of re-planned per row, and — critically — a policy on `organization_memberships` that
queried `organization_memberships` directly would recurse. A `SECURITY DEFINER` function bypasses
RLS on the tables *it* reads, breaking the cycle.

Hardening applied to each helper:

- Fixed `search_path`, so a caller cannot shadow `public` with a malicious schema.
- `revoke all ... from public, anon`, then `grant execute ... to authenticated` only.
- Owned by the migration role; the `app` schema is not exposed via PostgREST.

### Policy shape

Per table, separate `select` / `insert` / `update` / `delete` policies — never `for all`. Read and
write authority differ by role, and a single combined policy makes that impossible to express
precisely.

| Actor | Read | Write |
| --- | --- | --- |
| Platform admin | everything | everything |
| Platform support | everything | nothing (explicitly no write policies in Phase 1) |
| Org admin | own organization | own organization |
| Location manager | assigned locations | assigned locations |
| Viewer | assigned locations | nothing |
| `anon` | nothing on tenant tables | nothing |

### Public feedback flow

`anon` receives **no** policies on feedback tables. The QR flow writes through server endpoints
that validate input and use the service-role client. This is deliberate: correct anon-insert
policies for an unauthenticated, abusable write path are far harder to get right than a validated
server endpoint, and the token → campaign resolution has to happen server-side anyway.

### Service role

`SUPABASE_SERVICE_ROLE_KEY` bypasses RLS entirely. Containment:

- Only `src/lib/supabase/admin.ts` reads it, and that file starts with `import 'server-only'`.
- An ESLint `no-restricted-imports` rule blocks importing it from `components/` and any
  `'use client'` module.
- Environment validation rejects any `NEXT_PUBLIC_*` variable whose value looks like a service key.

---

## 6. Implementation phases

### Phase 1 — Foundation

- [x] Next.js App Router + TypeScript strict + Tailwind
- [x] Dependency baseline
- [x] Documentation set
- [x] Typed environment validation, server/client split
- [x] Supabase browser / server / admin / middleware clients
- [x] Host-based middleware routing (marketing vs portal)
- [x] Migrations 0001–0005 (tenancy, helpers, policies, audit)
- [x] RLS helper functions + policies for core tables
- [x] Auth: magic link, callback, sign-out, invite acceptance
- [x] Organizations, locations, memberships services + portal pages
- [x] Audit logging for membership and location changes
- [x] Vitest + unit tests for phase-1 domain logic
- [x] Sentry wiring (guarded — no-ops without a DSN)
- [x] Deterministic seed data

### Phase 2 — Questionnaires and campaigns
- [ ] Templates, versioning, publish + immutability triggers
- [ ] Deterministic `condition_json` rule evaluator (+ unit tests)
- [ ] Location questionnaire assignments
- [ ] Campaign CRUD
- [ ] QR generation, token hashing, SVG/PNG download

### Phase 3 — Public feedback flow
- [ ] Token resolution, session start, expiry
- [ ] Score entry + conditional questions, mobile UI
- [ ] Atomic submission RPC with idempotency
- [ ] Rate limiting, Turnstile hook

### Phase 4 — Rewards
- [ ] Reward campaign config
- [ ] Email normalisation, hashing, AES-256-GCM encryption
- [ ] Idempotent issuance, claim limits, delivery

### Phase 5 — Review Acquisition Readiness
- [ ] Settings, rules, manual mode
- [ ] Aggregate metric SQL, scheduled evaluation, transitions + cooldown
- [ ] Portal page, Google CTA, click tracking
- [ ] Individual-score independence test suite

### Phase 6 — Analytics
- [ ] Metric views, dashboards, filters, comparison, CSV export

### Phase 7 — AI analysis
- [ ] Queues, provider abstraction, Anthropic provider
- [ ] Classification, period analysis, history, retry

### Phase 8 — Hardening
- [ ] Complete audit coverage, privacy requests
- [ ] Security + accessibility review, load test
- [ ] Playwright suite, staging deploy, production checklist

---

## 7. Technical risks

**1. `npm audit` reports 3 high-severity advisories.** They are in `postcss` and `sharp`, both
transitive dependencies of `next@16.2.12`. `npm audit fix --force` proposes `next@9.3.3`, which is
not a fix but a six-year downgrade. Correct response: leave them, track the Next.js patch release,
re-check before the production cutover. Neither is reachable from untrusted input in our usage.

**2. Node 25 locally vs. Node 22 on Vercel.** Node 25 is not an LTS line. Native-module behaviour
(`sharp`) and crypto defaults can differ. Mitigation: `.nvmrc` and `engines` pin Node 22; CI runs
22 so the deployed runtime is the tested one.

**3. Redundant `organization_id` / `location_id` columns can drift.** The denormalisation that
makes RLS fast also allows a child row to name a location belonging to a different organization.
Mitigated with composite foreign keys against `locations(organization_id, id)` rather than trusting
application code.

**4. `SECURITY DEFINER` helpers are the privilege-escalation surface.** One helper missing
`SET search_path`, or left executable by `anon`, undoes tenant isolation everywhere at once.
Mitigated by the hardening list in §5 and by RLS integration tests that assert `anon` cannot
execute them.

**5. Supabase Queues are still comparatively young.** If the extension proves unstable under load,
the fallback is a plain `jobs` table with `FOR UPDATE SKIP LOCKED` claiming. The queue is therefore
accessed only through `lib/queue/`, so the swap stays confined to one module.

**6. Vercel function execution limits vs. batch jobs.** AI period analysis over a large location
can exceed the limit. Queue workers claim bounded batches and stop early against a wall-clock
budget rather than assuming a batch fits.

**7. Consumer email encryption key management.** `APP_ENCRYPTION_KEY` protects stored consumer
emails. There is no key rotation story in the MVP. The ciphertext format is versioned from day one
(`v1:` prefix) so rotation can be added without a data migration.

**8. Default branch is `production`.** Committing feature work straight onto `production` in a repo
wired to Vercel would deploy it. `main` should be created and set as the default before any
deployment integration is connected.

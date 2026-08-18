# GeefSterren — Implementation Status

Last updated: 2026-08-04

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
| 06 | `0006_access_rpc.sql` | public wrappers so the app can call the `app`-schema predicates |
| 07 | `0007_questionnaires.sql` | templates, versions, questions, options, immutability triggers |
| 08 | `0008_campaigns_and_qr.sql` | `campaigns`, `qr_codes` |
| 09 | `0009_feedback.sql` | sessions, submissions, answers |
| 10 | `0010_rewards.sql` | reward campaigns and issuances |
| 11 | `0011_review_readiness.sql` | settings, rules, evaluations, external invitations |
| 12 | `0012_ai_analysis.sql` | analysis runs, results, classifications |
| 13 | `0013_privacy.sql` | privacy requests |
| 14 | `0014_analytics_views.sql` | metric views and SQL functions |
| 15 | `0015_queues.sql` | Supabase Queues setup |

Migrations 01–06 belong to Phase 1 and are applied. 07 onward land with their phases.

`0006` was not in the original plan. The `app` schema is deliberately not exposed through
PostgREST, so the application could not call `app.can_manage_location()` or `app.write_audit_log()`
directly; thin `public` wrappers give it access without duplicating the rules in TypeScript.

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

### Phase 0 — Design system integration

Delivered alongside Phase 1, from the "GeefSterren Design System" handoff.

- [x] Full token layer in `src/app/globals.css`, copied one-to-one from `tokens/*.css` and exposed
      to Tailwind through `@theme`
- [x] Plus Jakarta Sans + DM Sans, self-hosted via `next/font`; tabular numerals everywhere
- [x] Brand assets in `public/brand/`, favicon, inline logo mark with the exact path from the
      handoff
- [x] UI primitives rebuilt to spec: Button (36/44/52, r10, six variants, loading state), Card
      (r14, 1px cream border), Input/Select/Textarea/Checkbox (44px, focus halo), Alert, Badge,
      StatCard, EmptyState
- [x] Portal shell: 256px ink sidebar — the only inversion in the system — on a cream content area
- [x] Consumer-first public homepage
- [x] i18n layer: English source, complete Dutch catalogue, cookie → `Accept-Language` → default
- [x] Accessibility baseline: 2px ink focus outline + 3px amber halo, 44px targets, errors bound to
      inputs by `id`, `prefers-reduced-motion` honoured

Deferred deliberately: `RatingControl` (the product signature) belongs with the guest flow in
Phase 3, where it can be tested against real screens with a keyboard and a screen reader. Charts,
DataTable and ReadinessMeter land with Phases 5–6.

### Consumer homepage — design system §8

All eight sections built, consumer-first, with the business section last.

- [x] Sticky 68px nav: logo, section links, sign-in, amber business CTA — the only amber up there
- [x] Brand lockup rebuilt as the amber tile + white star from the reference screenshot
- [x] Hero with eyebrow, 56px display headline, and the feedback code field **inline in a white
      card**, not behind a modal
- [x] Hero phone mock: location header, 2/4 progress, cumulative star row with the chosen option
      carrying an ink border and bar, scale legend, topic chips, primary action, attribution —
      decorative and `aria-hidden`, but it obeys the rating rules so it cannot teach the wrong thing
- [x] `FeedbackCodeInput`: 52px field, 20px bold at 0.16em tracking, uppercase, 2px border
- [x] Feedback codes use **Crockford Base32** (`O`→`0`, `I`/`L`→`1`, `U`→`V`) so a code read off a
      sticker in bad light still resolves — with unit tests
- [x] "How your feedback helps" — `StepFlow`, ink numbers, only the payoff step amber
- [x] "What changes thanks to feedback" — anonymised case + three `BeforeAfter` figures under an
      `ExampleLabel`
- [x] "Businesses that listen" — `LocationCard` grid, no scores and no ranking
- [x] "Why your opinion matters" — three benefits, no guilt language
- [x] "What happens with your feedback" — `TransparencyBlock` + `FaqList`, on the page itself
      rather than only in the footer
- [x] Business section, then ink-950 footer
- [x] Full Dutch and English copy

Two honest gaps, both visible in the UI rather than papered over:

- **The code field cannot resolve yet.** `qr_codes` arrives in Phase 2, so no code exists to find.
  `lookupTokenForCode()` returns null and the field shows its normal neutral message. Phase 2
  replaces that one function body; nothing above it changes.
- **The "businesses that listen" grid renders its empty state.** It needs published improvement data
  (Phase 6). It deliberately does *not* show invented businesses: named fake companies read as real
  customers even under an example label, which is a claim we are not entitled to make. The
  anonymised case in the section above is different — no company is named, and it is labelled.

`FollowUpdates` (improvement-update sign-up) is specified but not built: it needs double opt-in
email and encrypted address storage from Phase 4. A form that silently discarded email addresses
would be worse than its absence.

### Password sign-in

Added because the portal should not *depend* on mail delivery to let someone in — no email provider
is configured yet, and magic links are unusable without one outside local development.

- [x] Route handler at `/api/portal/sign-in`, not a Server Action: writing auth cookies and then
      redirecting from an action leaves the destination render without the session it just created
- [x] Plain form post, so it works with JavaScript disabled — covered by a test that runs with JS off
- [x] Identical message for a wrong password, an unknown address and an unconfirmed account, so the
      form is not an account-enumeration oracle — asserted in two tests
- [x] Magic link retained as the invitation route and the no-password option

Still required before staging: a real provider (`EMAIL_PROVIDER=resend`, `RESEND_API_KEY`) for
invitations, password reset and verification. Password length is validated where a password is
*chosen*, never at sign-in, where a length complaint would leak which guesses could be real.

### Platform administration and participant context

The `platform_admin` role, its RLS policies and a seeded account existed from Phase 1. Two things
did not, and both are now built.

- [x] `/admin`: every organization with location and member counts, platform-staff only, guarded at
      the layout so the check lives at the boundary
- [x] Opening a participant sets a validated, session-scoped cookie; the portal then renders that
      organization
- [x] An amber banner names whose data is on screen, with a one-click exit
- [x] Every enter and exit by platform staff writes an audit entry naming the real user
- [x] `/admin` added to the portal-host routing in the proxy
- [x] Unit tests for the context rules, plus a browser test for the whole switch

This is a **context switch, not impersonation**. The signed-in user stays themselves: RLS evaluates
their real `auth.uid()` and audit entries name them. Nothing mints a session for another user, so an
action taken while viewing a participant can never be misattributed to that participant's staff.

A true "log in as this user" would need session minting plus a way to reproduce that user's exact
permissions, and it would break audit attribution by design. Worth a deliberate decision rather than
an accident; not built.

### Playwright smoke suite

Brought forward from Phase 8 because it is what would have caught the 500 described in risk 9.

- [x] `playwright.config.ts`, `npm run test:e2e`, reuses a running dev server
- [x] Homepage responds 200 in both languages with no console errors, one `h1`, the code field
      visible, and every section heading rendered
- [x] An unknown feedback code is refused, and the message is asserted **not** to hint at why
- [x] Portal sign-in renders; an unauthenticated `/app` visit redirects

Two nav links — `/hoe-het-werkt` and `/verbeteringen` — are in the design's navigation but those
pages are listed as "nog niet ontworpen" in the handoff, so they currently 404. They must be built
or removed from the nav before launch.

### Phase 1 — Foundation

- [x] Next.js App Router + TypeScript strict + Tailwind
- [x] Dependency baseline
- [x] Documentation set
- [x] Typed environment validation, server/client split
- [x] Supabase browser / server / admin / middleware clients
- [x] Host-based middleware routing (marketing vs portal)
- [x] Migrations 0001–0005 (tenancy, helpers, policies, audit)
- [x] RLS helper functions + policies for core tables
- [x] Auth: password sign-in, magic link, callback, sign-out, invite acceptance
- [x] Organizations, locations, memberships services + portal pages
- [x] Audit logging for membership and location changes
- [x] Vitest + unit tests for phase-1 domain logic
- [ ] Sentry — **not built.** Only `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN` validation exists in
      `lib/env.ts`; there is no package, no config and no capture. An earlier revision of this
      document ticked this box, which was wrong.
- [x] Deterministic seed data

### MVP loop: questionnaire, QR, guest flow, results per question

Phase 1 was redefined as a working MVP, which pulls in Phase 2, Phase 3 and part of Phase 6. The
whole loop is built and verified end to end.

**Standard questionnaire**

- [x] `questionnaire_templates` / `_versions` / `questions` / `question_options`, plus
      `location_questionnaire_assignments`
- [x] Published versions are **immutable**, enforced by triggers — a published version cannot be
      edited, cannot return to draft and cannot be deleted, not even by the service role
- [x] Publishing refuses a version with no questions
- [x] A published Dutch hospitality questionnaire ships in the seed: one rating, a diagnostic
      follow-up below five stars, an appreciation question at five, and an optional comment
- [x] Deterministic condition evaluator with 21 unit tests
- [x] Assignment resolution is most-specific-wins, `location_id NULL` meaning every location

**QR codes**

- [x] Crockford Base32 printed codes and a 16-character URL token, both stored hashed **and**
      encrypted — a hash cannot be reversed, so without the ciphertext a sticker could only be
      downloaded in the minute it was created
- [x] Download as SVG and PNG, error correction H, a 4-module quiet zone, PNG at 1024px, filename
      carrying organization, location and campaign
- [x] Reissue, which invalidates the old code — also the route for the seeded rows, which predate
      encrypted storage and therefore cannot be downloaded until reissued
- [x] Atomic scan counter in SQL rather than read-modify-write from the application

**Guest flow at `/r/{token}`**

- [x] `RatingControl`: cumulative fill, real radiogroup, arrow keys, one tab stop, nothing
      preselected, and no reaction to a low score
- [x] Conditional follow-ups using the same evaluator the server re-runs on submit, so the browser
      cannot smuggle in an answer to a question it was never shown
- [x] Idempotent submission — the session's unique key decides, not application logic
- [x] IP and user agent stored hashed only
- [x] Unknown, paused and expired all return one neutral message

**Results per question**

- [x] `question_results()` and `location_period_metrics()` in SQL, `SECURITY INVOKER` so RLS
      applies to the caller
- [x] Per-question respondent counts, per-option counts and shares, score distribution, headline
      KPIs and recent comments on the location page
- [x] Every share is of the people who answered *that* question, with its base printed beside it —
      a conditional follow-up divided by everyone would understate every topic on it
- [x] Feedback is append-only for the portal: no update or delete policy exists for any role

Verified: 96 unit, 52 integration, 17 end-to-end, plus a manual pass of the whole loop — create a
QR, download SVG and PNG, submit as a guest, type the printed code on the homepage, and see the
comment appear in the results.

### Still open for Phase 1

Verified against the repository, not against this checklist.

| Gap | Why it matters |
| --- | --- |
| **Sentry not wired** | Named in Phase 1. Errors currently only reach the structured logger, so a production failure leaves no alert. |
| **Rate limiting on the printed code** | A feedback code is ~40 bits, far weaker than the 95-bit URL token, and `lookupTokenForCode` is currently unthrottled. It needs a limit before launch. |
| **Seeded QR codes cannot be downloaded** | They store only a hash, because the seed runs in SQL and AES-GCM does not. The portal shows a hint and offers reissue, which fixes them. |
| **Password reset** | Phase 1 auth list. Now that password sign-in exists, someone who forgets one has no route back in. |
| **Invite acceptance page** | An invited user lands on `/auth/callback` and is signed in, but has nowhere to set a name or a password — so they stay dependent on magic links. |
| **Email verification** | `enable_confirmations = false` locally. Needs a decision plus a provider before staging. |
| **`updateProfileAction` is dead code** | Written in `features/auth/actions.ts`, never rendered anywhere. Either give it a settings screen or delete it. |
| **No CI workflow** | `docs/testing.md` describes typecheck → lint → unit → integration → build on every pull request. Nothing runs it. |
| **No `vercel.json`** | `docs/deployment.md` documents the cron entries and the file does not exist. The endpoints arrive in Phases 6–7, but the doc currently promises a file that is missing. |

Deliberate deviation, not a gap: **shadcn/ui is not installed.** The design system overrides
shadcn's defaults on nearly every value it specifies (44px controls, 10px radius, ink-on-amber,
its own focus treatment), so the primitives are written directly against the tokens. Radix is worth
adding when the first component that genuinely needs it lands — Dialog, Tabs or Select with a
listbox. Nothing built so far did.

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

**8. `@theme` self-references silently unset a variable.** Tailwind 4 re-emits every `@theme` entry
into `:root`, so `--color-surface: var(--color-surface)` is a cycle that CSS discards — the
variable becomes unset and every consumer loses its value with no warning at build time. Eight of
these were introduced and caught by inspecting the compiled stylesheet, not by the build. `@theme`
aliases must therefore point at a *ramp* variable, never at the same-named semantic token. Worth a
CI check if the token layer grows.

**9. A passing build does not prove a page renders.** Every route in this app is dynamic (`ƒ`), so
`next build` type-checks and compiles them without ever executing them. The marketing layout was
missing its `I18nProvider` and every homepage request threw a 500 — through a clean build, a clean
typecheck and a clean lint. Only an actual request found it. Smoke-testing each surface after a
layout change is not optional here; a Playwright run over the four surfaces in Phase 8 should make
it automatic.

**10. Serialised message catalogues leak across surfaces.** Anything a server layout hands to a
Client Component is serialised into the HTML. Passing the whole catalogue put every portal string —
role labels, portal error messages — into the public homepage payload. Now scoped per surface in
`lib/i18n/scope.ts`. Worth re-checking whenever a new provider is added.

**11. `next/font/google` needs network access at build time.** One build in this session failed
with a bare `next/font: error`; the identical build passed on the next run. The loader downloads
the woff2 files from Google during `next build` and self-hosts the *output*, so a network blip is a
failed build rather than a slow page. Vercel is fine; an air-gapped or flaky CI is not. If it
recurs, vendor the two families into `public/fonts` and switch to `next/font/local` — the design
handoff already recommends self-hosting.

**12. Setting a cookie and redirecting in one Server Action broke the destination render.** Next
renders the redirect target inside the action's own response, and that render came back as the
sign-in page — a manual reload of the same URL was fine. Replaced with a route handler that answers
a plain 303, so the browser makes a clean follow-up request. It also removed a hydration race: the
control is now a plain form post that works without JavaScript.

**13. `request.nextUrl.origin` is not the host the client is on.** For a request that arrived at
`app.localhost:5010` it produced `http://localhost:5010`, so an absolute redirect built from it
landed on the marketing host, where the portal session cookie does not apply — presenting as a
logged-out user. Redirects from route handlers now use a **relative** `Location`. Anything building
an absolute URL from the request should be treated with suspicion in this multi-host setup.

**14. A nullable column inside a composite foreign key makes PostgREST embeds return nothing.**
`question_options` reaches `questions` through `(question_id, organization_id)`, and for a platform
template `organization_id` is NULL on both sides. NULL never equals NULL, so the embed silently
returned zero options and the guest saw a follow-up question with no answers to choose from — no
error, just an empty array. Options are now fetched in a separate query. Any embed across a
composite key with a nullable column deserves the same suspicion.

**15. `revalidatePath` inside an action discards `useActionState`.** Both QR actions return secrets
that exist nowhere else — the plain token and printed code are only stored hashed and encrypted.
Revalidating replaced the route's payload and wiped that result, so the operator never saw the code
they had to write down. Neither action revalidates now; the row derives its own state from the
action result instead.

**16. Brand name resolved to `GeefSterren`.** The original specification said `GeefSterre` /
`geefsterre.nl`; the design system, the repository name and the git remote all say `GeefSterren`.
Confirmed with the product owner and applied throughout. `geefsterren.nl` still has to be acquired,
with `geefsterre.nl` redirecting to it — see §16 of the design handoff.

**17. Language default is English, Dutch is a full translation.** Chosen by the product owner. Note
the tension to resolve before Phase 3: the design system treats Dutch consumer copy as a
*functional* requirement — the tone rules are part of the brand promise — so the guest flow should
default to `nl` for Dutch locations regardless of the portal's locale.

**18. macOS binds port 5000.** AirPlay Receiver (ControlCenter) holds it and answers `403`, which
looks exactly like an application error. Local development therefore runs on **5010**, which is
free. Anyone changing the port must update the three `NEXT_PUBLIC_*_URL` values with it: the proxy
decides marketing vs portal by comparing the request host against `NEXT_PUBLIC_PORTAL_URL`, so a
mismatched port silently sends every portal request to the marketing site.

**19. Default branch is `production`.** Committing feature work straight onto `production` in a repo
wired to Vercel would deploy it. `main` should be created and set as the default before any
deployment integration is connected.

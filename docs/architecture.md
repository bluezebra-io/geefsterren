# Architecture

GeefSterren is a **modular monolith**: one Next.js application, one PostgreSQL database, clear
domain boundaries enforced by folder structure and lint rules rather than by network hops.

## Runtime shape

```text
                    ┌──────────────────────────────┐
  QR scan  ────────▶│ geefsterren.nl/r/{token}      │  no auth
                    │ (public-feedback route group)│
                    └──────────────┬───────────────┘
                                   │
  Portal   ────────▶┌──────────────▼───────────────┐
                    │ app.geefsterren.nl            │  Supabase Auth session
                    │ (portal route group)         │
                    └──────────────┬───────────────┘
                                   │
  Vercel Cron ─────▶┌──────────────▼───────────────┐
                    │ /api/internal/*  CRON_SECRET │
                    └──────────────┬───────────────┘
                                   │
                    ┌──────────────▼───────────────┐
                    │ Supabase Postgres (Frankfurt)│
                    │ RLS + SECURITY DEFINER helpers│
                    └──────────────────────────────┘
```

A single deployment serves all three hostnames. `src/proxy.ts` classifies the request host
and rewrites into the correct route group. The location is **never** derived from the hostname —
only from a QR token or from explicit, authorised portal context.

## Layering

```text
app/            React Server Components, route handlers. No business rules.
  └ calls
features/*/actions.ts    Server Actions: authorize → validate (Zod) → service → revalidate
  └ calls
features/*/service.ts    Business rules. Pure where possible. No React, no Next imports.
  └ calls
features/*/queries.ts    Data access via the RLS-scoped server client.
  └ calls
lib/supabase/*           Client construction only.
```

The rule that matters: **`service.ts` is the unit-testable layer**. Anything worth asserting —
readiness transitions, reward eligibility, questionnaire branching, post-submission experience —
lives there and receives its inputs as arguments. A function that reaches for `cookies()` or a
database connection cannot be tested cheaply, so it does not hold rules.

## Feature module layout

```text
features/<domain>/
  schemas.ts   Zod contracts for every external input and every AI output
  types.ts     Domain types, derived from schemas and generated DB types
  queries.ts   Reads
  service.ts   Rules
  actions.ts   Server Actions
```

## Two deliberately separate services

Questionnaire branching and public review acquisition are separate domains that must not share
inputs:

- `features/questionnaires/service.ts` decides **which questions a respondent sees**. It reads the
  overall score. That is its job.
- `features/external-reviews/service.ts` decides **whether the Google invitation appears**. Its
  input type has no score field, no answers, no sentiment, no reward status. It cannot consult them
  because it is never given them.

This is enforced by the shape of `ResolveExternalReviewInvitationInput`, not by discipline. See
[review-acquisition-readiness.md](./review-acquisition-readiness.md).

## Data access clients

| Client | File | Key | Used from |
| --- | --- | --- | --- |
| Browser | `lib/supabase/browser.ts` | anon | Client Components |
| Server | `lib/supabase/server.ts` | anon + user session | RSC, Server Actions, route handlers |
| Admin | `lib/supabase/admin.ts` | **service role** | server-only modules; bypasses RLS |
| Middleware | `lib/supabase/middleware.ts` | anon + session refresh | `src/proxy.ts` |

`admin.ts` begins with `import 'server-only'` and is blocked from client modules by an ESLint rule.
It is used for exactly two things: the public feedback write path (which has no authenticated user)
and internal cron/queue work.

## Authoritative numbers

Every count, average and percentage shown in the portal is computed by PostgreSQL. AI output is
narrative only: themes, likely causes, suggested actions. When AI text and a database metric
disagree, the metric wins and the AI text is the bug.

## What this architecture deliberately is not

No microservices, no per-tenant database, no per-customer deployment, no location subdomains, no
Kubernetes. Tenant isolation is a row-level concern solved at the row level.

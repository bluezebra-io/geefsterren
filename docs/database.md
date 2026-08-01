# Database

PostgreSQL on Supabase (Frankfurt). UUID primary keys, UTC `timestamptz` everywhere.

## Conventions

- Primary keys: `uuid` defaulting to `gen_random_uuid()`.
- Timestamps: `timestamptz`, defaulting to `now()`. `updated_at` is maintained by the shared
  `app.set_updated_at()` trigger, never by application code.
- Enums are used only where the value set is genuinely stable (`platform_role`, statuses that map
  to state machines). Everything likely to grow — source channels, reward types, question types —
  is `text` with a `CHECK` constraint, which can be altered in a transaction. `ALTER TYPE ... ADD
  VALUE` cannot run inside one, which makes enums a poor fit for evolving vocabularies.
- Soft deletion via `archived_at` for tenant-visible entities. Hard deletes are reserved for
  privacy erasure.
- Every table has RLS enabled in the same migration that creates it.

## Migration workflow

Forward-only. An applied migration is never edited; a mistake is corrected by a new migration.

```bash
npx supabase migration new <name>     # create
npx supabase db reset                 # rebuild local DB + reseed
npx supabase db push                  # apply to the linked project
npm run db:types                      # regenerate src/types/database.generated.ts
```

Regenerating types after every schema change is not optional — `database.generated.ts` is the
single source of truth for row shapes in TypeScript.

## Schema map

### Tenancy
`organizations`, `locations`, `profiles`, `organization_memberships`, `location_memberships`.

`locations` has `unique (organization_id, slug)` and, to support composite foreign keys from child
tables, `unique (organization_id, id)`.

### Questionnaires
`questionnaire_templates` → `questionnaire_versions` → `questions` → `question_options`, plus
`location_questionnaire_assignments`.

Published versions are **immutable**. A trigger rejects updates to questions, options and the
version itself once `status = 'published'`. Changing a published questionnaire means creating a new
version.

### Campaigns and QR
`campaigns`, `qr_codes`.

`qr_codes` stores `token_hash`, never the plain token. The token is returned exactly once, at
creation time.

### Feedback
`feedback_sessions` → `feedback_submissions` → `feedback_answers`.

`overall_score integer not null check (overall_score between 1 and 5)`.
`feedback_answers.answer_json` carries answers for types where a single option id is insufficient.

### Rewards
`reward_campaigns`, `reward_issuances`.

`reward_issuances.idempotency_key` is unique. Issuance depends on completing feedback — never on
the score, and never on a Google Review.

### Review Acquisition Readiness
`review_acquisition_settings`, `review_activation_rules`, `review_activation_evaluations`,
`external_review_invitations`.

`external_review_invitations.individual_score_used boolean not null default false check
(individual_score_used = false)` — see
[review-acquisition-readiness.md](./review-acquisition-readiness.md).

### AI
`analysis_runs`, `analysis_results`, `feedback_classifications`.

### Governance
`audit_logs`, `privacy_requests`.

## Analytics

Metrics are database views and SQL functions, not application code and never browser code:

```text
location_daily_metrics
location_period_metrics
location_category_metrics
campaign_conversion_metrics
qr_source_metrics
review_readiness_metrics
```

Views are `security_invoker = true` so RLS on the underlying tables still applies to the caller.

## Indexing

Every RLS predicate column is indexed — an unindexed `organization_id` turns every policy check
into a sequential scan. Time-series reads over `feedback_submissions` use composite indexes on
`(location_id, submitted_at desc)`.

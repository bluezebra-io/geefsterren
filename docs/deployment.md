# Deployment

## Environments

Three fully separate data environments. Nothing is shared between them.

| | Development | Staging | Production |
| --- | --- | --- | --- |
| Supabase | local CLI stack | separate staging project | Supabase Pro, Frankfurt |
| Hosting | `next dev` | Vercel staging | Vercel Pro |
| Email | console / test inbox | test recipients only | live |
| AI | test key, cheap model | test key | production key |
| Data | seed | synthetic | real |

**Vercel preview deployments must never point at the production Supabase project.** Set preview
environment variables explicitly to staging; do not let them inherit production values.

## Domains

| Host | Serves |
| --- | --- |
| `geefsterren.nl` | marketing + `/r/{token}` feedback flow |
| `www.geefsterren.nl` | redirect to apex |
| `app.geefsterren.nl` | authenticated portal |

All three point at the same deployment. `src/proxy.ts` routes by host. No location
subdomains.

## Vercel configuration

- Region: `fra1` (Frankfurt), co-located with the database. Cross-region latency on a
  multi-query page render is the single easiest performance mistake to make here.
- Node 22 runtime (`.nvmrc` and `engines` pin it).
- Environment variables per environment, never shared.

## Environment variables

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY

NEXT_PUBLIC_MARKETING_URL
NEXT_PUBLIC_PORTAL_URL
NEXT_PUBLIC_REVIEW_URL

APP_ENCRYPTION_KEY          # 32 bytes, base64
CRON_SECRET

AI_PROVIDER                 # anthropic
ANTHROPIC_API_KEY
ANTHROPIC_MODEL

EMAIL_PROVIDER              # resend | postmark | console
RESEND_API_KEY
EMAIL_FROM_ADDRESS

SENTRY_DSN
NEXT_PUBLIC_SENTRY_DSN

TURNSTILE_SITE_KEY
TURNSTILE_SECRET_KEY
```

`lib/env.ts` validates these at startup and fails the boot rather than surfacing a confusing
runtime error later. Generate secrets with:

```bash
openssl rand -base64 32   # APP_ENCRYPTION_KEY
openssl rand -hex 32      # CRON_SECRET
```

No direct database URL is needed at runtime. Connection strings are for migrations and CI only.

## Release procedure

1. Merge to `main`.
2. CI: typecheck, lint, unit tests, RLS integration tests, build.
3. Apply migrations to staging: `npx supabase db push --linked` against the staging project.
4. Deploy to staging, run Playwright against it.
5. Apply migrations to production **before** promoting the deployment. Migrations are written to be
   backward compatible with the currently deployed code, so the two steps can never be atomic and
   must not need to be.
6. Promote the deployment.
7. Verify: sign in, resolve a QR token, submit test feedback, check Sentry is quiet.

## Cron

Defined in `vercel.json`:

```json
{
  "crons": [
    { "path": "/api/internal/cron/process-feedback-classification", "schedule": "*/5 * * * *" },
    { "path": "/api/internal/cron/process-period-analysis",         "schedule": "15 3 * * *" },
    { "path": "/api/internal/cron/evaluate-review-readiness",       "schedule": "30 3 * * *" },
    { "path": "/api/internal/cron/send-notifications",              "schedule": "*/10 * * * *" }
  ]
}
```

## Backup and recovery

- Supabase Pro daily backups with point-in-time recovery.
- Restore drill before launch, and quarterly after — an untested backup is a hypothesis, not a
  backup.
- Recovery: restore the Supabase project to a timestamp, re-point environment variables, redeploy.
- `APP_ENCRYPTION_KEY` must be backed up **separately** from the database. Restoring a database
  without the key leaves every stored consumer email permanently unreadable.

## Rollback

Application: promote the previous Vercel deployment.
Database: forward-only. Roll back by shipping a corrective migration, never by reverting an applied
one.

# Background jobs

## Why a queue at all

Vercel functions end when the HTTP response ends. Work started in a floating promise after the
response is not guaranteed to finish, and there is no retry. Anything that must eventually happen —
AI classification, email delivery, reward issuance — goes on a durable queue.

Rule: **never start a long-running promise after an HTTP response has completed.**

## Queues

```text
feedback-classification
period-analysis
email-delivery
reward-issuance
privacy-processing
```

Backed by Supabase Queues, accessed only through `src/lib/queue/`. If the extension proves
unsuitable under load, the fallback is a `jobs` table claimed with `FOR UPDATE SKIP LOCKED`; the
swap stays inside that one module.

## Worker endpoints

A generic processor:

```text
POST /api/internal/queue/process
```

and, where clearer, dedicated scheduled endpoints:

```text
POST /api/internal/cron/process-feedback-classification
POST /api/internal/cron/process-period-analysis
POST /api/internal/cron/evaluate-review-readiness
POST /api/internal/cron/send-notifications
```

All are protected by `CRON_SECRET`, compared with a timing-safe equality check.

## Processing contract

Each invocation:

1. Claims a **bounded** batch with a visibility timeout.
2. Processes jobs one at a time.
3. Marks a job complete **only after** its result is durably stored.
4. Leaves failed jobs visible again for retry.
5. Records structured error detail on failure.
6. Stops against a wall-clock budget well before the Vercel execution limit, leaving the remainder
   for the next tick.

Acknowledging before the work is stored converts a retryable failure into silent data loss. The
order above is the whole point.

## Retries

Vercel Cron is a **trigger**, not a retry mechanism — a failed cron invocation is simply gone.
Durability comes from the queue: an unacknowledged job becomes visible again after its timeout.

Jobs are therefore designed to be **idempotent**. A job that runs twice must produce the same
result as running once — enforced by idempotency keys on reward issuance and submission, and by
upserts keyed on `(feedback_submission_id, prompt_version)` for classification.

## Poison messages

A job that fails repeatedly must not block the queue. After a configured attempt count it is moved
to a dead-letter state, surfaced in the platform admin operational views, and retried only on
explicit request.

## Scheduling

`vercel.json` holds the cron definitions. Local development invokes the endpoints manually:

```bash
curl -X POST http://localhost:3000/api/internal/queue/process \
  -H "Authorization: Bearer $CRON_SECRET"
```

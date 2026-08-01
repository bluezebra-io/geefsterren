# Review Acquisition Readiness

The internal and user-facing name for this feature is **Review Acquisition Readiness**. The term
`review_gating` must not appear in user-facing text.

## What the feature is

A location starts by collecting **private feedback only**. No Google Review invitation is shown.
Once the location's *aggregate* results meet configured criteria, Google Review acquisition becomes
active — and from that moment **every** respondent sees the **same** neutral invitation.

## What the feature is not

It is not review filtering. An individual customer's score never influences what that customer
sees afterwards.

Forbidden, in any form:

```ts
// NEVER
const showGoogleReview = submission.overallScore >= 4;
```

The individual score, individual answers, AI sentiment, complaint severity and reward status must
never affect:

- whether the Google CTA is shown
- its wording
- its timing
- reminders
- the reward
- the destination
- its prominence

## The correct rule

```ts
const showGoogleReview =
  locationReviewReadiness.status === "active" &&
  campaign.googleReviewInvitationEnabled;
```

## How the code enforces it

Enforcement is structural, in three layers.

**1. The input type has no score.**

```ts
type ResolveExternalReviewInvitationInput = {
  platform: "google";
  readinessStatus: ReviewAcquisitionStatus;
  campaignStatus: CampaignStatus;
  googleReviewInvitationEnabled: boolean;
  destinationUrl: string | null;
};
```

The resolver is a pure function of that type. It cannot read a score because it is never handed
one. A future contributor who wants score-based behaviour has to widen a type in a file named
`external-reviews`, which is a reviewable act rather than an invisible one.

**2. A database constraint.**

```sql
individual_score_used boolean not null default false
  check (individual_score_used = false)
```

The column carries no information. It exists so the decision is visible in the schema and
falsifiable by a test.

**3. Tests that assert the negative.**

- CTA absent while status is `evaluating`
- CTA present for every completed submission while status is `active`
- a 1-star and a 5-star submission get identical CTA availability
- the resolver's input type has no score-bearing field
- AI sentiment cannot change CTA visibility
- reward status cannot change CTA visibility

## States

| Status | Meaning |
| --- | --- |
| `disabled` | No review acquisition configured. |
| `evaluating` | Private feedback is being collected. No Google CTA is shown. |
| `active` | Every completed submission receives the same Google CTA. |
| `paused` | Temporarily disabled by an authorised user or an operational rule. |

Modes: `off`, `manual`, `automatic`.

## Manual mode

An organization administrator activates or pauses acquisition. Before activation the portal shows
current aggregate metrics so the decision is informed. Every change writes an audit log entry.

## Automatic mode

A scheduled job evaluates each location over a rolling window and activates only when **every**
condition is met:

| Rule | Default | Configurable |
| --- | --- | --- |
| `minimum_response_count` | 50 | yes |
| `measurement_window_days` | 60 | yes |
| `minimum_average_score` | 4.2 | yes |
| `maximum_low_score_percentage` | 10 | yes |
| `minimum_completion_percentage` | 70 | yes |
| `activation_cooldown_days` | 14 | yes |

These defaults live in `review_activation_rules` rows, never hard-coded in business logic.

Every automatic transition writes a `review_activation_evaluations` record **and** an audit log
entry. An evaluation is recorded even when the outcome is "no change" — the absence of a
transition is itself information when debugging why a location never activated.

## Stability

To avoid oscillation:

- a cooldown period after any transition
- separate activation and pause thresholds (deactivation is not simply "activation, negated")
- manual pause always wins over automatic evaluation
- a minimum period before another automatic transition

## Click tracking

We record `invitation_shown_at` and `clicked_at`. We do **not** record, infer, display or claim
that a Google Review was actually posted. A click is a click. Portal copy says "Google link
clicks", never "Google reviews received".

## Required portal copy

The readiness page must state, verbatim in intent:

> When active, the Google invitation is shown to every respondent, regardless of their individual
> score.

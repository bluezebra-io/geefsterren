# Testing

| Layer | Tool | Location |
| --- | --- | --- |
| Unit / service | Vitest | `tests/unit/` |
| Database policies + functions | Vitest against a local Supabase | `tests/integration/` |
| Browser flows | Playwright | `tests/e2e/` |

```bash
npm run test              # unit
npm run test:integration  # requires a running local Supabase
npm run test:e2e          # requires a running app
```

## What unit tests are for

Domain services, and only domain services. Everything in the mandatory list below is a pure
function taking explicit arguments — which is precisely why business rules live in `service.ts`
rather than in components or route handlers.

Mandatory:

- Questionnaire rule evaluation
- Readiness metric calculation
- Readiness state transitions
- Cooldown behaviour
- Reward eligibility
- Reward idempotency
- Post-submission experience
- AI response validation
- Email normalisation and hashing
- Encryption and decryption round-trip

## RLS integration tests

These run against a real local PostgreSQL, because RLS cannot be mocked — a mocked policy tells you
nothing.

Each test creates users with known roles, obtains real sessions, and asserts through the anon-key
client so policies actually apply. Using the service-role client in an RLS test bypasses the thing
under test and produces a suite that passes while the system leaks.

Mandatory assertions:

1. Organization A cannot read Organization B.
2. Location manager A cannot access Location B.
3. A viewer cannot modify campaigns.
4. An organization administrator cannot access another organization.
5. Anonymous users cannot read private feedback.
6. Anonymous users cannot directly insert arbitrary feedback.
7. Platform support has only its intended access.
8. Platform administrators have their intended access.
9. Service-role operations remain server-only.

## Review acquisition tests

The feature's whole value is a negative property, so the tests assert absence:

1. Google CTA absent while status is `evaluating`.
2. Google CTA present for every completed submission while status is `active`.
3. A 1-star submission has identical CTA availability to a 5-star submission while active.
4. The individual score is not passed into the CTA eligibility function — asserted at type level
   and by inspecting the resolver's parameter shape.
5. AI sentiment cannot affect CTA visibility.
6. Reward status cannot affect CTA visibility.
7. Readiness activation uses aggregate metrics only.
8. Every automatic transition creates an evaluation record.
9. Every manual transition creates an audit record.
10. `individual_score_used` is always false.

## End-to-end flows

- Organization admin signs in.
- Creates a campaign.
- Generates a QR code.
- Consumer scans and submits 5-star feedback.
- Consumer scans and submits a lower score with follow-up answers.
- Reward is issued exactly once.
- Duplicate submission does not issue a second reward.
- Location stays in evaluation below thresholds.
- Scheduled evaluation activates Google acquisition once thresholds are met.
- 1-star and 5-star respondents both see the Google CTA after activation.
- A Google link click is recorded.
- Portal shows results and analysis.
- Cross-tenant URL manipulation fails.

## CI

On every pull request: typecheck → lint → unit → integration (local Supabase in the runner) →
build. Playwright runs against the staging deployment after merge.

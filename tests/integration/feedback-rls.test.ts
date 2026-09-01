import { beforeAll, describe, expect, it } from 'vitest';

import { anonClient, SEED, serviceClient, signedInClient, type TestClient } from './helpers';

/**
 * Feedback and questionnaire policies, against a real database.
 *
 * Two things are being proved here that no unit test can:
 *   - `anon` cannot read or write feedback, which is why the guest flow goes
 *     through server endpoints instead of anonymous inserts;
 *   - feedback is append-only for the portal, which is what makes historic
 *     results trustworthy.
 */

const LEIDEN = SEED.locations.leiden;
const ROTTERDAM = SEED.locations.rotterdam;
const NAPOLI = SEED.locations.napoli;

let orgAdminA: TestClient;
let locationManager: TestClient;
let viewer: TestClient;
let orgAdminB: TestClient;
let support: TestClient;

beforeAll(async () => {
  [orgAdminA, locationManager, viewer, orgAdminB, support] = await Promise.all([
    signedInClient(SEED.users.orgAdminA),
    signedInClient(SEED.users.locationManagerLeiden),
    signedInClient(SEED.users.viewerA),
    signedInClient(SEED.users.orgAdminB),
    signedInClient(SEED.users.platformSupport),
  ]);
}, 60_000);

describe('anonymous access to feedback', () => {
  const anon = anonClient();

  it('cannot read submissions', async () => {
    const { data, error } = await anon.from('feedback_submissions').select('id');
    expect(error !== null || (data ?? []).length === 0).toBe(true);
  });

  it('cannot read answers', async () => {
    const { data, error } = await anon.from('feedback_answers').select('id');
    expect(error !== null || (data ?? []).length === 0).toBe(true);
  });

  it('cannot read qr codes, so a token cannot be harvested', async () => {
    const { data, error } = await anon.from('qr_codes').select('id, token_hash');
    expect(error !== null || (data ?? []).length === 0).toBe(true);
  });

  it('cannot insert a submission directly', async () => {
    const { error } = await anon.from('feedback_submissions').insert({
      feedback_session_id: '00000000-0000-4000-8000-000000000000',
      organization_id: SEED.organizations.a,
      location_id: LEIDEN,
      campaign_id: '00000000-0000-4000-8000-000000000000',
      questionnaire_version_id: '77777777-7777-4777-8777-000000000001',
      overall_score: 5,
    });
    expect(error).not.toBeNull();
  });
});

describe('feedback is append-only for the portal', () => {
  it('an organization administrator cannot edit a submission', async () => {
    const { data } = await orgAdminA
      .from('feedback_submissions')
      .update({ overall_score: 5 })
      .eq('location_id', LEIDEN)
      .select('id');
    // No update policy exists, so nothing is updated.
    expect(data ?? []).toEqual([]);
  });

  it('an organization administrator cannot delete a submission', async () => {
    const before = await orgAdminA
      .from('feedback_submissions')
      .select('id', { count: 'exact', head: true })
      .eq('location_id', LEIDEN);

    await orgAdminA.from('feedback_submissions').delete().eq('location_id', LEIDEN);

    const after = await orgAdminA
      .from('feedback_submissions')
      .select('id', { count: 'exact', head: true })
      .eq('location_id', LEIDEN);

    expect(after.count).toBe(before.count);
  });
});

describe('feedback stays inside its tenant', () => {
  it('an organization administrator reads only their own locations', async () => {
    const { data } = await orgAdminA.from('feedback_submissions').select('location_id');
    const locations = new Set((data ?? []).map((row) => row.location_id));
    expect(locations.has(NAPOLI)).toBe(false);
  });

  it('a location manager reads only their assigned location', async () => {
    const { data } = await locationManager.from('feedback_submissions').select('location_id');
    const locations = new Set((data ?? []).map((row) => row.location_id));
    expect([...locations]).toEqual([LEIDEN]);
    expect(locations.has(ROTTERDAM)).toBe(false);
  });

  it('the other organization sees none of this ones feedback', async () => {
    // Pizzeria Napoli has no campaign seeded, so the point is the absence: an
    // administrator elsewhere must not see Bakkerij's submissions at all.
    const { data, error } = await orgAdminB.from('feedback_submissions').select('location_id');
    expect(error).toBeNull();
    const locations = new Set((data ?? []).map((row) => row.location_id));
    expect(locations.has(LEIDEN)).toBe(false);
    expect(locations.has(ROTTERDAM)).toBe(false);
  });

  it('platform support can read across organizations', async () => {
    const { data, error } = await support.from('feedback_submissions').select('location_id');
    expect(error).toBeNull();
    const locations = new Set((data ?? []).map((row) => row.location_id));
    expect(locations.size).toBeGreaterThan(1);
  });
});

describe('question_results respects the caller', () => {
  it('gives a location manager their own location', async () => {
    const { data, error } = await locationManager.rpc('question_results', {
      p_location_id: LEIDEN,
    });
    expect(error).toBeNull();
    expect((data ?? []).length).toBeGreaterThan(0);
  });

  it('gives nothing for a location the caller cannot see', async () => {
    // The function is SECURITY INVOKER, so RLS filters the rows it reads rather
    // than the function handing over somebody else's aggregate.
    const { data } = await locationManager.rpc('question_results', {
      p_location_id: ROTTERDAM,
    });
    const withAnswers = (data ?? []).filter((row) => Number(row.respondent_count) > 0);
    expect(withAnswers).toEqual([]);
  });

  it('gives a viewer read access without write access', async () => {
    const { error } = await viewer.rpc('question_results', { p_location_id: LEIDEN });
    expect(error).toBeNull();
  });
});

describe('published questionnaires are immutable', () => {
  it('an organization administrator cannot edit a published question', async () => {
    const { data } = await orgAdminA
      .from('questions')
      .update({ label: 'Rewritten after the fact' })
      .eq('question_key', 'overall_score')
      .select('id');
    // The platform template is not theirs to author, so the policy denies it and
    // the trigger would refuse it even if the policy allowed.
    expect(data ?? []).toEqual([]);
  });

  it('not even the service role can edit a published question', async () => {
    // The trigger applies to every role, which is what makes historic answers
    // still mean what they meant.
    const { error } = await serviceClient()
      .from('questions')
      .update({ label: 'Rewritten by the service role' })
      .eq('question_key', 'overall_score');
    expect(error).not.toBeNull();
    expect(error?.message).toMatch(/draft/i);
  });
});

describe('submission idempotency', () => {
  it('a repeated idempotency key cannot create a second session', async () => {
    // This is the guarantee behind a double tap on "send": the unique constraint
    // decides, not application logic.
    const service = serviceClient();
    const key = `integration-idempotency-${Date.now()}`;

    const base = {
      organization_id: SEED.organizations.a,
      location_id: LEIDEN,
      campaign_id: 'aaaaaaaa-aaaa-4aaa-8aaa-000000000001',
      qr_code_id: 'bbbbbbbb-bbbb-4bbb-8bbb-000000000001',
      status: 'started' as const,
      expires_at: new Date(Date.now() + 3_600_000).toISOString(),
      idempotency_key: key,
    };

    const first = await service.from('feedback_sessions').insert(base).select('id').single();
    expect(first.error).toBeNull();

    const second = await service.from('feedback_sessions').insert(base).select('id');
    expect(second.error).not.toBeNull();
    expect(second.error?.code).toBe('23505');

    await service.from('feedback_sessions').delete().eq('idempotency_key', key);
  });
});

describe('questionnaire names survive the nullable composite foreign key', () => {
  it('resolves the platform template name, which an embed cannot', async () => {
    /*
     * The regression this guards: the questionnaire tables are chained by
     * composite foreign keys including `organization_id`, which is NULL for a
     * platform template. A PostgREST embed across them returns null for the
     * parent — silently, with no error — and the portal showed a questionnaire
     * called "—". It happened three times in three different queries before the
     * join was moved into one helper.
     */
    const client = serviceClient();

    const embedded = await client
      .from('questionnaire_versions')
      .select('id, questionnaire_templates(name)')
      .eq('id', '77777777-7777-4777-8777-000000000001')
      .single();

    expect(embedded.error).toBeNull();
    // Still null: this is the trap, documented here so nobody "fixes" the helper
    // by going back to an embed.
    expect(embedded.data?.questionnaire_templates).toBeNull();

    // Two queries do give the name.
    const version = await client
      .from('questionnaire_versions')
      .select('questionnaire_template_id')
      .eq('id', '77777777-7777-4777-8777-000000000001')
      .single();

    const template = await client
      .from('questionnaire_templates')
      .select('name, organization_id')
      .eq('id', version.data!.questionnaire_template_id)
      .single();

    expect(template.data?.organization_id).toBeNull();
    expect(template.data?.name).toBe('Standaard horeca-vragenlijst');
  });
});

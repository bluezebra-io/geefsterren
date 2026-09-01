import { createHash } from 'node:crypto';

import { afterAll, describe, expect, it } from 'vitest';

import { SEED, serviceClient, signedInClient } from './helpers';

/**
 * Platform staff write access.
 *
 * `app.can_manage_location()` originally checked memberships only, so a platform administrator —
 * who has no membership rows anywhere by design — was refused by RLS while the portal cheerfully
 * rendered the form, because the TypeScript permission check *did* count them. The result was a
 * form that looked usable and failed on submit with a generic message.
 *
 * These tests pin both halves of the fix: an administrator may write, and read-only support still
 * may not. Support is the half that would silently become dangerous if the predicate were widened
 * to "any platform staff".
 */

const PUBLISHED_VERSION = '77777777-7777-4777-8777-000000000001';
const NAPOLI = SEED.locations.napoli;
const ORG_B = SEED.organizations.b;

const createdCampaignIds: string[] = [];

/** token_hash is constrained to a SHA-256 hex digest, so a placeholder string will not do. */
function hash(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

afterAll(async () => {
  if (createdCampaignIds.length === 0) return;
  await serviceClient().from('campaigns').delete().in('id', createdCampaignIds);
});

describe('app.can_manage_location for platform staff', () => {
  it('reports true for a platform administrator with no membership', async () => {
    const client = await signedInClient(SEED.users.platformAdmin);

    // The premise: this really is someone with no membership of their own anywhere. (They can
    // *read* everyone else's, which is exactly why the query is filtered by user id.)
    const { data: memberships } = await client
      .from('organization_memberships')
      .select('id')
      .eq('user_id', SEED.userIds.platformAdmin);

    expect(memberships ?? []).toHaveLength(0);

    const { data, error } = await client.rpc('can_manage_location', { p_location_id: NAPOLI });
    expect(error).toBeNull();
    expect(data).toBe(true);
  });

  it('reports false for read-only platform support', async () => {
    const client = await signedInClient(SEED.users.platformSupport);
    const { data, error } = await client.rpc('can_manage_location', { p_location_id: NAPOLI });
    expect(error).toBeNull();
    expect(data).toBe(false);
  });
});

describe('campaign writes', () => {
  it('lets a platform administrator create a campaign in any organization', async () => {
    const client = await signedInClient(SEED.users.platformAdmin);

    const { data, error } = await client
      .from('campaigns')
      .insert({
        organization_id: ORG_B,
        location_id: NAPOLI,
        name: 'Platform admin write path',
        questionnaire_version_id: PUBLISHED_VERSION,
      })
      .select('id')
      .single();

    expect(error).toBeNull();
    expect(data?.id).toBeTruthy();
    if (data?.id) createdCampaignIds.push(data.id);
  });

  it('refuses a campaign from read-only platform support', async () => {
    const client = await signedInClient(SEED.users.platformSupport);

    const { data, error } = await client
      .from('campaigns')
      .insert({
        organization_id: ORG_B,
        location_id: NAPOLI,
        name: 'Support should not be able to write this',
        questionnaire_version_id: PUBLISHED_VERSION,
      })
      .select('id')
      .single();

    expect(data).toBeNull();
    expect(error?.code).toBe('42501');
  });

  it('refuses a campaign from a viewer in the owning organization', async () => {
    // Not platform staff, but the other way the predicate could be too generous: a member of the
    // organization who is not entitled to change anything.
    const client = await signedInClient(SEED.users.viewerA);

    const { error } = await client.from('campaigns').insert({
      organization_id: SEED.organizations.a,
      location_id: SEED.locations.leiden,
      name: 'Viewer should not be able to write this',
      questionnaire_version_id: PUBLISHED_VERSION,
    });

    expect(error?.code).toBe('42501');
  });
});

describe('QR code writes', () => {
  it('lets a platform administrator create a QR code, and refuses support', async () => {
    const admin = await signedInClient(SEED.users.platformAdmin);

    const { data: campaign, error: campaignError } = await admin
      .from('campaigns')
      .insert({
        organization_id: ORG_B,
        location_id: NAPOLI,
        name: 'Platform admin QR path',
        questionnaire_version_id: PUBLISHED_VERSION,
      })
      .select('id')
      .single();

    expect(campaignError).toBeNull();
    if (campaign?.id) createdCampaignIds.push(campaign.id);

    const row = {
      organization_id: ORG_B,
      location_id: NAPOLI,
      campaign_id: campaign!.id,
      source_channel: 'table' as const,
      label: 'Integration test',
    };

    const { data: created, error: createError } = await admin
      .from('qr_codes')
      .insert({ ...row, token_hash: hash('integration-test-admin') })
      .select('id')
      .single();

    expect(createError).toBeNull();
    expect(created?.id).toBeTruthy();

    const support = await signedInClient(SEED.users.platformSupport);
    const { error: supportError } = await support
      .from('qr_codes')
      .insert({ ...row, token_hash: hash('integration-test-support') });

    expect(supportError?.code).toBe('42501');

    if (created?.id) await serviceClient().from('qr_codes').delete().eq('id', created.id);
  });
});

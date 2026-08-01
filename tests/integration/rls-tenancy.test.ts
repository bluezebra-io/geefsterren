import { beforeAll, describe, expect, it } from 'vitest';

import { anonClient, SEED, signedInClient, type TestClient } from './helpers';

/**
 * RLS integration tests.
 *
 * Everything here runs against a real local PostgreSQL through the anon key with a real session,
 * because RLS cannot be mocked — a mocked policy proves nothing.
 *
 * Requires: `npm run db:start && npm run db:reset`.
 */

let orgAdminA: TestClient;
let orgAdminB: TestClient;
let locationManager: TestClient;
let viewer: TestClient;
let platformAdmin: TestClient;
let platformSupport: TestClient;

beforeAll(async () => {
  [orgAdminA, orgAdminB, locationManager, viewer, platformAdmin, platformSupport] =
    await Promise.all([
      signedInClient(SEED.users.orgAdminA),
      signedInClient(SEED.users.orgAdminB),
      signedInClient(SEED.users.locationManagerLeiden),
      signedInClient(SEED.users.viewerA),
      signedInClient(SEED.users.platformAdmin),
      signedInClient(SEED.users.platformSupport),
    ]);
}, 60_000);

describe('1. organization A cannot read organization B', () => {
  it('sees only its own organization', async () => {
    const { data, error } = await orgAdminA.from('organizations').select('id');
    expect(error).toBeNull();
    expect(data?.map((row) => row.id)).toEqual([SEED.organizations.a]);
  });

  it('gets no row when asking for the other organization by id', async () => {
    const { data, error } = await orgAdminA
      .from('organizations')
      .select('id')
      .eq('id', SEED.organizations.b);
    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  it('cannot read the other organization locations', async () => {
    const { data } = await orgAdminA
      .from('locations')
      .select('id')
      .eq('id', SEED.locations.napoli);
    expect(data).toEqual([]);
  });
});

describe('2. location manager A cannot access location B', () => {
  it('reads only its assigned location', async () => {
    const { data, error } = await locationManager.from('locations').select('id');
    expect(error).toBeNull();
    expect(data?.map((row) => row.id)).toEqual([SEED.locations.leiden]);
  });

  it('cannot read an unassigned location in the same organization', async () => {
    const { data } = await locationManager
      .from('locations')
      .select('id')
      .eq('id', SEED.locations.rotterdam);
    expect(data).toEqual([]);
  });

  it('cannot update an unassigned location', async () => {
    const { data } = await locationManager
      .from('locations')
      .update({ name: 'Hijacked' })
      .eq('id', SEED.locations.rotterdam)
      .select('id');
    // No matching row passes the USING clause, so nothing is updated.
    expect(data ?? []).toEqual([]);
  });

  it('can update its own location', async () => {
    const { data, error } = await locationManager
      .from('locations')
      .update({ name: 'De Korenaar Leiden' })
      .eq('id', SEED.locations.leiden)
      .select('id');
    expect(error).toBeNull();
    expect(data).toHaveLength(1);
  });
});

describe('3. a viewer cannot modify configuration', () => {
  it('can read its assigned location', async () => {
    const { data } = await viewer.from('locations').select('id');
    expect(data?.map((row) => row.id)).toEqual([SEED.locations.leiden]);
  });

  it('cannot update a location', async () => {
    const { data } = await viewer
      .from('locations')
      .update({ name: 'Viewer edit' })
      .eq('id', SEED.locations.leiden)
      .select('id');
    expect(data ?? []).toEqual([]);
  });

  it('cannot insert a location', async () => {
    const { error } = await viewer.from('locations').insert({
      organization_id: SEED.organizations.a,
      name: 'Viewer location',
      slug: 'viewer-location',
    });
    expect(error).not.toBeNull();
  });

  it('cannot invite a member', async () => {
    const { error } = await viewer.from('organization_memberships').insert({
      organization_id: SEED.organizations.a,
      user_id: SEED.userIds.viewerA,
      role: 'org_admin',
    });
    expect(error).not.toBeNull();
  });
});

describe('4. an organization administrator cannot reach another organization', () => {
  it('cannot read organization B locations', async () => {
    const { data } = await orgAdminA.from('locations').select('id').eq('id', SEED.locations.napoli);
    expect(data).toEqual([]);
  });

  it('cannot insert a location into organization B', async () => {
    const { error } = await orgAdminA.from('locations').insert({
      organization_id: SEED.organizations.b,
      name: 'Cross-tenant location',
      slug: 'cross-tenant',
    });
    expect(error).not.toBeNull();
  });

  it('cannot update organization B', async () => {
    const { data } = await orgAdminA
      .from('organizations')
      .update({ name: 'Taken over' })
      .eq('id', SEED.organizations.b)
      .select('id');
    expect(data ?? []).toEqual([]);
  });

  it('is symmetric — B cannot reach A', async () => {
    const { data } = await orgAdminB.from('locations').select('id');
    expect(data?.map((row) => row.id)).toEqual([SEED.locations.napoli]);
  });
});

describe('5 & 6. anonymous users', () => {
  const anon = anonClient();

  it('cannot read organizations', async () => {
    const { data, error } = await anon.from('organizations').select('id');
    expect(error !== null || (data ?? []).length === 0).toBe(true);
  });

  it('cannot read locations', async () => {
    const { data, error } = await anon.from('locations').select('id');
    expect(error !== null || (data ?? []).length === 0).toBe(true);
  });

  it('cannot read memberships', async () => {
    const { data, error } = await anon.from('organization_memberships').select('id');
    expect(error !== null || (data ?? []).length === 0).toBe(true);
  });

  it('cannot insert a location', async () => {
    const { error } = await anon.from('locations').insert({
      organization_id: SEED.organizations.a,
      name: 'Anon location',
      slug: 'anon-location',
    });
    expect(error).not.toBeNull();
  });

  it('cannot execute the location access predicates', async () => {
    const { error } = await anon.rpc('can_manage_location', {
      p_location_id: SEED.locations.leiden,
    });
    expect(error).not.toBeNull();
  });

  it('cannot write an audit log entry', async () => {
    const { error } = await anon.rpc('write_audit_log', {
      p_action: 'forged',
      p_entity_type: 'organization',
    });
    expect(error).not.toBeNull();
  });
});

describe('7. platform support has read access but no write access', () => {
  it('reads every organization', async () => {
    const { data, error } = await platformSupport.from('organizations').select('id');
    expect(error).toBeNull();
    expect(data?.length).toBeGreaterThanOrEqual(2);
  });

  it('reads every location', async () => {
    const { data } = await platformSupport.from('locations').select('id');
    expect(data?.length).toBeGreaterThanOrEqual(3);
  });

  it('cannot update an organization', async () => {
    const { data } = await platformSupport
      .from('organizations')
      .update({ name: 'Support edit' })
      .eq('id', SEED.organizations.a)
      .select('id');
    expect(data ?? []).toEqual([]);
  });

  it('cannot create a location', async () => {
    const { error } = await platformSupport.from('locations').insert({
      organization_id: SEED.organizations.a,
      name: 'Support location',
      slug: 'support-location',
    });
    expect(error).not.toBeNull();
  });

  it('cannot change a membership', async () => {
    const { data } = await platformSupport
      .from('organization_memberships')
      .update({ role: 'viewer' })
      .eq('id', SEED.memberships.orgAdminA)
      .select('id');
    expect(data ?? []).toEqual([]);
  });
});

describe('8. platform administrators have their intended access', () => {
  it('reads across organizations', async () => {
    const { data, error } = await platformAdmin.from('organizations').select('id');
    expect(error).toBeNull();
    expect(data?.length).toBeGreaterThanOrEqual(2);
  });

  it('can update any organization', async () => {
    const { data, error } = await platformAdmin
      .from('organizations')
      .update({ default_timezone: 'Europe/Amsterdam' })
      .eq('id', SEED.organizations.b)
      .select('id');
    expect(error).toBeNull();
    expect(data).toHaveLength(1);
  });
});

describe('privilege escalation', () => {
  it('a user cannot promote themselves to platform admin', async () => {
    const { error } = await viewer
      .from('profiles')
      .update({ platform_role: 'platform_admin' })
      .eq('user_id', SEED.userIds.viewerA);

    expect(error).not.toBeNull();
    expect(error?.message).toContain('platform administrator');
  });

  it('a user can still edit their own name', async () => {
    const { error } = await viewer
      .from('profiles')
      .update({ full_name: 'Kim Bakker' })
      .eq('user_id', SEED.userIds.viewerA);
    expect(error).toBeNull();
  });

  it('a user cannot edit another user profile', async () => {
    const { data } = await viewer
      .from('profiles')
      .update({ full_name: 'Renamed' })
      .eq('user_id', SEED.userIds.platformAdmin)
      .select('user_id');
    expect(data ?? []).toEqual([]);
  });
});

describe('audit log', () => {
  it('is readable by an organization administrator', async () => {
    const { error } = await orgAdminA.from('audit_logs').select('id').limit(1);
    expect(error).toBeNull();
  });

  it('is not readable by a viewer', async () => {
    await orgAdminA.rpc('write_audit_log', {
      p_action: 'test.entry',
      p_entity_type: 'organization',
      p_organization_id: SEED.organizations.a,
    });

    const { data } = await viewer.from('audit_logs').select('id');
    expect(data ?? []).toEqual([]);
  });

  it('cannot be inserted into directly, only through the guarded function', async () => {
    const { error } = await orgAdminA.from('audit_logs').insert({
      organization_id: SEED.organizations.a,
      action: 'forged.entry',
      entity_type: 'organization',
    });
    expect(error).not.toBeNull();
  });

  it('records the real actor rather than a claimed one', async () => {
    const { data: logId, error } = await orgAdminA.rpc('write_audit_log', {
      p_action: 'test.actor',
      p_entity_type: 'organization',
      p_organization_id: SEED.organizations.a,
    });
    expect(error).toBeNull();

    const { data } = await orgAdminA
      .from('audit_logs')
      .select('actor_type, actor_user_id')
      .eq('id', logId as string)
      .single();

    expect(data?.actor_type).toBe('user');
    expect(data?.actor_user_id).not.toBeNull();
  });
});

describe('last-administrator invariant', () => {
  it('refuses to demote the only active organization administrator', async () => {
    const { error } = await orgAdminA
      .from('organization_memberships')
      .update({ role: 'viewer' })
      .eq('id', SEED.memberships.orgAdminA);

    expect(error).not.toBeNull();
    expect(error?.message).toContain('at least one active administrator');
  });
});

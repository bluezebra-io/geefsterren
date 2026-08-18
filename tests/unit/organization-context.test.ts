import { describe, expect, it } from 'vitest';

import {
  isPlatformContext,
  mayViewOrganization,
  resolveActiveOrganizationId,
} from '@/features/auth/service';
import type { OrganizationRole, PlatformRole, PortalActor } from '@/types/domain';

const ORG_A = '22222222-2222-4222-8222-00000000000a';
const ORG_B = '22222222-2222-4222-8222-00000000000b';

function actor(platformRole: PlatformRole, orgs: Array<[string, OrganizationRole]> = []): PortalActor {
  return {
    userId: 'user-1',
    email: 'user@example.test',
    fullName: 'Test User',
    platformRole,
    organizations: orgs.map(([organizationId, role]) => ({
      organizationId,
      name: 'Org',
      slug: 'org',
      role,
      status: 'active' as const,
    })),
  };
}

describe('mayViewOrganization', () => {
  it('lets platform staff view any organization', () => {
    for (const role of ['platform_admin', 'platform_support'] as const) {
      expect(mayViewOrganization(actor(role), ORG_A)).toBe(true);
      expect(mayViewOrganization(actor(role), ORG_B)).toBe(true);
    }
  });

  it('lets a member view only their own organization', () => {
    const member = actor('none', [[ORG_A, 'org_admin']]);
    expect(mayViewOrganization(member, ORG_A)).toBe(true);
    expect(mayViewOrganization(member, ORG_B)).toBe(false);
  });
});

describe('resolveActiveOrganizationId', () => {
  it('honours a permitted request', () => {
    expect(resolveActiveOrganizationId(actor('platform_admin'), ORG_B)).toBe(ORG_B);
  });

  it('ignores a forged cookie and falls back to the actors own organization', () => {
    // The cookie is attacker-controlled, so this is the case that matters: a
    // member pointing it at somebody else's organization must not get in.
    const member = actor('none', [[ORG_A, 'viewer']]);
    expect(resolveActiveOrganizationId(member, ORG_B)).toBe(ORG_A);
  });

  it('falls back when there is no request', () => {
    const member = actor('none', [[ORG_A, 'viewer']]);
    expect(resolveActiveOrganizationId(member, null)).toBe(ORG_A);
    expect(resolveActiveOrganizationId(member, undefined)).toBe(ORG_A);
    expect(resolveActiveOrganizationId(member, '')).toBe(ORG_A);
  });

  it('returns null for platform staff who have not chosen yet', () => {
    expect(resolveActiveOrganizationId(actor('platform_admin'), null)).toBeNull();
  });

  it('lets a multi-organization member switch between their own', () => {
    const member = actor('none', [
      [ORG_A, 'viewer'],
      [ORG_B, 'org_admin'],
    ]);
    expect(resolveActiveOrganizationId(member, ORG_B)).toBe(ORG_B);
  });
});

describe('isPlatformContext', () => {
  it('is true when platform staff view a tenant they do not belong to', () => {
    expect(isPlatformContext(actor('platform_admin'), ORG_A)).toBe(true);
    expect(isPlatformContext(actor('platform_support'), ORG_A)).toBe(true);
  });

  it('is false for their own organization, so no banner appears', () => {
    const staffMember = actor('platform_admin', [[ORG_A, 'org_admin']]);
    expect(isPlatformContext(staffMember, ORG_A)).toBe(false);
  });

  it('is false for an ordinary member', () => {
    expect(isPlatformContext(actor('none', [[ORG_A, 'org_admin']]), ORG_A)).toBe(false);
  });

  it('is false without an organization', () => {
    expect(isPlatformContext(actor('platform_admin'), null)).toBe(false);
  });
});

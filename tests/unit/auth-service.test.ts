import { describe, expect, it } from 'vitest';

import {
  canManageMembers,
  canManageOrganization,
  canReadOrganization,
  defaultOrganizationId,
  isOrganizationAdmin,
  isPlatformAdmin,
  isPlatformStaff,
  organizationRole,
} from '@/features/auth/service';
import type { OrganizationRole, PlatformRole, PortalActor } from '@/types/domain';

const ORG_A = '22222222-2222-4222-8222-00000000000a';
const ORG_B = '22222222-2222-4222-8222-00000000000b';

function actor(overrides: Partial<PortalActor> = {}): PortalActor {
  return {
    userId: 'user-1',
    email: 'user@example.test',
    fullName: 'Test User',
    platformRole: 'none',
    organizations: [],
    ...overrides,
  };
}

function member(organizationId: string, role: OrganizationRole) {
  return {
    organizationId,
    name: 'Org',
    slug: 'org',
    role,
    status: 'active' as const,
  };
}

describe('platform roles', () => {
  it('recognises a platform admin', () => {
    expect(isPlatformAdmin(actor({ platformRole: 'platform_admin' }))).toBe(true);
    expect(isPlatformAdmin(actor({ platformRole: 'platform_support' }))).toBe(false);
    expect(isPlatformAdmin(actor())).toBe(false);
  });

  it('treats a platform admin as platform staff', () => {
    const roles: PlatformRole[] = ['platform_admin', 'platform_support'];
    for (const role of roles) {
      expect(isPlatformStaff(actor({ platformRole: role }))).toBe(true);
    }
    expect(isPlatformStaff(actor())).toBe(false);
  });
});

describe('organization membership', () => {
  it('resolves the role for the matching organization only', () => {
    const subject = actor({ organizations: [member(ORG_A, 'org_admin')] });
    expect(organizationRole(subject, ORG_A)).toBe('org_admin');
    expect(organizationRole(subject, ORG_B)).toBeNull();
  });

  it('does not treat a member of one organization as an admin of another', () => {
    const subject = actor({ organizations: [member(ORG_A, 'org_admin')] });
    expect(isOrganizationAdmin(subject, ORG_A)).toBe(true);
    expect(isOrganizationAdmin(subject, ORG_B)).toBe(false);
    expect(canManageOrganization(subject, ORG_B)).toBe(false);
    expect(canReadOrganization(subject, ORG_B)).toBe(false);
  });
});

describe('platform support is read-only', () => {
  const support = actor({ platformRole: 'platform_support' });

  it('can read any organization', () => {
    expect(canReadOrganization(support, ORG_A)).toBe(true);
    expect(canReadOrganization(support, ORG_B)).toBe(true);
  });

  it('cannot manage an organization it has no membership in', () => {
    expect(canManageOrganization(support, ORG_A)).toBe(false);
    expect(canManageMembers(support, ORG_A)).toBe(false);
  });
});

describe('viewer and location manager write access', () => {
  it('denies organization management to viewers and location managers', () => {
    for (const role of ['viewer', 'location_manager'] as const) {
      const subject = actor({ organizations: [member(ORG_A, role)] });
      expect(canReadOrganization(subject, ORG_A)).toBe(true);
      expect(canManageOrganization(subject, ORG_A)).toBe(false);
      expect(canManageMembers(subject, ORG_A)).toBe(false);
    }
  });
});

describe('defaultOrganizationId', () => {
  it('returns null when the actor has no memberships', () => {
    expect(defaultOrganizationId(actor())).toBeNull();
  });

  it('returns the first membership', () => {
    const subject = actor({
      organizations: [member(ORG_A, 'viewer'), member(ORG_B, 'org_admin')],
    });
    expect(defaultOrganizationId(subject)).toBe(ORG_A);
  });
});

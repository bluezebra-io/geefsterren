import { describe, expect, it } from 'vitest';

import {
  diffLocationAssignments,
  locationRoleFor,
  requiresLocationAssignments,
  wouldRemoveLastAdmin,
} from '@/features/memberships/service';

describe('requiresLocationAssignments', () => {
  it('exempts organization administrators', () => {
    expect(requiresLocationAssignments('org_admin')).toBe(false);
    expect(requiresLocationAssignments('location_manager')).toBe(true);
    expect(requiresLocationAssignments('viewer')).toBe(true);
  });
});

describe('locationRoleFor', () => {
  it('maps organization roles onto location roles', () => {
    expect(locationRoleFor('org_admin')).toBeNull();
    expect(locationRoleFor('location_manager')).toBe('location_manager');
    expect(locationRoleFor('viewer')).toBe('viewer');
  });
});

describe('diffLocationAssignments', () => {
  const LOC_A = 'loc-a';
  const LOC_B = 'loc-b';
  const LOC_C = 'loc-c';

  it('adds only the genuinely new locations', () => {
    const diff = diffLocationAssignments(
      [{ locationId: LOC_A, role: 'viewer' }],
      [LOC_A, LOC_B],
      'viewer',
    );
    expect(diff.toAdd).toEqual([LOC_B]);
    expect(diff.toRemove).toEqual([]);
    expect(diff.toUpdate).toEqual([]);
  });

  it('removes locations that are no longer desired', () => {
    const diff = diffLocationAssignments(
      [
        { locationId: LOC_A, role: 'viewer' },
        { locationId: LOC_B, role: 'viewer' },
      ],
      [LOC_A],
      'viewer',
    );
    expect(diff.toRemove).toEqual([LOC_B]);
    expect(diff.toAdd).toEqual([]);
  });

  it('updates rows whose role changed but leaves matching rows untouched', () => {
    const diff = diffLocationAssignments(
      [
        { locationId: LOC_A, role: 'viewer' },
        { locationId: LOC_B, role: 'location_manager' },
      ],
      [LOC_A, LOC_B],
      'location_manager',
    );
    // Only LOC_A changes role; LOC_B already matches and must not be rewritten, so its created_at
    // survives.
    expect(diff.toUpdate).toEqual([LOC_A]);
    expect(diff.toAdd).toEqual([]);
    expect(diff.toRemove).toEqual([]);
  });

  it('produces an empty diff when nothing changed', () => {
    const current = [{ locationId: LOC_A, role: 'viewer' as const }];
    const diff = diffLocationAssignments(current, [LOC_A], 'viewer');
    expect(diff).toEqual({ toAdd: [], toRemove: [], toUpdate: [] });
  });

  it('handles a full replacement', () => {
    const diff = diffLocationAssignments(
      [{ locationId: LOC_A, role: 'viewer' }],
      [LOC_B, LOC_C],
      'viewer',
    );
    expect(diff.toAdd).toEqual([LOC_B, LOC_C]);
    expect(diff.toRemove).toEqual([LOC_A]);
  });
});

describe('wouldRemoveLastAdmin', () => {
  const admins = [
    { membershipId: 'm1', role: 'org_admin' as const, status: 'active' },
    { membershipId: 'm2', role: 'viewer' as const, status: 'active' },
  ];

  it('flags removing the only active administrator', () => {
    expect(wouldRemoveLastAdmin(admins, 'm1', null, null)).toBe(true);
  });

  it('flags demoting the only active administrator', () => {
    expect(wouldRemoveLastAdmin(admins, 'm1', 'viewer', 'active')).toBe(true);
  });

  it('flags suspending the only active administrator', () => {
    expect(wouldRemoveLastAdmin(admins, 'm1', 'org_admin', 'suspended')).toBe(true);
  });

  it('allows removal when another active administrator remains', () => {
    const two = [...admins, { membershipId: 'm3', role: 'org_admin' as const, status: 'active' }];
    expect(wouldRemoveLastAdmin(two, 'm1', null, null)).toBe(false);
  });

  it('does not count a suspended administrator as remaining cover', () => {
    const withSuspended = [
      ...admins,
      { membershipId: 'm3', role: 'org_admin' as const, status: 'suspended' },
    ];
    expect(wouldRemoveLastAdmin(withSuspended, 'm1', null, null)).toBe(true);
  });

  it('allows promoting a viewer while the admin stays', () => {
    expect(wouldRemoveLastAdmin(admins, 'm2', 'org_admin', 'active')).toBe(false);
  });
});

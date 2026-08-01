'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';

import { Badge, Checkbox, FormError, Select } from '@/components/ui';
import { Button } from '@/components/ui/button';
import {
  removeMembershipAction,
  setLocationAssignmentsAction,
  updateMembershipAction,
} from '@/features/memberships/actions';
import { requiresLocationAssignments } from '@/features/memberships/service';
import type { OrganizationMemberRow } from '@/features/memberships/queries';
import { useMessages } from '@/lib/i18n/provider';
import type { ActionResult, MembershipStatus, OrganizationRole } from '@/types/domain';

function PendingButton({
  children,
  variant = 'outline',
}: {
  children: React.ReactNode;
  variant?: 'outline' | 'danger';
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" variant={variant} loading={pending}>
      {children}
    </Button>
  );
}

export function MemberRow({
  member,
  organizationId,
  locations,
  canManage,
  isSelf,
}: {
  member: OrganizationMemberRow;
  organizationId: string;
  locations: Array<{ id: string; name: string }>;
  canManage: boolean;
  isSelf: boolean;
}) {
  const t = useMessages();
  const [expanded, setExpanded] = useState(false);

  const [updateState, updateAction] = useActionState<ActionResult<void> | null, FormData>(
    updateMembershipAction,
    null,
  );
  const [removeState, removeAction] = useActionState<ActionResult<void> | null, FormData>(
    removeMembershipAction,
    null,
  );
  const [assignState, assignAction] = useActionState<ActionResult<void> | null, FormData>(
    setLocationAssignmentsAction,
    null,
  );

  const roleLabel: Record<OrganizationRole, string> = {
    org_admin: t.roles.orgAdmin,
    location_manager: t.roles.locationManager,
    viewer: t.roles.viewer,
  };

  const statusLabel: Record<MembershipStatus, string> = {
    active: t.status.active,
    invited: t.status.invited,
    suspended: t.status.suspended,
  };

  const statusTone: Record<MembershipStatus, 'success' | 'warning' | 'error'> = {
    active: 'success',
    invited: 'warning',
    suspended: 'error',
  };

  const showLocations = requiresLocationAssignments(member.role);
  const assignedIds = new Set(member.locations.map((location) => location.locationId));

  const error =
    (updateState && !updateState.ok && updateState.error) ||
    (removeState && !removeState.ok && removeState.error) ||
    (assignState && !assignState.ok && assignState.error) ||
    undefined;

  return (
    <li className="py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--color-text-primary)]">
            {member.fullName ?? t.users.invitedUser}
            {isSelf ? (
              <span className="ml-2 text-xs font-normal text-[var(--color-text-muted)]">
                ({t.users.you})
              </span>
            ) : null}
          </p>
          <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
            {roleLabel[member.role]}
          </p>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            {showLocations
              ? member.locations.length === 0
                ? t.users.noLocations
                : member.locations.map((location) => location.name).join(', ')
              : t.users.allLocations}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Badge tone={statusTone[member.status]}>{statusLabel[member.status]}</Badge>
          {canManage ? (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setExpanded((value) => !value)}
              aria-expanded={expanded}
            >
              {expanded ? t.common.close : t.common.edit}
            </Button>
          ) : null}
        </div>
      </div>

      {canManage && expanded ? (
        <div className="mt-4 space-y-5 rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface-muted)] p-4">
          <FormError message={error} />

          <form action={updateAction} className="flex flex-wrap items-end gap-3">
            <input type="hidden" name="membershipId" value={member.membershipId} />
            <div>
              <label
                className="block text-xs font-semibold text-[var(--color-text-secondary)]"
                htmlFor={`role-${member.membershipId}`}
              >
                {t.users.role}
              </label>
              <Select
                id={`role-${member.membershipId}`}
                name="role"
                defaultValue={member.role}
                className="mt-1.5 w-60"
              >
                <option value="viewer">{t.roles.viewer}</option>
                <option value="location_manager">{t.roles.locationManager}</option>
                <option value="org_admin">{t.roles.orgAdmin}</option>
              </Select>
            </div>
            <div>
              <label
                className="block text-xs font-semibold text-[var(--color-text-secondary)]"
                htmlFor={`status-${member.membershipId}`}
              >
                {t.users.memberStatus}
              </label>
              <Select
                id={`status-${member.membershipId}`}
                name="status"
                defaultValue={member.status}
                className="mt-1.5 w-44"
              >
                <option value="invited">{t.status.invited}</option>
                <option value="active">{t.status.active}</option>
                <option value="suspended">{t.status.suspended}</option>
              </Select>
            </div>
            <PendingButton>{t.common.save}</PendingButton>
          </form>

          {showLocations && locations.length > 0 ? (
            <form action={assignAction} className="space-y-3">
              <input type="hidden" name="organizationId" value={organizationId} />
              <input type="hidden" name="userId" value={member.userId} />
              <input
                type="hidden"
                name="role"
                value={member.role === 'location_manager' ? 'location_manager' : 'viewer'}
              />
              <p className="text-xs font-semibold text-[var(--color-text-secondary)]">
                {t.users.locationAccess}
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {locations.map((location) => (
                  <label
                    key={location.id}
                    className="flex min-h-11 cursor-pointer items-center gap-3 text-base text-[var(--color-text-primary)]"
                  >
                    <Checkbox
                      name="locationIds"
                      value={location.id}
                      defaultChecked={assignedIds.has(location.id)}
                    />
                    {location.name}
                  </label>
                ))}
              </div>
              <PendingButton>{t.users.saveAccess}</PendingButton>
            </form>
          ) : null}

          <form action={removeAction}>
            <input type="hidden" name="membershipId" value={member.membershipId} />
            <PendingButton variant="danger">{t.users.removeFromOrg}</PendingButton>
          </form>
        </div>
      ) : null}
    </li>
  );
}

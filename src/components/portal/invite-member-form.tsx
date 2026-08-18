'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';

import { Checkbox, FieldError, FormError, FormSuccess, Input, Label, Select } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { inviteMemberAction } from '@/features/memberships/actions';
import { requiresLocationAssignments } from '@/features/memberships/service';
import { usePortalMessages } from '@/lib/i18n/provider';
import type { ActionResult, OrganizationRole } from '@/types/domain';

function SubmitButton() {
  const { pending } = useFormStatus();
  const t = usePortalMessages();
  return (
    <Button type="submit" loading={pending}>
      {pending ? t.auth.sending : t.users.inviteAction}
    </Button>
  );
}

export function InviteMemberForm({
  organizationId,
  locations,
}: {
  organizationId: string;
  locations: Array<{ id: string; name: string }>;
}) {
  const t = usePortalMessages();
  const [state, formAction] = useActionState<ActionResult<{ userId: string }> | null, FormData>(
    inviteMemberAction,
    null,
  );
  const [role, setRole] = useState<OrganizationRole>('viewer');

  // Org admins reach every location by role, so the picker is hidden rather
  // than shown-and-ignored: a control whose value has no effect is worse than
  // no control.
  const showLocations = requiresLocationAssignments(role);
  const fieldErrors = state && !state.ok ? state.fieldErrors : undefined;

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="organizationId" value={organizationId} />

      <FormError message={state && !state.ok ? state.error : undefined} />
      <FormSuccess message={state?.ok ? t.users.inviteSent : undefined} />

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="email">{t.auth.emailLabel}</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            maxLength={320}
            className="mt-2"
            aria-invalid={fieldErrors?.email ? true : undefined}
            aria-describedby={fieldErrors?.email ? 'invite-email-error' : undefined}
          />
          <FieldError id="invite-email-error" messages={fieldErrors?.email} />
        </div>

        <div>
          <Label htmlFor="role">{t.users.role}</Label>
          <Select
            id="role"
            name="role"
            value={role}
            onChange={(event) => setRole(event.target.value as OrganizationRole)}
            className="mt-2"
          >
            <option value="viewer">{t.users.roleViewer}</option>
            <option value="location_manager">{t.users.roleLocationManager}</option>
            <option value="org_admin">{t.users.roleOrgAdmin}</option>
          </Select>
          <FieldError messages={fieldErrors?.role} />
        </div>
      </div>

      {showLocations ? (
        <fieldset>
          <legend className="text-sm leading-[1.35] font-semibold text-[var(--color-text-primary)]">
            {t.users.locationAccess}
          </legend>
          {locations.length === 0 ? (
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              {t.users.addLocationFirst}
            </p>
          ) : (
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {locations.map((location) => (
                <label
                  key={location.id}
                  className="flex min-h-11 cursor-pointer items-center gap-3 text-base text-[var(--color-text-primary)]"
                >
                  <Checkbox name="locationIds" value={location.id} />
                  {location.name}
                </label>
              ))}
            </div>
          )}
        </fieldset>
      ) : (
        <p className="text-sm text-[var(--color-text-secondary)]">{t.users.orgAdminAllLocations}</p>
      )}

      <SubmitButton />
    </form>
  );
}

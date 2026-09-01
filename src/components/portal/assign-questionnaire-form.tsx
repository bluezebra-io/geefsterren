'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';

import { Checkbox, FormError, FormSuccess, Label } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { assignVersionAction } from '@/features/questionnaires/actions';
import { usePortalMessages } from '@/lib/i18n/provider';
import type { ActionResult } from '@/types/domain';

function SubmitButton() {
  const { pending } = useFormStatus();
  const t = usePortalMessages();
  return (
    <Button type="submit" loading={pending}>
      {pending ? t.common.saving : t.questionnaires.saveAssignment}
    </Button>
  );
}

type Scope = 'all' | 'selected' | 'none';

/**
 * Where this questionnaire is asked.
 *
 * "Every location" is stored as a single assignment with no location, not as one
 * row per location — so a branch opened next month inherits it instead of quietly
 * asking nothing.
 */
export function AssignQuestionnaireForm({
  versionId,
  organizationId,
  locations,
  current,
  canAssign,
}: {
  versionId: string;
  organizationId: string;
  locations: Array<{ id: string; name: string }>;
  current: { orgWide: boolean; locationIds: string[] };
  canAssign: boolean;
}) {
  const t = usePortalMessages();
  const [state, formAction] = useActionState<ActionResult<void> | null, FormData>(
    assignVersionAction,
    null,
  );

  const [scope, setScope] = useState<Scope>(
    current.orgWide ? 'all' : current.locationIds.length > 0 ? 'selected' : 'none',
  );

  const selected = new Set(current.locationIds);

  const options: Array<{ value: Scope; label: string; hint?: string }> = [
    { value: 'all', label: t.questionnaires.scopeAll, hint: t.questionnaires.scopeAllHint },
    { value: 'selected', label: t.questionnaires.scopeSelected },
    { value: 'none', label: t.questionnaires.scopeNone },
  ];

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="versionId" value={versionId} />
      <input type="hidden" name="organizationId" value={organizationId} />

      <FormError message={state && !state.ok ? state.error : undefined} />
      <FormSuccess message={state?.ok ? t.common.saved : undefined} />

      <fieldset className="space-y-2" disabled={!canAssign}>
        <legend className="sr-only">{t.questionnaires.assignTitle}</legend>
        {options.map((option) => (
          <div key={option.value}>
            <label className="flex min-h-11 cursor-pointer items-center gap-3 text-base text-[var(--color-text-primary)]">
              <input
                type="radio"
                name="scope"
                value={option.value}
                checked={scope === option.value}
                onChange={() => setScope(option.value)}
                className="size-[1.125rem] accent-ink-900"
              />
              {option.label}
            </label>
            {option.hint ? (
              <p className="ml-8 text-sm text-[var(--color-text-secondary)]">{option.hint}</p>
            ) : null}
          </div>
        ))}
      </fieldset>

      {scope === 'selected' ? (
        <div>
          <Label>{t.users.locationAccess}</Label>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {locations.map((location) => (
              <label
                key={location.id}
                className="flex min-h-11 cursor-pointer items-center gap-3 text-base text-[var(--color-text-primary)]"
              >
                <Checkbox
                  name="locationIds"
                  value={location.id}
                  defaultChecked={selected.has(location.id)}
                  disabled={!canAssign}
                />
                {location.name}
              </label>
            ))}
          </div>
        </div>
      ) : null}

      {canAssign ? <SubmitButton /> : null}
    </form>
  );
}

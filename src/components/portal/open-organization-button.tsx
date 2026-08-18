'use client';

import { ArrowRight } from 'lucide-react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui';
import { enterOrganizationAction } from '@/features/organizations/actions';
import type { ActionResult } from '@/types/domain';

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="outline" size="sm" loading={pending}>
      {label}
      {pending ? null : <ArrowRight aria-hidden="true" className="size-4" />}
    </Button>
  );
}

export function OpenOrganizationButton({
  organizationId,
  label,
}: {
  organizationId: string;
  label: string;
}) {
  const [state, formAction] = useActionState<ActionResult<void> | null, FormData>(
    enterOrganizationAction,
    null,
  );

  return (
    <form action={formAction} className="flex shrink-0 items-center gap-3">
      <input type="hidden" name="organizationId" value={organizationId} />
      {state && !state.ok ? <FormError message={state.error} /> : null}
      <Submit label={label} />
    </form>
  );
}

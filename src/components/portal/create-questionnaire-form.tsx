'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { FieldError, FormError, Input, Label, Textarea } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { createQuestionnaireAction } from '@/features/questionnaires/actions';
import { usePortalMessages } from '@/lib/i18n/provider';
import type { ActionResult } from '@/types/domain';

function SubmitButton() {
  const { pending } = useFormStatus();
  const t = usePortalMessages();
  return (
    <Button type="submit" loading={pending}>
      {pending ? t.questionnaires.creating : t.questionnaires.create}
    </Button>
  );
}

export function CreateQuestionnaireForm({ organizationId }: { organizationId: string }) {
  const t = usePortalMessages();
  const router = useRouter();
  const [state, formAction] = useActionState<ActionResult<{ versionId: string }> | null, FormData>(
    createQuestionnaireAction,
    null,
  );

  // Straight into the new draft: creating a questionnaire and then hunting for it
  // in a list is one step too many.
  useEffect(() => {
    if (state?.ok) router.push(`/app/questionnaires/${state.data.versionId}`);
  }, [state, router]);

  const fieldErrors = state && !state.ok ? state.fieldErrors : undefined;

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="organizationId" value={organizationId} />
      <FormError message={state && !state.ok ? state.error : undefined} />

      <div>
        <Label htmlFor="name">{t.questionnaires.name}</Label>
        <Input id="name" name="name" required maxLength={200} className="mt-2" />
        <FieldError messages={fieldErrors?.name} />
      </div>

      <div>
        <Label htmlFor="description">{t.questionnaires.description}</Label>
        <Textarea id="description" name="description" maxLength={2000} className="mt-2" />
        <FieldError messages={fieldErrors?.description} />
      </div>

      <SubmitButton />
    </form>
  );
}

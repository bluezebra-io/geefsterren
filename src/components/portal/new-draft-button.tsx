'use client';

import { useEffect } from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Copy } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { newDraftFromTemplateAction } from '@/features/questionnaires/actions';
import type { ActionResult } from '@/types/domain';

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="outline" size="sm" loading={pending}>
      {pending ? null : <Copy aria-hidden="true" className="size-4" />}
      {label}
    </Button>
  );
}

/**
 * Copies the newest version into a fresh draft.
 *
 * This is the only route to changing a published questionnaire, and the reason
 * the button exists at all: published versions are immutable so that answers
 * recorded months ago still mean what they meant.
 */
export function NewDraftButton({
  templateId,
  organizationId,
  label,
}: {
  templateId: string;
  organizationId: string;
  label: string;
}) {
  const router = useRouter();
  const [state, formAction] = useActionState<ActionResult<{ versionId: string }> | null, FormData>(
    newDraftFromTemplateAction,
    null,
  );

  useEffect(() => {
    if (state?.ok) router.push(`/app/questionnaires/${state.data.versionId}`);
  }, [state, router]);

  return (
    <form action={formAction}>
      <input type="hidden" name="templateId" value={templateId} />
      <input type="hidden" name="organizationId" value={organizationId} />
      <Submit label={label} />
    </form>
  );
}

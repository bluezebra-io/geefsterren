'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';

import { Alert, FormError } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { publishVersionAction } from '@/features/questionnaires/actions';
import { usePortalMessages } from '@/lib/i18n/provider';
import type { ActionResult } from '@/types/domain';

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" loading={pending}>
      {label}
    </Button>
  );
}

/**
 * Publishing is a one-way door, so it asks first.
 *
 * After this the questions can never change — that is what keeps historic answers
 * interpretable — and no undo exists, which is exactly when a confirmation step
 * earns its place.
 */
export function PublishVersionButton({ versionId }: { versionId: string }) {
  const t = usePortalMessages();
  const [confirming, setConfirming] = useState(false);
  const [state, formAction] = useActionState<ActionResult<void> | null, FormData>(
    publishVersionAction,
    null,
  );

  if (!confirming) {
    return (
      <div className="flex flex-col items-end gap-2">
        {state && !state.ok ? <FormError message={state.error} /> : null}
        <Button size="sm" onClick={() => setConfirming(true)}>
          {t.questionnaires.publish}
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <Alert tone="warning" title={t.questionnaires.publish}>
        <p className="mb-3">{t.questionnaires.publishHint}</p>
        <div className="flex items-center gap-2">
          <form action={formAction}>
            <input type="hidden" name="versionId" value={versionId} />
            <Submit label={t.questionnaires.publish} />
          </form>
          <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
            {t.common.cancel}
          </Button>
        </div>
      </Alert>
    </div>
  );
}

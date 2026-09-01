'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

import { Checkbox, FieldError, FormError, Input, Label, Select } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { createCampaignAction } from '@/features/campaigns/actions';
import type { QuestionnaireChoice } from '@/features/campaigns/queries';
import { usePortalMessages } from '@/lib/i18n/provider';
import type { ActionResult } from '@/types/domain';

function SubmitButton() {
  const { pending } = useFormStatus();
  const t = usePortalMessages();
  return (
    <Button type="submit" loading={pending}>
      {pending ? t.campaigns.creating : t.campaigns.create}
    </Button>
  );
}

export function CreateCampaignForm({
  locationId,
  questionnaires,
}: {
  locationId: string;
  questionnaires: QuestionnaireChoice[];
}) {
  const t = usePortalMessages();
  const [state, formAction] = useActionState<ActionResult<{ campaignId: string }> | null, FormData>(
    createCampaignAction,
    null,
  );

  // The questionnaire assigned to this location is the near-certain choice, so it
  // is preselected rather than left for the operator to match up by hand.
  const assigned = questionnaires.find((choice) => choice.assigned);
  const fieldErrors = state && !state.ok ? state.fieldErrors : undefined;

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="locationId" value={locationId} />
      <FormError message={state && !state.ok ? state.error : undefined} />

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">{t.campaigns.name}</Label>
          <Input
            id="name"
            name="name"
            required
            maxLength={200}
            placeholder={t.campaigns.namePlaceholder}
            className="mt-2"
          />
          <FieldError messages={fieldErrors?.name} />
        </div>

        <div>
          <Label htmlFor="questionnaireVersionId">{t.campaigns.questionnaire}</Label>
          <Select
            id="questionnaireVersionId"
            name="questionnaireVersionId"
            defaultValue={assigned?.versionId ?? questionnaires[0]?.versionId}
            className="mt-2"
          >
            {questionnaires.map((choice) => (
              <option key={choice.versionId} value={choice.versionId}>
                {choice.label}
                {choice.assigned ? ` — ${t.campaigns.assignedHint}` : ''}
              </option>
            ))}
          </Select>
          <FieldError messages={fieldErrors?.questionnaireVersionId} />
        </div>
      </div>

      <label className="flex min-h-11 cursor-pointer items-center gap-3 text-base text-[var(--color-text-primary)]">
        <Checkbox name="activate" defaultChecked />
        {t.campaigns.activateNow}
      </label>

      <SubmitButton />
    </form>
  );
}

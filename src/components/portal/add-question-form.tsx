'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';

import { Checkbox, FieldError, FormError, Input, Label, Select, Textarea } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { addQuestionAction } from '@/features/questionnaires/actions';
import { needsOptions, QUESTION_TYPES } from '@/features/questionnaires/schemas';
import { usePortalMessages } from '@/lib/i18n/provider';
import type { ActionResult } from '@/types/domain';

function SubmitButton() {
  const { pending } = useFormStatus();
  const t = usePortalMessages();
  return (
    <Button type="submit" loading={pending}>
      {pending ? t.questionnaires.adding : t.questionnaires.add}
    </Button>
  );
}

/** Derives a key from the question, so nobody has to invent one. */
function deriveKey(label: string): string {
  return label
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 60);
}

export function AddQuestionForm({ versionId }: { versionId: string }) {
  const t = usePortalMessages();
  const [state, formAction] = useActionState<ActionResult<void> | null, FormData>(
    addQuestionAction,
    null,
  );

  const [label, setLabel] = useState('');
  const [key, setKey] = useState('');
  const [keyEdited, setKeyEdited] = useState(false);
  const [questionType, setQuestionType] = useState<string>('multiple_choice');

  const effectiveKey = keyEdited ? key : deriveKey(label);
  const showOptions = needsOptions(questionType);
  const fieldErrors = state && !state.ok ? state.fieldErrors : undefined;

  const typeLabels: Record<string, string> = {
    rating: t.questionnaires.typeRating,
    single_choice: t.questionnaires.typeSingle,
    multiple_choice: t.questionnaires.typeMultiple,
    boolean: t.questionnaires.typeBoolean,
    short_text: t.questionnaires.typeShortText,
    long_text: t.questionnaires.typeLongText,
  };

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="versionId" value={versionId} />
      <FormError message={state && !state.ok ? state.error : undefined} />

      <div>
        <Label htmlFor="label">{t.questionnaires.label}</Label>
        <Input
          id="label"
          name="label"
          required
          maxLength={500}
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          className="mt-2"
        />
        <FieldError messages={fieldErrors?.label} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="questionKey">{t.questionnaires.questionKey}</Label>
          <Input
            id="questionKey"
            name="questionKey"
            required
            maxLength={63}
            value={effectiveKey}
            onChange={(event) => {
              setKeyEdited(true);
              setKey(event.target.value);
            }}
            className="mt-2 font-mono"
            aria-describedby="key-help"
          />
          <p id="key-help" className="mt-1.5 text-sm text-[var(--color-text-secondary)]">
            {t.questionnaires.questionKeyHelp}
          </p>
          <FieldError messages={fieldErrors?.questionKey} />
        </div>

        <div>
          <Label htmlFor="questionType">{t.questionnaires.questionType}</Label>
          <Select
            id="questionType"
            name="questionType"
            value={questionType}
            onChange={(event) => setQuestionType(event.target.value)}
            className="mt-2"
          >
            {QUESTION_TYPES.map((type) => (
              <option key={type} value={type}>
                {typeLabels[type]}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {showOptions ? (
        <div>
          <Label htmlFor="options">{t.questionnaires.options}</Label>
          <Textarea
            id="options"
            name="options"
            className="mt-2"
            rows={5}
            aria-describedby="options-help"
            placeholder={'Bezorgtijd\nTemperatuur\nSmaak'}
          />
          <p id="options-help" className="mt-1.5 text-sm text-[var(--color-text-secondary)]">
            {t.questionnaires.optionsHelp}
          </p>
          <FieldError messages={fieldErrors?.options} />
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="helpText">{t.questionnaires.helpText}</Label>
          <Input id="helpText" name="helpText" maxLength={1000} className="mt-2" />
        </div>
        <div>
          <Label htmlFor="category">{t.questionnaires.category}</Label>
          <Input id="category" name="category" maxLength={100} className="mt-2" />
        </div>
      </div>

      <div className="space-y-3">
        <label className="flex min-h-11 cursor-pointer items-center gap-3 text-base text-[var(--color-text-primary)]">
          <Checkbox name="required" />
          {t.questionnaires.required}
        </label>

        <div>
          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-base text-[var(--color-text-primary)]">
            <Checkbox name="onlyBelowFive" />
            {t.questionnaires.onlyBelowFive}
          </label>
          <p className="ml-9 text-sm text-[var(--color-text-secondary)]">
            {t.questionnaires.onlyBelowFiveHelp}
          </p>
        </div>
      </div>

      <SubmitButton />
    </form>
  );
}

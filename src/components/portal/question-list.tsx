'use client';

import { Trash2 } from 'lucide-react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

import { Badge, FormError } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { removeQuestionAction } from '@/features/questionnaires/actions';
import type { QuestionDetail } from '@/features/questionnaires/queries';
import { usePortalMessages } from '@/lib/i18n/provider';
import type { ActionResult } from '@/types/domain';

function RemoveButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="ghost" size="sm" loading={pending} aria-label={label}>
      {pending ? null : <Trash2 aria-hidden="true" className="size-4" />}
    </Button>
  );
}

export function QuestionList({
  versionId,
  questions,
  canEdit,
}: {
  versionId: string;
  questions: QuestionDetail[];
  canEdit: boolean;
}) {
  const t = usePortalMessages();
  const [state, remove] = useActionState<ActionResult<void> | null, FormData>(
    removeQuestionAction,
    null,
  );

  const typeLabels: Record<string, string> = {
    rating: t.questionnaires.typeRating,
    single_choice: t.questionnaires.typeSingle,
    multiple_choice: t.questionnaires.typeMultiple,
    boolean: t.questionnaires.typeBoolean,
    short_text: t.questionnaires.typeShortText,
    long_text: t.questionnaires.typeLongText,
  };

  return (
    <div>
      {state && !state.ok ? (
        <div className="mb-4">
          <FormError message={state.error} />
        </div>
      ) : null}

      <ol className="divide-y divide-[var(--color-border)]">
        {questions.map((question, index) => (
          <li key={question.id} className="flex items-start justify-between gap-4 py-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="tabular text-xs font-bold text-[var(--color-text-muted)]">
                  {index + 1}
                </span>
                <p className="font-semibold text-[var(--color-text-primary)]">{question.label}</p>
                <Badge tone="neutral">{typeLabels[question.questionType] ?? question.questionType}</Badge>
                {question.required ? <Badge tone="brand">{t.questionnaires.required}</Badge> : null}
                {/* The presence of a condition is the thing an operator needs to
                    see at a glance; the rule itself lives in the data. */}
                {question.conditionJson ? (
                  <Badge tone="info">{t.questionnaires.onlyBelowFive}</Badge>
                ) : null}
              </div>

              <p className="mt-1 font-mono text-xs text-[var(--color-text-muted)]">
                {question.questionKey}
              </p>

              {question.helpText ? (
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{question.helpText}</p>
              ) : null}

              {question.options.length > 0 ? (
                <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                  {question.options.map((option) => option.label).join(' · ')}
                </p>
              ) : null}
            </div>

            {canEdit ? (
              <form action={remove} className="shrink-0">
                <input type="hidden" name="versionId" value={versionId} />
                <input type="hidden" name="questionId" value={question.id} />
                <RemoveButton label={t.questionnaires.remove} />
              </form>
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  );
}

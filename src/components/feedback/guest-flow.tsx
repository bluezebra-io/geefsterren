'use client';

import { Check, CircleCheck } from 'lucide-react';
import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';

import { RatingControl } from '@/components/feedback/rating-control';
import { Alert, Textarea } from '@/components/ui';
import { Button } from '@/components/ui/button';
import type { ResolvedQuestion } from '@/features/feedback/resolve';
import { questionsForScoreClient } from '@/features/questionnaires/client';
import { format, usePublicMessages } from '@/lib/i18n/provider';
import { cn } from '@/lib/utils';

import {
  submitGuestFeedbackAction,
  type GuestSubmitState,
} from '@/app/(public-feedback)/r/[token]/actions';

const COMMENT_LIMIT = 500;

function SendButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  const t = usePublicMessages();
  return (
    <Button type="submit" size="lg" pill block loading={pending} disabled={disabled}>
      {pending ? t.guest.sending : t.guest.send}
    </Button>
  );
}

/**
 * One screen, not a wizard.
 *
 * The specification describes six steps; for a four-question questionnaire a
 * single scrolling page is fewer taps and cannot lose a half-finished answer to a
 * dropped connection. The follow-up questions appear as soon as a score is
 * chosen, which is the same branching the server re-evaluates on submit.
 */
export function GuestFlow({
  token,
  locationName,
  locationCity,
  questions,
  idempotencyKey,
}: {
  token: string;
  locationName: string;
  locationCity: string | null;
  questions: ResolvedQuestion[];
  /**
   * Generated on the server, once per page render.
   *
   * A double tap therefore sends the same key and the second insert loses to a
   * unique constraint, while a genuinely new visit gets a new key. Generating it
   * during render instead would be impure — and `useId` would be worse: it is
   * derived from tree position, so every page load would produce the same key and
   * a guest's second, real submission would be discarded as a duplicate.
   */
  idempotencyKey: string;
}) {
  const t = usePublicMessages();
  const [state, formAction] = useActionState<GuestSubmitState | null, FormData>(
    submitGuestFeedbackAction,
    null,
  );

  const [score, setScore] = useState<number | null>(null);
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [comment, setComment] = useState('');

  const visible = questionsForScoreClient(questions, score, selected);
  const choiceQuestions = visible.filter(
    (question) =>
      question.questionType === 'multiple_choice' || question.questionType === 'single_choice',
  );
  const textQuestion = visible.find(
    (question) => question.questionType === 'long_text' || question.questionType === 'short_text',
  );

  if (state?.status === 'done') {
    return (
      <div className="my-auto text-center">
        <div className="mx-auto grid size-19 place-items-center rounded-full bg-[var(--color-success-soft)]">
          <CircleCheck aria-hidden="true" className="size-10 text-[var(--color-success)]" />
        </div>
        <h1 className="font-display mt-5 text-2xl font-bold tracking-snug text-[var(--color-text-primary)]">
          {t.guest.thanksTitle}
        </h1>
        <p className="mt-3 text-sm leading-[1.55] text-[var(--color-text-secondary)]">
          {format(t.guest.thanksBody, { location: locationName })}
        </p>
        <p className="tabular mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--color-surface-brand-soft)] px-4 py-1.5 text-sm font-semibold text-amber-800">
          {t.guest.thanksScore}: {state.score}/5
        </p>
      </div>
    );
  }

  return (
    <div>
      <header className="flex items-center gap-3">
        <span className="font-display grid size-9 shrink-0 place-items-center rounded-md bg-ink-800 text-xs font-extrabold text-cream-50">
          {locationName
            .split(/\s+/)
            .slice(0, 2)
            .map((word) => word[0]?.toUpperCase() ?? '')
            .join('')}
        </span>
        <div className="min-w-0">
          <p className="font-display truncate font-extrabold text-[var(--color-text-primary)]">
            {locationName}
          </p>
          {locationCity ? (
            <p className="truncate text-xs text-[var(--color-text-muted)]">{locationCity}</p>
          ) : null}
        </div>
      </header>

      <p className="mt-5 text-sm leading-[1.55] text-[var(--color-text-secondary)]">
        {format(t.guest.intro, { location: locationName })}
      </p>

      {state?.status === 'invalid' ? (
        <div className="mt-4">
          <Alert tone="error" role="alert" title={t.guest.notFoundTitle}>
            {t.guest.notFoundBody}
          </Alert>
        </div>
      ) : null}
      {state?.status === 'failed' ? (
        <div className="mt-4">
          <Alert tone="error" role="alert" title={t.guest.failedTitle}>
            {t.guest.failedBody}
          </Alert>
        </div>
      ) : null}

      <form action={formAction} className="mt-6 space-y-7">
        <input type="hidden" name="token" value={token} />
        <input type="hidden" name="idempotencyKey" value={idempotencyKey} />

        <section>
          <h1 className="font-display text-xl font-bold tracking-snug text-[var(--color-text-primary)]">
            {t.guest.ratingQuestion}
          </h1>
          <div className="mt-4">
            <RatingControl
              name="overallScore"
              value={score}
              onChange={setScore}
              labels={{
                veryPoor: t.guest.veryPoor,
                poor: t.guest.poor,
                fair: t.guest.fair,
                good: t.guest.good,
                excellent: t.guest.excellent,
                optionLabel: t.guest.optionLabel,
                scaleLow: t.guest.scaleLow,
                scaleHigh: t.guest.scaleHigh,
              }}
            />
          </div>
        </section>

        {choiceQuestions.map((question) => (
          <section key={question.id}>
            <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
              {question.label}
            </h2>
            {question.helpText ? (
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{question.helpText}</p>
            ) : null}

            <div className="mt-3 flex flex-wrap gap-2">
              {question.options.map((option) => {
                const chosen = (selected[question.questionKey] ?? []).includes(option.optionKey);
                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={chosen}
                    onClick={() =>
                      setSelected((current) => {
                        const existing = current[question.questionKey] ?? [];
                        const single = question.questionType === 'single_choice';
                        const next = chosen
                          ? existing.filter((key) => key !== option.optionKey)
                          : single
                            ? [option.optionKey]
                            : [...existing, option.optionKey];
                        return { ...current, [question.questionKey]: next };
                      })
                    }
                    className={cn(
                      'inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-base font-medium transition-colors duration-140',
                      chosen
                        ? 'border-ink-900 bg-ink-900 text-cream-50'
                        : 'border-cream-400 bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-muted)]',
                    )}
                  >
                    {chosen ? (
                      <Check aria-hidden="true" className="size-4 text-[var(--color-brand-primary)]" />
                    ) : null}
                    {option.label}
                  </button>
                );
              })}
            </div>

            {/* The selections travel as repeated fields, so the form still works
                without JavaScript once a score is chosen. */}
            {(selected[question.questionKey] ?? []).map((optionKey) => (
              <input
                key={optionKey}
                type="hidden"
                name={`q:${question.questionKey}`}
                value={optionKey}
              />
            ))}
          </section>
        ))}

        {textQuestion ? (
          <section>
            <label
              htmlFor="comment"
              className="text-base font-semibold text-[var(--color-text-primary)]"
            >
              {textQuestion.label}{' '}
              <span className="font-normal text-[var(--color-text-muted)]">
                ({t.guest.optional})
              </span>
            </label>
            <Textarea
              id="comment"
              name="comment"
              maxLength={COMMENT_LIMIT}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder={t.guest.commentPlaceholder}
              className="mt-3"
            />
            <p className="tabular mt-1 text-right text-xs text-[var(--color-text-muted)]">
              {format(t.guest.charactersLeft, { count: COMMENT_LIMIT - comment.length })}
            </p>
          </section>
        ) : null}

        <div className="space-y-2 pt-2">
          <SendButton disabled={score === null} />
          {score === null ? (
            <p className="text-center text-xs text-[var(--color-text-muted)]">
              {t.guest.ratingRequired}
            </p>
          ) : null}
        </div>
      </form>
    </div>
  );
}

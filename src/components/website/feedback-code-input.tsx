'use client';

import { CircleAlert, QrCode } from 'lucide-react';
import { useActionState, useId, useState } from 'react';
import { useFormStatus } from 'react-dom';

import { Button } from '@/components/ui/button';
import { resolveFeedbackCodeAction, type FeedbackCodeState } from '@/features/qr-codes/actions';
import { FEEDBACK_CODE_LENGTH } from '@/features/qr-codes/service';
import { usePublicMessages } from '@/lib/i18n/provider';

/**
 * The homepage primary action: enter the code printed next to the QR.
 *
 * Design system §5.3. A 52px field with 20px bold tracked type, usable with one
 * thumb, and inline in the hero rather than behind a modal — the most important
 * action on the page must not cost an extra tap.
 *
 * The error never says *why* a code failed, so campaign structure stays
 * private. The help text names the physical places a code appears; it is the
 * difference between confusion and a second attempt.
 */
function SubmitButton({ hasValue }: { hasValue: boolean }) {
  const { pending } = useFormStatus();
  const t = usePublicMessages();

  return (
    <Button
      type="submit"
      size="lg"
      loading={pending}
      // Dimmed until there is something to submit. Not `disabled`: a disabled
      // button is skipped by some screen readers and gives no feedback on tap,
      // so the server still validates and answers.
      className={hasValue ? undefined : 'opacity-60'}
    >
      {pending ? t.common.loading : t.marketing.codeSubmit}
    </Button>
  );
}

export function FeedbackCodeInput() {
  const t = usePublicMessages();
  const [state, formAction] = useActionState<FeedbackCodeState | null, FormData>(
    resolveFeedbackCodeAction,
    null,
  );
  const [value, setValue] = useState('');
  const id = useId();

  const invalid = state === 'invalid';
  const errorId = `${id}-error`;
  const helpId = `${id}-help`;

  return (
    <form action={formAction}>
      <label
        htmlFor={id}
        className="block text-[0.95rem] leading-[1.35] font-semibold text-[var(--color-text-primary)]"
      >
        {t.marketing.codeLabel}
      </label>

      <div className="mt-2.5 flex items-stretch gap-2.5">
        <input
          id={id}
          name="code"
          value={value}
          // Codes are always shown uppercase, so the field uppercases as you
          // type rather than silently correcting on submit.
          onChange={(event) => setValue(event.target.value.toUpperCase())}
          placeholder={t.marketing.codePlaceholder}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          maxLength={FEEDBACK_CODE_LENGTH + 4}
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? errorId : helpId}
          className="h-control-lg min-w-0 flex-1 rounded-md border-2 border-cream-300 bg-[var(--color-surface)] px-4 text-xl font-bold tracking-[0.16em] text-[var(--color-text-primary)] uppercase transition-[border-color,box-shadow] duration-140 ease-[cubic-bezier(.2,.8,.2,1)] placeholder:text-base placeholder:font-normal placeholder:tracking-[0.01em] placeholder:normal-case placeholder:text-[var(--color-text-muted)] focus:border-ink-900 focus:shadow-[var(--shadow-focus)] focus:outline-none aria-invalid:border-[var(--color-error)]"
        />
        <SubmitButton hasValue={value.trim().length > 0} />
      </div>

      {invalid ? (
        <p
          id={errorId}
          className="mt-2.5 flex items-center gap-2 text-sm font-medium text-[var(--color-error-text)]"
        >
          <CircleAlert aria-hidden="true" className="size-4 shrink-0" />
          {t.marketing.codeError}
        </p>
      ) : (
        <p
          id={helpId}
          className="mt-2.5 flex items-start gap-2 text-sm leading-[1.45] text-[var(--color-text-secondary)]"
        >
          <QrCode aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {t.marketing.codeHelp}
        </p>
      )}
    </form>
  );
}

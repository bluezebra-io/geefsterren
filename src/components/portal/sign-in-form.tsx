'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

import { Card, CardBody, FieldError, FormError, Input, Label } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { sendMagicLinkAction } from '@/features/auth/actions';
import { format, useMessages } from '@/lib/i18n/provider';
import type { ActionResult } from '@/types/domain';

function SubmitButton() {
  const { pending } = useFormStatus();
  const t = useMessages();
  return (
    <Button type="submit" block loading={pending}>
      {pending ? t.auth.sending : t.auth.sendLink}
    </Button>
  );
}

export function SignInForm({ next }: { next?: string }) {
  const t = useMessages();
  const [state, formAction] = useActionState<ActionResult<{ email: string }> | null, FormData>(
    sendMagicLinkAction,
    null,
  );

  if (state?.ok) {
    return (
      <Card>
        <CardBody className="space-y-2 text-center">
          <p className="font-display text-xl font-bold tracking-snug text-[var(--color-text-primary)]">
            {t.auth.checkEmailTitle}
          </p>
          <p className="text-sm leading-[1.55] text-[var(--color-text-secondary)]">
            {format(t.auth.checkEmailBody, { email: state.data.email })}
          </p>
        </CardBody>
      </Card>
    );
  }

  const fieldErrors = state && !state.ok ? state.fieldErrors : undefined;

  return (
    <Card>
      <CardBody>
        <form action={formAction} className="space-y-5">
          <FormError message={state && !state.ok ? state.error : undefined} />

          <div>
            <Label htmlFor="email">{t.auth.emailLabel}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder={t.auth.emailPlaceholder}
              className="mt-2"
              aria-invalid={fieldErrors?.email ? true : undefined}
              aria-describedby={fieldErrors?.email ? 'signin-email-error' : undefined}
            />
            <FieldError id="signin-email-error" messages={fieldErrors?.email} />
          </div>

          {next ? <input type="hidden" name="next" value={next} /> : null}

          <SubmitButton />

          <p className="text-center text-xs leading-[1.5] text-[var(--color-text-muted)]">
            {t.auth.inviteOnly}
          </p>
        </form>
      </CardBody>
    </Card>
  );
}

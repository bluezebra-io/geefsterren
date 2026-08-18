'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';

import { Card, CardBody, FieldError, FormError, Input, Label } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { sendMagicLinkAction } from '@/features/auth/actions';
import { format, usePortalMessages } from '@/lib/i18n/provider';
import type { ActionResult } from '@/types/domain';

/**
 * Two ways in, on purpose.
 *
 * Password sign-in posts to a route handler so it works without JavaScript and
 * without mail delivery. The magic link stays available — it is the route for
 * invitations, and for anyone who would rather not keep a password.
 */

function PasswordSubmit() {
  const { pending } = useFormStatus();
  const t = usePortalMessages();
  return (
    <Button type="submit" block loading={pending}>
      {pending ? t.common.loading : t.auth.signInWithPassword}
    </Button>
  );
}

function LinkSubmit() {
  const { pending } = useFormStatus();
  const t = usePortalMessages();
  return (
    <Button type="submit" variant="ghost" size="sm" loading={pending}>
      {pending ? t.auth.sending : t.auth.sendLinkInstead}
    </Button>
  );
}

export function SignInForm({ next, error }: { next?: string; error?: string }) {
  const t = usePortalMessages();
  const [linkState, linkAction] = useActionState<ActionResult<{ email: string }> | null, FormData>(
    sendMagicLinkAction,
    null,
  );
  // Shared so switching to the magic link keeps what was already typed.
  const [email, setEmail] = useState('');

  if (linkState?.ok) {
    return (
      <Card>
        <CardBody className="space-y-2 text-center">
          <p className="font-display text-xl font-bold tracking-snug text-[var(--color-text-primary)]">
            {t.auth.checkEmailTitle}
          </p>
          <p className="text-sm leading-[1.55] text-[var(--color-text-secondary)]">
            {format(t.auth.checkEmailBody, { email: linkState.data.email })}
          </p>
        </CardBody>
      </Card>
    );
  }

  const fieldErrors = linkState && !linkState.ok ? linkState.fieldErrors : undefined;
  const formError =
    (linkState && !linkState.ok ? linkState.error : undefined) ??
    (error === 'credentials' ? t.auth.credentialsError : undefined) ??
    (error === 'invalid' ? t.common.checkForm : undefined);

  return (
    <Card>
      <CardBody className="space-y-5">
        <FormError message={formError} />

        <form method="post" action="/api/portal/sign-in" className="space-y-5">
          <div>
            <Label htmlFor="email">{t.auth.emailLabel}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder={t.auth.emailPlaceholder}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2"
              aria-invalid={fieldErrors?.email ? true : undefined}
              aria-describedby={fieldErrors?.email ? 'signin-email-error' : undefined}
            />
            <FieldError id="signin-email-error" messages={fieldErrors?.email} />
          </div>

          <div>
            <Label htmlFor="password">{t.auth.passwordLabel}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="mt-2"
            />
          </div>

          {next ? <input type="hidden" name="next" value={next} /> : null}

          <PasswordSubmit />
        </form>

        <div className="border-t border-[var(--color-border)] pt-4 text-center">
          <p className="text-sm text-[var(--color-text-secondary)]">{t.auth.orMagicLink}</p>
          <form action={linkAction} className="mt-1">
            <input type="hidden" name="email" value={email} />
            {next ? <input type="hidden" name="next" value={next} /> : null}
            <LinkSubmit />
          </form>
        </div>

        <p className="text-center text-xs leading-[1.5] text-[var(--color-text-muted)]">
          {t.auth.inviteOnly}
        </p>
      </CardBody>
    </Card>
  );
}

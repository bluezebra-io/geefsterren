import Link from 'next/link';

import { Card, CardBody } from '@/components/ui';
import { buttonVariants } from '@/components/ui/button';
import { getMessages } from '@/lib/i18n/locale';

export const metadata = { title: 'Sign-in problem — GeefSterren' };

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const [{ reason }, t] = await Promise.all([searchParams, getMessages()]);

  const reasons: Record<string, string> = {
    missing_code: t.auth.errorMissingCode,
    invalid_code: t.auth.errorInvalidCode,
  };

  const message = (reason && reasons[reason]) || t.auth.errorGeneric;

  return (
    <Card>
      <CardBody className="space-y-4 text-center">
        <p className="font-display text-xl font-bold tracking-snug text-[var(--color-text-primary)]">
          {t.auth.errorTitle}
        </p>
        <p className="text-sm leading-[1.55] text-[var(--color-text-secondary)]">{message}</p>
        <Link href="/auth/sign-in" className={buttonVariants({ variant: 'primary' })}>
          {t.auth.backToSignIn}
        </Link>
      </CardBody>
    </Card>
  );
}

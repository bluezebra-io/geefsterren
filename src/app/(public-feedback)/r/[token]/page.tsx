import { randomUUID } from 'node:crypto';

import { GuestFlow } from '@/components/feedback/guest-flow';
import { PoweredBy } from '@/components/ui/logo';
import { resolveQrToken } from '@/features/feedback/resolve';
import { getMessages, resolveLocale } from '@/lib/i18n/locale';
import { PublicI18nProvider } from '@/lib/i18n/provider';
import { pickPublicMessages } from '@/lib/i18n/scope';

export const metadata = { title: 'Feedback — GeefSterren' };

/**
 * The guest flow.
 *
 * No authentication, ever: a guest scanning a QR code has no account and never
 * will. Mobile-first, one column, max 420px.
 *
 * An unknown or inactive token renders the same neutral message as an expired
 * campaign, so the URL cannot be used to discover which campaigns exist.
 */
export default async function GuestFeedbackPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const [context, messages, locale] = await Promise.all([
    resolveQrToken(token),
    getMessages(),
    resolveLocale(),
  ]);

  const t = pickPublicMessages(messages);

  return (
    <PublicI18nProvider locale={locale} messages={t}>
      <div className="flex min-h-screen flex-col bg-[var(--color-background)] px-5 py-6">
        <div className="mx-auto flex w-full max-w-mobile flex-1 flex-col">
          {context === null ? (
            <div className="my-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center">
              <p className="font-display text-xl font-bold tracking-snug text-[var(--color-text-primary)]">
                {t.guest.notFoundTitle}
              </p>
              <p className="mt-2 text-sm leading-[1.55] text-[var(--color-text-secondary)]">
                {t.guest.notFoundBody}
              </p>
            </div>
          ) : (
            <GuestFlow
              token={token}
              locationName={context.locationName}
              locationCity={context.locationCity}
              questions={context.questions}
              idempotencyKey={randomUUID()}
            />
          )}

          <div className="mt-8">
            <PoweredBy label={t.brand.poweredBy} />
          </div>
        </div>
      </div>
    </PublicI18nProvider>
  );
}

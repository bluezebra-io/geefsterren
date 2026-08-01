import Link from 'next/link';

import { Card, CardBody } from '@/components/ui';
import { buttonVariants } from '@/components/ui/button';
import { clientEnv } from '@/lib/env';
import { getMessages } from '@/lib/i18n/locale';

export const metadata = {
  title: 'GeefSterren — feedback that leads to improvement',
  description:
    'Give feedback with a QR code and help your local business improve. Structured, private, and about a minute of your time.',
};

/**
 * Consumer homepage — design system §8.
 *
 * The consumer is the primary audience. This is deliberately not a B2B SaaS
 * landing page; the business section sits at the bottom.
 */
export default async function MarketingHomePage() {
  const t = await getMessages();
  const portalUrl = clientEnv().NEXT_PUBLIC_PORTAL_URL;

  const steps = [
    { title: t.marketing.step1Title, body: t.marketing.step1Body },
    { title: t.marketing.step2Title, body: t.marketing.step2Body },
    { title: t.marketing.step3Title, body: t.marketing.step3Body },
    { title: t.marketing.step4Title, body: t.marketing.step4Body },
  ];

  const benefits = [
    { title: t.marketing.privateTitle, body: t.marketing.privateBody },
    { title: t.marketing.adaptiveTitle, body: t.marketing.adaptiveBody },
    { title: t.marketing.reviewsTitle, body: t.marketing.reviewsBody },
  ];

  return (
    <main>
      <section className="mx-auto max-w-6xl px-5 pt-16 pb-20">
        <h1 className="font-display max-w-3xl text-4xl leading-tight font-extrabold tracking-tight text-[var(--color-text-primary)] sm:text-5xl">
          {t.marketing.heroTitle}
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[var(--color-text-secondary)]">
          {t.marketing.heroBody}
        </p>
        <div className="mt-8">
          <Link href="/hoe-het-werkt" className={buttonVariants({ variant: 'outline', size: 'lg' })}>
            {t.marketing.heroCta}
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20">
        <h2 className="font-display text-3xl font-bold tracking-snug text-[var(--color-text-primary)]">
          {t.marketing.stepsTitle}
        </h2>
        <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => {
            // Only the final step is amber: it marks the outcome, not the
            // sequence. Amber means "this is the action or the result".
            const isLast = index === steps.length - 1;
            return (
              <li key={step.title}>
                <span
                  className={`tabular grid size-9 place-items-center rounded-full text-sm font-bold ${
                    isLast
                      ? 'bg-[var(--color-brand-primary)] text-[var(--color-brand-primary-ink)]'
                      : 'bg-ink-900 text-[var(--color-text-inverse)]'
                  }`}
                >
                  {index + 1}
                </span>
                <h3 className="mt-4 text-lg font-semibold text-[var(--color-text-primary)]">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-[1.55] text-[var(--color-text-secondary)]">
                  {step.body}
                </p>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="grid gap-5 lg:grid-cols-3">
          {benefits.map((benefit) => (
            <Card key={benefit.title}>
              <CardBody>
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                  {benefit.title}
                </h3>
                <p className="mt-2 text-sm leading-[1.55] text-[var(--color-text-secondary)]">
                  {benefit.body}
                </p>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-[var(--color-surface-inverse)] py-20 text-[var(--color-text-inverse)]">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="font-display max-w-2xl text-3xl font-bold tracking-snug">
            {t.marketing.businessTitle}
          </h2>
          <p className="mt-4 max-w-2xl leading-relaxed text-[var(--color-text-inverse-muted)]">
            {t.marketing.businessBody}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/bedrijven" className={buttonVariants({ variant: 'primary', size: 'lg' })}>
              {t.marketing.forBusinesses}
            </Link>
            <a href={portalUrl} className={buttonVariants({ variant: 'onDark', size: 'lg' })}>
              {t.marketing.signInLink}
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

import Link from 'next/link';
import { ArrowRight, Wrench } from 'lucide-react';

import { Card, CardBody, EmptyState } from '@/components/ui';
import { buttonVariants } from '@/components/ui/button';
import {
  BeforeAfter,
  ExampleLabel,
  Eyebrow,
  LocationCard,
  StepFlow,
  TransparencyBlock,
} from '@/components/website';
import { FaqList } from '@/components/website/faq-list';
import { FeedbackCodeInput } from '@/components/website/feedback-code-input';
import { HeroPhoneMock } from '@/components/website/hero-phone-mock';
import { appConfig } from '@/lib/env';
import { getMessages } from '@/lib/i18n/locale';

export const metadata = {
  title: 'GeefSterren — feedback that leads to improvement',
  description:
    'Give feedback with a QR code and help your local business improve. Structured, private, and about a minute of your time.',
};

/**
 * Consumer homepage — design system §8.
 *
 * The consumer is the primary audience; the business section sits at the
 * bottom. This is deliberately not a B2B SaaS landing page.
 *
 * Section 3 uses an anonymised demonstration case and carries an
 * `ExampleLabel`, which the design system requires on every figure that is not
 * a verified customer result. It must be replaced with a real case — or removed
 * — before launch. See IMPLEMENTATION_STATUS.md.
 */
export default async function MarketingHomePage() {
  const t = await getMessages();
  const portalUrl = appConfig().PORTAL_URL;

  const steps = [
    { title: t.marketing.step1Title, text: t.marketing.step1Body },
    { title: t.marketing.step2Title, text: t.marketing.step2Body },
    { title: t.marketing.step3Title, text: t.marketing.step3Body },
    { title: t.marketing.step4Title, text: t.marketing.step4Body },
  ];

  const benefits = [
    { title: t.marketing.privateTitle, body: t.marketing.privateBody },
    { title: t.marketing.adaptiveTitle, body: t.marketing.adaptiveBody },
    { title: t.marketing.reviewsTitle, body: t.marketing.reviewsBody },
  ];

  /**
   * Published improvement updates for the "businesses that listen" grid.
   *
   * Empty until Phase 6 exposes published improvements through a public read
   * path. Typed here so the section's real shape is already settled.
   */
  const publishedLocations: Array<{
    name: string;
    city?: string;
    topic: string;
    change: string;
    date?: string;
    href?: string;
  }> = [];

  const faqs = [
    { q: t.marketing.faq1Q, a: t.marketing.faq1A },
    { q: t.marketing.faq2Q, a: t.marketing.faq2A },
    { q: t.marketing.faq3Q, a: t.marketing.faq3A },
    { q: t.marketing.faq4Q, a: t.marketing.faq4A },
    { q: t.marketing.faq5Q, a: t.marketing.faq5A },
  ];

  return (
    <main>
      {/* 1 — Hero. The code field sits inline in a white card, never behind a
          modal: the most important action must not cost an extra tap. */}
      <section className="mx-auto max-w-6xl px-6 pt-14 pb-20">
        <div className="grid items-center gap-14 lg:grid-cols-[1fr_minmax(0,26rem)]">
          <div>
            <Eyebrow>{t.marketing.heroEyebrow}</Eyebrow>

            <h1 className="font-display mt-5 max-w-[34rem] text-[2.75rem] leading-[1.08] font-extrabold tracking-tight text-[var(--color-text-primary)] sm:text-[3.5rem]">
              {t.marketing.heroTitle}
            </h1>

            <p className="mt-6 max-w-[32rem] text-lg leading-relaxed text-[var(--color-text-secondary)]">
              {t.marketing.heroBody}
            </p>

            <Card className="mt-8 max-w-[32rem]">
              <CardBody>
                <FeedbackCodeInput />
              </CardBody>
            </Card>

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
              <Link
                href="/hoe-het-werkt"
                className={buttonVariants({ variant: 'outline', size: 'lg' })}
              >
                {t.marketing.heroCta}
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
              <p className="text-sm text-[var(--color-text-muted)]">{t.marketing.heroNoCode}</p>
            </div>
          </div>

          <HeroPhoneMock t={t} />
        </div>
      </section>

      {/* 2 — How your feedback helps */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <h2 className="font-display text-3xl font-bold tracking-snug text-[var(--color-text-primary)]">
          {t.marketing.stepsTitle}
        </h2>
        <div className="mt-8">
          <StepFlow steps={steps} brandLast />
        </div>
      </section>

      {/* 3 — What changes because of feedback. Demonstration data, labelled. */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <Eyebrow>{t.marketing.changeEyebrow}</Eyebrow>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h2 className="font-display text-3xl font-bold tracking-snug text-[var(--color-text-primary)]">
            {t.marketing.changeTitle}
          </h2>
          <ExampleLabel>{t.marketing.changeExample}</ExampleLabel>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <Card tone="inverse">
            <CardBody className="space-y-5">
              <p className="text-sm text-[var(--color-text-inverse-muted)]">
                {t.marketing.changeCaseTitle}
              </p>
              {/* The two labelled blocks are fixed copy — they are what make
                  this read as a loop instead of a brag. */}
              <div>
                <p className="text-xs font-bold tracking-widest text-[var(--color-brand-primary)] uppercase">
                  {t.marketing.changeCaseHeard}
                </p>
                <p className="mt-2 leading-relaxed">{t.marketing.changeCaseHeardBody}</p>
              </div>
              <div>
                <p className="text-xs font-bold tracking-widest text-[var(--color-brand-primary)] uppercase">
                  {t.marketing.changeCaseDid}
                </p>
                <p className="mt-2 leading-relaxed">{t.marketing.changeCaseDidBody}</p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="flex flex-col gap-6">
              <BeforeAfter
                label={t.marketing.changeMetric1}
                from="3,4"
                to="4,2"
                note={t.marketing.changeMetric1Note}
              />
              <BeforeAfter
                label={t.marketing.changeMetric2}
                from="71"
                to="89"
                unit="%"
                progress={89}
                note={t.marketing.changeMetric2Note}
              />
              <BeforeAfter
                label={t.marketing.changeMetric3}
                from="18"
                to="6"
                unit="%"
                note={t.marketing.changeMetric3Note}
              />
            </CardBody>
          </Card>
        </div>
      </section>

      {/* 4 — Businesses that listen. No scores, no ranking: not a leaderboard.
          Rendered from published improvement data, which arrives in Phase 6.
          Until then this shows its empty state rather than invented businesses:
          named fake companies read as real customers even under an example
          label, which is a claim we are not entitled to make. */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <h2 className="font-display text-3xl font-bold tracking-snug text-[var(--color-text-primary)]">
          {t.marketing.listeningTitle}
        </h2>
        <p className="mt-2 max-w-2xl text-[var(--color-text-secondary)]">
          {t.marketing.listeningBody}
        </p>

        {publishedLocations.length > 0 ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {publishedLocations.map((location) => (
              <LocationCard key={location.name} {...location} />
            ))}
          </div>
        ) : (
          <div className="mt-8">
            <EmptyState
              icon={<Wrench aria-hidden="true" className="size-10" />}
              title={t.marketing.listeningEmpty}
              description={t.marketing.listeningEmptyBody}
            />
          </div>
        )}
      </section>

      {/* 5 — Why your opinion matters. No guilt language. */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <h2 className="font-display text-3xl font-bold tracking-snug text-[var(--color-text-primary)]">
          {t.marketing.whyTitle}
        </h2>
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
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

      {/* 6 — What happens with your feedback. On the page itself, not only in
          the footer: it is the question that decides whether someone answers. */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <h2 className="font-display text-3xl font-bold tracking-snug text-[var(--color-text-primary)]">
          {t.marketing.privacyTitle}
        </h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-[var(--color-text-secondary)]">
          {t.marketing.privacyBody}
        </p>

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_1fr]">
          <TransparencyBlock
            title={t.marketing.transparencyTitle}
            items={[
              t.marketing.transparency1,
              t.marketing.transparency2,
              t.marketing.transparency3,
              t.marketing.transparency4,
            ]}
            footer={
              <div className="flex flex-wrap gap-4">
                <Link href="/privacy" className="font-semibold text-[var(--color-text-link)] hover:text-[var(--color-text-link-hover)]">
                  {t.marketing.privacyLinkPrivacy}
                </Link>
                <Link href="/gegevensgebruik" className="font-semibold text-[var(--color-text-link)] hover:text-[var(--color-text-link-hover)]">
                  {t.marketing.privacyLinkData}
                </Link>
                <Link href="/contact" className="font-semibold text-[var(--color-text-link)] hover:text-[var(--color-text-link-hover)]">
                  {t.marketing.privacyLinkContact}
                </Link>
              </div>
            }
          />

          <div>
            <h3 className="font-display text-xl font-bold tracking-snug text-[var(--color-text-primary)]">
              {t.marketing.faqTitle}
            </h3>
            <div className="mt-4">
              <FaqList items={faqs} />
            </div>
          </div>
        </div>
      </section>

      {/* 7 — For businesses. Secondary audience, and it sits last on purpose. */}
      <section className="bg-[var(--color-surface-inverse)] py-20 text-[var(--color-text-inverse)]">
        <div className="mx-auto max-w-6xl px-6">
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


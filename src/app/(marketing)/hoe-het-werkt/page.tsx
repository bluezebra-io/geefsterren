import Link from 'next/link';
import {
  Bell,
  ChartNoAxesCombined,
  Eye,
  Gift,
  Mail,
  MapPin,
  MessageSquareQuote,
  PenLine,
  QrCode,
  Repeat,
  Send,
  Target,
  UserRoundX,
  Wrench,
  X,
} from 'lucide-react';

import { Alert, Card, CardBody } from '@/components/ui';
import {
  BeforeAfter,
  ExampleLabel,
  Eyebrow,
  Section,
  StepFlow,
  type FlowStep,
} from '@/components/website';
import { FaqList } from '@/components/website/faq-list';
import { FeedbackCodeInput } from '@/components/website/feedback-code-input';
import { HeroPhoneMock } from '@/components/website/hero-phone-mock';
import { getMessages } from '@/lib/i18n/locale';

/**
 * Guest page — handoff page 1, `/hoe-het-werkt`.
 *
 * The audience is someone who just scanned a QR code and wants to know three
 * things before they start: what is being asked, where the answer goes, and
 * whether they are anonymous. The page answers them in that order, and the
 * anonymity band deliberately does not soften the answer.
 *
 * The before/after case is demonstration data and carries an `ExampleLabel`,
 * which the design system requires on every figure that is not a verified
 * customer result. Its footnote states sequence, never causation.
 */
export async function generateMetadata() {
  const t = await getMessages();
  return {
    title: t.howItWorks.metaTitle,
    description: t.howItWorks.metaDescription,
  };
}

export default async function HowItWorksPage() {
  const t = await getMessages();
  const m = t.howItWorks;

  const steps: FlowStep[] = [
    { title: m.step1Title, text: m.step1Body, icon: <QrCode className="size-5" /> },
    {
      title: m.step2Title,
      text: m.step2Body,
      icon: <MessageSquareQuote className="size-5" />,
    },
    { title: m.step3Title, text: m.step3Body, icon: <Wrench className="size-5" /> },
    { title: m.step4Title, text: m.step4Body, icon: <Bell className="size-5" /> },
  ];

  const chain = [
    { icon: <Send className="size-5.5" />, title: m.chain1Title, body: m.chain1Body },
    {
      icon: <ChartNoAxesCombined className="size-5.5" />,
      title: m.chain2Title,
      body: m.chain2Body,
    },
    { icon: <Eye className="size-5.5" />, title: m.chain3Title, body: m.chain3Body },
  ];

  const anonymity = [
    { icon: <UserRoundX className="size-5" />, text: m.anonymous1 },
    { icon: <PenLine className="size-5" />, text: m.anonymous2 },
    { icon: <Mail className="size-5" />, text: m.anonymous3 },
  ];

  const why = [
    { icon: <Target className="size-5.5" />, title: m.why1Title, body: m.why1Body },
    { icon: <Repeat className="size-5.5" />, title: m.why2Title, body: m.why2Body },
    { icon: <MapPin className="size-5.5" />, title: m.why3Title, body: m.why3Body },
  ];

  const faqs = [
    { q: m.faq1Q, a: m.faq1A },
    { q: m.faq2Q, a: m.faq2A },
    { q: m.faq3Q, a: m.faq3A },
    { q: m.faq4Q, a: m.faq4A },
    { q: m.faq5Q, a: m.faq5A },
  ];

  return (
    <main>
      {/* 1.1 — Hero. The code field sits inline in a white card, never behind a
          modal: the most important action must not cost an extra tap. */}
      <section className="bg-[var(--color-background)] pt-14 pb-7">
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col items-start gap-5">
            <Eyebrow>{m.heroEyebrow}</Eyebrow>
            <h1 className="font-display max-w-[40rem] text-[2.75rem] leading-tight font-extrabold tracking-tight text-[var(--color-text-primary)] sm:text-[3.25rem]">
              {m.heroTitle}
            </h1>
            <p className="max-w-[32.5rem] text-lg leading-relaxed text-[var(--color-text-secondary)]">
              {m.heroBody}
            </p>

            <Card className="w-full max-w-[30rem] shadow-[var(--shadow-sm)]">
              <CardBody>
                <FeedbackCodeInput />
              </CardBody>
            </Card>

            <p className="max-w-[30rem] text-sm text-[var(--color-text-muted)]">{m.heroCaption}</p>
          </div>

          <HeroPhoneMock t={t} />
        </div>
      </section>

      {/* 1.2 — Zo werkt het */}
      <Section tone="surface">
        <div className="mb-8 flex max-w-[38.75rem] flex-col gap-2.5">
          <Eyebrow>{m.stepsEyebrow}</Eyebrow>
          <h2 className="font-display text-3xl font-bold tracking-snug text-[var(--color-text-primary)] sm:text-4xl">
            {m.stepsTitle}
          </h2>
          <p className="text-[1.0625rem] leading-relaxed text-[var(--color-text-secondary)]">
            {m.stepsBody}
          </p>
        </div>
        <StepFlow steps={steps} columns={4} brandLast />
      </Section>

      {/* 1.3 — Where the feedback goes */}
      <Section tone="cream">
        <h2 className="font-display text-3xl font-bold tracking-snug text-[var(--color-text-primary)] sm:text-4xl">
          {m.chainTitle}
        </h2>
        <p className="mt-2.5 text-[1.0625rem] leading-relaxed text-[var(--color-text-secondary)]">
          {m.chainBody}
        </p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {chain.map((item) => (
            <Card key={item.title}>
              <CardBody className="flex flex-col gap-3 p-6">
                <span className="grid size-11.5 place-items-center rounded-lg bg-[var(--color-surface-brand-soft)] text-amber-700">
                  <span aria-hidden="true">{item.icon}</span>
                </span>
                <h3 className="font-display text-lg font-bold text-[var(--color-text-primary)]">
                  {item.title}
                </h3>
                <p className="text-[0.9375rem] leading-relaxed text-[var(--color-text-secondary)]">
                  {item.body}
                </p>
              </CardBody>
            </Card>
          ))}
        </div>

        <Alert tone="info" title={m.chainAlertTitle} className="mt-6 max-w-[51.25rem]">
          {m.chainAlertBody}
        </Alert>
      </Section>

      {/* 1.4 — Anonymity. Ink band: the one place on this page where the answer
          is uncomfortable enough to deserve its own weight. */}
      <Section tone="ink">
        <div className="grid items-start gap-12 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <h2 className="font-display text-3xl font-bold tracking-snug sm:text-4xl">
              {m.anonymousTitle}
            </h2>
            <p className="mt-4 text-[1.03125rem] leading-relaxed text-[var(--color-text-inverse-muted)]">
              {m.anonymousBody}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {anonymity.map((row) => (
              <div
                key={row.text}
                className="grid grid-cols-[1.5rem_1fr] gap-3.5 rounded-lg border border-[var(--color-border-inverse)] px-5 py-4.5"
              >
                <span aria-hidden="true" className="text-amber-400">
                  {row.icon}
                </span>
                <p className="text-base leading-relaxed">{row.text}</p>
              </div>
            ))}

            <div className="mt-1 flex flex-wrap gap-5">
              <Link href="/privacy" className="text-sm font-medium text-amber-400 underline">
                {m.anonymousLinkPrivacy}
              </Link>
              <Link href="/gegevens" className="text-sm font-medium text-amber-400 underline">
                {m.anonymousLinkData}
              </Link>
            </div>
          </div>
        </div>
      </Section>

      {/* 1.5 — Rewards. The brand card is the page's single amber accent besides
          the closing CTA. */}
      <Section tone="cream" tight>
        <div className="grid items-start gap-7 lg:grid-cols-[1fr_0.85fr]">
          <Card tone="brand">
            <CardBody className="flex flex-col gap-3.5 p-7">
              <div className="flex items-center gap-3">
                <Gift aria-hidden="true" className="size-5.5 text-amber-700" />
                <h2 className="font-display text-2xl font-bold tracking-snug text-[var(--color-text-primary)]">
                  {m.rewardsTitle}
                </h2>
              </div>
              <p className="text-[1.0625rem] leading-relaxed text-[var(--color-text-secondary)]">
                {m.rewardsBody}
              </p>
              <p className="text-lg leading-snug font-semibold text-[var(--color-text-primary)]">
                {m.rewardsEmphasis}
              </p>
              <p className="text-[0.9375rem] leading-relaxed text-[var(--color-text-secondary)]">
                {m.rewardsTerms}
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-6">
              <h3 className="font-display text-[1.0625rem] font-bold text-[var(--color-text-primary)]">
                {m.rewardsNeverTitle}
              </h3>
              <ul className="mt-3 flex list-none flex-col gap-2.5">
                {[m.rewardsNever1, m.rewardsNever2, m.rewardsNever3].map((item) => (
                  <li key={item} className="flex gap-2.5">
                    <X
                      aria-hidden="true"
                      className="mt-0.5 size-4 shrink-0 text-[var(--color-text-muted)]"
                    />
                    <span className="text-[0.9375rem] leading-snug text-[var(--color-text-secondary)]">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        </div>
      </Section>

      {/* 1.6 — Why bother, with the demonstration case */}
      <Section tone="surface">
        <h2 className="font-display text-3xl font-bold tracking-snug text-[var(--color-text-primary)] sm:text-4xl">
          {m.whyTitle}
        </h2>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {why.map((item) => (
            <Card key={item.title}>
              <CardBody className="flex flex-col gap-3 p-6">
                <span aria-hidden="true" className="text-amber-700">
                  {item.icon}
                </span>
                <h3 className="font-display text-lg font-bold text-[var(--color-text-primary)]">
                  {item.title}
                </h3>
                <p className="text-[0.9375rem] leading-relaxed text-[var(--color-text-secondary)]">
                  {item.body}
                </p>
              </CardBody>
            </Card>
          ))}
        </div>

        <Card className="mt-5">
          <CardBody className="grid items-center gap-7 p-6 lg:grid-cols-3">
            <div className="flex flex-col gap-2">
              <ExampleLabel>{t.marketing.changeExample}</ExampleLabel>
              <p className="font-display text-[1.0625rem] font-bold text-[var(--color-text-primary)]">
                {m.whyCaseTitle}
              </p>
              <p className="text-sm leading-snug text-[var(--color-text-secondary)]">
                {m.whyCaseBody}
              </p>
            </div>
            <BeforeAfter
              label={m.whyCaseMetric1}
              from={71}
              to={89}
              unit="%"
              progress={89}
              note={m.whyCaseMetric1Note}
            />
            <BeforeAfter
              label={m.whyCaseMetric2}
              from="3,4"
              to="4,2"
              note={m.whyCaseMetric2Note}
            />
          </CardBody>
        </Card>

        {/* Sequence, not causation — a brand requirement, not a disclaimer. */}
        <p className="mt-4 max-w-[40rem] text-sm text-[var(--color-text-muted)]">
          {m.whyCaseFootnote}
        </p>
      </Section>

      {/* 1.7 — FAQ */}
      <Section tone="cream" narrow>
        <h2 className="font-display text-3xl font-bold tracking-snug text-[var(--color-text-primary)] sm:text-4xl">
          {m.faqTitle}
        </h2>
        <div className="mt-6">
          <FaqList items={faqs} />
        </div>
      </Section>

      {/* 1.8 — Amber CTA. Text on amber is always ink, never white. */}
      <Section tone="cream" tight>
        <div className="grid items-center gap-9 rounded-xl bg-[var(--color-brand-primary)] px-11 py-10 lg:grid-cols-2">
          <div className="flex flex-col gap-4">
            <h2 className="font-display text-[2rem] leading-snug font-extrabold tracking-snug text-ink-900">
              {m.ctaTitle}
            </h2>
            <p className="text-[1.03125rem] leading-relaxed text-ink-800">{m.ctaBody}</p>
            <Link
              href="/verbeteringen"
              className="text-[0.9375rem] font-semibold text-ink-900 underline"
            >
              {m.ctaLink}
            </Link>
          </div>

          <div className="rounded-lg bg-[var(--color-surface)] p-5">
            <FeedbackCodeInput />
          </div>
        </div>
      </Section>
    </main>
  );
}

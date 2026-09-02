import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  ChartColumnDecreasing,
  ChartNoAxesCombined,
  Check,
  ClockAlert,
  Download,
  Eye,
  MapPin,
  Megaphone,
  MessagesSquare,
  MonitorPlay,
  QrCode,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
  Wrench,
} from 'lucide-react';

import {
  Alert,
  Badge,
  Card,
  CardBody,
  CardHeader,
  CardSubtitle,
  CardTitle,
  DataTable,
  DistributionBars,
  ReadinessMeter,
  StatCard,
  type DataTableColumn,
  type ReadinessCriterion,
} from '@/components/ui';
import { buttonVariants } from '@/components/ui/button';
import {
  BeforeAfter,
  ExampleLabel,
  Eyebrow,
  Section,
  StatusBadge,
  StepFlow,
  type FlowStep,
} from '@/components/website';
import { FaqList } from '@/components/website/faq-list';
import { getMessages } from '@/lib/i18n/locale';

/**
 * Operator page — handoff page 3, `/voor-bedrijven`.
 *
 * The audience is a franchise operator deciding whether to book a demo. The
 * argument runs: individual reviews cannot steer a chain → the same questions
 * everywhere make locations comparable → improve first, ask for reviews after.
 *
 * Everything here is static marketing content plus demonstration data. The
 * design system requires that data to stay labelled with `ExampleLabel` until
 * verified customer results replace it — GeefSterren has no customer cases yet
 * and section 3.7 says so on the page rather than hiding it.
 *
 * The H1 is one of three pain headlines offered in the handoff. The first is
 * shipped and there is deliberately no switcher.
 */
export async function generateMetadata() {
  const t = await getMessages();
  return {
    title: t.forBusinesses.metaTitle,
    description: t.forBusinesses.metaDescription,
  };
}

/**
 * Where "Plan een demo" goes until a demo request flow exists. A mailto is
 * honest; a link to a route that 404s is not.
 */
const DEMO_HREF = 'mailto:support@geefsterren.nl?subject=Demo%20GeefSterren';

/** Demonstration data. Dutch notation, U+2212 for a negative delta. */
type LocationRow = {
  name: string;
  responses: string;
  score: string;
  delivery: string;
  temperature: string;
  delta: string;
  ready: 'active' | 'collecting' | 'improve';
};

const DEMO_ROWS: readonly LocationRow[] = [
  { name: 'Rotterdam Centrum', responses: '184', score: '4,6', delivery: '4,5', temperature: '4,7', delta: '+0,3', ready: 'active' },
  { name: 'Den Haag Zuid', responses: '156', score: '4,5', delivery: '4,4', temperature: '4,6', delta: '+0,2', ready: 'active' },
  { name: 'Utrecht Oost', responses: '121', score: '4,3', delivery: '4,1', temperature: '4,4', delta: '0,0', ready: 'active' },
  { name: 'Leiden', responses: '48', score: '4,3', delivery: '3,6', temperature: '4,2', delta: '0,0', ready: 'collecting' },
  { name: 'Amersfoort', responses: '97', score: '4,1', delivery: '3,9', temperature: '4,0', delta: '−0,2', ready: 'collecting' },
  { name: 'Zwolle', responses: '76', score: '3,7', delivery: '3,2', temperature: '3,5', delta: '−0,6', ready: 'improve' },
];

export default async function ForBusinessesPage() {
  const t = await getMessages();
  const m = t.forBusinesses;

  const readyLabels: Record<LocationRow['ready'], string> = {
    active: m.statusInvitationActive,
    collecting: m.statusCollecting,
    improve: m.statusImproveFirst,
  };

  const columns: ReadonlyArray<DataTableColumn<LocationRow>> = [
    { key: 'name', header: m.tableColLocation, width: '22%', render: (row) => row.name },
    { key: 'responses', header: m.tableColResponses, align: 'right', render: (row) => row.responses },
    { key: 'score', header: m.tableColScore, align: 'right', render: (row) => row.score },
    { key: 'delivery', header: m.tableColDelivery, align: 'right', render: (row) => row.delivery },
    { key: 'temperature', header: m.tableColTemperature, align: 'right', render: (row) => row.temperature },
    { key: 'delta', header: m.tableColDelta, align: 'right', render: (row) => row.delta },
    { key: 'ready', header: m.tableColReady, render: (row) => readyLabels[row.ready] },
  ];

  const problems = [
    { icon: <ChartColumnDecreasing className="size-5.5" />, title: m.problem1Title, body: m.problem1Body },
    { icon: <Wallet className="size-5.5" />, title: m.problem2Title, body: m.problem2Body },
    { icon: <ClockAlert className="size-5.5" />, title: m.problem3Title, body: m.problem3Body },
    { icon: <MessagesSquare className="size-5.5" />, title: m.problem4Title, body: m.problem4Body },
    { icon: <ShieldAlert className="size-5.5" />, title: m.problem5Title, body: m.problem5Body },
  ];

  const flow: FlowStep[] = [
    { title: m.flow1Title, text: m.flow1Body, icon: <QrCode className="size-5" /> },
    { title: m.flow2Title, text: m.flow2Body, icon: <ChartNoAxesCombined className="size-5" /> },
    { title: m.flow3Title, text: m.flow3Body, icon: <MapPin className="size-5" /> },
    { title: m.flow4Title, text: m.flow4Body, icon: <Wrench className="size-5" /> },
    { title: m.flow5Title, text: m.flow5Body, icon: <Eye className="size-5" /> },
    { title: m.flow6Title, text: m.flow6Body, icon: <BadgeCheck className="size-5" /> },
  ];

  const criteria: readonly ReadinessCriterion[] = [
    { label: m.readinessCriterion1, value: '48', target: '50', met: false },
    { label: m.readinessCriterion2, value: '4,3', target: '4,0', met: true },
    { label: m.readinessCriterion3, value: '6%', target: 'max 10%', met: true },
    { label: m.readinessCriterion4, value: '71%', target: 'min 60%', met: true },
  ];

  const statusRows: ReadonlyArray<{ name: string; state: LocationRow['ready'] }> = [
    { name: 'Rotterdam Centrum', state: 'active' },
    { name: 'Den Haag Zuid', state: 'active' },
    { name: 'Leiden', state: 'collecting' },
    { name: 'Zwolle', state: 'improve' },
  ];

  const features = [
    { icon: <MapPin className="size-5.5" />, title: m.feature1Title, body: m.feature1Body },
    { icon: <TrendingUp className="size-5.5" />, title: m.feature2Title, body: m.feature2Body },
    { icon: <Sparkles className="size-5.5" />, title: m.feature3Title, body: m.feature3Body },
    { icon: <Megaphone className="size-5.5" />, title: m.feature4Title, body: m.feature4Body },
    { icon: <Eye className="size-5.5" />, title: m.feature5Title, body: m.feature5Body },
    { icon: <Download className="size-5.5" />, title: m.feature6Title, body: m.feature6Body },
  ];

  const tiers = [
    {
      name: m.tier1Name,
      range: m.tier1Range,
      price: '€ 49',
      features: [m.tier1Feature1, m.tier1Feature2, m.tier1Feature3],
      cta: t.chrome.ctaDemo,
      brand: false,
      perLocation: true,
    },
    {
      name: m.tier2Name,
      range: m.tier2Range,
      price: '€ 39',
      features: [m.tier2Feature1, m.tier2Feature2, m.tier2Feature3, m.tier2Feature4],
      cta: t.chrome.ctaDemo,
      brand: true,
      perLocation: true,
    },
    {
      name: m.tier3Name,
      range: m.tier3Range,
      price: m.pricingOnRequest,
      features: [m.tier3Feature1, m.tier3Feature2, m.tier3Feature3, m.tier3Feature4],
      cta: m.pricingContact,
      brand: false,
      // "per vestiging per maand" under "Op aanvraag" contradicts itself.
      perLocation: false,
    },
  ];

  const faqs = [
    { q: m.faq1Q, a: m.faq1A },
    { q: m.faq2Q, a: m.faq2A },
    { q: m.faq3Q, a: m.faq3A },
    { q: m.faq4Q, a: m.faq4A },
    { q: m.faq5Q, a: m.faq5A },
  ];

  const pills = [m.readinessPill1, m.readinessPill2, m.readinessPill3, m.readinessPill4];

  return (
    <main>
      {/* 3.1 — Hero */}
      <section className="bg-[var(--color-background)] pt-13 pb-7">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="flex flex-col items-start gap-5">
            <Eyebrow>{m.heroEyebrow}</Eyebrow>
            <h1 className="font-display max-w-[40rem] text-4xl leading-tight font-extrabold tracking-tight text-[var(--color-text-primary)] sm:text-5xl">
              {m.heroTitle}
            </h1>
            <p className="max-w-[33.75rem] text-lg leading-relaxed text-[var(--color-text-secondary)]">
              {m.heroBody}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href={DEMO_HREF} className={buttonVariants({ variant: 'primary', size: 'lg' })}>
                {t.chrome.ctaDemo}
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
              <Link
                href="/hoe-het-werkt"
                className={buttonVariants({ variant: 'outline', size: 'lg' })}
              >
                {m.heroCtaSecondary}
              </Link>
            </div>
            <p className="text-sm text-[var(--color-text-secondary)]">{m.heroCaption}</p>
          </div>

          {/* Two stacked previews of the real product, with demonstration data. */}
          <div className="flex flex-col gap-3.5">
            <Card className="shadow-[var(--shadow-md)]">
              <CardBody className="flex flex-col gap-3 p-4.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-display text-[0.9375rem] font-extrabold text-[var(--color-text-primary)]">
                    {m.heroPanelATitle}
                  </p>
                  <ExampleLabel>{t.marketing.changeExample}</ExampleLabel>
                </div>

                <div className="grid gap-2.5 sm:grid-cols-3">
                  <StatCard
                    label={m.heroPanelAStatResponses}
                    value="1.248"
                    delta="+18%"
                    deltaDirection="up"
                    evidence={m.heroPanelAStatResponsesNote}
                  />
                  <StatCard
                    label={m.heroPanelAStatScore}
                    value="4,3"
                    delta="+0,2"
                    deltaDirection="up"
                    evidence={m.heroPanelAStatScoreNote}
                  />
                  <StatCard
                    label={m.heroPanelAStatReady}
                    value="7 / 12"
                    evidence={m.heroPanelAStatReadyNote}
                  />
                </div>

                <Card tone="muted">
                  <CardHeader>
                    <div>
                      <CardTitle className="text-base">{m.heroPanelADistribution}</CardTitle>
                      <CardSubtitle>{m.heroPanelADistributionNote}</CardSubtitle>
                    </div>
                  </CardHeader>
                  <CardBody className="pt-3">
                    <DistributionBars counts={[31, 44, 118, 402, 653]} showLabels={false} />
                  </CardBody>
                </Card>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="flex flex-col gap-3 p-4.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-display text-[0.9375rem] font-extrabold text-[var(--color-text-primary)]">
                    {m.heroPanelBTitle}
                  </p>
                  <StatusBadge status="measured" label={t.improvements.statusMeasured} />
                </div>
                <BeforeAfter
                  label={m.heroPanelBMetric}
                  from={71}
                  to={89}
                  unit="%"
                  progress={89}
                  note={m.heroPanelBMetricNote}
                />
              </CardBody>
            </Card>
          </div>
        </div>
      </section>

      {/* 3.2 — Why individual reviews are not enough */}
      <Section tone="surface">
        <h2 className="font-display text-3xl font-bold tracking-snug text-[var(--color-text-primary)] sm:text-4xl">
          {m.problemTitle}
        </h2>
        <p className="mt-2.5 max-w-3xl text-[1.0625rem] leading-relaxed text-[var(--color-text-secondary)]">
          {m.problemBody}
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {problems.map((item) => (
            <div key={item.title} className="flex flex-col gap-2.5">
              <span aria-hidden="true" className="text-amber-700">
                {item.icon}
              </span>
              <h3 className="font-display text-[0.96875rem] leading-snug font-bold text-[var(--color-text-primary)]">
                {item.title}
              </h3>
              <p className="text-sm leading-snug text-[var(--color-text-secondary)]">{item.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* 3.3 — Scores per location */}
      <Section tone="cream">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-3xl">
            <h2 className="font-display text-3xl font-bold tracking-snug text-[var(--color-text-primary)] sm:text-4xl">
              {m.tableTitle}
            </h2>
            <p className="mt-2.5 text-[1.0625rem] leading-relaxed text-[var(--color-text-secondary)]">
              {m.tableBody}
            </p>
          </div>
          <ExampleLabel>{t.marketing.changeExample}</ExampleLabel>
        </div>

        <Card>
          <CardBody className="px-1.5 pt-1.5 pb-0">
            <DataTable
              columns={columns}
              rows={DEMO_ROWS}
              rowKey={(row) => row.name}
              caption={m.tableTitle}
            />
          </CardBody>
        </Card>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <div>
                <CardTitle className="text-base">{m.tableDistributionTitle}</CardTitle>
                <CardSubtitle>{m.tableDistributionNote}</CardSubtitle>
              </div>
            </CardHeader>
            <CardBody className="pt-3">
              <DistributionBars counts={[24, 31, 96, 214, 145]} />
            </CardBody>
          </Card>

          <Alert tone="neutral" title={m.tableAlertTitle}>
            {m.tableAlertBody}
          </Alert>
        </div>

        <p className="mt-5 max-w-[45rem] text-sm text-[var(--color-text-muted)]">
          {m.tableFootnote}
        </p>
      </Section>

      {/* 3.4 — From feedback to visible result */}
      <Section tone="surface">
        <h2 className="font-display text-3xl font-bold tracking-snug text-[var(--color-text-primary)] sm:text-4xl">
          {m.flowTitle}
        </h2>
        <p className="mt-2.5 max-w-3xl text-[1.0625rem] leading-relaxed text-[var(--color-text-secondary)]">
          {m.flowBody}
        </p>
        <div className="mt-8">
          <StepFlow steps={flow} columns={3} brandLast />
        </div>
      </Section>

      {/* 3.5 — Improve first, then ask. The order is the product's whole claim. */}
      <Section tone="ink">
        <div className="grid items-start gap-12 lg:grid-cols-2">
          <div className="flex flex-col gap-4.5">
            <h2 className="font-display text-3xl font-bold tracking-snug sm:text-4xl">
              {m.readinessTitle}
            </h2>
            <p className="text-[1.03125rem] leading-relaxed text-[var(--color-text-inverse-muted)]">
              {m.readinessBody1}
            </p>
            <p className="text-[1.03125rem] leading-relaxed text-[var(--color-text-inverse-muted)]">
              {m.readinessBody2}
            </p>

            <ol className="flex list-none flex-wrap items-center gap-2">
              {pills.map((pill, index) => (
                <li key={pill} className="flex items-center gap-2">
                  <span
                    className={
                      index === pills.length - 1
                        ? 'rounded-full bg-[var(--color-brand-primary)] px-3.5 py-2 text-sm font-semibold text-ink-900'
                        : 'rounded-full bg-[rgba(253,251,247,.1)] px-3.5 py-2 text-sm font-semibold'
                    }
                  >
                    {pill}
                  </span>
                  {index < pills.length - 1 ? (
                    <ArrowRight
                      aria-hidden="true"
                      className="size-4 text-[var(--color-text-inverse-muted)]"
                    />
                  ) : null}
                </li>
              ))}
            </ol>

            <div className="flex gap-3 rounded-md border border-[var(--color-border-inverse)] px-4 py-3.5">
              <Users aria-hidden="true" className="mt-0.5 size-4.5 shrink-0 text-amber-400" />
              <p className="text-sm leading-snug text-[var(--color-text-inverse-muted)]">
                {m.readinessNote}
              </p>
            </div>
          </div>

          {/* Two light panels lifted out of the dark band. */}
          <div className="flex flex-col gap-4">
            <div className="rounded-xl bg-[var(--color-background)] p-5.5 text-[var(--color-text-primary)] shadow-[var(--shadow-lg)]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-display text-base font-extrabold">{m.readinessPanelTitle}</p>
                <ExampleLabel>{t.marketing.changeExample}</ExampleLabel>
              </div>
              <div className="mt-4">
                <ReadinessMeter
                  progress={75}
                  window={m.readinessWindow}
                  mode={m.readinessMode}
                  criteria={criteria}
                  metLabel={t.readiness.criterionMet}
                  unmetLabel={t.readiness.criterionUnmet}
                />
              </div>
            </div>

            <div className="rounded-xl bg-[var(--color-background)] px-5.5 py-5 text-[var(--color-text-primary)]">
              <p className="font-display text-base font-extrabold">{m.statusPanelTitle}</p>
              <ul className="mt-3 flex list-none flex-col">
                {statusRows.map((row) => (
                  <li
                    key={row.name}
                    className="flex items-center justify-between gap-3 border-b border-[var(--color-border)] py-2.5 last:border-b-0"
                  >
                    <span className="text-[0.90625rem] font-medium">{row.name}</span>
                    <Badge dot tone={row.state === 'active' ? 'success' : 'warning'}>
                      {readyLabels[row.state]}
                    </Badge>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Section>

      {/* 3.6 — What a chain does with it */}
      <Section tone="surface">
        <h2 className="font-display text-3xl font-bold tracking-snug text-[var(--color-text-primary)] sm:text-4xl">
          {m.featuresTitle}
        </h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((item) => (
            <Card key={item.title}>
              <CardBody className="flex flex-col gap-3 p-6">
                <span className="grid size-11 place-items-center rounded-md bg-[var(--color-surface-brand-soft)] text-amber-700">
                  <span aria-hidden="true">{item.icon}</span>
                </span>
                <h3 className="font-display text-lg font-bold text-[var(--color-text-primary)]">
                  {item.title}
                </h3>
                <p className="text-[0.90625rem] leading-relaxed text-[var(--color-text-secondary)]">
                  {item.body}
                </p>
              </CardBody>
            </Card>
          ))}
        </div>
      </Section>

      {/* 3.7 — No customer cases yet, said on the page */}
      <Section tone="cream" tight>
        <Card>
          <CardBody className="grid items-center gap-9 p-9 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="flex flex-col gap-3">
              <Eyebrow>{m.newEyebrow}</Eyebrow>
              <h2 className="font-display text-3xl font-bold tracking-snug text-[var(--color-text-primary)]">
                {m.newTitle}
              </h2>
              <p className="text-[1.0625rem] leading-relaxed text-[var(--color-text-secondary)]">
                {m.newBody1}
              </p>
              <p className="text-[0.9375rem] leading-relaxed text-[var(--color-text-secondary)]">
                {m.newBody2}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 rounded-md border border-[var(--color-border)] px-4 py-3.5">
                <Badge dot tone="success">
                  {m.newRowVerified}
                </Badge>
                <span className="text-sm text-[var(--color-text-secondary)]">
                  {m.newRowVerifiedNote}
                </span>
              </div>
              <div className="flex items-center gap-3 rounded-md border border-[var(--color-border)] px-4 py-3.5">
                <ExampleLabel>{t.marketing.changeExample}</ExampleLabel>
                <span className="text-sm text-[var(--color-text-secondary)]">
                  {m.newRowExampleNote}
                </span>
              </div>
              <div className="flex items-center gap-3 rounded-md border border-[var(--color-border)] px-4 py-3.5">
                <MonitorPlay
                  aria-hidden="true"
                  className="size-4.5 shrink-0 text-[var(--color-text-secondary)]"
                />
                <span className="text-sm text-[var(--color-text-secondary)]">
                  {m.newRowDemoNote}
                </span>
              </div>
            </div>
          </CardBody>
        </Card>
      </Section>

      {/* 3.8 — Pricing. Amounts are placeholders; the ExampleLabel and the
          footnote both go once the tariffs are settled. */}
      <Section tone="surface">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-3xl">
            <h2 className="font-display text-3xl font-bold tracking-snug text-[var(--color-text-primary)] sm:text-4xl">
              {m.pricingTitle}
            </h2>
            <p className="mt-2.5 text-[1.0625rem] leading-relaxed text-[var(--color-text-secondary)]">
              {m.pricingBody}
            </p>
          </div>
          <ExampleLabel>{m.pricingPending}</ExampleLabel>
        </div>

        <div className="grid items-start gap-5 lg:grid-cols-3">
          {tiers.map((tier) => (
            <Card key={tier.name} tone={tier.brand ? 'brand' : 'default'}>
              <CardBody className="flex flex-col gap-4 p-7">
                <div>
                  <p className="font-display text-xl font-bold text-[var(--color-text-primary)]">
                    {tier.name}
                  </p>
                  <p className="mt-0.5 text-sm text-[var(--color-text-secondary)]">{tier.range}</p>
                </div>

                <div>
                  <p className="font-display tabular text-[2.375rem] leading-none font-extrabold tracking-tight text-[var(--color-text-primary)]">
                    {tier.price}
                  </p>
                  {tier.perLocation ? (
                    <p className="mt-1.5 text-sm text-[var(--color-text-secondary)]">
                      {m.pricingPer}
                    </p>
                  ) : null}
                </div>

                <ul className="flex list-none flex-col gap-2.5">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex gap-2.5">
                      <Check
                        aria-hidden="true"
                        className="mt-0.5 size-4 shrink-0 text-[var(--color-success)]"
                      />
                      <span className="text-sm leading-normal text-[var(--color-text-secondary)]">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={DEMO_HREF}
                  className={buttonVariants({
                    variant: tier.brand ? 'primary' : 'outline',
                    block: true,
                  })}
                >
                  {tier.cta}
                </Link>
              </CardBody>
            </Card>
          ))}
        </div>

        <p className="mt-5 text-sm text-[var(--color-text-muted)]">{m.pricingFootnote}</p>
      </Section>

      {/* 3.9 — FAQ */}
      <Section tone="cream" narrow>
        <h2 className="font-display text-3xl font-bold tracking-snug text-[var(--color-text-primary)] sm:text-4xl">
          {m.faqTitle}
        </h2>
        <div className="mt-6">
          <FaqList items={faqs} />
        </div>
      </Section>

      {/* 3.10 — Amber CTA. Ink button on amber: the secondary variant, because
          an amber button on amber would disappear. */}
      <Section tone="cream" tight>
        <div className="flex flex-wrap items-center justify-between gap-8 rounded-xl bg-[var(--color-brand-primary)] px-11 py-10">
          <div className="max-w-[37.5rem] flex-col gap-3">
            <h2 className="font-display text-[2rem] leading-snug font-extrabold tracking-snug text-ink-900">
              {m.ctaTitle}
            </h2>
            <p className="mt-3 text-[1.03125rem] leading-relaxed text-ink-800">{m.ctaBody}</p>
          </div>
          <Link href={DEMO_HREF} className={buttonVariants({ variant: 'secondary', size: 'lg' })}>
            {t.chrome.ctaDemo}
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </Section>
    </main>
  );
}

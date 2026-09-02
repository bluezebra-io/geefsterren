import Link from 'next/link';
import { Database, Hash, ListChecks, ShieldOff, Users } from 'lucide-react';

import { Alert, Card, CardBody } from '@/components/ui';
import { Eyebrow, Section, TransparencyBlock } from '@/components/website';
import {
  LocationDirectory,
  type DirectoryLocation,
} from '@/components/website/location-directory';
import { getMessages } from '@/lib/i18n/locale';

/**
 * Public improvement directory — handoff page 2, `/verbeteringen`.
 *
 * This page is not a ranking and not a review site. Three rules from the design
 * system hold it to that, and all three are product requirements:
 *
 *   1. No star average and no score on the cards.
 *   2. No sort by score — only last-updated or name.
 *   3. A location appears only from 20 responses in the period.
 *
 * The transparency block is on the page rather than in the footer, directly
 * under the data it explains, and it states what GeefSterren does *not* do.
 */
export async function generateMetadata() {
  const t = await getMessages();
  return {
    title: t.improvements.metaTitle,
    description: t.improvements.metaDescription,
  };
}

/**
 * Demonstration data — the shape is final, the content is not.
 *
 * Replace with published locations once Phase 6 exposes them through a public
 * read path; only locations with at least 20 responses in the period may
 * appear. `updatedAt` is ISO so the `recent` sort needs no date parsing, and
 * `date` is the human string beside it.
 *
 * No `href` yet. The handoff has the cards link to `/vestiging/{slug}`, which
 * is a separate surface and out of its scope; until that route exists a link
 * would 404 on click and on Next's prefetch. Add `href` here and the cards
 * become interactive again with no other change.
 */
const DEMO_LOCATIONS: readonly DirectoryLocation[] = [
  {
    name: 'Restaurant De Haven',
    city: 'Leiden',
    category: 'restaurant',
    status: 'measured',
    initials: 'DH',
    topic: 'Restaurant · 84 reacties in 90 dagen',
    change: 'Nieuwe warmhoudverpakking voor bezorging — jan 2027',
    date: 'Laatst bijgewerkt 14 jan 2027',
    updatedAt: '2027-01-14',
    slug: 'restaurant-de-haven-leiden',
  },
  {
    name: 'Pizza Nostra',
    city: 'Rotterdam',
    category: 'delivery',
    status: 'done',
    initials: 'PN',
    topic: 'Bezorging · 212 reacties in 90 dagen',
    change: 'Bezorggebied verkleind op piekmomenten — jan 2027',
    date: 'Laatst bijgewerkt 11 jan 2027',
    updatedAt: '2027-01-11',
    slug: 'pizza-nostra-rotterdam',
  },
  {
    name: 'Bakkerij Van Dijk',
    city: 'Leiden',
    category: 'retail',
    status: 'done',
    initials: 'BD',
    topic: 'Retail · 46 reacties in 90 dagen',
    change: 'Allergeneninformatie op de productkaartjes — jan 2027',
    date: 'Laatst bijgewerkt 8 jan 2027',
    updatedAt: '2027-01-08',
    slug: 'bakkerij-van-dijk-leiden',
  },
  {
    name: 'Sushi Centrum',
    city: 'Den Haag',
    category: 'restaurant',
    status: 'measured',
    initials: 'SC',
    topic: 'Restaurant · 133 reacties in 90 dagen',
    change: 'Extra kassa in het weekend — dec 2026',
    date: 'Laatst bijgewerkt 22 dec 2026',
    updatedAt: '2026-12-22',
    slug: 'sushi-centrum-den-haag',
  },
  {
    name: 'Grillhuis Noord',
    city: 'Zwolle',
    category: 'delivery',
    status: 'measured',
    initials: 'GN',
    topic: 'Bezorging · 98 reacties in 90 dagen',
    change: 'Tweede controle bij het inpakken — dec 2026',
    date: 'Laatst bijgewerkt 19 dec 2026',
    updatedAt: '2026-12-19',
    slug: 'grillhuis-noord-zwolle',
  },
  {
    name: 'Café De Brug',
    city: 'Utrecht',
    category: 'restaurant',
    status: 'progress',
    initials: 'CB',
    topic: 'Restaurant · 61 reacties in 90 dagen',
    change: 'Glutenvrije kaart wordt herzien — dec 2026',
    date: 'Laatst bijgewerkt 15 dec 2026',
    updatedAt: '2026-12-15',
    slug: 'cafe-de-brug-utrecht',
  },
  {
    name: 'Buurtsuper Molenwijk',
    city: 'Amersfoort',
    category: 'retail',
    status: 'done',
    initials: 'BM',
    topic: 'Retail · 74 reacties in 90 dagen',
    change: 'Openingstijden op zaterdag verruimd — dec 2026',
    date: 'Laatst bijgewerkt 9 dec 2026',
    updatedAt: '2026-12-09',
    slug: 'buurtsuper-molenwijk-amersfoort',
  },
  {
    name: 'Wok & Roll',
    city: 'Breda',
    category: 'delivery',
    status: 'progress',
    initials: 'WR',
    topic: 'Bezorging · 120 reacties in 90 dagen',
    change: 'Warmhoudtassen worden vervangen — nov 2026',
    date: 'Laatst bijgewerkt 28 nov 2026',
    updatedAt: '2026-11-28',
    slug: 'wok-en-roll-breda',
  },
];

export default async function ImprovementsPage() {
  const t = await getMessages();
  const m = t.improvements;

  const about = [
    { icon: <Database className="size-4" />, text: m.about1 },
    { icon: <Users className="size-4" />, text: m.about2 },
    { icon: <ListChecks className="size-4" />, text: m.about3 },
    { icon: <ShieldOff className="size-4" />, text: m.about4 },
    { icon: <Hash className="size-4" />, text: m.about5 },
  ];

  return (
    <main>
      {/* 2.1 — Intro */}
      <section className="bg-[var(--color-background)] pt-13 pb-3">
        <div className="mx-auto flex max-w-4xl flex-col gap-4 px-6">
          <Eyebrow>{m.heroEyebrow}</Eyebrow>
          <h1 className="font-display text-4xl leading-tight font-extrabold tracking-tight text-[var(--color-text-primary)] sm:text-[2.875rem]">
            {m.heroTitle}
          </h1>
          <p className="text-lg leading-relaxed text-[var(--color-text-secondary)]">
            {m.heroBody}
          </p>
        </div>
      </section>

      {/* 2.2 — Filter bar and grid */}
      <Section tone="cream" tight>
        <LocationDirectory
          locations={DEMO_LOCATIONS}
          labels={{
            searchLabel: m.searchLabel,
            categoryAll: m.categoryAll,
            categoryDelivery: m.categoryDelivery,
            categoryRestaurant: m.categoryRestaurant,
            categoryRetail: m.categoryRetail,
            sortLabel: m.sortLabel,
            sortRecent: m.sortRecent,
            sortName: m.sortName,
            sortNote: m.sortNote,
            resultCount: m.resultCount,
            emptyTitle: m.emptyTitle,
            emptyBody: m.emptyBody,
            exampleLabel: t.marketing.changeExample,
            statusLabels: {
              progress: m.statusProgress,
              done: m.statusDone,
              measured: m.statusMeasured,
            },
          }}
        />
      </Section>

      {/* 2.3 — About this page */}
      <Section tone="surface" tight>
        <div className="grid items-start gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <TransparencyBlock title={m.aboutTitle} items={about} />

          <div className="flex flex-col gap-5">
            <Alert tone="info" title={m.noRankingTitle}>
              {m.noRankingBody}
            </Alert>

            <Card>
              <CardBody className="flex flex-col gap-3 p-6">
                <h3 className="font-display text-[1.0625rem] font-bold text-[var(--color-text-primary)]">
                  {m.ownFeedbackTitle}
                </h3>
                <p className="text-[0.9375rem] leading-relaxed text-[var(--color-text-secondary)]">
                  {m.ownFeedbackBody}
                </p>
                <Link
                  href="/hoe-het-werkt"
                  className="text-[0.9375rem] font-semibold text-[var(--color-text-link)] underline"
                >
                  {m.ownFeedbackLink}
                </Link>
              </CardBody>
            </Card>
          </div>
        </div>
      </Section>
    </main>
  );
}

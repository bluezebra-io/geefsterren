import Link from 'next/link';
import { notFound } from 'next/navigation';
import { QrCode } from 'lucide-react';

import { buttonVariants } from '@/components/ui/button';

import { EditLocationForm } from '@/components/portal/edit-location-form';
import { Alert, Badge, Card, CardBody, CardHeader, CardTitle, StatCard } from '@/components/ui';
import { QuestionResults, ScoreDistribution } from '@/components/portal/question-results';
import { getLocationMetrics, getQuestionResults, getRecentComments } from '@/features/feedback/queries';
import { getPortalActor } from '@/features/auth/queries';
import { canManageOrganization } from '@/features/auth/service';
import { getLocation } from '@/features/locations/queries';
import { NotFoundError } from '@/lib/errors';
import { getMessages } from '@/lib/i18n/locale';
import type { EntityStatus, Location } from '@/types/domain';

export const metadata = { title: 'Location — GeefSterren' };

export default async function LocationDetailPage({
  params,
}: {
  params: Promise<{ locationId: string }>;
}) {
  const { locationId } = await params;
  const [actor, t] = await Promise.all([getPortalActor(), getMessages()]);
  if (!actor) notFound();

  // RLS makes an inaccessible location indistinguishable from a missing one,
  // which is exactly right: a 404 reveals nothing about whether the id exists
  // inside another tenant.
  let location: Location;
  try {
    location = await getLocation(locationId);
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }

  const canManage = canManageOrganization(actor, location.organization_id);

  const [metrics, questionResults, comments] = await Promise.all([
    getLocationMetrics(locationId),
    getQuestionResults(locationId),
    getRecentComments(locationId),
  ]);

  const nl = (value: number | null, digits = 1) =>
    value === null
      ? '—'
      : value.toLocaleString('nl-NL', { minimumFractionDigits: digits, maximumFractionDigits: digits });
  const statusLabel: Record<EntityStatus, string> = {
    active: t.status.active,
    inactive: t.status.inactive,
    archived: t.status.archived,
  };

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-snug text-[var(--color-text-primary)]">
            {location.name}
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">{location.slug}</p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Badge tone={location.status === 'active' ? 'success' : 'neutral'}>
            {statusLabel[location.status]}
          </Badge>
          <Link
            href={`/app/locations/${locationId}/qr-codes`}
            className={buttonVariants({ variant: 'outline', size: 'sm' })}
          >
            <QrCode aria-hidden="true" className="size-4" />
            {t.qr.title}
          </Link>
        </div>
      </header>

      {/* Four KPI cards at most per row, each with its own evidence line. */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={t.results.statResponses}
          value={metrics.responseCount}
          evidence={t.results.basedOn
            .replace('{answered}', String(metrics.responseCount))
            .replace('{total}', String(metrics.sessionCount))}
        />
        <StatCard label={t.results.statAverage} value={nl(metrics.averageScore)} />
        <StatCard
          label={t.results.statLowScores}
          value={metrics.lowScorePercentage === null ? '—' : `${nl(metrics.lowScorePercentage)}%`}
        />
        <StatCard
          label={t.results.statCompletion}
          value={metrics.completionPercentage === null ? '—' : `${nl(metrics.completionPercentage, 0)}%`}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <ScoreDistribution
          distribution={metrics.distribution}
          total={metrics.responseCount}
          t={t}
        />

        <Card>
          <CardHeader>
            <CardTitle>{t.readiness.title}</CardTitle>
          </CardHeader>
          <CardBody className="space-y-3">
            <p className="text-sm text-[var(--color-text-secondary)]">
              {t.readiness.collectingBody}
            </p>
            {/*
              Required copy. Blue means neutral explanation, never an action —
              and this is an explanation of how the product behaves, not a
              prompt to do anything.
            */}
            <Alert tone="info">{t.readiness.equalTreatment}</Alert>
          </CardBody>
        </Card>
      </div>

      <section>
        <h2 className="font-display text-xl font-bold tracking-snug text-[var(--color-text-primary)]">
          {t.results.title}
        </h2>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{t.results.subtitle}</p>
        <div className="mt-5">
          <QuestionResults
            results={questionResults}
            t={t}
            totalResponses={metrics.responseCount}
          />
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>{t.results.recentComments}</CardTitle>
        </CardHeader>
        <CardBody>
          {comments.length === 0 ? (
            <p className="text-sm text-[var(--color-text-muted)]">{t.results.noComments}</p>
          ) : (
            <ul className="divide-y divide-[var(--color-border)]">
              {comments.map((comment) => (
                <li key={comment.submissionId} className="flex gap-4 py-3">
                  <span className="tabular shrink-0 text-sm font-bold text-[var(--color-text-secondary)]">
                    {comment.score}/5
                  </span>
                  <p className="text-sm text-[var(--color-text-primary)]">{comment.comment}</p>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      {canManage ? (
        <Card>
          <CardHeader>
            <CardTitle>{t.locations.settingsTitle}</CardTitle>
          </CardHeader>
          <CardBody>
            <EditLocationForm location={location} />
          </CardBody>
        </Card>
      ) : null}
    </div>
  );
}

import Link from 'next/link';
import { MapPin } from 'lucide-react';

import { Badge, Card, CardBody, CardHeader, CardTitle, EmptyState, StatCard } from '@/components/ui';
import { getPortalActor } from '@/features/auth/queries';
import { defaultOrganizationId } from '@/features/auth/service';
import { listLocations } from '@/features/locations/queries';
import { getOrganization, getOrganizationSummary } from '@/features/organizations/queries';
import { getMessages } from '@/lib/i18n/locale';
import type { EntityStatus } from '@/types/domain';

export const metadata = { title: 'Overview — GeefSterren' };

export default async function PortalOverviewPage() {
  const [actor, t] = await Promise.all([getPortalActor(), getMessages()]);
  const organizationId = actor ? defaultOrganizationId(actor) : null;

  if (!organizationId) {
    return (
      <EmptyState
        icon={<MapPin aria-hidden="true" className="size-10" />}
        title={t.overview.noOrganization}
        description={t.overview.noOrganizationBody}
      />
    );
  }

  const [organization, summary, locations] = await Promise.all([
    getOrganization(organizationId),
    getOrganizationSummary(organizationId),
    listLocations(organizationId),
  ]);

  const statusLabel: Record<EntityStatus, string> = {
    active: t.status.active,
    inactive: t.status.inactive,
    archived: t.status.archived,
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold tracking-snug text-[var(--color-text-primary)]">
          {organization.name}
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{t.overview.subtitle}</p>
      </header>

      {/* Never more than four KPI cards per row — design system §7. */}
      <div className="grid gap-5 sm:grid-cols-3">
        <StatCard label={t.overview.statLocations} value={summary.locationCount} />
        <StatCard label={t.overview.statActiveLocations} value={summary.activeLocationCount} />
        <StatCard label={t.overview.statMembers} value={summary.memberCount} />
      </div>

      <p className="text-sm text-[var(--color-text-muted)]">{t.overview.metricsPending}</p>

      <Card>
        <CardHeader>
          <CardTitle>{t.overview.locationsTitle}</CardTitle>
          <Link
            href="/app/locations"
            className="text-sm font-semibold text-[var(--color-text-link)] hover:text-[var(--color-text-link-hover)]"
          >
            {t.overview.manage}
          </Link>
        </CardHeader>
        <CardBody>
          {locations.length === 0 ? (
            <EmptyState
              icon={<MapPin aria-hidden="true" className="size-10" />}
              title={t.locations.empty}
              description={t.locations.emptyBody}
            />
          ) : (
            <ul className="divide-y divide-[var(--color-border)]">
              {locations.map((location) => (
                <li key={location.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <Link
                      href={`/app/locations/${location.id}`}
                      className="text-sm font-semibold text-[var(--color-text-primary)] hover:underline"
                    >
                      {location.name}
                    </Link>
                    <p className="truncate text-xs text-[var(--color-text-muted)]">
                      {location.slug} · {location.timezone}
                    </p>
                  </div>
                  <Badge tone={location.status === 'active' ? 'success' : 'neutral'}>
                    {statusLabel[location.status]}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

import Link from 'next/link';
import { MapPin } from 'lucide-react';

import { CreateLocationForm } from '@/components/portal/create-location-form';
import { Badge, Card, CardBody, CardHeader, CardTitle, EmptyState } from '@/components/ui';
import { getPortalContext } from '@/features/auth/organization-context';
import { canManageOrganization } from '@/features/auth/service';
import { listLocations } from '@/features/locations/queries';
import { getMessages } from '@/lib/i18n/locale';
import type { EntityStatus } from '@/types/domain';

export const metadata = { title: 'Locations — GeefSterren' };

const STATUS_TONE: Record<EntityStatus, 'success' | 'warning' | 'neutral'> = {
  active: 'success',
  inactive: 'warning',
  archived: 'neutral',
};

export default async function LocationsPage() {
  const [{ actor, organizationId }, t] = await Promise.all([getPortalContext(), getMessages()]);

  if (!actor || !organizationId) {
    return <EmptyState title={t.overview.noOrganization} />;
  }

  const locations = await listLocations(organizationId);
  const canManage = canManageOrganization(actor, organizationId);

  const statusLabel: Record<EntityStatus, string> = {
    active: t.status.active,
    inactive: t.status.inactive,
    archived: t.status.archived,
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold tracking-snug text-[var(--color-text-primary)]">
          {t.locations.title}
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-[var(--color-text-secondary)]">
          {t.locations.subtitle}
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>{t.locations.allLocations}</CardTitle>
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
                  <Badge tone={STATUS_TONE[location.status]}>{statusLabel[location.status]}</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      {canManage ? (
        <Card>
          <CardHeader>
            <CardTitle>{t.locations.addTitle}</CardTitle>
          </CardHeader>
          <CardBody>
            <CreateLocationForm organizationId={organizationId} />
          </CardBody>
        </Card>
      ) : null}
    </div>
  );
}

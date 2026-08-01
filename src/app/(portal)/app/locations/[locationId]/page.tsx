import { notFound } from 'next/navigation';

import { EditLocationForm } from '@/components/portal/edit-location-form';
import { Alert, Badge, Card, CardBody, CardHeader, CardTitle } from '@/components/ui';
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
        <Badge tone={location.status === 'active' ? 'success' : 'neutral'}>
          {statusLabel[location.status]}
        </Badge>
      </header>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t.locations.feedbackTitle}</CardTitle>
          </CardHeader>
          <CardBody className="text-sm text-[var(--color-text-secondary)]">
            {t.locations.feedbackPending}
          </CardBody>
        </Card>

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

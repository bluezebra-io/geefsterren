import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Megaphone, QrCode } from 'lucide-react';

import { CampaignRow } from '@/components/portal/campaign-row';
import { CreateCampaignForm } from '@/components/portal/create-campaign-form';
import { Alert, Card, CardBody, CardHeader, CardTitle, EmptyState } from '@/components/ui';
import { buttonVariants } from '@/components/ui/button';
import { getPortalActor } from '@/features/auth/queries';
import { canManageOrganization } from '@/features/auth/service';
import { listCampaignsForLocation, listQuestionnaireChoices } from '@/features/campaigns/queries';
import { getLocation } from '@/features/locations/queries';
import { NotFoundError } from '@/lib/errors';
import { getMessages } from '@/lib/i18n/locale';
import type { Location } from '@/types/domain';

export const metadata = { title: 'Campaigns — GeefSterren' };

export default async function CampaignsPage({
  params,
}: {
  params: Promise<{ locationId: string }>;
}) {
  const { locationId } = await params;
  const [actor, t] = await Promise.all([getPortalActor(), getMessages()]);
  if (!actor) notFound();

  let location: Location;
  try {
    location = await getLocation(locationId);
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }

  const [campaigns, questionnaires] = await Promise.all([
    listCampaignsForLocation(locationId),
    listQuestionnaireChoices(location.organization_id, locationId),
  ]);

  const canManage = canManageOrganization(actor, location.organization_id);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-display text-3xl font-bold tracking-snug text-[var(--color-text-primary)]">
            {t.campaigns.title}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-[var(--color-text-secondary)]">
            {t.campaigns.subtitle}
          </p>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">{location.name}</p>
        </div>
        <Link
          href={`/app/locations/${locationId}/qr-codes`}
          className={buttonVariants({ variant: 'outline', size: 'sm' })}
        >
          <QrCode aria-hidden="true" className="size-4" />
          {t.campaigns.manageQr}
        </Link>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>{t.campaigns.listTitle}</CardTitle>
        </CardHeader>
        <CardBody>
          {campaigns.length === 0 ? (
            <EmptyState
              icon={<Megaphone aria-hidden="true" className="size-10" />}
              title={t.campaigns.empty}
              description={t.campaigns.emptyBody}
            />
          ) : (
            <ul className="divide-y divide-[var(--color-border)]">
              {campaigns.map((campaign) => (
                <CampaignRow
                  key={campaign.id}
                  campaign={campaign}
                  locationId={locationId}
                  canManage={canManage}
                />
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      {canManage ? (
        <Card>
          <CardHeader>
            <CardTitle>{t.campaigns.createTitle}</CardTitle>
          </CardHeader>
          <CardBody>
            {questionnaires.length === 0 ? (
              <Alert tone="warning">{t.campaigns.noQuestionnaire}</Alert>
            ) : (
              <CreateCampaignForm locationId={locationId} questionnaires={questionnaires} />
            )}
          </CardBody>
        </Card>
      ) : null}
    </div>
  );
}

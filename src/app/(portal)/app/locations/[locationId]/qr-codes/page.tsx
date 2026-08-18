import { notFound } from 'next/navigation';
import { QrCode } from 'lucide-react';

import { CreateQrCodeForm } from '@/components/portal/create-qr-code-form';
import { QrCodeRow } from '@/components/portal/qr-code-row';
import { Alert, Card, CardBody, CardHeader, CardTitle, EmptyState } from '@/components/ui';
import { getPortalActor } from '@/features/auth/queries';
import { canManageOrganization } from '@/features/auth/service';
import { getLocation } from '@/features/locations/queries';
import { listCampaigns, listQrCodes } from '@/features/qr-codes/queries';
import { NotFoundError } from '@/lib/errors';
import { getMessages } from '@/lib/i18n/locale';
import type { Location } from '@/types/domain';

export const metadata = { title: 'QR codes — GeefSterren' };

export default async function QrCodesPage({
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

  const [codes, campaigns] = await Promise.all([listQrCodes(locationId), listCampaigns(locationId)]);
  const canManage = canManageOrganization(actor, location.organization_id);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold tracking-snug text-[var(--color-text-primary)]">
          {t.qr.title}
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-[var(--color-text-secondary)]">{t.qr.subtitle}</p>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">{location.name}</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>{t.qr.listTitle}</CardTitle>
        </CardHeader>
        <CardBody>
          {codes.length === 0 ? (
            <EmptyState
              icon={<QrCode aria-hidden="true" className="size-10" />}
              title={t.qr.empty}
              description={t.qr.emptyBody}
            />
          ) : (
            <ul className="divide-y divide-[var(--color-border)]">
              {codes.map((code) => (
                <QrCodeRow
                  key={code.id}
                  code={code}
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
            <CardTitle>{t.qr.createTitle}</CardTitle>
          </CardHeader>
          <CardBody>
            {campaigns.length === 0 ? (
              <Alert tone="warning">{t.qr.noCampaign}</Alert>
            ) : (
              <CreateQrCodeForm locationId={locationId} campaigns={campaigns} />
            )}
          </CardBody>
        </Card>
      ) : null}
    </div>
  );
}

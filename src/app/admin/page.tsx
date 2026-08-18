import { Building2 } from 'lucide-react';

import { OpenOrganizationButton } from '@/components/portal/open-organization-button';
import { Alert, Badge, Card, CardBody, CardHeader, CardTitle, EmptyState } from '@/components/ui';
import { readOrganizationCookie } from '@/features/auth/organization-context';
import { getPortalActor } from '@/features/auth/queries';
import { isPlatformAdmin } from '@/features/auth/service';
import { listOrganizationsWithCounts } from '@/features/organizations/queries';
import { getMessages } from '@/lib/i18n/locale';

export const metadata = { title: 'Platform — GeefSterren' };

export default async function PlatformOverviewPage() {
  const [actor, t, organizations, activeId] = await Promise.all([
    getPortalActor(),
    getMessages(),
    listOrganizationsWithCounts(),
    readOrganizationCookie(),
  ]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold tracking-snug text-[var(--color-text-primary)]">
          {t.platform.title}
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{t.platform.subtitle}</p>
      </header>

      {/* Support may look but not change. Saying so up front beats letting them
          discover it through a write that silently affects nothing. */}
      {actor && !isPlatformAdmin(actor) ? (
        <Alert tone="info">{t.platform.readOnlyHint}</Alert>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{t.platform.organizations}</CardTitle>
        </CardHeader>
        <CardBody>
          {organizations.length === 0 ? (
            <EmptyState
              icon={<Building2 aria-hidden="true" className="size-10" />}
              title={t.platform.empty}
            />
          ) : (
            <ul className="divide-y divide-[var(--color-border)]">
              {organizations.map((organization) => (
                <li
                  key={organization.id}
                  className="flex flex-wrap items-center justify-between gap-4 py-4"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-[var(--color-text-primary)]">
                        {organization.name}
                      </p>
                      {organization.id === activeId ? (
                        <Badge tone="brand">{t.platform.current}</Badge>
                      ) : null}
                    </div>
                    <p className="tabular mt-0.5 text-xs text-[var(--color-text-muted)]">
                      {organization.slug} · {organization.locationCount} {t.platform.locations} ·{' '}
                      {organization.memberCount} {t.platform.members}
                    </p>
                  </div>
                  <OpenOrganizationButton
                    organizationId={organization.id}
                    label={t.platform.open}
                  />
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

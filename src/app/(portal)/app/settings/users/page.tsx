import { Users } from 'lucide-react';

import { InviteMemberForm } from '@/components/portal/invite-member-form';
import { MemberRow } from '@/components/portal/member-row';
import { Alert, Card, CardBody, CardHeader, CardTitle, EmptyState } from '@/components/ui';
import { getPortalActor } from '@/features/auth/queries';
import { canManageMembers, defaultOrganizationId } from '@/features/auth/service';
import { listLocations } from '@/features/locations/queries';
import { listOrganizationMembers } from '@/features/memberships/queries';
import { getMessages } from '@/lib/i18n/locale';

export const metadata = { title: 'Users — GeefSterren' };

export default async function UsersPage() {
  const [actor, t] = await Promise.all([getPortalActor(), getMessages()]);
  const organizationId = actor ? defaultOrganizationId(actor) : null;

  if (!actor || !organizationId) {
    return <EmptyState title={t.overview.noOrganization} />;
  }

  const canManage = canManageMembers(actor, organizationId);
  const [members, locations] = await Promise.all([
    listOrganizationMembers(organizationId),
    listLocations(organizationId),
  ]);

  const locationOptions = locations.map((location) => ({ id: location.id, name: location.name }));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold tracking-snug text-[var(--color-text-primary)]">
          {t.users.title}
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-[var(--color-text-secondary)]">
          {t.users.subtitle}
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>{t.users.teamTitle}</CardTitle>
        </CardHeader>
        <CardBody>
          {members.length === 0 ? (
            <EmptyState
              icon={<Users aria-hidden="true" className="size-10" />}
              title={t.users.empty}
            />
          ) : (
            <ul className="divide-y divide-[var(--color-border)]">
              {members.map((member) => (
                <MemberRow
                  key={member.membershipId}
                  member={member}
                  organizationId={organizationId}
                  locations={locationOptions}
                  // You cannot edit or remove your own membership from here.
                  // Doing so is the fastest way to lock yourself out, and the
                  // last-admin database trigger would reject it anyway.
                  canManage={canManage && member.userId !== actor.userId}
                  isSelf={member.userId === actor.userId}
                />
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      {canManage ? (
        <Card>
          <CardHeader>
            <CardTitle>{t.users.inviteTitle}</CardTitle>
          </CardHeader>
          <CardBody>
            <InviteMemberForm organizationId={organizationId} locations={locationOptions} />
          </CardBody>
        </Card>
      ) : (
        <Alert tone="neutral">{t.users.readOnlyNotice}</Alert>
      )}
    </div>
  );
}

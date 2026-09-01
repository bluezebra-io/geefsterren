import Link from 'next/link';
import { MessageSquareQuote } from 'lucide-react';

import { CreateQuestionnaireForm } from '@/components/portal/create-questionnaire-form';
import { NewDraftButton } from '@/components/portal/new-draft-button';
import { Badge, Card, CardBody, CardHeader, CardSubtitle, CardTitle, EmptyState } from '@/components/ui';
import { buttonVariants } from '@/components/ui/button';
import { getPortalContext } from '@/features/auth/organization-context';
import { canManageOrganization } from '@/features/auth/service';
import { listQuestionnaires } from '@/features/questionnaires/queries';
import { getMessages } from '@/lib/i18n/locale';

export const metadata = { title: 'Questionnaires — GeefSterren' };

export default async function QuestionnairesPage() {
  const [{ actor, organizationId }, t] = await Promise.all([getPortalContext(), getMessages()]);

  if (!actor || !organizationId) {
    return <EmptyState title={t.overview.noOrganization} />;
  }

  const [questionnaires, canManage] = await Promise.all([
    listQuestionnaires(organizationId),
    Promise.resolve(canManageOrganization(actor, organizationId)),
  ]);

  const statusLabel = {
    draft: t.questionnaires.statusDraft,
    published: t.questionnaires.statusPublished,
    archived: t.questionnaires.statusArchived,
  } as const;

  const statusTone = { draft: 'warning', published: 'success', archived: 'neutral' } as const;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold tracking-snug text-[var(--color-text-primary)]">
          {t.questionnaires.title}
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-[var(--color-text-secondary)]">
          {t.questionnaires.subtitle}
        </p>
      </header>

      {questionnaires.length === 0 ? (
        <EmptyState
          icon={<MessageSquareQuote aria-hidden="true" className="size-10" />}
          title={t.questionnaires.empty}
          description={t.questionnaires.emptyBody}
        />
      ) : (
        <div className="space-y-5">
          {questionnaires.map((questionnaire) => (
            <Card key={questionnaire.templateId}>
              <CardHeader>
                <div className="min-w-0">
                  <CardTitle>{questionnaire.name}</CardTitle>
                  {questionnaire.description ? (
                    <CardSubtitle>{questionnaire.description}</CardSubtitle>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {/* A platform template is shared and read-only here; an
                      organization copies it into its own draft to change it. */}
                  <Badge tone={questionnaire.organizationId === null ? 'info' : 'neutral'}>
                    {questionnaire.organizationId === null
                      ? t.questionnaires.platformTemplate
                      : t.questionnaires.yours}
                  </Badge>
                  {canManage ? (
                    <NewDraftButton
                      templateId={questionnaire.templateId}
                      organizationId={organizationId}
                      label={t.questionnaires.newDraft}
                    />
                  ) : null}
                </div>
              </CardHeader>

              <CardBody>
                <ul className="divide-y divide-[var(--color-border)]">
                  {questionnaire.versions.map((version) => (
                    <li
                      key={version.id}
                      className="flex flex-wrap items-center justify-between gap-3 py-3"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                            {t.questionnaires.version.replace(
                              '{number}',
                              String(version.versionNumber),
                            )}
                          </span>
                          <Badge tone={statusTone[version.status]}>
                            {statusLabel[version.status]}
                          </Badge>
                        </div>
                        <p className="tabular mt-0.5 text-xs text-[var(--color-text-muted)]">
                          {t.questionnaires.questionCount.replace(
                            '{count}',
                            String(version.questionCount),
                          )}{' '}
                          ·{' '}
                          {version.assignedOrgWide
                            ? t.questionnaires.assignedAll
                            : version.assignedLocationCount > 0
                              ? t.questionnaires.assignedSelected.replace(
                                  '{count}',
                                  String(version.assignedLocationCount),
                                )
                              : t.questionnaires.assignedNone}
                        </p>
                      </div>

                      <Link
                        href={`/app/questionnaires/${version.id}`}
                        className={buttonVariants({ variant: 'outline', size: 'sm' })}
                      >
                        {t.questionnaires.open}
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {canManage ? (
        <Card>
          <CardHeader>
            <CardTitle>{t.questionnaires.createTitle}</CardTitle>
          </CardHeader>
          <CardBody>
            <CreateQuestionnaireForm organizationId={organizationId} />
          </CardBody>
        </Card>
      ) : null}
    </div>
  );
}

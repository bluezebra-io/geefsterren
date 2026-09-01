import Link from 'next/link';
import { notFound } from 'next/navigation';

import { AddQuestionForm } from '@/components/portal/add-question-form';
import { AssignQuestionnaireForm } from '@/components/portal/assign-questionnaire-form';
import { PublishVersionButton } from '@/components/portal/publish-version-button';
import { QuestionList } from '@/components/portal/question-list';
import { Alert, Badge, Card, CardBody, CardHeader, CardTitle, EmptyState } from '@/components/ui';
import { getPortalContext } from '@/features/auth/organization-context';
import { canManageOrganization } from '@/features/auth/service';
import { listLocations } from '@/features/locations/queries';
import { getQuestionnaireVersion } from '@/features/questionnaires/queries';
import { NotFoundError } from '@/lib/errors';
import { getMessages } from '@/lib/i18n/locale';

export const metadata = { title: 'Questionnaire — GeefSterren' };

export default async function QuestionnaireVersionPage({
  params,
}: {
  params: Promise<{ versionId: string }>;
}) {
  const { versionId } = await params;
  const [{ actor, organizationId }, t] = await Promise.all([getPortalContext(), getMessages()]);

  if (!actor || !organizationId) return <EmptyState title={t.overview.noOrganization} />;

  let version;
  try {
    version = await getQuestionnaireVersion(versionId, organizationId);
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }

  const locations = await listLocations(organizationId);

  // A platform template belongs to nobody in particular, so it is read-only here
  // however senior the operator is; the way to change it is a own draft.
  const isPlatformTemplate = version.organizationId === null;
  const isDraft = version.status === 'draft';
  const canEdit = canManageOrganization(actor, organizationId) && isDraft && !isPlatformTemplate;
  const canAssign = canManageOrganization(actor, organizationId) && version.status === 'published';

  const statusLabel = {
    draft: t.questionnaires.statusDraft,
    published: t.questionnaires.statusPublished,
    archived: t.questionnaires.statusArchived,
  } as const;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <Link
            href="/app/questionnaires"
            className="text-sm font-semibold text-[var(--color-text-link)] hover:text-[var(--color-text-link-hover)]"
          >
            {t.questionnaires.title}
          </Link>
          <h1 className="font-display mt-1 text-3xl font-bold tracking-snug text-[var(--color-text-primary)]">
            {version.templateName}
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            {t.questionnaires.version.replace('{number}', String(version.versionNumber))}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Badge tone={isDraft ? 'warning' : version.status === 'published' ? 'success' : 'neutral'}>
            {statusLabel[version.status]}
          </Badge>
          {canEdit && version.questions.length > 0 ? (
            <PublishVersionButton versionId={version.versionId} />
          ) : null}
        </div>
      </header>

      {isPlatformTemplate ? <Alert tone="info">{t.questionnaires.platformNotice}</Alert> : null}
      {!isDraft && !isPlatformTemplate ? (
        <Alert tone="neutral">{t.questionnaires.publishedNotice}</Alert>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{t.questionnaires.editTitle}</CardTitle>
        </CardHeader>
        <CardBody>
          {version.questions.length === 0 ? (
            <EmptyState
              title={t.questionnaires.noQuestions}
              description={t.questionnaires.noQuestionsBody}
            />
          ) : (
            <QuestionList
              versionId={version.versionId}
              questions={version.questions}
              canEdit={canEdit}
            />
          )}
        </CardBody>
      </Card>

      {canEdit ? (
        <Card>
          <CardHeader>
            <CardTitle>{t.questionnaires.addQuestion}</CardTitle>
          </CardHeader>
          <CardBody>
            <AddQuestionForm versionId={version.versionId} />
          </CardBody>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{t.questionnaires.assignTitle}</CardTitle>
        </CardHeader>
        <CardBody>
          {version.status !== 'published' ? (
            <Alert tone="warning">{t.questionnaires.assignPublishFirst}</Alert>
          ) : (
            <AssignQuestionnaireForm
              versionId={version.versionId}
              organizationId={organizationId}
              locations={locations.map((location) => ({ id: location.id, name: location.name }))}
              current={version.assignment}
              canAssign={canAssign}
            />
          )}
        </CardBody>
      </Card>
    </div>
  );
}

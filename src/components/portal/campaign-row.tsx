'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

import { Badge, FormError } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { setCampaignStatusAction } from '@/features/campaigns/actions';
import type { CampaignRow as CampaignRowData } from '@/features/campaigns/queries';
import { usePortalMessages } from '@/lib/i18n/provider';
import type { ActionResult } from '@/types/domain';

function StatusButton({
  label,
  variant = 'outline',
}: {
  label: string;
  variant?: 'outline' | 'ghost';
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant={variant} size="sm" loading={pending}>
      {label}
    </Button>
  );
}

export function CampaignRow({
  campaign,
  locationId,
  canManage,
}: {
  campaign: CampaignRowData;
  locationId: string;
  canManage: boolean;
}) {
  const t = usePortalMessages();
  const [state, setStatus] = useActionState<ActionResult<void> | null, FormData>(
    setCampaignStatusAction,
    null,
  );

  const statusLabel = {
    draft: t.campaigns.statusDraft,
    active: t.campaigns.statusActive,
    paused: t.campaigns.statusPaused,
    completed: t.campaigns.statusCompleted,
    archived: t.campaigns.statusArchived,
  } as const;

  const statusTone = {
    draft: 'warning',
    active: 'success',
    paused: 'neutral',
    completed: 'info',
    archived: 'neutral',
  } as const;

  // Only the transitions that make sense from here: a completed campaign is
  // finished, and offering "activate" on it would invite reopening history.
  const canActivate = campaign.status === 'draft' || campaign.status === 'paused';
  const canPause = campaign.status === 'active';
  const canComplete = campaign.status === 'active' || campaign.status === 'paused';

  return (
    <li className="py-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-[var(--color-text-primary)]">{campaign.name}</p>
            <Badge tone={statusTone[campaign.status]}>{statusLabel[campaign.status]}</Badge>
          </div>
          <p className="tabular mt-1 text-xs text-[var(--color-text-muted)]">
            {campaign.questionnaireName} · v{campaign.questionnaireVersion} ·{' '}
            {t.campaigns.qrCodes.replace('{count}', String(campaign.qrCodeCount))} ·{' '}
            {t.campaigns.responses.replace('{count}', String(campaign.submissionCount))}
          </p>
        </div>

        {canManage ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {canActivate ? (
              <form action={setStatus}>
                <input type="hidden" name="campaignId" value={campaign.id} />
                <input type="hidden" name="locationId" value={locationId} />
                <input type="hidden" name="status" value="active" />
                <StatusButton label={t.campaigns.activate} />
              </form>
            ) : null}
            {canPause ? (
              <form action={setStatus}>
                <input type="hidden" name="campaignId" value={campaign.id} />
                <input type="hidden" name="locationId" value={locationId} />
                <input type="hidden" name="status" value="paused" />
                <StatusButton label={t.campaigns.pause} variant="ghost" />
              </form>
            ) : null}
            {canComplete ? (
              <form action={setStatus}>
                <input type="hidden" name="campaignId" value={campaign.id} />
                <input type="hidden" name="locationId" value={locationId} />
                <input type="hidden" name="status" value="completed" />
                <StatusButton label={t.campaigns.complete} variant="ghost" />
              </form>
            ) : null}
          </div>
        ) : null}
      </div>

      {campaign.status === 'paused' ? (
        <p className="mt-2 text-xs text-[var(--color-text-muted)]">{t.campaigns.pausedHint}</p>
      ) : null}

      {state && !state.ok ? (
        <div className="mt-3">
          <FormError message={state.error} />
        </div>
      ) : null}
    </li>
  );
}

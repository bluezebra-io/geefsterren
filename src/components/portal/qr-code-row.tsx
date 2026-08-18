'use client';

import { Download, RefreshCw } from 'lucide-react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

import { Badge, FormError } from '@/components/ui';
import { Button, buttonVariants } from '@/components/ui/button';
import { rotateQrCodeAction, type CreatedQrCode } from '@/features/qr-codes/actions';
import type { QrCodeRow as QrCodeRowData } from '@/features/qr-codes/queries';
import { usePortalMessages } from '@/lib/i18n/provider';
import type { ActionResult } from '@/types/domain';

import { QrSecrets } from './qr-secrets';

function RotateButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="ghost" size="sm" loading={pending}>
      {pending ? null : <RefreshCw aria-hidden="true" className="size-4" />}
      {label}
    </Button>
  );
}

export function QrCodeRow({
  code,
  locationId,
  canManage,
}: {
  code: QrCodeRowData;
  locationId: string;
  canManage: boolean;
}) {
  const t = usePortalMessages();
  const [state, rotate] = useActionState<ActionResult<CreatedQrCode> | null, FormData>(
    rotateQrCodeAction,
    null,
  );

  const channelLabels: Record<string, string> = {
    packaging: t.qr.channelPackaging,
    flyer: t.qr.channelFlyer,
    receipt: t.qr.channelReceipt,
    counter: t.qr.channelCounter,
    table: t.qr.channelTable,
    email: t.qr.channelEmail,
    other: t.qr.channelOther,
  };

  const downloadBase = `/api/portal/qr-codes/${code.id}/download`;

  // A successful reissue makes the token recoverable right away, so the links
  // appear without waiting for the page data to be refetched.
  const canDownload = code.canDownload || state?.ok === true;

  return (
    <li className="py-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-[var(--color-text-primary)]">
              {code.label ?? channelLabels[code.sourceChannel] ?? code.sourceChannel}
            </p>
            <Badge tone={code.status === 'active' ? 'success' : 'neutral'}>
              {code.status === 'active' ? t.status.active : t.status.inactive}
            </Badge>
            <Badge tone="neutral">{channelLabels[code.sourceChannel] ?? code.sourceChannel}</Badge>
          </div>
          <p className="tabular mt-1 text-xs text-[var(--color-text-muted)]">
            {code.campaignName} · {code.scanCount} {t.qr.scans} · {code.sessionCount}{' '}
            {t.qr.started} · {code.submissionCount} {t.qr.completed}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {/*
            Plain links, not fetch: the browser's own download handling takes the
            filename from Content-Disposition and streams straight to disk.
            Hidden entirely when the token cannot be recovered — a button that
            always fails is worse than no button.
          */}
          {canDownload ? (
            <>
              <a
                href={`${downloadBase}?format=svg`}
                className={buttonVariants({ variant: 'outline', size: 'sm' })}
              >
                <Download aria-hidden="true" className="size-4" />
                {t.qr.downloadSvg}
              </a>
              <a
                href={`${downloadBase}?format=png`}
                className={buttonVariants({ variant: 'outline', size: 'sm' })}
              >
                <Download aria-hidden="true" className="size-4" />
                {t.qr.downloadPng}
              </a>
            </>
          ) : null}
          {canManage ? (
            <form action={rotate}>
              <input type="hidden" name="qrCodeId" value={code.id} />
              <input type="hidden" name="locationId" value={locationId} />
              <RotateButton label={t.qr.reissue} />
            </form>
          ) : null}
        </div>
      </div>

      {!canDownload ? (
        <p className="mt-2 text-xs text-[var(--color-text-muted)]">{t.qr.reissueHint}</p>
      ) : null}

      {state && !state.ok ? (
        <div className="mt-3">
          <FormError message={state.error} />
        </div>
      ) : null}

      {state?.ok ? (
        <div className="mt-3">
          <QrSecrets created={state.data} />
        </div>
      ) : null}
    </li>
  );
}

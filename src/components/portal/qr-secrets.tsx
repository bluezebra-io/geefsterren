'use client';

import { Alert } from '@/components/ui';
import type { CreatedQrCode } from '@/features/qr-codes/actions';
import { usePortalMessages } from '@/lib/i18n/provider';

/**
 * The one moment a QR's secrets are visible.
 *
 * Both values are stored hashed (for lookup) and encrypted (for reprinting), so
 * this panel is the only place the plain text appears in the portal. The copy
 * says so, because someone who assumes they can come back for it later will
 * print the wrong thing.
 */
export function QrSecrets({ created }: { created: CreatedQrCode }) {
  const t = usePortalMessages();

  return (
    <Alert tone="success" title={t.qr.createdTitle}>
      <p className="mb-3">{t.qr.createdBody}</p>

      <dl className="space-y-2">
        <div>
          <dt className="text-xs font-semibold tracking-widest uppercase">{t.qr.tokenLabel}</dt>
          <dd className="mt-0.5 font-mono text-sm break-all">{created.url}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold tracking-widest uppercase">{t.qr.codeLabel}</dt>
          <dd className="mt-0.5 font-mono text-lg font-bold tracking-[0.16em]">
            {created.feedbackCode}
          </dd>
        </div>
      </dl>
    </Alert>
  );
}

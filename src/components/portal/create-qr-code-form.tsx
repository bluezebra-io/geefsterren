'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

import { FieldError, FormError, Input, Label, Select } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { createQrCodeAction, type CreatedQrCode } from '@/features/qr-codes/actions';
import type { CampaignOption } from '@/features/qr-codes/queries';
import { usePortalMessages } from '@/lib/i18n/provider';
import type { ActionResult } from '@/types/domain';

import { QrSecrets } from './qr-secrets';

function SubmitButton() {
  const { pending } = useFormStatus();
  const t = usePortalMessages();
  return (
    <Button type="submit" loading={pending}>
      {pending ? t.qr.creating : t.qr.create}
    </Button>
  );
}

export function CreateQrCodeForm({
  locationId,
  campaigns,
}: {
  locationId: string;
  campaigns: CampaignOption[];
}) {
  const t = usePortalMessages();
  const [state, formAction] = useActionState<ActionResult<CreatedQrCode> | null, FormData>(
    createQrCodeAction,
    null,
  );

  const fieldErrors = state && !state.ok ? state.fieldErrors : undefined;

  const channels = [
    ['packaging', t.qr.channelPackaging],
    ['flyer', t.qr.channelFlyer],
    ['receipt', t.qr.channelReceipt],
    ['counter', t.qr.channelCounter],
    ['table', t.qr.channelTable],
    ['email', t.qr.channelEmail],
    ['other', t.qr.channelOther],
  ] as const;

  return (
    <div className="space-y-5">
      {state?.ok ? <QrSecrets created={state.data} /> : null}

      <form action={formAction} className="space-y-5">
        <input type="hidden" name="locationId" value={locationId} />
        <FormError message={state && !state.ok ? state.error : undefined} />

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="campaignId">{t.qr.campaign}</Label>
            <Select id="campaignId" name="campaignId" required className="mt-2">
              {campaigns.map((campaign) => (
                <option key={campaign.id} value={campaign.id}>
                  {campaign.name}
                </option>
              ))}
            </Select>
            <FieldError messages={fieldErrors?.campaignId} />
          </div>

          <div>
            <Label htmlFor="sourceChannel">{t.qr.sourceChannel}</Label>
            <Select id="sourceChannel" name="sourceChannel" defaultValue="packaging" className="mt-2">
              {channels.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
            <FieldError messages={fieldErrors?.sourceChannel} />
          </div>
        </div>

        <div>
          <Label htmlFor="label">{t.qr.label}</Label>
          <Input id="label" name="label" maxLength={200} className="mt-2" aria-describedby="label-help" />
          <p id="label-help" className="mt-1.5 text-sm text-[var(--color-text-secondary)]">
            {t.qr.labelHelp}
          </p>
          <FieldError messages={fieldErrors?.label} />
        </div>

        <SubmitButton />
      </form>
    </div>
  );
}

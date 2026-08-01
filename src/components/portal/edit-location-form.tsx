'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

import { FieldError, FormError, FormSuccess, Input, Label, Select } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { updateLocationAction } from '@/features/locations/actions';
import { useMessages } from '@/lib/i18n/provider';
import type { ActionResult, Location } from '@/types/domain';

function SubmitButton() {
  const { pending } = useFormStatus();
  const t = useMessages();
  return (
    <Button type="submit" loading={pending}>
      {pending ? t.common.saving : t.common.save}
    </Button>
  );
}

type AddressJson = { street?: string; postal_code?: string; city?: string; country?: string };

export function EditLocationForm({ location }: { location: Location }) {
  const t = useMessages();
  const [state, formAction] = useActionState<ActionResult<void> | null, FormData>(
    updateLocationAction,
    null,
  );

  const address = (location.address_json ?? {}) as AddressJson;
  const fieldErrors = state && !state.ok ? state.fieldErrors : undefined;

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="locationId" value={location.id} />

      <FormError message={state && !state.ok ? state.error : undefined} />
      <FormSuccess message={state?.ok ? t.common.saved : undefined} />

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">{t.locations.name}</Label>
          <Input
            id="name"
            name="name"
            defaultValue={location.name}
            required
            maxLength={200}
            className="mt-2"
          />
          <FieldError messages={fieldErrors?.name} />
        </div>

        <div>
          <Label htmlFor="status">{t.users.memberStatus}</Label>
          <Select id="status" name="status" defaultValue={location.status} className="mt-2">
            <option value="active">{t.status.active}</option>
            <option value="inactive">{t.status.inactive}</option>
            <option value="archived">{t.status.archived}</option>
          </Select>
          <FieldError messages={fieldErrors?.status} />
        </div>

        <div>
          <Label htmlFor="timezone">{t.locations.timezone}</Label>
          <Input
            id="timezone"
            name="timezone"
            defaultValue={location.timezone}
            required
            maxLength={64}
            className="mt-2"
          />
          <FieldError messages={fieldErrors?.timezone} />
        </div>

        <div>
          <Label htmlFor="externalReference">{t.locations.externalReference}</Label>
          <Input
            id="externalReference"
            name="externalReference"
            defaultValue={location.external_reference ?? ''}
            maxLength={200}
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="street">{t.locations.street}</Label>
          <Input
            id="street"
            name="street"
            defaultValue={address.street ?? ''}
            maxLength={200}
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="city">{t.locations.city}</Label>
          <Input
            id="city"
            name="city"
            defaultValue={address.city ?? ''}
            maxLength={120}
            className="mt-2"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="googleReviewUrl">{t.locations.googleReviewUrl}</Label>
        <Input
          id="googleReviewUrl"
          name="googleReviewUrl"
          type="url"
          defaultValue={location.google_review_url ?? ''}
          className="mt-2"
          aria-describedby="google-help"
        />
        <p id="google-help" className="mt-1.5 text-sm text-[var(--color-text-secondary)]">
          {t.locations.googleReviewUrlHelp}
        </p>
        <FieldError messages={fieldErrors?.googleReviewUrl} />
      </div>

      <SubmitButton />
    </form>
  );
}

'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';

import { FieldError, FormError, Input, Label } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { createLocationAction } from '@/features/locations/actions';
import { useMessages } from '@/lib/i18n/provider';
import { slugify } from '@/lib/validation/slug';
import type { ActionResult } from '@/types/domain';

function SubmitButton() {
  const { pending } = useFormStatus();
  const t = useMessages();
  return (
    <Button type="submit" loading={pending}>
      {pending ? t.locations.adding : t.locations.addAction}
    </Button>
  );
}

export function CreateLocationForm({ organizationId }: { organizationId: string }) {
  const t = useMessages();
  const [state, formAction] = useActionState<ActionResult<{ locationId: string }> | null, FormData>(
    createLocationAction,
    null,
  );

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);

  // The slug follows the name until the user takes it over. Overwriting a
  // hand-edited slug on the next keystroke feels broken every single time.
  const effectiveSlug = slugEdited ? slug : slugify(name);
  const fieldErrors = state && !state.ok ? state.fieldErrors : undefined;

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="organizationId" value={organizationId} />
      <FormError message={state && !state.ok ? state.error : undefined} />

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">{t.locations.name}</Label>
          <Input
            id="name"
            name="name"
            required
            maxLength={200}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Restaurant Leiden"
            className="mt-2"
            aria-invalid={fieldErrors?.name ? true : undefined}
            aria-describedby={fieldErrors?.name ? 'name-error' : undefined}
          />
          <FieldError id="name-error" messages={fieldErrors?.name} />
        </div>

        <div>
          <Label htmlFor="slug">{t.locations.slug}</Label>
          <Input
            id="slug"
            name="slug"
            required
            maxLength={64}
            value={effectiveSlug}
            onChange={(event) => {
              setSlugEdited(true);
              setSlug(event.target.value);
            }}
            placeholder="restaurant-leiden"
            className="mt-2"
            aria-invalid={fieldErrors?.slug ? true : undefined}
            aria-describedby={fieldErrors?.slug ? 'slug-error' : 'slug-help'}
          />
          <p id="slug-help" className="mt-1.5 text-sm text-[var(--color-text-secondary)]">
            {t.locations.slugHelp}
          </p>
          <FieldError id="slug-error" messages={fieldErrors?.slug} />
        </div>

        <div>
          <Label htmlFor="timezone">{t.locations.timezone}</Label>
          <Input
            id="timezone"
            name="timezone"
            defaultValue="Europe/Amsterdam"
            maxLength={64}
            className="mt-2"
          />
          <FieldError messages={fieldErrors?.timezone} />
        </div>

        <div>
          <Label htmlFor="city">{t.locations.city}</Label>
          <Input id="city" name="city" maxLength={120} className="mt-2" />
        </div>
      </div>

      <div>
        <Label htmlFor="googleReviewUrl">{t.locations.googleReviewUrl}</Label>
        <Input
          id="googleReviewUrl"
          name="googleReviewUrl"
          type="url"
          placeholder="https://g.page/r/…"
          className="mt-2"
          aria-invalid={fieldErrors?.googleReviewUrl ? true : undefined}
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

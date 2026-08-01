import { z } from 'zod';

import { SLUG_MAX_LENGTH, SLUG_MIN_LENGTH, SLUG_PATTERN } from '@/lib/validation/slug';

const slugField = z
  .string()
  .trim()
  .min(SLUG_MIN_LENGTH, 'Slug is too short')
  .max(SLUG_MAX_LENGTH, 'Slug is too long')
  .regex(SLUG_PATTERN, 'Use lowercase letters, numbers and single hyphens');

const addressSchema = z.object({
  street: z.string().trim().max(200).optional(),
  postal_code: z.string().trim().max(20).optional(),
  city: z.string().trim().max(120).optional(),
  country: z.string().trim().max(2).optional(),
});

/**
 * The Google review URL is only validated for shape here — that it is HTTPS and plausibly Google.
 * We deliberately do not try to verify that the place exists: a failing lookup would block a
 * legitimate configuration change for reasons outside the customer's control.
 */
const googleReviewUrlField = z
  .url('Enter a valid URL')
  .max(2000)
  .refine((value) => value.startsWith('https://'), { message: 'The URL must use https://' })
  .refine(
    (value) => {
      try {
        const host = new URL(value).hostname.toLowerCase();
        return host.endsWith('google.com') || host.endsWith('goo.gl') || host.endsWith('app.goo.gl');
      } catch {
        return false;
      }
    },
    { message: 'Enter a Google review link' },
  );

export const createLocationSchema = z.object({
  organizationId: z.uuid(),
  name: z.string().trim().min(1, 'Enter a name').max(200, 'Name is too long'),
  slug: slugField,
  timezone: z.string().trim().min(1).max(64).default('Europe/Amsterdam'),
  address: addressSchema.optional(),
  googleReviewUrl: z.union([googleReviewUrlField, z.literal('')]).optional(),
  externalReference: z.string().trim().max(200).optional(),
});

export type CreateLocationInput = z.infer<typeof createLocationSchema>;

export const updateLocationSchema = z.object({
  locationId: z.uuid(),
  name: z.string().trim().min(1, 'Enter a name').max(200, 'Name is too long'),
  timezone: z.string().trim().min(1).max(64),
  status: z.enum(['active', 'inactive', 'archived']),
  address: addressSchema.optional(),
  googleReviewUrl: z.union([googleReviewUrlField, z.literal('')]).optional(),
  externalReference: z.string().trim().max(200).optional(),
});

export type UpdateLocationInput = z.infer<typeof updateLocationSchema>;

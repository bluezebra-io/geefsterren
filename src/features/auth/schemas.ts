import { z } from 'zod';

export const signInSchema = z.object({
  email: z.email('Enter a valid email address').max(320).transform((value) => value.trim().toLowerCase()),
  next: z.string().max(500).optional(),
});

export type SignInInput = z.infer<typeof signInSchema>;

export const updateProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, 'Enter your name')
    .max(200, 'Name is too long'),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

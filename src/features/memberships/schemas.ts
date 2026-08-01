import { z } from 'zod';

export const inviteMemberSchema = z.object({
  organizationId: z.uuid(),
  email: z
    .email('Enter a valid email address')
    .max(320)
    .transform((value) => value.trim().toLowerCase()),
  role: z.enum(['org_admin', 'location_manager', 'viewer']),
  /** Location assignments. Ignored for org_admin, who reaches every location by role. */
  locationIds: z.array(z.uuid()).max(200).default([]),
  fullName: z.string().trim().max(200).optional(),
});

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;

export const updateMembershipSchema = z.object({
  membershipId: z.uuid(),
  role: z.enum(['org_admin', 'location_manager', 'viewer']),
  status: z.enum(['invited', 'active', 'suspended']),
});

export type UpdateMembershipInput = z.infer<typeof updateMembershipSchema>;

export const setLocationAssignmentsSchema = z.object({
  organizationId: z.uuid(),
  userId: z.uuid(),
  role: z.enum(['location_manager', 'viewer']),
  locationIds: z.array(z.uuid()).max(200),
});

export type SetLocationAssignmentsInput = z.infer<typeof setLocationAssignmentsSchema>;

export const removeMembershipSchema = z.object({
  membershipId: z.uuid(),
});

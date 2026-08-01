import type { Database } from './database.generated';

/**
 * Domain-level aliases over the generated database types.
 *
 * Application code should import from here rather than reaching into `database.generated.ts`
 * directly, so a schema regeneration surfaces as type errors in one place.
 */

type Tables = Database['public']['Tables'];
type Enums = Database['public']['Enums'];

export type PlatformRole = Enums['platform_role'];
export type OrganizationRole = Enums['organization_role'];
export type LocationRole = Enums['location_role'];
export type MembershipStatus = Enums['membership_status'];
export type EntityStatus = Enums['entity_status'];

export type Organization = Tables['organizations']['Row'];
export type OrganizationInsert = Tables['organizations']['Insert'];
export type OrganizationUpdate = Tables['organizations']['Update'];

export type Location = Tables['locations']['Row'];
export type LocationInsert = Tables['locations']['Insert'];
export type LocationUpdate = Tables['locations']['Update'];

export type Profile = Tables['profiles']['Row'];
export type OrganizationMembership = Tables['organization_memberships']['Row'];
export type LocationMembership = Tables['location_memberships']['Row'];
export type AuditLog = Tables['audit_logs']['Row'];

/**
 * The authenticated caller's identity and authority, resolved once per request.
 *
 * Carrying resolved roles rather than re-querying at each call site keeps authorization decisions
 * consistent within a single render.
 */
export type PortalActor = {
  userId: string;
  email: string | null;
  fullName: string | null;
  platformRole: PlatformRole;
  organizations: ActorOrganization[];
};

export type ActorOrganization = {
  organizationId: string;
  name: string;
  slug: string;
  role: OrganizationRole;
  status: MembershipStatus;
};

/**
 * Result type for Server Actions.
 *
 * Actions return this instead of throwing so a form can render a field-level error. Unexpected
 * failures still throw — this models *expected* rejections such as validation or authorization,
 * not bugs.
 */
export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export function actionOk(): ActionResult<void>;
export function actionOk<T>(data: T): ActionResult<T>;
export function actionOk<T>(data?: T): ActionResult<T | undefined> {
  return { ok: true, data };
}

export function actionError<T = never>(
  error: string,
  fieldErrors?: Record<string, string[]>,
): ActionResult<T> {
  return { ok: false, error, fieldErrors };
}

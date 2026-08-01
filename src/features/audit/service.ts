import 'server-only';

import { describeError, logger } from '@/lib/observability/logger';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Json } from '@/types/database.generated';

export type AuditLogInput = {
  action: string;
  entityType: string;
  entityId?: string | null;
  organizationId?: string | null;
  locationId?: string | null;
  before?: unknown;
  after?: unknown;
  metadata?: Record<string, unknown>;
};

/**
 * Writes an audit entry through `app.write_audit_log()`.
 *
 * The actor and actor type are derived inside the function from the caller's real session, not
 * passed in, so an action cannot be attributed to someone else or labelled 'system'.
 */
export async function writeAuditLog(input: AuditLogInput): Promise<void> {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.rpc('write_audit_log', {
    p_action: input.action,
    p_entity_type: input.entityType,
    p_entity_id: input.entityId ?? undefined,
    p_organization_id: input.organizationId ?? undefined,
    p_location_id: input.locationId ?? undefined,
    p_before_json: (input.before ?? null) as Json,
    p_after_json: (input.after ?? null) as Json,
    p_metadata_json: (input.metadata ?? {}) as Json,
  });

  if (error) {
    // A failed audit write must not roll back the action the user just performed — but it must be
    // loud, because a silent gap in the audit trail is exactly what an audit trail is for.
    logger.error('audit log write failed', {
      action: input.action,
      entity_type: input.entityType,
      organization_id: input.organizationId ?? undefined,
      location_id: input.locationId ?? undefined,
      ...describeError(error),
    });
  }
}

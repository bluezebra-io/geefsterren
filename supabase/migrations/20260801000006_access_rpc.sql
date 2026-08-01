-- Thin public wrappers over the location access predicates.
--
-- The application sometimes needs to ask "may this user manage this location?" *before* attempting
-- a write, so it can return a proper 403 instead of a confusing empty result. Re-implementing the
-- rule in TypeScript would create a second source of truth that drifts from the RLS policies.
-- These wrappers let the application call the exact same predicate the policies use.
--
-- SECURITY INVOKER on purpose: the wrapper adds no privilege of its own, it only forwards to the
-- hardened SECURITY DEFINER helper in the `app` schema.

create or replace function public.can_access_location(p_location_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = pg_catalog, public
as $$
  select app.can_access_location(p_location_id);
$$;

create or replace function public.can_manage_location(p_location_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = pg_catalog, public
as $$
  select app.can_manage_location(p_location_id);
$$;

revoke all on function public.can_access_location(uuid) from public, anon;
revoke all on function public.can_manage_location(uuid) from public, anon;

grant execute on function public.can_access_location(uuid) to authenticated;
grant execute on function public.can_manage_location(uuid) to authenticated;

comment on function public.can_manage_location is
  'Whether the calling user may modify the given location. Same predicate used by RLS policies.';

-- ---------------------------------------------------------------------------
-- Audit writer wrapper.
--
-- The `app` schema is not exposed through PostgREST, so the application cannot call
-- app.write_audit_log() directly. This wrapper is the exposed entry point; it adds no privilege of
-- its own and the SECURITY DEFINER insert still happens inside the app-schema function, which also
-- derives the actor from the real session rather than trusting an argument.
-- ---------------------------------------------------------------------------
create or replace function public.write_audit_log(
  p_action          text,
  p_entity_type     text,
  p_entity_id       uuid    default null,
  p_organization_id uuid    default null,
  p_location_id     uuid    default null,
  p_before_json     jsonb   default null,
  p_after_json      jsonb   default null,
  p_metadata_json   jsonb   default '{}'::jsonb
)
returns uuid
language sql
volatile
security invoker
set search_path = pg_catalog, public
as $$
  select app.write_audit_log(
    p_action, p_entity_type, p_entity_id, p_organization_id,
    p_location_id, p_before_json, p_after_json, p_metadata_json
  );
$$;

revoke all on function public.write_audit_log(text, text, uuid, uuid, uuid, jsonb, jsonb, jsonb)
  from public, anon;
grant execute on function public.write_audit_log(text, text, uuid, uuid, uuid, jsonb, jsonb, jsonb)
  to authenticated;

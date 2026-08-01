-- Audit logging.
--
-- Audit rows are append-only. No update or delete policy exists for any role, including platform
-- admins: an audit trail that privileged users can edit is not evidence of anything.

create table public.audit_logs (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid references public.organizations (id) on delete set null,
  location_id      uuid references public.locations (id) on delete set null,
  actor_user_id    uuid references auth.users (id) on delete set null,
  actor_type       text not null default 'user'
                     check (actor_type in ('user', 'system', 'support', 'platform_admin')),
  action           text not null check (length(action) between 1 and 100),
  entity_type      text not null check (length(entity_type) between 1 and 100),
  entity_id        uuid,
  before_json      jsonb,
  after_json       jsonb,
  metadata_json    jsonb not null default '{}'::jsonb,
  created_at       timestamptz not null default now()
);

create index audit_logs_org_created_idx on public.audit_logs (organization_id, created_at desc);
create index audit_logs_location_created_idx on public.audit_logs (location_id, created_at desc);
create index audit_logs_entity_idx on public.audit_logs (entity_type, entity_id);
create index audit_logs_actor_idx on public.audit_logs (actor_user_id, created_at desc);

alter table public.audit_logs enable row level security;

revoke all on public.audit_logs from anon;
grant select on public.audit_logs to authenticated;

-- Read-only for organization administrators and platform staff. Deliberately not visible to
-- viewers or location managers.
create policy audit_logs_select on public.audit_logs
  for select to authenticated
  using (
    app.is_platform_support()
    or (organization_id is not null and app.is_organization_admin(organization_id))
  );

-- No insert policy for `authenticated`. Writes go through app.write_audit_log() below, which is
-- SECURITY DEFINER, so an audit entry cannot be forged by an ordinary client insert.

create or replace function app.write_audit_log(
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
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  new_id uuid;
  actor  uuid := auth.uid();
  kind   text;
begin
  -- The actor type is derived from the caller's real platform role rather than accepted as an
  -- argument, so a caller cannot label their own action as 'system'.
  if actor is null then
    kind := 'system';
  elsif app.is_platform_admin() then
    kind := 'platform_admin';
  elsif app.is_platform_support() then
    kind := 'support';
  else
    kind := 'user';
  end if;

  insert into public.audit_logs (
    organization_id, location_id, actor_user_id, actor_type,
    action, entity_type, entity_id, before_json, after_json, metadata_json
  )
  values (
    p_organization_id, p_location_id, actor, kind,
    p_action, p_entity_type, p_entity_id, p_before_json, p_after_json,
    coalesce(p_metadata_json, '{}'::jsonb)
  )
  returning id into new_id;

  return new_id;
end;
$$;

revoke all on function app.write_audit_log(text, text, uuid, uuid, uuid, jsonb, jsonb, jsonb)
  from public, anon;
grant execute on function app.write_audit_log(text, text, uuid, uuid, uuid, jsonb, jsonb, jsonb)
  to authenticated, service_role;

comment on table public.audit_logs is
  'Append-only audit trail. No UPDATE or DELETE policy exists for any role.';

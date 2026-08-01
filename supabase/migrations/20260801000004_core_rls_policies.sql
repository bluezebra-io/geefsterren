-- RLS policies for the core tenancy tables.
--
-- Policies are written per command (select / insert / update / delete) rather than `for all`,
-- because read authority and write authority genuinely differ by role and a combined policy
-- cannot express that difference.

-- ---------------------------------------------------------------------------
-- One more helper: may the current user see this profile at all?
--
-- Needed so the portal user list can show names. Scoped to shared organizations so a member of
-- org A cannot enumerate the staff of org B.
-- ---------------------------------------------------------------------------
create or replace function app.shares_organization_with(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select exists (
    select 1
    from public.organization_memberships mine
    join public.organization_memberships theirs
      on theirs.organization_id = mine.organization_id
    where mine.user_id = auth.uid()
      and mine.status = 'active'
      and theirs.user_id = p_user_id
      and theirs.status in ('active', 'invited')
  );
$$;

revoke all on function app.shares_organization_with(uuid) from public, anon;
grant execute on function app.shares_organization_with(uuid) to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Table grants.
--
-- RLS filters rows; grants decide whether the role may attempt the command at all. Both are
-- needed. anon is given nothing on tenant tables: the public feedback flow goes through validated
-- server endpoints, never through direct anonymous table access.
-- ---------------------------------------------------------------------------
revoke all on public.organizations            from anon;
revoke all on public.locations                from anon;
revoke all on public.profiles                 from anon;
revoke all on public.organization_memberships from anon;
revoke all on public.location_memberships     from anon;

grant select, insert, update, delete on public.organizations            to authenticated;
grant select, insert, update, delete on public.locations                to authenticated;
grant select, insert, update, delete on public.profiles                 to authenticated;
grant select, insert, update, delete on public.organization_memberships to authenticated;
grant select, insert, update, delete on public.location_memberships     to authenticated;

-- ===========================================================================
-- organizations
-- ===========================================================================

create policy organizations_select on public.organizations
  for select to authenticated
  using (app.is_platform_support() or app.is_organization_member(id));

-- Organizations are onboarded by the platform, not self-served, in the MVP.
create policy organizations_insert on public.organizations
  for insert to authenticated
  with check (app.is_platform_admin());

create policy organizations_update on public.organizations
  for update to authenticated
  using (app.is_platform_admin() or app.is_organization_admin(id))
  with check (app.is_platform_admin() or app.is_organization_admin(id));

create policy organizations_delete on public.organizations
  for delete to authenticated
  using (app.is_platform_admin());

-- ===========================================================================
-- locations
-- ===========================================================================

create policy locations_select on public.locations
  for select to authenticated
  using (app.is_platform_support() or app.can_access_location(id));

create policy locations_insert on public.locations
  for insert to authenticated
  with check (app.is_platform_admin() or app.is_organization_admin(organization_id));

-- A location manager may edit the location they manage; only an org admin may move it between
-- organizations, which the WITH CHECK on organization_id prevents for everyone else.
create policy locations_update on public.locations
  for update to authenticated
  using (
    app.is_platform_admin()
    or app.is_organization_admin(organization_id)
    or app.can_manage_location(id)
  )
  with check (
    app.is_platform_admin()
    or app.is_organization_admin(organization_id)
    or app.can_manage_location(id)
  );

create policy locations_delete on public.locations
  for delete to authenticated
  using (app.is_platform_admin() or app.is_organization_admin(organization_id));

-- ===========================================================================
-- profiles
-- ===========================================================================

create policy profiles_select on public.profiles
  for select to authenticated
  using (
    user_id = app.current_user_id()
    or app.is_platform_support()
    or app.shares_organization_with(user_id)
  );

create policy profiles_update on public.profiles
  for update to authenticated
  using (user_id = app.current_user_id() or app.is_platform_admin())
  with check (user_id = app.current_user_id() or app.is_platform_admin());

-- No insert policy: profiles are created by the app.handle_new_user() trigger on auth.users.
-- No delete policy: profiles disappear with their auth user.

-- A user may edit their own profile, which the policy above allows. Without this trigger that
-- same policy would let them set platform_role = 'platform_admin' on themselves, since a WITH
-- CHECK expression cannot compare against the old row. Escalation is therefore blocked here.
--
-- SECURITY INVOKER, deliberately: the function needs to see which Postgres role is actually
-- performing the update. Under SECURITY DEFINER, `current_user` would always be the function
-- owner, and the trusted-context test below could never distinguish an end user from a migration.
create or replace function app.guard_platform_role()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
begin
  if new.platform_role is not distinct from old.platform_role then
    return new;
  end if;

  -- Requests arriving through PostgREST run as `anon` or `authenticated`. Anything else is a
  -- trusted server-side context — a migration, the seed, or the service-role client — which is
  -- how the very first platform administrator gets created. Without this exemption there would be
  -- no way to bootstrap one: granting the role requires already holding it.
  if current_user not in ('anon', 'authenticated') then
    return new;
  end if;

  if not app.is_platform_admin() then
    raise exception 'platform_role may only be changed by a platform administrator'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

create trigger profiles_guard_platform_role
  before update on public.profiles
  for each row execute function app.guard_platform_role();

-- ===========================================================================
-- organization_memberships
-- ===========================================================================

create policy organization_memberships_select on public.organization_memberships
  for select to authenticated
  using (
    user_id = app.current_user_id()
    or app.is_platform_support()
    or app.is_organization_admin(organization_id)
  );

create policy organization_memberships_insert on public.organization_memberships
  for insert to authenticated
  with check (app.is_platform_admin() or app.is_organization_admin(organization_id));

create policy organization_memberships_update on public.organization_memberships
  for update to authenticated
  using (app.is_platform_admin() or app.is_organization_admin(organization_id))
  with check (app.is_platform_admin() or app.is_organization_admin(organization_id));

create policy organization_memberships_delete on public.organization_memberships
  for delete to authenticated
  using (app.is_platform_admin() or app.is_organization_admin(organization_id));

-- An organization with no active administrator cannot be administered again without platform
-- intervention. Cheap to prevent, tedious to recover from, so it is an invariant rather than a
-- UI-level warning.
create or replace function app.guard_last_org_admin()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  affected_org uuid := coalesce(old.organization_id, new.organization_id);
  remaining integer;
begin
  if tg_op = 'UPDATE'
     and new.role = 'org_admin'
     and new.status = 'active' then
    return new;
  end if;

  if old.role <> 'org_admin' or old.status <> 'active' then
    return coalesce(new, old);
  end if;

  select count(*) into remaining
  from public.organization_memberships m
  where m.organization_id = affected_org
    and m.role = 'org_admin'
    and m.status = 'active'
    and m.id <> old.id;

  if remaining = 0 then
    raise exception 'An organization must keep at least one active administrator'
      using errcode = '23514';
  end if;

  return coalesce(new, old);
end;
$$;

create trigger organization_memberships_guard_last_admin
  before update or delete on public.organization_memberships
  for each row execute function app.guard_last_org_admin();

-- ===========================================================================
-- location_memberships
-- ===========================================================================

create policy location_memberships_select on public.location_memberships
  for select to authenticated
  using (
    user_id = app.current_user_id()
    or app.is_platform_support()
    or app.is_organization_admin(organization_id)
    or app.can_manage_location(location_id)
  );

-- Membership changes are an organization-administrator power. A location manager manages
-- campaigns and QR codes for their location, not who else can see it.
create policy location_memberships_insert on public.location_memberships
  for insert to authenticated
  with check (app.is_platform_admin() or app.is_organization_admin(organization_id));

create policy location_memberships_update on public.location_memberships
  for update to authenticated
  using (app.is_platform_admin() or app.is_organization_admin(organization_id))
  with check (app.is_platform_admin() or app.is_organization_admin(organization_id));

create policy location_memberships_delete on public.location_memberships
  for delete to authenticated
  using (app.is_platform_admin() or app.is_organization_admin(organization_id));

-- Authorization helpers used by RLS policies.
--
-- Every function here is SECURITY DEFINER, which makes this file the privilege-escalation surface
-- of the whole system. Three properties are mandatory on each one:
--
--   1. `set search_path = pg_catalog, public` — without it a caller can create a schema earlier in
--      their search_path containing a malicious `organization_memberships` and the function will
--      happily read it while running as the owner.
--   2. `stable` — lets Postgres cache the result per statement instead of re-running the lookup
--      for every candidate row.
--   3. Execute revoked from public and anon, granted only to authenticated.
--
-- SECURITY DEFINER is also what makes these functions necessary rather than merely convenient: a
-- policy on organization_memberships that queried organization_memberships would recurse. These
-- functions bypass RLS on the tables they read, which breaks the cycle.

-- ---------------------------------------------------------------------------
create or replace function app.current_user_id()
returns uuid
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select auth.uid();
$$;

-- ---------------------------------------------------------------------------
create or replace function app.platform_role()
returns public.platform_role
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select coalesce(
    (select p.platform_role from public.profiles p where p.user_id = auth.uid()),
    'none'::public.platform_role
  );
$$;

-- ---------------------------------------------------------------------------
create or replace function app.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select app.platform_role() = 'platform_admin';
$$;

-- ---------------------------------------------------------------------------
-- Support staff can read broadly but write nothing. Platform admins are included here because
-- every read a support user may perform, an admin may perform too.
create or replace function app.is_platform_support()
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select app.platform_role() in ('platform_support', 'platform_admin');
$$;

-- ---------------------------------------------------------------------------
-- Membership predicates.
--
-- 'active' is required throughout: an `invited` membership is not yet access, and a `suspended`
-- one is access that has been taken away. Only counting active rows means suspension takes effect
-- immediately rather than at next login.
-- ---------------------------------------------------------------------------
create or replace function app.is_organization_member(p_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select exists (
    select 1
    from public.organization_memberships m
    where m.organization_id = p_organization_id
      and m.user_id = auth.uid()
      and m.status = 'active'
  );
$$;

-- ---------------------------------------------------------------------------
create or replace function app.has_organization_role(
  p_organization_id uuid,
  p_allowed_roles text[]
)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select exists (
    select 1
    from public.organization_memberships m
    where m.organization_id = p_organization_id
      and m.user_id = auth.uid()
      and m.status = 'active'
      and m.role::text = any (p_allowed_roles)
  );
$$;

-- ---------------------------------------------------------------------------
create or replace function app.is_organization_admin(p_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select app.has_organization_role(p_organization_id, array['org_admin']);
$$;

-- ---------------------------------------------------------------------------
-- Read access to a location: granted by an org_admin membership on the owning organization, or by
-- an explicit active location membership of any role.
create or replace function app.can_access_location(p_location_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select exists (
    select 1
    from public.locations l
    join public.organization_memberships m
      on m.organization_id = l.organization_id
     and m.user_id = auth.uid()
     and m.status = 'active'
    where l.id = p_location_id
      and m.role = 'org_admin'
  )
  or exists (
    select 1
    from public.location_memberships lm
    where lm.location_id = p_location_id
      and lm.user_id = auth.uid()
      and lm.status = 'active'
  );
$$;

-- ---------------------------------------------------------------------------
-- Write access to a location: org_admin on the owning organization, or an explicit
-- location_manager membership. A viewer never qualifies.
create or replace function app.can_manage_location(p_location_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select exists (
    select 1
    from public.locations l
    join public.organization_memberships m
      on m.organization_id = l.organization_id
     and m.user_id = auth.uid()
     and m.status = 'active'
    where l.id = p_location_id
      and m.role = 'org_admin'
  )
  or exists (
    select 1
    from public.location_memberships lm
    where lm.location_id = p_location_id
      and lm.user_id = auth.uid()
      and lm.status = 'active'
      and lm.role = 'location_manager'
  );
$$;

-- ---------------------------------------------------------------------------
-- Lock down execution.
--
-- The default on a new function is EXECUTE to PUBLIC, which would let the anon role probe
-- membership. Revoke first, then grant narrowly.
-- ---------------------------------------------------------------------------
do $$
declare
  fn record;
begin
  for fn in
    select p.oid::regprocedure as signature
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'app'
  loop
    execute format('revoke all on function %s from public, anon', fn.signature);
    execute format('grant execute on function %s to authenticated, service_role', fn.signature);
  end loop;
end;
$$;

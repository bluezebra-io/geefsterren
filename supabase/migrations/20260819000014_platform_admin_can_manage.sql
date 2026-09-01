-- Platform administrators can manage locations.
--
-- `app.can_manage_location()` only ever checked memberships, and a platform
-- administrator has none by design — they reach a tenant through their platform
-- role, not by joining it. Every write policy built on this predicate therefore
-- refused them: creating a campaign or a QR code failed with a row-level security
-- violation, while the portal happily showed the form because the application
-- check (`canManageOrganization`) does count platform admins.
--
-- Two layers disagreeing about the same rule is the actual defect. This aligns
-- the database with the rest of the model, where a platform admin already updates
-- organizations, locations and memberships.
--
-- Platform *support* is deliberately not included: support looks, it does not
-- change, and `is_platform_support()` returns true for admins anyway — using it
-- here would silently grant support write access everywhere.
create or replace function app.can_manage_location(p_location_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select app.is_platform_admin()
  or exists (
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

comment on function app.can_manage_location is
  'Whether the caller may modify this location and things scoped to it. Platform administrators qualify; platform support does not.';

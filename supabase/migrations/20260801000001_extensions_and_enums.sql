-- Extensions, the private `app` schema, shared enums and shared triggers.
--
-- Enum vs. checked text: enums are used only where the value set is genuinely stable. Anything
-- likely to grow (source channels, reward types, question types) is `text` with a CHECK, because
-- `alter type ... add value` cannot run inside a transaction, which makes enums awkward to evolve
-- in a migration.

create extension if not exists pgcrypto with schema extensions;
create extension if not exists citext with schema extensions;

-- ---------------------------------------------------------------------------
-- Private schema for authorization helpers.
--
-- Not exposed through PostgREST: nothing here should be callable over the API. It exists so RLS
-- policies can share hardened SECURITY DEFINER predicates.
-- ---------------------------------------------------------------------------
create schema if not exists app;

revoke all on schema app from public;
grant usage on schema app to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type public.platform_role as enum ('none', 'platform_support', 'platform_admin');

create type public.organization_role as enum ('org_admin', 'location_manager', 'viewer');

create type public.location_role as enum ('location_manager', 'viewer');

create type public.membership_status as enum ('invited', 'active', 'suspended');

create type public.entity_status as enum ('active', 'inactive', 'archived');

-- ---------------------------------------------------------------------------
-- Shared trigger: keep updated_at honest.
--
-- Maintained by the database rather than the application so it cannot be forgotten at a call site.
-- ---------------------------------------------------------------------------
create or replace function app.set_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

comment on function app.set_updated_at is
  'Trigger function maintaining updated_at on every UPDATE.';

-- ---------------------------------------------------------------------------
-- Slug validation, shared by organizations and locations.
-- ---------------------------------------------------------------------------
create or replace function app.is_valid_slug(value text)
returns boolean
language sql
immutable
set search_path = pg_catalog, public
as $$
  select value ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(value) between 2 and 64;
$$;

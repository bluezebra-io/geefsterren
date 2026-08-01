-- Core tenancy: organizations, locations, profiles and memberships.
--
-- Every tenant-owned row carries organization_id. Location-scoped rows also carry location_id.
-- These columns are denormalised onto child tables deliberately: RLS policies must authorise a row
-- without a join, because joins inside policies are slow and are the usual source of recursive
-- policy bugs. Composite foreign keys keep the redundancy honest.

-- ---------------------------------------------------------------------------
-- organizations
-- ---------------------------------------------------------------------------
create table public.organizations (
  id                uuid primary key default gen_random_uuid(),
  name              text not null check (length(trim(name)) between 1 and 200),
  slug              text not null unique check (app.is_valid_slug(slug)),
  status            public.entity_status not null default 'active',
  default_timezone  text not null default 'Europe/Amsterdam',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  archived_at       timestamptz
);

create trigger organizations_set_updated_at
  before update on public.organizations
  for each row execute function app.set_updated_at();

-- ---------------------------------------------------------------------------
-- locations
-- ---------------------------------------------------------------------------
create table public.locations (
  id                  uuid primary key default gen_random_uuid(),
  organization_id     uuid not null references public.organizations (id) on delete cascade,
  name                text not null check (length(trim(name)) between 1 and 200),
  slug                text not null check (app.is_valid_slug(slug)),
  status              public.entity_status not null default 'active',
  timezone            text not null default 'Europe/Amsterdam',
  address_json        jsonb not null default '{}'::jsonb,
  google_review_url   text check (google_review_url is null or google_review_url ~ '^https://'),
  external_reference  text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  archived_at         timestamptz,

  constraint locations_org_slug_unique unique (organization_id, slug),
  -- Target for composite foreign keys from child tables. Redundant with the primary key on its
  -- own, but required so children can reference the (organization_id, id) pair as a unit.
  constraint locations_org_id_unique unique (organization_id, id)
);

create index locations_organization_id_idx on public.locations (organization_id);

create trigger locations_set_updated_at
  before update on public.locations
  for each row execute function app.set_updated_at();

-- ---------------------------------------------------------------------------
-- profiles
--
-- One row per Supabase Auth user. Consumers submitting feedback never get an auth user, so this
-- table only ever contains portal and platform staff.
-- ---------------------------------------------------------------------------
create table public.profiles (
  user_id        uuid primary key references auth.users (id) on delete cascade,
  full_name      text check (full_name is null or length(trim(full_name)) between 1 and 200),
  platform_role  public.platform_role not null default 'none',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index profiles_platform_role_idx
  on public.profiles (platform_role)
  where platform_role <> 'none';

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function app.set_updated_at();

-- Create the profile alongside the auth user. Doing this in a trigger rather than in application
-- code means a user created by an invite, a magic link or the Supabase dashboard all end up with a
-- profile; an application-side insert would only cover the paths we remembered.
create or replace function app.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  insert into public.profiles (user_id, full_name)
  values (
    new.id,
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), '')
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function app.handle_new_user();

-- ---------------------------------------------------------------------------
-- organization_memberships
-- ---------------------------------------------------------------------------
create table public.organization_memberships (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations (id) on delete cascade,
  user_id          uuid not null references public.profiles (user_id) on delete cascade,
  role             public.organization_role not null,
  status           public.membership_status not null default 'invited',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  constraint organization_memberships_unique unique (organization_id, user_id)
);

create index organization_memberships_user_idx on public.organization_memberships (user_id);
create index organization_memberships_org_idx on public.organization_memberships (organization_id);

create trigger organization_memberships_set_updated_at
  before update on public.organization_memberships
  for each row execute function app.set_updated_at();

-- ---------------------------------------------------------------------------
-- location_memberships
--
-- Scopes a user to specific locations. An org_admin does not need rows here: organization
-- membership already grants access to every location in the organization.
-- ---------------------------------------------------------------------------
create table public.location_memberships (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null,
  location_id      uuid not null,
  user_id          uuid not null references public.profiles (user_id) on delete cascade,
  role             public.location_role not null,
  status           public.membership_status not null default 'invited',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  constraint location_memberships_unique unique (location_id, user_id),
  -- The pair must exist together, so a membership cannot point at a location in another org.
  constraint location_memberships_location_fk
    foreign key (organization_id, location_id)
    references public.locations (organization_id, id)
    on delete cascade
);

create index location_memberships_user_idx on public.location_memberships (user_id);
create index location_memberships_location_idx on public.location_memberships (location_id);
create index location_memberships_org_idx on public.location_memberships (organization_id);

create trigger location_memberships_set_updated_at
  before update on public.location_memberships
  for each row execute function app.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS is enabled here, in the same migration that creates the tables, so there is never a window
-- in which they are readable. Policies follow in 0004; until then the tables are closed to
-- everyone except the service role, which is the safe default.
-- ---------------------------------------------------------------------------
alter table public.organizations            enable row level security;
alter table public.locations                enable row level security;
alter table public.profiles                 enable row level security;
alter table public.organization_memberships enable row level security;
alter table public.location_memberships     enable row level security;

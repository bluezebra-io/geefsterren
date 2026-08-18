-- Deterministic seed data for local development.
--
-- Fixed UUIDs so tests and fixtures can reference records without a lookup. Every password below
-- is a well-known local-only literal; these accounts exist on a throwaway database and must never
-- be created in staging or production.
--
-- Phase 1 seeds tenancy and staff. Questionnaires, campaigns, QR codes, feedback submissions,
-- readiness evaluations and AI analyses are seeded by their own phases as those tables land.

begin;

-- ---------------------------------------------------------------------------
-- Auth users
--
-- Inserted directly rather than through the Admin API so `supabase db reset` alone produces a
-- usable environment. `app.handle_new_user()` creates the matching profile rows.
-- ---------------------------------------------------------------------------
-- The token columns are nullable in the schema but GoTrue scans them into non-nullable Go
-- strings, so a NULL makes every sign-in fail with "Database error querying schema". They must be
-- empty strings, not NULL.
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data,
  confirmation_token, recovery_token,
  email_change, email_change_token_new, email_change_token_current,
  phone_change, phone_change_token, reauthentication_token
)
values
  ('00000000-0000-0000-0000-000000000000', '11111111-1111-4111-8111-000000000001', 'authenticated', 'authenticated',
   'platform.admin@geefsterren.test', crypt('LocalDev!2026', gen_salt('bf')), now(), now(), now(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Platform Admin"}', '', '', '', '', '', '', '', ''),

  ('00000000-0000-0000-0000-000000000000', '11111111-1111-4111-8111-000000000002', 'authenticated', 'authenticated',
   'platform.support@geefsterren.test', crypt('LocalDev!2026', gen_salt('bf')), now(), now(), now(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Platform Support"}', '', '', '', '', '', '', '', ''),

  ('00000000-0000-0000-0000-000000000000', '11111111-1111-4111-8111-000000000003', 'authenticated', 'authenticated',
   'org.admin@bakkerij.test', crypt('LocalDev!2026', gen_salt('bf')), now(), now(), now(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Sam de Vries"}', '', '', '', '', '', '', '', ''),

  ('00000000-0000-0000-0000-000000000000', '11111111-1111-4111-8111-000000000004', 'authenticated', 'authenticated',
   'manager.leiden@bakkerij.test', crypt('LocalDev!2026', gen_salt('bf')), now(), now(), now(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Robin Jansen"}', '', '', '', '', '', '', '', ''),

  ('00000000-0000-0000-0000-000000000000', '11111111-1111-4111-8111-000000000005', 'authenticated', 'authenticated',
   'viewer@bakkerij.test', crypt('LocalDev!2026', gen_salt('bf')), now(), now(), now(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Kim Bakker"}', '', '', '', '', '', '', '', ''),

  -- Second organization. Exists so cross-tenant isolation is testable: without a neighbour to
  -- leak to, an RLS test can pass while proving nothing.
  ('00000000-0000-0000-0000-000000000000', '11111111-1111-4111-8111-000000000006', 'authenticated', 'authenticated',
   'org.admin@pizzeria.test', crypt('LocalDev!2026', gen_salt('bf')), now(), now(), now(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Alex Moretti"}', '', '', '', '', '', '', '', ''),

  -- Second platform administrator. Two exist on purpose: the last-admin guard
  -- and the "open a participant" flow are both easier to exercise with a spare.
  ('00000000-0000-0000-0000-000000000000', '11111111-1111-4111-8111-000000000007', 'authenticated', 'authenticated',
   'super.admin@geefsterren.test', crypt('LocalDev!2026', gen_salt('bf')), now(), now(), now(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Super Admin"}', '', '', '', '', '', '', '', ''),

  -- Third organization: the newly onboarded participant.
  ('00000000-0000-0000-0000-000000000000', '11111111-1111-4111-8111-000000000008', 'authenticated', 'authenticated',
   'eigenaar@sushinoord.test', crypt('LocalDev!2026', gen_salt('bf')), now(), now(), now(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Noor van Dijk"}', '', '', '', '', '', '', '', ''),

  ('00000000-0000-0000-0000-000000000000', '11111111-1111-4111-8111-000000000009', 'authenticated', 'authenticated',
   'manager@sushinoord.test', crypt('LocalDev!2026', gen_salt('bf')), now(), now(), now(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Tim Bakhuis"}', '', '', '', '', '', '', '', '')
on conflict (id) do nothing;

-- Identities. Supabase Auth needs these for email/password sign-in to work.
insert into auth.identities (
  id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
)
select
  gen_random_uuid(), u.id, u.id::text,
  jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
  'email', now(), now(), now()
from auth.users u
where u.email like '%@geefsterren.test' or u.email like '%@bakkerij.test'
   or u.email like '%@pizzeria.test' or u.email like '%@sushinoord.test'
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Platform roles
-- ---------------------------------------------------------------------------
update public.profiles set platform_role = 'platform_admin'
  where user_id = '11111111-1111-4111-8111-000000000001';
update public.profiles set platform_role = 'platform_support'
  where user_id = '11111111-1111-4111-8111-000000000002';
update public.profiles set platform_role = 'platform_admin'
  where user_id = '11111111-1111-4111-8111-000000000007';

-- ---------------------------------------------------------------------------
-- Organizations
-- ---------------------------------------------------------------------------
insert into public.organizations (id, name, slug, status, default_timezone)
values
  ('22222222-2222-4222-8222-000000000001', 'Bakkerij De Korenaar', 'bakkerij-de-korenaar', 'active', 'Europe/Amsterdam'),
  ('22222222-2222-4222-8222-000000000002', 'Pizzeria Napoli',      'pizzeria-napoli',      'active', 'Europe/Amsterdam'),
  ('22222222-2222-4222-8222-000000000003', 'Sushi Noord',          'sushi-noord',          'active', 'Europe/Amsterdam')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Locations
-- ---------------------------------------------------------------------------
insert into public.locations (id, organization_id, name, slug, status, timezone, address_json, google_review_url)
values
  ('33333333-3333-4333-8333-000000000001', '22222222-2222-4222-8222-000000000001',
   'De Korenaar Leiden', 'leiden', 'active', 'Europe/Amsterdam',
   '{"street":"Breestraat 12","postal_code":"2311 CS","city":"Leiden","country":"NL"}',
   'https://g.page/r/korenaar-leiden'),

  ('33333333-3333-4333-8333-000000000002', '22222222-2222-4222-8222-000000000001',
   'De Korenaar Rotterdam', 'rotterdam', 'active', 'Europe/Amsterdam',
   '{"street":"Meent 44","postal_code":"3011 JN","city":"Rotterdam","country":"NL"}',
   'https://g.page/r/korenaar-rotterdam'),

  ('33333333-3333-4333-8333-000000000003', '22222222-2222-4222-8222-000000000002',
   'Napoli Centrum', 'centrum', 'active', 'Europe/Amsterdam',
   '{"street":"Damstraat 3","postal_code":"1012 JL","city":"Amsterdam","country":"NL"}',
   null),

  ('33333333-3333-4333-8333-000000000004', '22222222-2222-4222-8222-000000000003',
   'Sushi Noord Groningen', 'groningen', 'active', 'Europe/Amsterdam',
   '{"street":"Herestraat 88","postal_code":"9711 LM","city":"Groningen","country":"NL"}',
   'https://g.page/r/sushi-noord-groningen'),

  ('33333333-3333-4333-8333-000000000005', '22222222-2222-4222-8222-000000000003',
   'Sushi Noord Assen', 'assen', 'active', 'Europe/Amsterdam',
   '{"street":"Koopmansplein 4","postal_code":"9401 EA","city":"Assen","country":"NL"}',
   null)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Organization memberships
-- ---------------------------------------------------------------------------
insert into public.organization_memberships (id, organization_id, user_id, role, status)
values
  ('44444444-4444-4444-8444-000000000001', '22222222-2222-4222-8222-000000000001',
   '11111111-1111-4111-8111-000000000003', 'org_admin', 'active'),
  ('44444444-4444-4444-8444-000000000002', '22222222-2222-4222-8222-000000000001',
   '11111111-1111-4111-8111-000000000004', 'location_manager', 'active'),
  ('44444444-4444-4444-8444-000000000003', '22222222-2222-4222-8222-000000000001',
   '11111111-1111-4111-8111-000000000005', 'viewer', 'active'),
  ('44444444-4444-4444-8444-000000000004', '22222222-2222-4222-8222-000000000002',
   '11111111-1111-4111-8111-000000000006', 'org_admin', 'active'),
  ('44444444-4444-4444-8444-000000000005', '22222222-2222-4222-8222-000000000003',
   '11111111-1111-4111-8111-000000000008', 'org_admin', 'active'),
  ('44444444-4444-4444-8444-000000000006', '22222222-2222-4222-8222-000000000003',
   '11111111-1111-4111-8111-000000000009', 'location_manager', 'active')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Location memberships
--
-- The Leiden manager is assigned to Leiden only. Rotterdam is deliberately left out so
-- "location manager A cannot access location B" is testable within a single organization.
-- ---------------------------------------------------------------------------
insert into public.location_memberships (id, organization_id, location_id, user_id, role, status)
values
  ('55555555-5555-4555-8555-000000000001', '22222222-2222-4222-8222-000000000001',
   '33333333-3333-4333-8333-000000000001', '11111111-1111-4111-8111-000000000004',
   'location_manager', 'active'),
  ('55555555-5555-4555-8555-000000000002', '22222222-2222-4222-8222-000000000001',
   '33333333-3333-4333-8333-000000000001', '11111111-1111-4111-8111-000000000005',
   'viewer', 'active'),
  -- Groningen only, so the participant has its own restricted-manager case.
  ('55555555-5555-4555-8555-000000000003', '22222222-2222-4222-8222-000000000003',
   '33333333-3333-4333-8333-000000000004', '11111111-1111-4111-8111-000000000009',
   'location_manager', 'active')
on conflict (id) do nothing;

commit;

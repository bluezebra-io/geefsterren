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

-- ---------------------------------------------------------------------------
-- Standard hospitality questionnaire
--
-- A platform template (organization_id null), published and therefore immutable,
-- assigned organization-wide to every seeded organization. This is the "standard
-- questionnaire" the MVP ships with: a business can collect feedback without
-- authoring anything first.
--
-- Shape follows §11 of the specification: one overall rating, then follow-ups
-- that only appear below five stars, then an optional comment. A five-star guest
-- is never interrogated.
-- ---------------------------------------------------------------------------
insert into public.questionnaire_templates (id, organization_id, name, industry, description, status)
values (
  '66666666-6666-4666-8666-000000000001', null,
  'Standaard horeca-vragenlijst', 'hospitality',
  'Eén algemene beoordeling, gerichte vervolgvragen bij een score onder vijf, en een optionele opmerking.',
  'active'
) on conflict (id) do nothing;

insert into public.questionnaire_versions
  (id, questionnaire_template_id, organization_id, version_number, status, published_at)
values (
  '77777777-7777-4777-8777-000000000001',
  '66666666-6666-4666-8666-000000000001', null, 1, 'draft', null
) on conflict (id) do nothing;

-- Questions are inserted while the version is still a draft; the immutability
-- trigger refuses them afterwards.
insert into public.questions
  (id, questionnaire_version_id, organization_id, question_key, category, label, help_text,
   question_type, required, display_order, condition_json)
values
  ('88888888-8888-4888-8888-000000000001', '77777777-7777-4777-8777-000000000001', null,
   'overall_score', 'algemeen', 'Hoe beoordeel je jouw ervaring?', null,
   'rating', true, 10, null),

  ('88888888-8888-4888-8888-000000000002', '77777777-7777-4777-8777-000000000001', null,
   'improvement_topics', 'verbetering', 'Waar kunnen we verbeteren?',
   'Je mag meerdere onderwerpen kiezen.',
   'multiple_choice', false, 20,
   '{"all":[{"field":"overall_score","operator":"lt","value":5}]}'),

  ('88888888-8888-4888-8888-000000000003', '77777777-7777-4777-8777-000000000001', null,
   'positive_topics', 'waardering', 'Wat ging er goed?',
   'Je mag meerdere onderwerpen kiezen.',
   'multiple_choice', false, 30,
   '{"all":[{"field":"overall_score","operator":"gte","value":5}]}'),

  ('88888888-8888-4888-8888-000000000004', '77777777-7777-4777-8777-000000000001', null,
   'comment', 'toelichting', 'Wil je nog iets toelichten?', null,
   'long_text', false, 40, null)
on conflict (id) do nothing;

-- Topic options. The same vocabulary for both the improvement and the
-- appreciation question, so results stay comparable across scores.
insert into public.question_options (question_id, organization_id, option_key, label, display_order)
select q.id, null, o.option_key, o.label, o.display_order
from (values
  ('delivery_time',  'Bezorgtijd',                     10),
  ('temperature',    'Temperatuur',                    20),
  ('taste',          'Smaak',                          30),
  ('packaging',      'Verpakking',                     40),
  ('friendliness',   'Vriendelijkheid',                50),
  ('price',          'Prijs',                          60),
  ('order_accuracy', 'Compleetheid van de bestelling', 70)
) as o(option_key, label, display_order)
cross join (
  select id from public.questions
  where questionnaire_version_id = '77777777-7777-4777-8777-000000000001'
    and question_key in ('improvement_topics', 'positive_topics')
) as q
on conflict do nothing;

-- Publish. From here the version is immutable: the trigger blocks any further
-- change to its questions or options.
update public.questionnaire_versions
set status = 'published'
where id = '77777777-7777-4777-8777-000000000001';

-- Assign organization-wide, so a location added later inherits it.
insert into public.location_questionnaire_assignments
  (id, organization_id, location_id, questionnaire_version_id, status)
values
  ('99999999-9999-4999-8999-000000000001', '22222222-2222-4222-8222-000000000001', null,
   '77777777-7777-4777-8777-000000000001', 'active'),
  ('99999999-9999-4999-8999-000000000002', '22222222-2222-4222-8222-000000000002', null,
   '77777777-7777-4777-8777-000000000001', 'active'),
  ('99999999-9999-4999-8999-000000000003', '22222222-2222-4222-8222-000000000003', null,
   '77777777-7777-4777-8777-000000000001', 'active')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Campaigns, QR codes and sample feedback
--
-- Tokens and codes are fixed literals so they can be documented and used in
-- tests; only their hashes are stored, exactly as production does it. Local
-- development values on a throwaway database.
--
--   Leiden     token DemoLeiden00001   code KRN2AB34
--   Rotterdam  token DemoRotterdam001  code RTM5CD67
--   Groningen  token DemoGroningen001  code GRN4GH56
-- ---------------------------------------------------------------------------
insert into public.campaigns
  (id, organization_id, location_id, name, status, starts_at,
   questionnaire_version_id, google_review_invitation_enabled)
values
  ('aaaaaaaa-aaaa-4aaa-8aaa-000000000001', '22222222-2222-4222-8222-000000000001',
   '33333333-3333-4333-8333-000000000001', 'Bezorging Leiden', 'active', now() - interval '90 days',
   '77777777-7777-4777-8777-000000000001', false),
  ('aaaaaaaa-aaaa-4aaa-8aaa-000000000002', '22222222-2222-4222-8222-000000000001',
   '33333333-3333-4333-8333-000000000002', 'Bezorging Rotterdam', 'active', now() - interval '90 days',
   '77777777-7777-4777-8777-000000000001', false),
  ('aaaaaaaa-aaaa-4aaa-8aaa-000000000003', '22222222-2222-4222-8222-000000000003',
   '33333333-3333-4333-8333-000000000004', 'Restaurant Groningen', 'active', now() - interval '60 days',
   '77777777-7777-4777-8777-000000000001', false)
on conflict (id) do nothing;

insert into public.qr_codes
  (id, organization_id, location_id, campaign_id, token_hash, feedback_code_hash,
   source_channel, label, status)
values
  ('bbbbbbbb-bbbb-4bbb-8bbb-000000000001', '22222222-2222-4222-8222-000000000001',
   '33333333-3333-4333-8333-000000000001', 'aaaaaaaa-aaaa-4aaa-8aaa-000000000001',
   encode(digest('DemoLeiden00001', 'sha256'), 'hex'),
   encode(digest('KRN2AB34', 'sha256'), 'hex'),
   'packaging', 'Bezorgdoos Leiden', 'active'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-000000000002', '22222222-2222-4222-8222-000000000001',
   '33333333-3333-4333-8333-000000000002', 'aaaaaaaa-aaaa-4aaa-8aaa-000000000002',
   encode(digest('DemoRotterdam001', 'sha256'), 'hex'),
   encode(digest('RTM5CD67', 'sha256'), 'hex'),
   'receipt', 'Kassabon Rotterdam', 'active'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-000000000003', '22222222-2222-4222-8222-000000000003',
   '33333333-3333-4333-8333-000000000004', 'aaaaaaaa-aaaa-4aaa-8aaa-000000000003',
   encode(digest('DemoGroningen001', 'sha256'), 'hex'),
   encode(digest('GRN4GH56', 'sha256'), 'hex'),
   'table', 'Tafelkaart Groningen', 'active')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Sample submissions.
--
-- Deterministic, not random: `(i * 7919) % 100` gives a stable spread, so every
-- reset produces identical numbers and a test can assert on them. Leiden gets a
-- strong distribution and Rotterdam a weak one, so Review Acquisition Readiness
-- has both a "met" and a "not met" case to evaluate against later.
-- ---------------------------------------------------------------------------
with spec as (
  select * from (values
    ('33333333-3333-4333-8333-000000000001'::uuid, '22222222-2222-4222-8222-000000000001'::uuid,
     'aaaaaaaa-aaaa-4aaa-8aaa-000000000001'::uuid, 'bbbbbbbb-bbbb-4bbb-8bbb-000000000001'::uuid,
     'packaging', 70, 1),
    ('33333333-3333-4333-8333-000000000002'::uuid, '22222222-2222-4222-8222-000000000001'::uuid,
     'aaaaaaaa-aaaa-4aaa-8aaa-000000000002'::uuid, 'bbbbbbbb-bbbb-4bbb-8bbb-000000000002'::uuid,
     'receipt', 45, 2),
    ('33333333-3333-4333-8333-000000000004'::uuid, '22222222-2222-4222-8222-000000000003'::uuid,
     'aaaaaaaa-aaaa-4aaa-8aaa-000000000003'::uuid, 'bbbbbbbb-bbbb-4bbb-8bbb-000000000003'::uuid,
     'table', 55, 3)
  ) as t(location_id, organization_id, campaign_id, qr_code_id, channel, count, bucket)
),
scored as (
  select
    s.location_id, s.organization_id, s.campaign_id, s.qr_code_id, s.channel, s.bucket, i,
    (i * 7919 + s.bucket * 131) % 100 as r,
    now() - ((i % 60) || ' days')::interval - ((i % 17) || ' hours')::interval as moment,
    'seed-' || s.bucket || '-' || i as idem,
    case s.bucket
      when 1 then case when (i * 7919 + s.bucket * 131) % 100 < 55 then 5
                       when (i * 7919 + s.bucket * 131) % 100 < 85 then 4
                       when (i * 7919 + s.bucket * 131) % 100 < 95 then 3 else 2 end
      when 2 then case when (i * 7919 + s.bucket * 131) % 100 < 20 then 5
                       when (i * 7919 + s.bucket * 131) % 100 < 45 then 4
                       when (i * 7919 + s.bucket * 131) % 100 < 70 then 3
                       when (i * 7919 + s.bucket * 131) % 100 < 88 then 2 else 1 end
      else        case when (i * 7919 + s.bucket * 131) % 100 < 40 then 5
                       when (i * 7919 + s.bucket * 131) % 100 < 75 then 4
                       when (i * 7919 + s.bucket * 131) % 100 < 90 then 3
                       when (i * 7919 + s.bucket * 131) % 100 < 97 then 2 else 1 end
    end as score
  from spec s
  cross join generate_series(1, s.count) as i
),
sessions as (
  insert into public.feedback_sessions
    (organization_id, location_id, campaign_id, qr_code_id, status, started_at, completed_at,
     expires_at, idempotency_key)
  select
    organization_id, location_id, campaign_id, qr_code_id, 'completed',
    moment, moment + interval '92 seconds', moment + interval '2 hours', idem
  from scored
  returning id, idempotency_key
),
subs as (
  insert into public.feedback_submissions
    (feedback_session_id, organization_id, location_id, campaign_id, questionnaire_version_id,
     overall_score, free_text_comment, submitted_at, source_channel)
  select
    se.id, sc.organization_id, sc.location_id, sc.campaign_id,
    '77777777-7777-4777-8777-000000000001',
    sc.score,
    case
      when sc.r % 5 <> 0 then null
      when sc.score >= 4 then 'Alles klopte, ook de bezorging.'
      when sc.score = 3 then 'Prima, maar het duurde wat lang.'
      else 'De maaltijd was lauw toen die aankwam.'
    end,
    sc.moment + interval '92 seconds',
    sc.channel
  from sessions se
  join scored sc on sc.idem = se.idempotency_key
  returning id, overall_score, organization_id
)
-- The rating is also stored as an answer, so "results per question" treats every
-- question the same way instead of special-casing the score.
insert into public.feedback_answers
  (feedback_submission_id, organization_id, question_id, selected_option_id, answer_json)
select s.id, s.organization_id, '88888888-8888-4888-8888-000000000001', null,
       jsonb_build_object('rating', s.overall_score)
from subs s;

-- Topic answers: one row per selected option, so each option is countable on its
-- own. Below five stars the improvement question applies, at five the
-- appreciation question — matching the conditions on those questions.
insert into public.feedback_answers
  (feedback_submission_id, organization_id, question_id, selected_option_id, answer_json)
select
  sub.id,
  sub.organization_id,
  target.question_id,
  opt.id,
  null
from public.feedback_submissions sub
cross join lateral (
  select case when sub.overall_score < 5
              then '88888888-8888-4888-8888-000000000002'::uuid
              else '88888888-8888-4888-8888-000000000003'::uuid end as question_id
) target
join lateral (
  select o.id, row_number() over (order by o.display_order) as rn
  from public.question_options o
  where o.question_id = target.question_id
) opt on opt.rn in (
  -- Two deterministic topics per submission, spread across the seven options.
  1 + (('x' || substr(md5(sub.id::text), 1, 8))::bit(32)::bigint % 7),
  1 + (('x' || substr(md5(sub.id::text), 9, 8))::bit(32)::bigint % 7)
)
where sub.questionnaire_version_id = '77777777-7777-4777-8777-000000000001'
on conflict do nothing;

-- The comment is stored as an answer too, so the per-question view treats every
-- question alike. It stays denormalised on the submission as well, exactly like
-- the score: one row to read for a list, one row to count per question.
insert into public.feedback_answers
  (feedback_submission_id, organization_id, question_id, selected_option_id, answer_json)
select s.id, s.organization_id, '88888888-8888-4888-8888-000000000004', null,
       jsonb_build_object('text', s.free_text_comment)
from public.feedback_submissions s
where s.free_text_comment is not null
on conflict do nothing;

commit;

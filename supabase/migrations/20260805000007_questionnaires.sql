-- Questionnaires: templates, immutable published versions, questions, options,
-- and the assignment of a version to locations.
--
-- Two decisions that are not in the original table sketch:
--
-- 1. `questionnaire_templates.organization_id` is nullable. NULL means a platform
--    template shared with every organization; a value means it belongs to that
--    organization. The specification needs both platform templates and
--    organization-authored questions, and one nullable column covers it.
--
-- 2. `location_questionnaire_assignments.location_id` is nullable. NULL means
--    "every location in this organization". Fanning out one row per location
--    instead would leave a location created next month asking nothing — the kind
--    of silent gap nobody notices until a campaign returns no answers.
--    Resolution is most-specific-wins: a location's own row beats the org-wide one.

create table public.questionnaire_templates (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid references public.organizations (id) on delete cascade,
  name             text not null check (length(trim(name)) between 1 and 200),
  industry         text check (industry is null or length(trim(industry)) between 1 and 100),
  description      text check (description is null or length(description) <= 2000),
  status           text not null default 'active' check (status in ('active', 'archived')),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index questionnaire_templates_org_idx on public.questionnaire_templates (organization_id);
alter table public.questionnaire_templates
  add constraint questionnaire_templates_id_org_unique unique (id, organization_id);

create trigger questionnaire_templates_set_updated_at
  before update on public.questionnaire_templates
  for each row execute function app.set_updated_at();

-- ---------------------------------------------------------------------------
create table public.questionnaire_versions (
  id                        uuid primary key default gen_random_uuid(),
  questionnaire_template_id uuid not null,
  -- Denormalised so RLS authorises without a join; the composite FK keeps it
  -- in step with the template.
  organization_id           uuid,
  version_number            integer not null check (version_number >= 1),
  status                    text not null default 'draft'
                              check (status in ('draft', 'published', 'archived')),
  published_at              timestamptz,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now(),

  constraint questionnaire_versions_number_unique
    unique (questionnaire_template_id, version_number),
  constraint questionnaire_versions_template_fk
    foreign key (questionnaire_template_id, organization_id)
    references public.questionnaire_templates (id, organization_id)
    on delete cascade,
  -- A draft must not claim a publication date.
  constraint questionnaire_versions_draft_has_no_date
    check (status <> 'draft' or published_at is null)
);

create index questionnaire_versions_template_idx
  on public.questionnaire_versions (questionnaire_template_id);
create index questionnaire_versions_org_idx on public.questionnaire_versions (organization_id);
alter table public.questionnaire_versions
  add constraint questionnaire_versions_id_org_unique unique (id, organization_id);

create trigger questionnaire_versions_set_updated_at
  before update on public.questionnaire_versions
  for each row execute function app.set_updated_at();

-- ---------------------------------------------------------------------------
create table public.questions (
  id                       uuid primary key default gen_random_uuid(),
  questionnaire_version_id uuid not null,
  organization_id          uuid,
  question_key             text not null check (question_key ~ '^[a-z][a-z0-9_]{1,62}$'),
  category                 text check (category is null or length(trim(category)) between 1 and 100),
  label                    text not null check (length(trim(label)) between 1 and 500),
  help_text                text check (help_text is null or length(help_text) <= 1000),
  question_type            text not null check (question_type in (
                             'single_choice', 'multiple_choice', 'rating',
                             'short_text', 'long_text', 'boolean')),
  required                 boolean not null default false,
  display_order            integer not null default 0,
  -- Conditions are configuration, never code. Shape is validated with Zod in
  -- features/questionnaires/service.ts and evaluated deterministically there.
  condition_json           jsonb,
  created_at               timestamptz not null default now(),

  constraint questions_key_unique_per_version unique (questionnaire_version_id, question_key),
  constraint questions_version_fk
    foreign key (questionnaire_version_id, organization_id)
    references public.questionnaire_versions (id, organization_id)
    on delete cascade
);

create index questions_version_order_idx
  on public.questions (questionnaire_version_id, display_order);
alter table public.questions add constraint questions_id_org_unique unique (id, organization_id);

-- ---------------------------------------------------------------------------
create table public.question_options (
  id              uuid primary key default gen_random_uuid(),
  question_id     uuid not null,
  organization_id uuid,
  option_key      text not null check (option_key ~ '^[a-z][a-z0-9_]{1,62}$'),
  label           text not null check (length(trim(label)) between 1 and 300),
  display_order   integer not null default 0,
  metadata_json   jsonb not null default '{}'::jsonb,

  constraint question_options_key_unique_per_question unique (question_id, option_key),
  constraint question_options_question_fk
    foreign key (question_id, organization_id)
    references public.questions (id, organization_id)
    on delete cascade
);

create index question_options_question_order_idx
  on public.question_options (question_id, display_order);
alter table public.question_options
  add constraint question_options_id_org_unique unique (id, organization_id);

-- ---------------------------------------------------------------------------
create table public.location_questionnaire_assignments (
  id                       uuid primary key default gen_random_uuid(),
  organization_id          uuid not null references public.organizations (id) on delete cascade,
  location_id              uuid,
  questionnaire_version_id uuid not null
                             references public.questionnaire_versions (id) on delete restrict,
  active_from              timestamptz not null default now(),
  active_until             timestamptz,
  status                   text not null default 'active'
                             check (status in ('active', 'inactive')),
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now(),

  constraint assignments_period_ordered
    check (active_until is null or active_until > active_from),
  constraint assignments_location_fk
    foreign key (organization_id, location_id)
    references public.locations (organization_id, id)
    on delete cascade
);

-- Partial unique indexes: NULL never equals NULL in a plain unique constraint,
-- so the organization-wide row needs its own index.
create unique index assignments_one_active_org_wide
  on public.location_questionnaire_assignments (organization_id)
  where location_id is null and status = 'active';

create unique index assignments_one_active_per_location
  on public.location_questionnaire_assignments (location_id)
  where location_id is not null and status = 'active';

create index assignments_org_idx on public.location_questionnaire_assignments (organization_id);
create index assignments_version_idx
  on public.location_questionnaire_assignments (questionnaire_version_id);

create trigger assignments_set_updated_at
  before update on public.location_questionnaire_assignments
  for each row execute function app.set_updated_at();

alter table public.questionnaire_templates            enable row level security;
alter table public.questionnaire_versions             enable row level security;
alter table public.questions                          enable row level security;
alter table public.question_options                   enable row level security;
alter table public.location_questionnaire_assignments enable row level security;

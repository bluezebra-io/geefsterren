-- Feedback: sessions, submissions and answers.
--
-- `anon` gets no policies at all here. The guest flow writes through validated
-- server endpoints using the service role, because a correct anon-insert policy
-- for an unauthenticated, deliberately abusable write path is far harder to get
-- right than one audited endpoint — and the token has to be resolved server-side
-- anyway.

create table public.feedback_sessions (
  id                uuid primary key default gen_random_uuid(),
  organization_id   uuid not null,
  location_id       uuid not null,
  campaign_id       uuid not null,
  qr_code_id        uuid not null,
  status            text not null default 'started' check (status in ('started','completed','expired')),
  started_at        timestamptz not null default now(),
  completed_at      timestamptz,
  expires_at        timestamptz not null,
  -- Hashes, never the values: an IP address is personal data and a session does
  -- not need to be able to reproduce it, only to compare it.
  ip_hash           text check (ip_hash is null or ip_hash ~ '^[0-9a-f]{64}$'),
  user_agent_hash   text check (user_agent_hash is null or user_agent_hash ~ '^[0-9a-f]{64}$'),
  idempotency_key   text unique check (idempotency_key is null or length(idempotency_key) between 8 and 200),

  constraint feedback_sessions_completed_matches_status
    check ((status = 'completed') = (completed_at is not null)),
  constraint feedback_sessions_location_fk
    foreign key (organization_id, location_id)
    references public.locations (organization_id, id) on delete cascade,
  constraint feedback_sessions_qr_fk
    foreign key (qr_code_id, organization_id)
    references public.qr_codes (id, organization_id) on delete cascade
);

create index feedback_sessions_location_started_idx
  on public.feedback_sessions (location_id, started_at desc);
create index feedback_sessions_qr_idx on public.feedback_sessions (qr_code_id);
alter table public.feedback_sessions
  add constraint feedback_sessions_id_org_unique unique (id, organization_id);

-- ---------------------------------------------------------------------------
create table public.feedback_submissions (
  id                       uuid primary key default gen_random_uuid(),
  feedback_session_id      uuid not null unique,
  organization_id          uuid not null,
  location_id              uuid not null,
  campaign_id              uuid not null,
  questionnaire_version_id uuid not null references public.questionnaire_versions (id) on delete restrict,
  overall_score            integer not null check (overall_score between 1 and 5),
  free_text_comment        text check (free_text_comment is null or length(free_text_comment) <= 2000),
  consent_version          text not null default 'v1',
  submitted_at             timestamptz not null default now(),
  source_channel           text not null default 'other' check (source_channel in (
                             'packaging','flyer','receipt','counter','table','email','other')),

  constraint feedback_submissions_session_fk
    foreign key (feedback_session_id, organization_id)
    references public.feedback_sessions (id, organization_id) on delete cascade,
  constraint feedback_submissions_location_fk
    foreign key (organization_id, location_id)
    references public.locations (organization_id, id) on delete cascade
);

create index feedback_submissions_location_time_idx
  on public.feedback_submissions (location_id, submitted_at desc);
create index feedback_submissions_campaign_idx on public.feedback_submissions (campaign_id);
create index feedback_submissions_version_idx on public.feedback_submissions (questionnaire_version_id);
alter table public.feedback_submissions
  add constraint feedback_submissions_id_org_unique unique (id, organization_id);

-- ---------------------------------------------------------------------------
create table public.feedback_answers (
  id                     uuid primary key default gen_random_uuid(),
  feedback_submission_id uuid not null,
  organization_id        uuid not null,
  question_id            uuid not null references public.questions (id) on delete restrict,
  selected_option_id     uuid references public.question_options (id) on delete restrict,
  -- For types where one option id is not enough: ratings, free text, and the
  -- several selections of a multiple choice.
  answer_json            jsonb,
  created_at             timestamptz not null default now(),

  constraint feedback_answers_submission_fk
    foreign key (feedback_submission_id, organization_id)
    references public.feedback_submissions (id, organization_id) on delete cascade,
  -- One row per selected option, so a multiple choice becomes several rows and
  -- each one is countable on its own.
  constraint feedback_answers_unique_option
    unique (feedback_submission_id, question_id, selected_option_id)
);

-- A question without options (rating, free text, boolean) stores its value in
-- answer_json with a null option. Unique constraints ignore nulls, so without
-- this partial index one submission could hold two conflicting answers to the
-- same question.
create unique index feedback_answers_one_value_per_question
  on public.feedback_answers (feedback_submission_id, question_id)
  where selected_option_id is null;

create index feedback_answers_submission_idx on public.feedback_answers (feedback_submission_id);
create index feedback_answers_question_idx on public.feedback_answers (question_id);
create index feedback_answers_option_idx on public.feedback_answers (selected_option_id);

-- ---------------------------------------------------------------------------
alter table public.feedback_sessions    enable row level security;
alter table public.feedback_submissions enable row level security;
alter table public.feedback_answers     enable row level security;

revoke all on public.feedback_sessions    from anon;
revoke all on public.feedback_submissions from anon;
revoke all on public.feedback_answers     from anon;

-- Read-only for the portal. No insert, update or delete policy for any signed-in
-- role: feedback is written by the guest flow and is not editable afterwards,
-- which is what makes historic results trustworthy.
grant select on public.feedback_sessions    to authenticated;
grant select on public.feedback_submissions to authenticated;
grant select on public.feedback_answers     to authenticated;

create policy feedback_sessions_select on public.feedback_sessions
  for select to authenticated
  using (app.is_platform_support() or app.can_access_location(location_id));

create policy feedback_submissions_select on public.feedback_submissions
  for select to authenticated
  using (app.is_platform_support() or app.can_access_location(location_id));

create policy feedback_answers_select on public.feedback_answers
  for select to authenticated
  using (
    app.is_platform_support()
    or exists (
      select 1 from public.feedback_submissions s
      where s.id = feedback_answers.feedback_submission_id
        and app.can_access_location(s.location_id)
    )
  );

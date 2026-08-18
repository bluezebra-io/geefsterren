-- Campaigns and QR codes.
--
-- `reward_campaign_id` from the original sketch is deliberately absent: rewards
-- arrive in Phase 4, and a nullable column with no foreign key would be a
-- promise the schema cannot keep. Adding it later is one forward-only migration.

create table public.campaigns (
  id                               uuid primary key default gen_random_uuid(),
  organization_id                  uuid not null,
  location_id                      uuid not null,
  name                             text not null check (length(trim(name)) between 1 and 200),
  status                           text not null default 'draft'
                                     check (status in ('draft','active','paused','completed','archived')),
  starts_at                        timestamptz,
  ends_at                          timestamptz,
  questionnaire_version_id         uuid not null references public.questionnaire_versions (id)
                                     on delete restrict,
  -- Whether this campaign may show the Google invitation *at all*. Visibility
  -- still additionally requires the location's readiness status to be active,
  -- and never the respondent's own score.
  google_review_invitation_enabled boolean not null default false,
  created_at                       timestamptz not null default now(),
  updated_at                       timestamptz not null default now(),

  constraint campaigns_period_ordered check (ends_at is null or starts_at is null or ends_at > starts_at),
  constraint campaigns_location_fk
    foreign key (organization_id, location_id)
    references public.locations (organization_id, id) on delete cascade
);

create index campaigns_location_idx on public.campaigns (location_id, status);
create index campaigns_org_idx on public.campaigns (organization_id);
alter table public.campaigns add constraint campaigns_id_org_unique unique (id, organization_id);

create trigger campaigns_set_updated_at
  before update on public.campaigns
  for each row execute function app.set_updated_at();

-- ---------------------------------------------------------------------------
-- QR codes.
--
-- Neither secret is stored in the clear. The URL token and the printed feedback
-- code are both kept as SHA-256 hashes, and the plain values are returned once,
-- at creation, so they can be rendered onto something physical. A database dump
-- therefore does not hand over the ability to submit feedback as that QR.
-- ---------------------------------------------------------------------------
create table public.qr_codes (
  id                  uuid primary key default gen_random_uuid(),
  organization_id     uuid not null,
  location_id         uuid not null,
  campaign_id         uuid not null,
  -- Hash for lookup: given a token from a URL, hash it and find the row.
  token_hash          text not null unique check (token_hash ~ '^[0-9a-f]{64}$'),
  feedback_code_hash  text unique check (feedback_code_hash is null or feedback_code_hash ~ '^[0-9a-f]{64}$'),
  -- Ciphertext for reprinting. A hash cannot be reversed, so without this a
  -- sticker could only ever be downloaded in the same minute it was created.
  -- The specification allows keeping the value "where there is a specific
  -- operational requirement"; reprinting is one. AES-256-GCM via
  -- lib/security/encryption.ts, so a database dump alone is not enough to submit
  -- feedback as this QR — it also takes APP_ENCRYPTION_KEY.
  token_encrypted     text,
  feedback_code_encrypted text,
  source_channel      text not null default 'other' check (source_channel in (
                        'packaging','flyer','receipt','counter','table','email','other')),
  label               text check (label is null or length(trim(label)) between 1 and 200),
  status              text not null default 'active' check (status in ('active','inactive')),
  active_from         timestamptz not null default now(),
  active_until        timestamptz,
  scan_count          integer not null default 0 check (scan_count >= 0),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),

  constraint qr_codes_period_ordered check (active_until is null or active_until > active_from),
  constraint qr_codes_campaign_fk
    foreign key (campaign_id, organization_id)
    references public.campaigns (id, organization_id) on delete cascade,
  constraint qr_codes_location_fk
    foreign key (organization_id, location_id)
    references public.locations (organization_id, id) on delete cascade
);

create index qr_codes_campaign_idx on public.qr_codes (campaign_id);
create index qr_codes_location_idx on public.qr_codes (location_id);
alter table public.qr_codes add constraint qr_codes_id_org_unique unique (id, organization_id);

create trigger qr_codes_set_updated_at
  before update on public.qr_codes
  for each row execute function app.set_updated_at();

-- ---------------------------------------------------------------------------
alter table public.campaigns enable row level security;
alter table public.qr_codes  enable row level security;

revoke all on public.campaigns from anon;
revoke all on public.qr_codes  from anon;

grant select, insert, update, delete on public.campaigns to authenticated;
grant select, insert, update, delete on public.qr_codes  to authenticated;

-- Campaigns and QR codes are location-scoped, so a location manager may run
-- their own. `can_manage_location` already encodes that.
create policy campaigns_select on public.campaigns
  for select to authenticated
  using (app.is_platform_support() or app.can_access_location(location_id));
create policy campaigns_insert on public.campaigns
  for insert to authenticated with check (app.can_manage_location(location_id));
create policy campaigns_update on public.campaigns
  for update to authenticated
  using (app.can_manage_location(location_id))
  with check (app.can_manage_location(location_id));
create policy campaigns_delete on public.campaigns
  for delete to authenticated
  using (app.is_platform_admin() or app.is_organization_admin(organization_id));

create policy qr_codes_select on public.qr_codes
  for select to authenticated
  using (app.is_platform_support() or app.can_access_location(location_id));
create policy qr_codes_insert on public.qr_codes
  for insert to authenticated with check (app.can_manage_location(location_id));
create policy qr_codes_update on public.qr_codes
  for update to authenticated
  using (app.can_manage_location(location_id))
  with check (app.can_manage_location(location_id));
create policy qr_codes_delete on public.qr_codes
  for delete to authenticated
  using (app.is_platform_admin() or app.is_organization_admin(organization_id));

-- Immutability of published questionnaire versions, plus RLS.
--
-- "Published versions are immutable" is the invariant that lets a submission
-- from six months ago still be interpreted: the answers reference question ids,
-- so if a question's label or options could change afterwards, historic results
-- would silently start meaning something else. Enforced by triggers rather than
-- by application care, because a single forgotten call site would corrupt it
-- permanently.

-- ---------------------------------------------------------------------------
-- Questions and options may only change while their version is a draft.
-- ---------------------------------------------------------------------------
create or replace function app.guard_draft_only_questions()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_version uuid;
  v_status  text;
begin
  v_version := coalesce(new.questionnaire_version_id, old.questionnaire_version_id);
  select status into v_status from public.questionnaire_versions where id = v_version;

  if v_status is distinct from 'draft' then
    raise exception 'Questions can only be changed while the questionnaire version is a draft'
      using errcode = '23514';
  end if;

  return coalesce(new, old);
end;
$$;

create trigger questions_draft_only
  before insert or update or delete on public.questions
  for each row execute function app.guard_draft_only_questions();

create or replace function app.guard_draft_only_options()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_status text;
begin
  select v.status into v_status
  from public.questions q
  join public.questionnaire_versions v on v.id = q.questionnaire_version_id
  where q.id = coalesce(new.question_id, old.question_id);

  if v_status is distinct from 'draft' then
    raise exception 'Options can only be changed while the questionnaire version is a draft'
      using errcode = '23514';
  end if;

  return coalesce(new, old);
end;
$$;

create trigger question_options_draft_only
  before insert or update or delete on public.question_options
  for each row execute function app.guard_draft_only_options();

-- ---------------------------------------------------------------------------
-- A published version may only be archived. Nothing else about it may move.
-- ---------------------------------------------------------------------------
create or replace function app.guard_version_transition()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if old.status = 'published' then
    if new.status not in ('published', 'archived') then
      raise exception 'A published questionnaire version cannot return to draft'
        using errcode = '23514';
    end if;

    if new.questionnaire_template_id is distinct from old.questionnaire_template_id
       or new.version_number is distinct from old.version_number
       or new.published_at is distinct from old.published_at then
      raise exception 'A published questionnaire version is immutable'
        using errcode = '23514';
    end if;
  end if;

  -- Publishing stamps the moment, and refuses an empty questionnaire: a version
  -- with no questions would produce sessions that ask nothing.
  if old.status = 'draft' and new.status = 'published' then
    if not exists (select 1 from public.questions q where q.questionnaire_version_id = new.id) then
      raise exception 'A questionnaire version needs at least one question before publishing'
        using errcode = '23514';
    end if;
    new.published_at := coalesce(new.published_at, now());
  end if;

  return new;
end;
$$;

create trigger questionnaire_versions_guard_transition
  before update on public.questionnaire_versions
  for each row execute function app.guard_version_transition();

-- A version that is in use must not be deleted; archiving is the way out.
create or replace function app.guard_version_in_use()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if old.status = 'published' then
    raise exception 'A published questionnaire version cannot be deleted; archive it instead'
      using errcode = '23514';
  end if;
  return old;
end;
$$;

create trigger questionnaire_versions_guard_delete
  before delete on public.questionnaire_versions
  for each row execute function app.guard_version_in_use();

-- ---------------------------------------------------------------------------
-- Grants and policies.
--
-- Authoring is an organization-administrator power; location managers and
-- viewers read only. Platform templates (organization_id is null) are readable
-- by every signed-in user so an organization can start from one.
-- ---------------------------------------------------------------------------
revoke all on public.questionnaire_templates            from anon;
revoke all on public.questionnaire_versions             from anon;
revoke all on public.questions                          from anon;
revoke all on public.question_options                   from anon;
revoke all on public.location_questionnaire_assignments from anon;

grant select, insert, update, delete on public.questionnaire_templates            to authenticated;
grant select, insert, update, delete on public.questionnaire_versions             to authenticated;
grant select, insert, update, delete on public.questions                          to authenticated;
grant select, insert, update, delete on public.question_options                   to authenticated;
grant select, insert, update, delete on public.location_questionnaire_assignments to authenticated;

-- Shared predicate: may the caller author questionnaires in this scope?
-- A null organization means a platform template, which only platform admins own.
create or replace function app.can_author_questionnaire(p_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select case
    when p_organization_id is null then app.is_platform_admin()
    else app.is_platform_admin() or app.is_organization_admin(p_organization_id)
  end;
$$;

revoke all on function app.can_author_questionnaire(uuid) from public, anon;
grant execute on function app.can_author_questionnaire(uuid) to authenticated, service_role;

create or replace function app.can_read_questionnaire(p_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select p_organization_id is null
     or app.is_platform_support()
     or app.is_organization_member(p_organization_id);
$$;

revoke all on function app.can_read_questionnaire(uuid) from public, anon;
grant execute on function app.can_read_questionnaire(uuid) to authenticated, service_role;

-- templates
create policy questionnaire_templates_select on public.questionnaire_templates
  for select to authenticated using (app.can_read_questionnaire(organization_id));
create policy questionnaire_templates_insert on public.questionnaire_templates
  for insert to authenticated with check (app.can_author_questionnaire(organization_id));
create policy questionnaire_templates_update on public.questionnaire_templates
  for update to authenticated
  using (app.can_author_questionnaire(organization_id))
  with check (app.can_author_questionnaire(organization_id));
create policy questionnaire_templates_delete on public.questionnaire_templates
  for delete to authenticated using (app.can_author_questionnaire(organization_id));

-- versions
create policy questionnaire_versions_select on public.questionnaire_versions
  for select to authenticated using (app.can_read_questionnaire(organization_id));
create policy questionnaire_versions_insert on public.questionnaire_versions
  for insert to authenticated with check (app.can_author_questionnaire(organization_id));
create policy questionnaire_versions_update on public.questionnaire_versions
  for update to authenticated
  using (app.can_author_questionnaire(organization_id))
  with check (app.can_author_questionnaire(organization_id));
create policy questionnaire_versions_delete on public.questionnaire_versions
  for delete to authenticated using (app.can_author_questionnaire(organization_id));

-- questions
create policy questions_select on public.questions
  for select to authenticated using (app.can_read_questionnaire(organization_id));
create policy questions_insert on public.questions
  for insert to authenticated with check (app.can_author_questionnaire(organization_id));
create policy questions_update on public.questions
  for update to authenticated
  using (app.can_author_questionnaire(organization_id))
  with check (app.can_author_questionnaire(organization_id));
create policy questions_delete on public.questions
  for delete to authenticated using (app.can_author_questionnaire(organization_id));

-- options
create policy question_options_select on public.question_options
  for select to authenticated using (app.can_read_questionnaire(organization_id));
create policy question_options_insert on public.question_options
  for insert to authenticated with check (app.can_author_questionnaire(organization_id));
create policy question_options_update on public.question_options
  for update to authenticated
  using (app.can_author_questionnaire(organization_id))
  with check (app.can_author_questionnaire(organization_id));
create policy question_options_delete on public.question_options
  for delete to authenticated using (app.can_author_questionnaire(organization_id));

-- assignments: readable by anyone who may see the location, written by admins
create policy assignments_select on public.location_questionnaire_assignments
  for select to authenticated
  using (
    app.is_platform_support()
    or app.is_organization_member(organization_id)
  );
create policy assignments_insert on public.location_questionnaire_assignments
  for insert to authenticated
  with check (app.is_platform_admin() or app.is_organization_admin(organization_id));
create policy assignments_update on public.location_questionnaire_assignments
  for update to authenticated
  using (app.is_platform_admin() or app.is_organization_admin(organization_id))
  with check (app.is_platform_admin() or app.is_organization_admin(organization_id));
create policy assignments_delete on public.location_questionnaire_assignments
  for delete to authenticated
  using (app.is_platform_admin() or app.is_organization_admin(organization_id));

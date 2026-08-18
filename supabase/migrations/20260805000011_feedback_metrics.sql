-- Per-question results.
--
-- The portal's numbers come from PostgreSQL, never from application code and
-- never from AI. This function is the single definition of "results per
-- question", so a table, an export and a chart cannot drift apart.
--
-- SECURITY INVOKER: RLS on feedback_submissions applies to the caller, so a
-- location manager asking about a location they cannot see gets no rows rather
-- than someone else's aggregate.

create or replace function public.question_results(
  p_location_id uuid,
  p_from        timestamptz default null,
  p_to          timestamptz default null
)
returns table (
  question_id      uuid,
  question_key     text,
  question_label   text,
  question_type    text,
  category         text,
  display_order    integer,
  respondent_count bigint,
  average_rating   numeric,
  option_id        uuid,
  option_key       text,
  option_label     text,
  option_order     integer,
  option_count     bigint,
  option_share     numeric
)
language sql
stable
security invoker
set search_path = pg_catalog, public
as $$
  with scoped as (
    select s.id, s.questionnaire_version_id
    from public.feedback_submissions s
    where s.location_id = p_location_id
      and (p_from is null or s.submitted_at >= p_from)
      and (p_to   is null or s.submitted_at <  p_to)
  ),
  -- Every question of every version these submissions used, so a question that
  -- nobody answered still appears with a zero instead of vanishing.
  asked as (
    select distinct q.*
    from public.questions q
    where q.questionnaire_version_id in (select distinct questionnaire_version_id from scoped)
  ),
  per_question as (
    select
      a.id as question_id,
      count(distinct ans.feedback_submission_id) as respondent_count,
      -- Only meaningful for a rating question; null elsewhere.
      case when a.question_type = 'rating'
           then round(avg((ans.answer_json ->> 'rating')::numeric), 2)
           end as average_rating
    from asked a
    left join public.feedback_answers ans
           on ans.question_id = a.id
          and ans.feedback_submission_id in (select id from scoped)
    group by a.id, a.question_type
  ),
  per_option as (
    select
      o.question_id,
      o.id as option_id,
      count(ans.id) as option_count
    from public.question_options o
    left join public.feedback_answers ans
           on ans.selected_option_id = o.id
          and ans.feedback_submission_id in (select id from scoped)
    where o.question_id in (select id from asked)
    group by o.question_id, o.id
  )
  select
    a.id,
    a.question_key,
    a.label,
    a.question_type,
    a.category,
    a.display_order,
    pq.respondent_count,
    pq.average_rating,
    o.id,
    o.option_key,
    o.label,
    o.display_order,
    -- Null, not zero, when the question has no options at all: a rating question
    -- reporting "0 selections, 0%" reads like nobody answered it.
    case when o.id is not null then coalesce(po.option_count, 0) end,
    -- Share of the people who answered *this* question, not of all submissions:
    -- a conditional question is only asked of some respondents, and dividing by
    -- everyone would understate every topic on it.
    case when o.id is not null and pq.respondent_count > 0
         then round(100.0 * coalesce(po.option_count, 0) / pq.respondent_count, 1)
         end
  from asked a
  join per_question pq on pq.question_id = a.id
  left join public.question_options o on o.question_id = a.id
  left join per_option po on po.option_id = o.id
  order by a.display_order, o.display_order nulls first;
$$;

revoke all on function public.question_results(uuid, timestamptz, timestamptz) from public, anon;
grant execute on function public.question_results(uuid, timestamptz, timestamptz) to authenticated;

-- ---------------------------------------------------------------------------
-- Headline numbers for a location over a period.
-- ---------------------------------------------------------------------------
create or replace function public.location_period_metrics(
  p_location_id uuid,
  p_from        timestamptz default null,
  p_to          timestamptz default null
)
returns table (
  response_count        bigint,
  average_score         numeric,
  low_score_percentage  numeric,
  session_count         bigint,
  completion_percentage numeric,
  score_1               bigint,
  score_2               bigint,
  score_3               bigint,
  score_4               bigint,
  score_5               bigint
)
language sql
stable
security invoker
set search_path = pg_catalog, public
as $$
  with subs as (
    select s.overall_score
    from public.feedback_submissions s
    where s.location_id = p_location_id
      and (p_from is null or s.submitted_at >= p_from)
      and (p_to   is null or s.submitted_at <  p_to)
  ),
  sess as (
    select count(*) as total
    from public.feedback_sessions fs
    where fs.location_id = p_location_id
      and (p_from is null or fs.started_at >= p_from)
      and (p_to   is null or fs.started_at <  p_to)
  )
  select
    count(*),
    round(avg(overall_score), 2),
    case when count(*) > 0
         then round(100.0 * sum(case when overall_score <= 2 then 1 else 0 end) / count(*), 1)
         end,
    (select total from sess),
    case when (select total from sess) > 0
         then round(100.0 * count(*) / (select total from sess), 1)
         end,
    sum(case when overall_score = 1 then 1 else 0 end),
    sum(case when overall_score = 2 then 1 else 0 end),
    sum(case when overall_score = 3 then 1 else 0 end),
    sum(case when overall_score = 4 then 1 else 0 end),
    sum(case when overall_score = 5 then 1 else 0 end)
  from subs;
$$;

revoke all on function public.location_period_metrics(uuid, timestamptz, timestamptz) from public, anon;
grant execute on function public.location_period_metrics(uuid, timestamptz, timestamptz) to authenticated;

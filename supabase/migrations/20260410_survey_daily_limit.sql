-- Enforce at most 8 survey completions per member per rolling 24-hour window (server time).

create index if not exists idx_survey_completions_user_created_at
  on public.survey_completions (user_id, created_at desc);

create or replace function public.enforce_survey_daily_limit()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
declare
  recent_count int;
  v_max int := 8;
begin
  select count(*)::int into recent_count
  from public.survey_completions
  where user_id = new.user_id
    and created_at >= (now() - interval '24 hours');

  if recent_count >= v_max then
    raise exception 'You can complete up to 8 surveys per 24 hours. Please try again later.'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_survey_completions_daily_limit on public.survey_completions;

create trigger trg_survey_completions_daily_limit
  before insert on public.survey_completions
  for each row
  execute function public.enforce_survey_daily_limit();

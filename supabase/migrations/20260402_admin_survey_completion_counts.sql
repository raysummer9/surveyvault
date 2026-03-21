-- Aggregated completion counts for admin survey list (GROUP BY in DB; avoids loading every completion row).
create or replace function public.admin_survey_completion_counts(p_survey_ids uuid[])
returns table (survey_id uuid, completion_count bigint)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin_email(public.jwt_email()) then
    raise exception 'not authorized';
  end if;

  if p_survey_ids is null or coalesce(array_length(p_survey_ids, 1), 0) = 0 then
    return;
  end if;

  return query
  select sc.survey_id, count(*)::bigint
  from public.survey_completions sc
  where sc.survey_id = any (p_survey_ids)
  group by sc.survey_id;
end;
$$;

revoke all on function public.admin_survey_completion_counts(uuid[]) from public;
grant execute on function public.admin_survey_completion_counts(uuid[]) to authenticated;

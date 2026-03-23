-- Account suspension (admin-managed) + admin directory listing with member stats.

alter table public.user_profiles
  add column if not exists account_suspended boolean not null default false,
  add column if not exists suspended_at timestamptz,
  add column if not exists suspended_reason text;

create index if not exists idx_user_profiles_account_suspended on public.user_profiles (account_suspended)
  where account_suspended = true;

comment on column public.user_profiles.account_suspended is 'When true, member cannot use /dashboard; sees policy notice instead.';
comment on column public.user_profiles.suspended_at is 'When the account was suspended (UTC).';
comment on column public.user_profiles.suspended_reason is 'Optional internal note shown to admins.';

-- Only admins may change suspension fields (RLS already restricts profile updates; this blocks direct API abuse).
create or replace function public.user_profiles_enforce_suspension_admin_only()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' then
    if (new.account_suspended is distinct from old.account_suspended)
       or (new.suspended_at is distinct from old.suspended_at)
       or (new.suspended_reason is distinct from old.suspended_reason) then
      if not public.is_admin_for_rls() then
        raise exception 'Only administrators may change account suspension';
      end if;
    end if;
    if new.account_suspended = true and (old.account_suspended is distinct from true) then
      new.suspended_at := coalesce(new.suspended_at, timezone('utc', now()));
    end if;
    if new.account_suspended = false then
      new.suspended_at := null;
      new.suspended_reason := null;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_user_profiles_suspension_admin_only on public.user_profiles;
create trigger trg_user_profiles_suspension_admin_only
before update on public.user_profiles
for each row
execute function public.user_profiles_enforce_suspension_admin_only();

-- Aggregated member list for admin UI (single round-trip).
create or replace function public.admin_list_member_directory(
  p_limit int default 50,
  p_offset int default 0,
  p_search text default null
)
returns table (
  id uuid,
  email text,
  first_name text,
  last_name text,
  onboarding_status text,
  workforce_approved boolean,
  workforce_joined boolean,
  workforce_payment_confirmed boolean,
  account_suspended boolean,
  suspended_at timestamptz,
  suspended_reason text,
  created_at timestamptz,
  completed_surveys bigint,
  lifetime_paid_cents bigint,
  withdrawable_cents bigint,
  pending_withdrawal_cents bigint,
  total_count bigint
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_search text := nullif(trim(p_search), '');
begin
  if not public.is_admin_for_rls() then
    raise exception 'not authorized';
  end if;

  return query
  with base as (
    select p.*
    from public.user_profiles p
    where v_search is null
      or p.email ilike '%' || v_search || '%'
      or coalesce(p.first_name, '') ilike '%' || v_search || '%'
      or coalesce(p.last_name, '') ilike '%' || v_search || '%'
  ),
  counted as (
    select count(*)::bigint as c from base
  ),
  sc_counts as (
    select sc.user_id, count(*)::bigint as cnt
    from public.survey_completions sc
    group by sc.user_id
  ),
  paid_totals as (
    select sc.user_id, sum(sc.reward_cents)::bigint as total_paid
    from public.survey_completions sc
    where sc.payout_status = 'paid'
    group by sc.user_id
  ),
  pending_w as (
    select w.user_id, sum(w.amount_cents)::bigint as pending_sum
    from public.withdrawal_requests w
    where w.status = 'pending'
    group by w.user_id
  ),
  outflow_w as (
    select w.user_id, sum(w.amount_cents)::bigint as out_sum
    from public.withdrawal_requests w
    where w.status in ('pending', 'approved')
    group by w.user_id
  )
  select
    b.id,
    b.email,
    b.first_name,
    b.last_name,
    b.onboarding_status,
    b.workforce_approved,
    b.workforce_joined,
    b.workforce_payment_confirmed,
    b.account_suspended,
    b.suspended_at,
    b.suspended_reason,
    b.created_at,
    coalesce(sc.cnt, 0)::bigint,
    coalesce(pt.total_paid, 0)::bigint,
    greatest(
      coalesce(pt.total_paid, 0) - coalesce(ow.out_sum, 0),
      0
    )::bigint,
    coalesce(pw.pending_sum, 0)::bigint,
    cnt.c
  from base b
  cross join counted cnt
  left join sc_counts sc on sc.user_id = b.id
  left join paid_totals pt on pt.user_id = b.id
  left join pending_w pw on pw.user_id = b.id
  left join outflow_w ow on ow.user_id = b.id
  order by b.created_at desc nulls last
  limit greatest(coalesce(p_limit, 50), 1)
  offset greatest(coalesce(p_offset, 0), 0);
end;
$$;

revoke all on function public.admin_list_member_directory(int, int, text) from public;
grant execute on function public.admin_list_member_directory(int, int, text) to authenticated;

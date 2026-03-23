-- Add verified membership tier (Silver / Gold / Platinum) to admin member directory for UI badges.

drop function if exists public.admin_list_member_directory(integer, integer, text);

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
  total_earned_cents bigint,
  withdrawable_cents bigint,
  pending_payout_cents bigint,
  total_payout_cents bigint,
  membership_tier_id uuid,
  membership_tier_slug text,
  membership_tier_name text,
  membership_tier_badge text,
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
    where not exists (
      select 1
      from public.admin_users au
      where length(trim(coalesce(p.email, ''))) > 0
        and lower(trim(au.email)) = lower(trim(p.email))
    )
    and (
      v_search is null
      or p.email ilike '%' || v_search || '%'
      or coalesce(p.first_name, '') ilike '%' || v_search || '%'
      or coalesce(p.last_name, '') ilike '%' || v_search || '%'
    )
  ),
  counted as (
    select count(*)::bigint as c from base
  ),
  sc_counts as (
    select sc.user_id, count(*)::bigint as cnt
    from public.survey_completions sc
    group by sc.user_id
  ),
  earned_totals as (
    select sc.user_id, sum(sc.reward_cents)::bigint as total_earned
    from public.survey_completions sc
    group by sc.user_id
  ),
  paid_totals as (
    select sc.user_id, sum(sc.reward_cents)::bigint as total_paid
    from public.survey_completions sc
    where sc.payout_status = 'paid'
    group by sc.user_id
  ),
  pending_wd as (
    select w.user_id, sum(w.amount_cents)::bigint as pending_sum
    from public.withdrawal_requests w
    where w.status = 'pending'
    group by w.user_id
  ),
  approved_wd as (
    select w.user_id, sum(w.amount_cents)::bigint as approved_sum
    from public.withdrawal_requests w
    where w.status = 'approved'
    group by w.user_id
  ),
  outflow_w as (
    select w.user_id, sum(w.amount_cents)::bigint as out_sum
    from public.withdrawal_requests w
    where w.status in ('pending', 'approved')
    group by w.user_id
  ),
  user_tier as (
    select user_id, tier_id, tier_slug, tier_name, tier_badge
    from (
      select
        wp.user_id,
        pc.id as tier_id,
        pc.slug as tier_slug,
        pc.name as tier_name,
        pc.badge as tier_badge,
        row_number() over (
          partition by wp.user_id
          order by pc.sort_order desc nulls last
        ) as rn
      from public.workforce_payments wp
      inner join public.payment_categories pc on (
        pc.id::text = trim(wp.tier_id)
        or lower(trim(coalesce(pc.slug, ''))) = lower(trim(wp.tier_id))
      )
      where wp.status = 'verified'
    ) ranked
    where rn = 1
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
    coalesce(et.total_earned, 0)::bigint,
    greatest(
      coalesce(pt.total_paid, 0) - coalesce(ow.out_sum, 0),
      0
    )::bigint,
    coalesce(pwd.pending_sum, 0)::bigint,
    coalesce(awd.approved_sum, 0)::bigint,
    ut.tier_id,
    ut.tier_slug,
    ut.tier_name,
    ut.tier_badge,
    cnt.c
  from base b
  cross join counted cnt
  left join sc_counts sc on sc.user_id = b.id
  left join earned_totals et on et.user_id = b.id
  left join paid_totals pt on pt.user_id = b.id
  left join pending_wd pwd on pwd.user_id = b.id
  left join approved_wd awd on awd.user_id = b.id
  left join outflow_w ow on ow.user_id = b.id
  left join user_tier ut on ut.user_id = b.id
  order by b.created_at desc nulls last
  limit greatest(coalesce(p_limit, 50), 1)
  offset greatest(coalesce(p_offset, 0), 0);
end;
$$;

revoke all on function public.admin_list_member_directory(int, int, text) from public;
grant execute on function public.admin_list_member_directory(int, int, text) to authenticated;

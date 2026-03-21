-- Survey visibility by workforce tier (payment_categories.sort_order: Silver=0 < Gold=1 < Platinum=2).
--
-- Rules (verified member_max_tier_sort = highest tier they have paid for):
--   Silver (0):   only surveys that require Silver   (required sort 0)
--   Gold (1):     surveys requiring Silver or Gold   (required sort 0 or 1)
--   Platinum (2): all surveys                        (required sort 0, 1, or 2)
--
-- Access iff: survey.required_tier.sort_order <= member_max_tier_sort(user)
-- Members with no verified payment: member_max_tier_sort = -1 → no surveys.

create or replace function public.member_max_tier_sort(p_user_id uuid)
returns int
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select max(pc_u.sort_order)::int
      from public.workforce_payments wp
      inner join public.payment_categories pc_u
        on (
          pc_u.id::text = trim(wp.tier_id)
          or lower(trim(pc_u.slug)) = lower(trim(wp.tier_id))
        )
      where wp.user_id = p_user_id
        and wp.status = 'verified'
    ),
    -1
  );
$$;

revoke all on function public.member_max_tier_sort(uuid) from public;
grant execute on function public.member_max_tier_sort(uuid) to authenticated;

create or replace function public.member_can_access_survey(p_user_id uuid, p_survey_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select
        s.is_active
        and s.payment_category_id is not null
        and pc_req.sort_order <= public.member_max_tier_sort(p_user_id)
      from public.surveys s
      inner join public.payment_categories pc_req on pc_req.id = s.payment_category_id
      where s.id = p_survey_id
    ),
    false
  );
$$;

revoke all on function public.member_can_access_survey(uuid, uuid) from public;
grant execute on function public.member_can_access_survey(uuid, uuid) to authenticated;

-- Every survey must declare a tier (Silver / Gold / Platinum); no “open to all tiers” row without a category.
update public.surveys s
set payment_category_id = pc.id
from public.payment_categories pc
where s.payment_category_id is null
  and pc.slug = 'silver';

alter table public.surveys
  alter column payment_category_id set not null;

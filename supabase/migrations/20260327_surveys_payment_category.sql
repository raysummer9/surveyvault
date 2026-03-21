-- Tie each survey to a payment category (membership tier). Members only see surveys
-- for their tier level or lower requirement (sort_order: Silver < Gold < Platinum).

alter table public.surveys
  add column if not exists payment_category_id uuid references public.payment_categories (id) on delete restrict;

create index if not exists idx_surveys_payment_category on public.surveys (payment_category_id);

-- Backfill existing rows to Silver (lowest tier)
update public.surveys s
set payment_category_id = pc.id
from public.payment_categories pc
where s.payment_category_id is null
  and pc.slug = 'silver';

-- Max tier sort_order the member has unlocked via verified workforce payments
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

-- Survey visible if active and member's max tier >= required tier (by sort_order)
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
        and coalesce(pc_req.sort_order, 0) <= public.member_max_tier_sort(p_user_id)
      from public.surveys s
      left join public.payment_categories pc_req on pc_req.id = s.payment_category_id
      where s.id = p_survey_id
    ),
    false
  );
$$;

revoke all on function public.member_can_access_survey(uuid, uuid) from public;
grant execute on function public.member_can_access_survey(uuid, uuid) to authenticated;

-- Replace member read policy on surveys
drop policy if exists "Members can read active surveys" on public.surveys;
create policy "Members read surveys for their payment tier"
on public.surveys for select
to authenticated
using (
  public.member_can_access_survey(auth.uid(), id)
);

-- Tighten completion insert: must be eligible for that survey
drop policy if exists "Users insert own survey completions" on public.survey_completions;
create policy "Users insert own survey completions"
on public.survey_completions for insert
to authenticated
with check (
  auth.uid() = user_id
  and public.member_can_access_survey(auth.uid(), survey_id)
);

-- Workforce membership tiers / payment plans (admin-managed, user-facing join + payment flow)
create table if not exists public.payment_categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique,
  name text not null,
  btc_amount text not null,
  usd_amount numeric(12, 2) not null,
  payout_limit text not null,
  features jsonb not null default '[]'::jsonb,
  badge text,
  button_color text not null default 'grey' check (button_color in ('grey', 'orange', 'blue')),
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_payment_categories_active_sort
  on public.payment_categories (is_active, sort_order);

alter table public.payment_categories enable row level security;

-- Authenticated members: only active plans (join workforce + payment page)
create policy "Authenticated read active payment categories"
on public.payment_categories for select
to authenticated
using (is_active = true);

-- Admins: full read (including inactive / drafts)
create policy "Admins read all payment categories"
on public.payment_categories for select
using (public.is_admin_email(auth.jwt() ->> 'email'));

create policy "Admins insert payment categories"
on public.payment_categories for insert
with check (public.is_admin_email(auth.jwt() ->> 'email'));

create policy "Admins update payment categories"
on public.payment_categories for update
using (public.is_admin_email(auth.jwt() ->> 'email'))
with check (public.is_admin_email(auth.jwt() ->> 'email'));

create policy "Admins delete payment categories"
on public.payment_categories for delete
using (public.is_admin_email(auth.jwt() ->> 'email'));

create or replace function public.set_payment_categories_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_payment_categories_updated_at on public.payment_categories;
create trigger trg_payment_categories_updated_at
before update on public.payment_categories
for each row execute function public.set_payment_categories_updated_at();

-- Seed default tiers (matches previous client-side membershipTiers)
insert into public.payment_categories (
  slug, name, btc_amount, usd_amount, payout_limit, features, badge, button_color, sort_order, is_active
) values
(
  'silver',
  'Silver',
  '0.005',
  320,
  '$500/month',
  '[
    {"text": "Basic Survey Access (15/day)", "included": true},
    {"text": "$500/month Payout Limit", "included": true},
    {"text": "Standard Priority", "included": true},
    {"text": "Email Support", "included": true},
    {"text": "Bonus Surveys", "included": false},
    {"text": "Priority Matching", "included": false}
  ]'::jsonb,
  null,
  'grey',
  0,
  true
),
(
  'gold',
  'Gold',
  '0.015',
  960,
  '$2,000/month',
  '[
    {"text": "Advanced Survey Access (40/day)", "included": true},
    {"text": "$2,000/month Payout Limit", "included": true},
    {"text": "High Priority Matching (2x faster)", "included": true},
    {"text": "Priority Support", "included": true},
    {"text": "Bonus Surveys (+5 exclusive/week)", "included": true},
    {"text": "Dedicated Account Manager", "included": false}
  ]'::jsonb,
  'Gold',
  'orange',
  1,
  true
),
(
  'platinum',
  'Platinum',
  '0.035',
  2240,
  'Unlimited',
  '[
    {"text": "Unlimited Survey Access", "included": true},
    {"text": "Unlimited Payout", "included": true},
    {"text": "Top Priority Matching", "included": true},
    {"text": "24/7 Live Support", "included": true},
    {"text": "Exclusive Bonus Surveys (+20 premium/week)", "included": true},
    {"text": "Dedicated Account Manager", "included": true}
  ]'::jsonb,
  null,
  'blue',
  2,
  true
)
on conflict (slug) do nothing;

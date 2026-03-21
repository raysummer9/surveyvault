-- Store workforce payment submissions (TX hash, etc.) for admin verification
create table if not exists public.workforce_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  tier_id text not null,
  amount_btc text not null,
  amount_usd numeric not null,
  currency_sent text not null default 'btc',
  tx_hash text,
  amount_sent text,
  wallet_address text,
  notes text,
  status text not null default 'pending' check (status in ('pending', 'verified', 'rejected')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_workforce_payments_user_id on public.workforce_payments (user_id);
create index if not exists idx_workforce_payments_status on public.workforce_payments (status);

alter table public.workforce_payments enable row level security;

create policy "Users can insert own workforce payments"
on public.workforce_payments for insert
with check (auth.uid() = user_id);

create policy "Users can select own workforce payments"
on public.workforce_payments for select
using (auth.uid() = user_id);

-- Admins need to read/update for verification (admin policies from admin_users)
drop policy if exists "Admins can read all workforce payments" on public.workforce_payments;
create policy "Admins can read all workforce payments"
on public.workforce_payments for select
using (public.is_admin_email(auth.jwt() ->> 'email'));

drop policy if exists "Admins can update all workforce payments" on public.workforce_payments;
create policy "Admins can update all workforce payments"
on public.workforce_payments for update
using (public.is_admin_email(auth.jwt() ->> 'email'))
with check (public.is_admin_email(auth.jwt() ->> 'email'));

create or replace function public.set_workforce_payments_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_workforce_payments_updated_at on public.workforce_payments;
create trigger set_workforce_payments_updated_at
before update on public.workforce_payments
for each row execute function public.set_workforce_payments_updated_at();

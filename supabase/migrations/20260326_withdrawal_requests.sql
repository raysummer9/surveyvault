-- Member withdrawal requests ($500+). Balance = paid survey earnings minus pending/approved withdrawals.

create table if not exists public.withdrawal_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  amount_cents bigint not null check (amount_cents >= 50000),
  method text not null check (method in ('crypto', 'bank')),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  -- Crypto payout
  crypto_network text,
  crypto_wallet_address text,
  -- Bank transfer
  bank_account_holder text,
  bank_name text,
  bank_account_number text,
  bank_routing_or_iban text,
  bank_country text,
  member_note text,
  admin_rejection_reason text,
  reviewed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_withdrawal_requests_user on public.withdrawal_requests (user_id);
create index if not exists idx_withdrawal_requests_status on public.withdrawal_requests (status);

drop trigger if exists set_withdrawal_requests_updated_at on public.withdrawal_requests;
create trigger set_withdrawal_requests_updated_at
before update on public.withdrawal_requests
for each row execute function public.set_updated_at();

-- Balance: sum(paid survey completions) - sum(pending + approved withdrawals for user)
-- Callable only for auth.uid() = p_user_id (no peeking at other users).
create or replace function public.withdrawable_balance_cents(p_user_id uuid)
returns bigint
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if p_user_id is null or p_user_id <> auth.uid() then
    raise exception 'not allowed';
  end if;
  return coalesce(
    (select sum(sc.reward_cents)::bigint
     from public.survey_completions sc
     where sc.user_id = p_user_id and sc.payout_status = 'paid'),
    0
  )
  - coalesce(
    (select sum(w.amount_cents)::bigint
     from public.withdrawal_requests w
     where w.user_id = p_user_id and w.status in ('pending', 'approved')),
    0
  );
end;
$$;

revoke all on function public.withdrawable_balance_cents(uuid) from public;
grant execute on function public.withdrawable_balance_cents(uuid) to authenticated;

create or replace function public.enforce_withdrawal_insert_balance()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  avail bigint;
begin
  if new.user_id <> auth.uid() then
    raise exception 'Invalid user';
  end if;
  if new.amount_cents < 50000 then
    raise exception 'Minimum withdrawal is $500.00 USD';
  end if;
  avail := public.withdrawable_balance_cents(new.user_id);
  -- Balance before this row is counted: withdrawable = paid - existing pending/approved
  if new.amount_cents > avail then
    raise exception 'Insufficient withdrawable balance (available: % cents)', avail;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_withdrawal_balance on public.withdrawal_requests;
create trigger trg_withdrawal_balance
before insert on public.withdrawal_requests
for each row execute function public.enforce_withdrawal_insert_balance();

alter table public.withdrawal_requests enable row level security;

drop policy if exists "Users insert own withdrawal requests" on public.withdrawal_requests;
create policy "Users insert own withdrawal requests"
on public.withdrawal_requests for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users select own withdrawal requests" on public.withdrawal_requests;
create policy "Users select own withdrawal requests"
on public.withdrawal_requests for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Admins read all withdrawal requests" on public.withdrawal_requests;
create policy "Admins read all withdrawal requests"
on public.withdrawal_requests for select
using (public.is_admin_for_rls());

drop policy if exists "Admins update withdrawal requests" on public.withdrawal_requests;
create policy "Admins update withdrawal requests"
on public.withdrawal_requests for update
using (public.is_admin_for_rls())
with check (public.is_admin_for_rls());

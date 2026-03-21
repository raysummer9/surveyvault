-- Track when user has completed payment (awaiting admin workforce approval)
alter table public.user_profiles
  add column if not exists workforce_payment_confirmed boolean not null default false;

create index if not exists idx_user_profiles_workforce_payment_confirmed
  on public.user_profiles (workforce_payment_confirmed);

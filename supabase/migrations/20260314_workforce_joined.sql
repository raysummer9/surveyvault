-- Add workforce_joined to track when user has completed the join flow (payment, etc.)
alter table public.user_profiles
  add column if not exists workforce_joined boolean not null default false;

create index if not exists idx_user_profiles_workforce_joined on public.user_profiles (workforce_joined);

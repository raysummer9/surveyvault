-- SurveyVault auth + onboarding backend schema
-- Run in Supabase SQL editor or migration pipeline.

create extension if not exists "pgcrypto";

create table if not exists public.user_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  first_name text,
  last_name text,
  onboarding_status text not null default 'in_progress' check (onboarding_status in ('in_progress', 'completed', 'approved', 'rejected')),
  workforce_approved boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.onboarding_submissions (
  user_id uuid primary key references auth.users (id) on delete cascade,
  current_step text not null default 'profile',
  is_profile_complete boolean not null default false,
  is_skill_complete boolean not null default false,
  is_id_complete boolean not null default false,
  is_address_complete boolean not null default false,
  is_onboarding_complete boolean not null default false,
  profile_data jsonb not null default '{}'::jsonb,
  skills_data jsonb not null default '{}'::jsonb,
  id_verification_data jsonb not null default '{}'::jsonb,
  address_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_user_profiles_onboarding_status on public.user_profiles (onboarding_status);
create index if not exists idx_user_profiles_workforce_approved on public.user_profiles (workforce_approved);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_user_profiles_updated_at on public.user_profiles;
create trigger set_user_profiles_updated_at
before update on public.user_profiles
for each row
execute function public.set_updated_at();

drop trigger if exists set_onboarding_submissions_updated_at on public.onboarding_submissions;
create trigger set_onboarding_submissions_updated_at
before update on public.onboarding_submissions
for each row
execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (id, email, first_name, last_name, onboarding_status)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'first_name', null),
    coalesce(new.raw_user_meta_data ->> 'last_name', null),
    'in_progress'
  )
  on conflict (id) do nothing;

  insert into public.onboarding_submissions (user_id, current_step)
  values (new.id, 'profile')
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

alter table public.user_profiles enable row level security;
alter table public.onboarding_submissions enable row level security;

drop policy if exists "Users can select own profile" on public.user_profiles;
create policy "Users can select own profile"
on public.user_profiles
for select
using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.user_profiles;
create policy "Users can insert own profile"
on public.user_profiles
for insert
with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.user_profiles;
create policy "Users can update own profile"
on public.user_profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Users can select own onboarding" on public.onboarding_submissions;
create policy "Users can select own onboarding"
on public.onboarding_submissions
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own onboarding" on public.onboarding_submissions;
create policy "Users can insert own onboarding"
on public.onboarding_submissions
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own onboarding" on public.onboarding_submissions;
create policy "Users can update own onboarding"
on public.onboarding_submissions
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);


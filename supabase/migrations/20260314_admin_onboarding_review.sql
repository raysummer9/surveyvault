-- Admin onboarding review permissions
-- Uses public.admin_users allowlist table keyed by email.

create table if not exists public.admin_users (
  email text primary key,
  created_at timestamptz not null default timezone('utc', now())
);

-- IMPORTANT:
-- Avoid policy recursion by checking admin status via a SECURITY DEFINER function.
create or replace function public.is_admin_email(input_email text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users as admins
    where admins.email = input_email
  );
$$;

revoke all on function public.is_admin_email(text) from public;
grant execute on function public.is_admin_email(text) to anon, authenticated;

alter table public.admin_users disable row level security;

drop policy if exists "Admins can read admin_users" on public.admin_users;

drop policy if exists "Admins can read all profiles" on public.user_profiles;
create policy "Admins can read all profiles"
on public.user_profiles
for select
using (public.is_admin_email(auth.jwt() ->> 'email'));

drop policy if exists "Admins can update all profiles" on public.user_profiles;
create policy "Admins can update all profiles"
on public.user_profiles
for update
using (public.is_admin_email(auth.jwt() ->> 'email'))
with check (public.is_admin_email(auth.jwt() ->> 'email'));

drop policy if exists "Admins can read all onboarding submissions" on public.onboarding_submissions;
create policy "Admins can read all onboarding submissions"
on public.onboarding_submissions
for select
using (public.is_admin_email(auth.jwt() ->> 'email'));

drop policy if exists "Admins can update all onboarding submissions" on public.onboarding_submissions;
create policy "Admins can update all onboarding submissions"
on public.onboarding_submissions
for update
using (public.is_admin_email(auth.jwt() ->> 'email'))
with check (public.is_admin_email(auth.jwt() ->> 'email'));

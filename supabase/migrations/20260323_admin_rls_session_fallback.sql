-- Some JWTs still fail is_admin_email(jwt_email()) even with auth.users fallback in jwt_email().
-- This adds a second check: logged-in user's email from auth.users must match public.admin_users.
-- Keeps the same allowlist; does not grant access by uid alone.

create or replace function public.is_admin_session()
returns boolean
language plpgsql
stable
security definer
set search_path = public, auth
as $$
declare
  em text;
begin
  if auth.uid() is null then
    return false;
  end if;

  select lower(trim(u.email)) into em
  from auth.users u
  where u.id = auth.uid();

  if em is null or length(em) = 0 then
    return false;
  end if;

  return exists (
    select 1
    from public.admin_users au
    where lower(trim(au.email)) = em
  );
end;
$$;

revoke all on function public.is_admin_session() from public;
grant execute on function public.is_admin_session() to authenticated;

create or replace function public.is_admin_for_rls()
returns boolean
language plpgsql
stable
security definer
set search_path = public, auth
as $$
begin
  if public.is_admin_email(public.jwt_email()) then
    return true;
  end if;
  return public.is_admin_session();
end;
$$;

revoke all on function public.is_admin_for_rls() from public;
grant execute on function public.is_admin_for_rls() to anon, authenticated;

-- workforce_payments
drop policy if exists "Admins can read all workforce payments" on public.workforce_payments;
create policy "Admins can read all workforce payments"
on public.workforce_payments for select
using (public.is_admin_for_rls());

drop policy if exists "Admins can update all workforce payments" on public.workforce_payments;
create policy "Admins can update all workforce payments"
on public.workforce_payments for update
using (public.is_admin_for_rls())
with check (public.is_admin_for_rls());

-- user_profiles
drop policy if exists "Admins can read all profiles" on public.user_profiles;
create policy "Admins can read all profiles"
on public.user_profiles for select
using (public.is_admin_for_rls());

drop policy if exists "Admins can update all profiles" on public.user_profiles;
create policy "Admins can update all profiles"
on public.user_profiles for update
using (public.is_admin_for_rls())
with check (public.is_admin_for_rls());

-- onboarding_submissions
drop policy if exists "Admins can read all onboarding submissions" on public.onboarding_submissions;
create policy "Admins can read all onboarding submissions"
on public.onboarding_submissions for select
using (public.is_admin_for_rls());

drop policy if exists "Admins can update all onboarding submissions" on public.onboarding_submissions;
create policy "Admins can update all onboarding submissions"
on public.onboarding_submissions for update
using (public.is_admin_for_rls())
with check (public.is_admin_for_rls());

-- payment_categories
drop policy if exists "Admins read all payment categories" on public.payment_categories;
create policy "Admins read all payment categories"
on public.payment_categories for select
using (public.is_admin_for_rls());

drop policy if exists "Admins insert payment categories" on public.payment_categories;
create policy "Admins insert payment categories"
on public.payment_categories for insert
with check (public.is_admin_for_rls());

drop policy if exists "Admins update payment categories" on public.payment_categories;
create policy "Admins update payment categories"
on public.payment_categories for update
using (public.is_admin_for_rls())
with check (public.is_admin_for_rls());

drop policy if exists "Admins delete payment categories" on public.payment_categories;
create policy "Admins delete payment categories"
on public.payment_categories for delete
using (public.is_admin_for_rls());

-- Storage
drop policy if exists "Admins can view all onboarding files" on storage.objects;
create policy "Admins can view all onboarding files"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'onboarding-documents'
  and public.is_admin_for_rls()
);

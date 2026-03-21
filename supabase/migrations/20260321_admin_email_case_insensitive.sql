-- Match admin JWT email to admin_users case-insensitively (fixes empty RLS results when casing differs).
-- Also read email from user_metadata when the top-level claim is missing (some JWT shapes).
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
    where lower(trim(admins.email)) = lower(trim(coalesce(input_email, '')))
      and length(trim(coalesce(input_email, ''))) > 0
  );
$$;

revoke all on function public.is_admin_email(text) from public;
grant execute on function public.is_admin_email(text) to anon, authenticated;

-- Helper for policies: resolve email from common JWT locations
create or replace function public.jwt_email()
returns text
language sql
stable
as $$
  select nullif(
    trim(
      coalesce(
        auth.jwt() ->> 'email',
        auth.jwt() -> 'user_metadata' ->> 'email'
      )
    ),
    ''
  );
$$;

revoke all on function public.jwt_email() from public;
grant execute on function public.jwt_email() to anon, authenticated;

-- Use jwt_email() in admin policies so metadata-only emails still work
drop policy if exists "Admins can read all workforce payments" on public.workforce_payments;
create policy "Admins can read all workforce payments"
on public.workforce_payments for select
using (public.is_admin_email(public.jwt_email()));

drop policy if exists "Admins can update all workforce payments" on public.workforce_payments;
create policy "Admins can update all workforce payments"
on public.workforce_payments for update
using (public.is_admin_email(public.jwt_email()))
with check (public.is_admin_email(public.jwt_email()));

drop policy if exists "Admins can read all profiles" on public.user_profiles;
create policy "Admins can read all profiles"
on public.user_profiles for select
using (public.is_admin_email(public.jwt_email()));

drop policy if exists "Admins can update all profiles" on public.user_profiles;
create policy "Admins can update all profiles"
on public.user_profiles for update
using (public.is_admin_email(public.jwt_email()))
with check (public.is_admin_email(public.jwt_email()));

drop policy if exists "Admins can read all onboarding submissions" on public.onboarding_submissions;
create policy "Admins can read all onboarding submissions"
on public.onboarding_submissions for select
using (public.is_admin_email(public.jwt_email()));

drop policy if exists "Admins can update all onboarding submissions" on public.onboarding_submissions;
create policy "Admins can update all onboarding submissions"
on public.onboarding_submissions for update
using (public.is_admin_email(public.jwt_email()))
with check (public.is_admin_email(public.jwt_email()));

-- payment_categories admin policies
drop policy if exists "Admins read all payment categories" on public.payment_categories;
create policy "Admins read all payment categories"
on public.payment_categories for select
using (public.is_admin_email(public.jwt_email()));

drop policy if exists "Admins insert payment categories" on public.payment_categories;
create policy "Admins insert payment categories"
on public.payment_categories for insert
with check (public.is_admin_email(public.jwt_email()));

drop policy if exists "Admins update payment categories" on public.payment_categories;
create policy "Admins update payment categories"
on public.payment_categories for update
using (public.is_admin_email(public.jwt_email()))
with check (public.is_admin_email(public.jwt_email()));

drop policy if exists "Admins delete payment categories" on public.payment_categories;
create policy "Admins delete payment categories"
on public.payment_categories for delete
using (public.is_admin_email(public.jwt_email()));

-- Storage: admin onboarding files
drop policy if exists "Admins can view all onboarding files" on storage.objects;
create policy "Admins can view all onboarding files"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'onboarding-documents'
  and public.is_admin_email(public.jwt_email())
);

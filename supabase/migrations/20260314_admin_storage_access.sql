-- Allow admins to view all onboarding documents (for admin review)
drop policy if exists "Admins can view all onboarding files" on storage.objects;
create policy "Admins can view all onboarding files"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'onboarding-documents'
  and public.is_admin_email(auth.jwt() ->> 'email')
);

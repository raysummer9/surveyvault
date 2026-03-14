-- SurveyVault onboarding document storage bucket + policies

insert into storage.buckets (id, name, public, file_size_limit)
values ('onboarding-documents', 'onboarding-documents', false, 10485760)
on conflict (id) do nothing;

drop policy if exists "Users can view own onboarding files" on storage.objects;
create policy "Users can view own onboarding files"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'onboarding-documents'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users can upload own onboarding files" on storage.objects;
create policy "Users can upload own onboarding files"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'onboarding-documents'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users can update own onboarding files" on storage.objects;
create policy "Users can update own onboarding files"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'onboarding-documents'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'onboarding-documents'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users can delete own onboarding files" on storage.objects;
create policy "Users can delete own onboarding files"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'onboarding-documents'
  and (storage.foldername(name))[1] = auth.uid()::text
);

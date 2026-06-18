-- Switch primary admin from maildavidharris591@gmail.com → admin@mail.com.
-- Marks email confirmed so sign-in works without a verification step.

insert into public.admin_users (email)
values ('admin@mail.com')
on conflict (email) do nothing;

delete from public.admin_users
where lower(trim(email)) = lower('maildavidharris591@gmail.com');

update public.user_profiles
set email = 'admin@mail.com'
where lower(trim(email)) = lower('maildavidharris591@gmail.com');

do $$
declare
  admin_uid uuid;
begin
  select id into admin_uid
  from auth.users
  where lower(trim(email)) = lower('maildavidharris591@gmail.com');

  if admin_uid is null then
    return;
  end if;

  update auth.users
  set
    email = 'admin@mail.com',
    email_confirmed_at = coalesce(email_confirmed_at, timezone('utc', now())),
    updated_at = timezone('utc', now()),
    raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb)
      || jsonb_build_object('email', 'admin@mail.com')
  where id = admin_uid;

  update auth.identities
  set
    provider_id = 'admin@mail.com',
    identity_data = coalesce(identity_data, '{}'::jsonb)
      || jsonb_build_object('email', 'admin@mail.com'),
    updated_at = timezone('utc', now())
  where user_id = admin_uid
    and provider = 'email';
end;
$$;

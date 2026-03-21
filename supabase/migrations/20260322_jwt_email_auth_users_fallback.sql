-- When the JWT has no top-level `email` claim (common with some providers / API keys),
-- fall back to auth.users so is_admin_email() still matches admin_users for RLS.
create or replace function public.jwt_email()
returns text
language plpgsql
stable
security definer
set search_path = public, auth
as $$
declare
  v text;
  uid uuid;
begin
  v := nullif(
    trim(
      coalesce(
        auth.jwt() ->> 'email',
        auth.jwt() -> 'user_metadata' ->> 'email'
      )
    ),
    ''
  );

  if v is not null then
    return v;
  end if;

  begin
    uid := (auth.jwt() ->> 'sub')::uuid;
  exception
    when invalid_text_representation then
      return null;
  end;

  if uid is null then
    return null;
  end if;

  select nullif(trim(coalesce(u.email, '')), '') into v
  from auth.users u
  where u.id = uid;

  return v;
end;
$$;

revoke all on function public.jwt_email() from public;
grant execute on function public.jwt_email() to anon, authenticated;

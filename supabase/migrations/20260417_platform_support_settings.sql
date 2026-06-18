-- Singleton support links (Telegram, etc.) editable by admins; readable by all clients.

create table if not exists public.platform_support_settings (
  id smallint primary key default 1 check (id = 1),
  telegram_url text not null,
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists trg_platform_support_settings_updated_at on public.platform_support_settings;
create trigger trg_platform_support_settings_updated_at
before update on public.platform_support_settings
for each row execute function public.set_payment_categories_updated_at();

insert into public.platform_support_settings (id, telegram_url)
values (1, 'https://t.me/taskpluse')
on conflict (id) do nothing;

alter table public.platform_support_settings enable row level security;

drop policy if exists "Anyone read platform support settings" on public.platform_support_settings;
create policy "Anyone read platform support settings"
on public.platform_support_settings for select
to anon, authenticated
using (true);

drop policy if exists "Admins insert platform support settings" on public.platform_support_settings;
create policy "Admins insert platform support settings"
on public.platform_support_settings for insert
to authenticated
with check (public.is_admin_for_rls());

drop policy if exists "Admins update platform support settings" on public.platform_support_settings;
create policy "Admins update platform support settings"
on public.platform_support_settings for update
to authenticated
using (public.is_admin_for_rls())
with check (public.is_admin_for_rls());

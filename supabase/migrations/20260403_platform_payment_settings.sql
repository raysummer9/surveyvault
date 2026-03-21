-- Single-row settings for member crypto deposit addresses (shown on workforce payment page).
create table if not exists public.platform_payment_settings (
  id smallint primary key default 1 check (id = 1),
  btc_address text not null,
  eth_address text not null,
  usdt_address text not null,
  payment_window_minutes int not null default 45
    check (payment_window_minutes > 0 and payment_window_minutes <= 24 * 60),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists trg_platform_payment_settings_updated_at on public.platform_payment_settings;
create trigger trg_platform_payment_settings_updated_at
before update on public.platform_payment_settings
for each row execute function public.set_payment_categories_updated_at();

-- Seed matches previous client defaults in src/domain/paymentConfig.ts
insert into public.platform_payment_settings (id, btc_address, eth_address, usdt_address, payment_window_minutes)
values (
  1,
  'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
  '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
  '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
  45
)
on conflict (id) do nothing;

alter table public.platform_payment_settings enable row level security;

drop policy if exists "Authenticated read platform payment settings" on public.platform_payment_settings;
create policy "Authenticated read platform payment settings"
on public.platform_payment_settings for select
to authenticated
using (true);

drop policy if exists "Admins insert platform payment settings" on public.platform_payment_settings;
create policy "Admins insert platform payment settings"
on public.platform_payment_settings for insert
with check (public.is_admin_email(public.jwt_email()));

drop policy if exists "Admins update platform payment settings" on public.platform_payment_settings;
create policy "Admins update platform payment settings"
on public.platform_payment_settings for update
using (public.is_admin_email(public.jwt_email()))
with check (public.is_admin_email(public.jwt_email()));

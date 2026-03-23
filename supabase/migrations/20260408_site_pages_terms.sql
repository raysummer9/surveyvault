-- Editable public legal pages (terms, etc.). Read by anyone; write by admins only.

create table if not exists public.site_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  body_markdown text not null default '',
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_site_pages_slug on public.site_pages (slug);

comment on table public.site_pages is 'CMS-style pages shown on the public site (terms, etc.).';

drop trigger if exists set_site_pages_updated_at on public.site_pages;
create trigger set_site_pages_updated_at
before update on public.site_pages
for each row execute function public.set_updated_at();

alter table public.site_pages enable row level security;

drop policy if exists "site_pages_select_public" on public.site_pages;
create policy "site_pages_select_public"
on public.site_pages for select
to anon, authenticated
using (true);

drop policy if exists "site_pages_admin_all" on public.site_pages;
create policy "site_pages_admin_all"
on public.site_pages for all
to authenticated
using (public.is_admin_for_rls())
with check (public.is_admin_for_rls());

insert into public.site_pages (slug, title, body_markdown)
values (
  'terms',
  'Terms of Service',
  $markdown$
These Terms of Service ("Terms") govern your use of Taskpluse. By creating an account or using our services, you agree to these Terms and our [Privacy Policy](/privacy).

## Acceptable use

You agree not to misuse the platform, manipulate surveys or payouts, share accounts, or engage in fraud or harassment. We may suspend or terminate accounts that violate these rules or applicable law.

## Accounts

You are responsible for your login credentials and for activity under your account. You must provide accurate information during onboarding and workforce enrollment.

## Changes

We may update these Terms from time to time. Continued use after changes constitutes acceptance.
$markdown$
)
on conflict (slug) do nothing;

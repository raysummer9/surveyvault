-- Member surveys catalog + per-user completions (earnings stats on dashboard)

create table if not exists public.surveys (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  reward_cents int not null check (reward_cents >= 0),
  estimated_minutes int not null default 5 check (estimated_minutes >= 0),
  questions jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.survey_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  survey_id uuid not null references public.surveys (id) on delete cascade,
  reward_cents int not null check (reward_cents >= 0),
  answers jsonb not null default '{}'::jsonb,
  payout_status text not null default 'pending' check (payout_status in ('pending', 'paid')),
  paid_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  unique (user_id, survey_id)
);

create index if not exists idx_survey_completions_user_id on public.survey_completions (user_id);
create index if not exists idx_survey_completions_payout on public.survey_completions (user_id, payout_status);

alter table public.surveys enable row level security;
alter table public.survey_completions enable row level security;

-- Surveys: members read active catalog; admins manage all
drop policy if exists "Members can read active surveys" on public.surveys;
create policy "Members can read active surveys"
on public.surveys for select
to authenticated
using (is_active = true);

drop policy if exists "Admins can manage surveys" on public.surveys;
create policy "Admins can manage surveys"
on public.surveys for all
using (public.is_admin_for_rls())
with check (public.is_admin_for_rls());

-- Completions: users insert/select own; admins update payout
drop policy if exists "Users insert own survey completions" on public.survey_completions;
create policy "Users insert own survey completions"
on public.survey_completions for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users select own survey completions" on public.survey_completions;
create policy "Users select own survey completions"
on public.survey_completions for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Admins can read all survey completions" on public.survey_completions;
create policy "Admins can read all survey completions"
on public.survey_completions for select
using (public.is_admin_for_rls());

drop policy if exists "Admins can update survey completions" on public.survey_completions;
create policy "Admins can update survey completions"
on public.survey_completions for update
using (public.is_admin_for_rls())
with check (public.is_admin_for_rls());

-- One basic onboarding-style survey (reward in cents)
insert into public.surveys (slug, title, description, reward_cents, estimated_minutes, questions, is_active)
values (
  'welcome-pulse',
  'Welcome pulse survey',
  'A short check-in so we can calibrate your profile and earnings.',
  350,
  5,
  '[
    {"id":"frequency","type":"choice","label":"How often do you take online surveys?","options":["Daily","Weekly","Monthly","Rarely"]},
    {"id":"topic","type":"choice","label":"Which topic interests you most?","options":["Shopping","Technology","Health","Travel"]},
    {"id":"feedback","type":"text","label":"Anything else we should know? (optional)","optional":true}
  ]'::jsonb,
  true
)
on conflict (slug) do nothing;

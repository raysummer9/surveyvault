-- Content categories for surveys (Technology, Lifestyle, …)

alter table public.surveys
  add column if not exists survey_category text;

update public.surveys
set survey_category = 'Technology'
where survey_category is null;

alter table public.surveys
  alter column survey_category set not null;

alter table public.surveys drop constraint if exists surveys_survey_category_check;

alter table public.surveys
  add constraint surveys_survey_category_check
  check (
    survey_category in (
      'Technology',
      'Lifestyle',
      'Finance',
      'Health',
      'Food & Beverages',
      'Travel',
      'Education',
      'Environment',
      'Media',
      'Automotive'
    )
  );

create index if not exists idx_surveys_survey_category on public.surveys (survey_category);

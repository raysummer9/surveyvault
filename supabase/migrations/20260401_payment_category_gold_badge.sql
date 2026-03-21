-- Account category badge for Gold tier: display "Gold" (replaces legacy "Most Popular" copy).
update public.payment_categories
set
  badge = 'Gold',
  updated_at = timezone('utc', now())
where slug = 'gold';

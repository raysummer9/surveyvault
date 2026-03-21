-- Admin review notes + reference id for workforce payment submissions
alter table public.workforce_payments
  add column if not exists admin_rejection_reason text,
  add column if not exists review_reference_id text;

create unique index if not exists idx_workforce_payments_review_reference_id
  on public.workforce_payments (review_reference_id)
  where review_reference_id is not null;

-- Shown to user when admin rejects payment verification (cleared on new payment submit)
alter table public.user_profiles
  add column if not exists workforce_payment_rejection_reason text;

comment on column public.workforce_payments.admin_rejection_reason is 'Admin explanation when status is rejected; visible to the submitting user.';
comment on column public.user_profiles.workforce_payment_rejection_reason is 'Copy of last rejection reason for quick UX; cleared when user submits a new payment.';

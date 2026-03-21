# Survey Vault Frontend Scaffold

Frontend scaffold for a survey workforce platform where users:

1. complete onboarding,
2. pay a one-time workforce joining fee,
3. access paid surveys,
4. track payouts.

## Tech Stack

- React + TypeScript + Vite
- React Router for page flow

## Local Development

```bash
npm install
npm run dev
```

## Current Routes

- `/` - landing page
- `/onboarding` - onboarding steps
- `/workforce/join` - one-time payment screen
- `/surveys` - survey list
- `/dashboard` - earnings overview
- `/admin/payment-settings` - admin CRUD for workforce payment categories (plans); users load plans from Supabase `payment_categories`

## Project Structure

```txt
src/
  app/
    routes.tsx
    ui/
      AppLayout.tsx
  domain/
    paymentConfig.ts
  features/
    admin/
    dashboard/
    landing/
    not-found/
    onboarding/
    surveys/
    workforce/
  shared/
    ui/
      PageSection.tsx
```

## Notes For Backend Integration

- Workforce membership plans live in Supabase table `payment_categories` (see `supabase/migrations/20260319_payment_categories.sql`). Run migrations locally / on hosted Supabase.
- `src/domain/paymentCategory.ts` loads plans for users; admins manage them in the app under **Payment settings**.
- `src/domain/paymentConfig.ts` holds static crypto deposit addresses and payment window duration only.

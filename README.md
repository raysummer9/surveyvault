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
- `/admin/payment-settings` - admin-controlled payment settings (frontend placeholder)

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

- `src/domain/paymentConfig.ts` is currently mocked and should be replaced with API-driven admin values.
- Workforce joining fee is modeled as a category + one-time price.
- Payment action buttons are placeholders; wire to your payment provider once backend endpoints exist.

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

## Production / hosting (avoid 404 on deep links)

This app uses **client-side routing** (`/admin/login`, `/dashboard/...`, etc.). The server must **serve `index.html`** for those paths, or users get a **404** when opening a URL directly or refreshing.

### Vercel (recommended settings)

The repo includes **`vercel.json`** with:

- `outputDirectory`: `dist` (Vite’s build output)
- `rewrites`: send all routes to `index.html` so `/admin/login` and other deep links work

**What to do**

1. Commit and push **`vercel.json`** from the repo root (same folder as `package.json`).
2. In the Vercel dashboard → your project → **Settings → General**:
   - **Framework Preset**: Vite (or “Other” with **Output Directory** = `dist`).
3. Trigger a **new deployment** (Deployments → … → Redeploy), or push any commit so Vercel rebuilds.

If `/admin/login` still 404s, the old deploy likely had no `vercel.json`—confirm the latest deployment includes it (Git commit on the deployment).

### Other hosts

| Host | What we ship |
|------|----------------|
| **Netlify / Cloudflare Pages** | `public/_redirects` → copied to `dist/` |
| **Apache / many cPanels** | `public/.htaccess` → copied to `dist/` |
| **Nginx** | `try_files $uri $uri/ /index.html;` in `location /` |

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

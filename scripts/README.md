# Survey seed generator

## Run

From the **project root** (`surveyvault/`):

```bash
npm run generate:seed-surveys > supabase/migrations/20260331_seed_twenty_diverse_surveys.sql
```

Or:

```bash
node scripts/build-seed-20-surveys-sql.mjs > supabase/migrations/20260331_seed_twenty_diverse_surveys.sql
```

Requires **Node.js** (same as the rest of the project).

## Add more surveys

1. Open `build-seed-20-surveys-sql.mjs`.
2. Add another object to the `surveys` array with:
   - `slug` — unique, e.g. `seed-topic-name`
   - `title`, `desc`, `reward` (cents), `mins`, `cat` (must match `survey_category` check: Technology, Lifestyle, …)
   - `tier` — `'silver' | 'gold' | 'platinum'`
   - `prefix` — short label for Likert prompts
   - `letter` — **unique** per survey for question ids (`a`–`z`, avoid duplicates)
   - `first` — four starter questions (same shape as existing entries)
3. Regenerate the SQL (command above).

## If the database already applied the old migration

Supabase does **not** re-run a migration file you change. For **new** surveys only:

```bash
npm run generate:seed-surveys > supabase/migrations/20260402_your_new_batch.sql
```

Then **delete** the old survey blocks from that file (or maintain a separate script that only outputs new inserts), and apply with `supabase db push` / your usual process.

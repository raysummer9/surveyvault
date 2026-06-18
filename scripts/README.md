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

## Run large SQL files (CLI / psql)

The Supabase **SQL Editor** can reject very large scripts. Apply the same file from your machine with `psql`:

1. Install `psql` if needed (macOS): `brew install libpq && brew link --force libpq`
2. In Supabase: **Project Settings → Database**, copy the **URI** (use the **direct** host on port `5432` for long-running batches if the pooler times out).
3. From the repo root:

```bash
export DATABASE_URL='postgresql://postgres.[ref]:YOUR_PASSWORD@db.[ref].supabase.co:5432/postgres'
./scripts/run-sql.sh supabase/migrations/20260413_seed_silver_deep_surveys_part1_of_4.sql
# …then part2–4 as needed, or pass multiple files: ./scripts/run-sql.sh file1.sql file2.sql
```

Silver seed is split into **four** migrations (`*_part1_of_4.sql` … `*_part4_of_4.sql`) so each fits the Supabase SQL Editor. Regenerate with `python3 scripts/generate_silver_surveys_sql.py`.

Or:

```bash
npm run db:sql -- supabase/migrations/20260413_seed_silver_deep_surveys_part1_of_4.sql
```

If this migration was **never** recorded in `supabase_migrations.schema_migrations`, either run `supabase db push` for smaller migrations only, or after a successful `psql` run insert the migration name manually if you rely on migration history—otherwise a later `db push` may try to apply the same file again. For seed-only SQL with `ON CONFLICT DO NOTHING`, re-running is usually safe.

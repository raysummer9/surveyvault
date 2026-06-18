#!/usr/bin/env bash
# Run one or more SQL files against Postgres using psql (works for large files that exceed the Supabase SQL Editor limit).
#
# Prerequisites:
#   - psql (macOS: brew install libpq && brew link --force libpq)
#   - DATABASE_URL or SUPABASE_DB_URL: Supabase Dashboard → Project Settings → Database
#     Use the "URI" connection string; for long scripts prefer the direct connection (port 5432)
#     over the pooler (6543) if you hit timeouts.
#
# Usage (from repo root):
#   export DATABASE_URL='postgresql://postgres.[ref]:[PASSWORD]@db.[ref].supabase.co:5432/postgres'
#   ./scripts/run-sql.sh supabase/migrations/20260413_seed_silver_deep_surveys_part1_of_4.sql
#   ./scripts/run-sql.sh supabase/migrations/20260413_seed_silver_deep_surveys_part*_of_4.sql
#
# Or:
#   npm run db:sql -- supabase/migrations/20260413_seed_silver_deep_surveys_part1_of_4.sql
set -euo pipefail

if [[ "${1:-}" == "" || "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  echo "Usage: $0 <path-to.sql> [path-to.sql ...]" >&2
  exit 1
fi

if ! command -v psql >/dev/null 2>&1; then
  echo "psql not found. Install: brew install libpq && brew link --force libpq" >&2
  exit 1
fi

URL="${DATABASE_URL:-${SUPABASE_DB_URL:-}}"
if [[ -z "$URL" ]]; then
  echo "Set DATABASE_URL or SUPABASE_DB_URL to your Postgres connection string (see script header)." >&2
  exit 1
fi

for SQL_FILE in "$@"; do
  if [[ ! -f "$SQL_FILE" ]]; then
    echo "File not found: $SQL_FILE" >&2
    exit 1
  fi
  echo "Running: $SQL_FILE"
  psql "$URL" -v ON_ERROR_STOP=1 -f "$SQL_FILE"
done
echo "Done."

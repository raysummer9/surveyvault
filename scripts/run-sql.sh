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

resolve_psql() {
  if command -v psql >/dev/null 2>&1; then
    command -v psql
    return 0
  fi
  local candidates=(
    "${PSQL:-}"
    "/opt/homebrew/opt/libpq/bin/psql"
    "/usr/local/opt/libpq/bin/psql"
    "$(brew --prefix libpq 2>/dev/null)/bin/psql"
  )
  for candidate in "${candidates[@]}"; do
    if [[ -n "$candidate" && -x "$candidate" ]]; then
      echo "$candidate"
      return 0
    fi
  done
  return 1
}

if [[ "${1:-}" == "" || "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  echo "Usage: $0 <path-to.sql> [path-to.sql ...]" >&2
  exit 1
fi

PSQL_BIN="$(resolve_psql)" || {
  echo "psql not found. Install: brew install libpq" >&2
  echo "Then either: brew link --force libpq   OR   export PATH=\"\$(brew --prefix libpq)/bin:\$PATH\"" >&2
  exit 1
}

strip_env_value() {
  local v="$1"
  v="${v#"${v%%[![:space:]]*}"}"
  v="${v%"${v##*[![:space:]]}"}"
  if [[ "$v" == \"*\" && "$v" == *\" ]]; then v="${v:1:${#v}-2}"; fi
  if [[ "$v" == \'*\' && "$v" == *\' ]]; then v="${v:1:${#v}-2}"; fi
  printf '%s' "$v"
}

read_env_var() {
  local key="$1" line val
  [[ -f .env ]] || return 1
  line="$(grep -E "^${key}=" .env | tail -1 || true)"
  [[ -n "$line" ]] || return 1
  val="${line#*=}"
  strip_env_value "$val"
}

URL="${DATABASE_URL:-${SUPABASE_DB_URL:-}}"
if [[ -z "$URL" ]]; then
  URL="$(read_env_var DATABASE_URL || true)"
fi
if [[ -z "$URL" ]]; then
  URL="$(read_env_var SUPABASE_DB_URL || true)"
fi
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
  "$PSQL_BIN" "$URL" -v ON_ERROR_STOP=1 -f "$SQL_FILE"
done
echo "Done."

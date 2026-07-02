#!/usr/bin/env bash
# Authenticate with GitHub using a Personal Access Token and push current branch.
#
# Usage (pick one):
#   GITHUB_TOKEN=ghp_xxxx ./scripts/github-push.sh
#   echo 'ghp_xxxx' > ~/.github-token && chmod 600 ~/.github-token && ./scripts/github-push.sh
#
# Create a classic PAT at: https://github.com/settings/tokens (repo scope)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

TOKEN="${GITHUB_TOKEN:-${GH_TOKEN:-}}"
if [[ -z "$TOKEN" && -f "${HOME}/.github-token" ]]; then
  TOKEN="$(tr -d '[:space:]' < "${HOME}/.github-token")"
fi

if [[ -z "$TOKEN" ]]; then
  echo "Missing GitHub token. Set GITHUB_TOKEN or save a PAT to ~/.github-token" >&2
  exit 1
fi

if ! command -v gh >/dev/null 2>&1; then
  echo "GitHub CLI (gh) is required. Install: brew install gh" >&2
  exit 1
fi

echo "Authenticating gh with PAT…"
printf '%s\n' "$TOKEN" | gh auth login --with-token

echo "Configuring git to use gh credentials…"
gh auth setup-git

BRANCH="$(git branch --show-current)"
echo "Pushing ${BRANCH} to origin…"
git push -u origin "${BRANCH}"

echo "Done. Remote: $(git remote get-url origin)"

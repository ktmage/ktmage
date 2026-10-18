#!/usr/bin/env bash
set -euo pipefail

STARS_TOTAL=$(gh api users/ktmage/repos --paginate | jq -s '[.[][] | .stargazers_count] | add // 0')
CREATED_YEAR=$(gh api users/ktmage --jq '.created_at[:4]')
CURRENT_YEAR=$(date -u +%Y)
TOTAL_CONTRIBUTIONS=0

for YEAR in $(seq "$CREATED_YEAR" "$CURRENT_YEAR"); do
  FROM="${YEAR}-01-01T00:00:00Z"
  TO="${YEAR}-12-31T23:59:59Z"
  COUNT=$(gh api graphql \
    -f query="query { user(login: \"ktmage\") { contributionsCollection(from: \"${FROM}\", to: \"${TO}\") { contributionCalendar { totalContributions } } } }" \
    --jq '.data.user.contributionsCollection.contributionCalendar.totalContributions')
  if [[ ! "$COUNT" =~ ^[0-9]+$ ]]; then
    echo 'Invalid contribution count' >&2
    exit 1
  fi
  TOTAL_CONTRIBUTIONS=$((TOTAL_CONTRIBUTIONS + COUNT))
done

export STARS_TOTAL TOTAL_CONTRIBUTIONS
npm run build:profile

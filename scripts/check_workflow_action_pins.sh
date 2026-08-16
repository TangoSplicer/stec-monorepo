#!/usr/bin/env bash
# Ensures third-party GitHub Actions are pinned to immutable full commit SHAs.
set -euo pipefail

readonly ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
readonly WORKFLOW_DIR="$ROOT_DIR/.github/workflows"

fail() {
  printf 'workflow-pin-policy: %s\n' "$1" >&2
  exit 1
}

[[ -d "$WORKFLOW_DIR" ]] || fail 'workflow directory is missing'

violations=0
while IFS= read -r workflow; do
  while IFS= read -r line; do
    reference="${line#*uses: }"
    reference="${reference%%[[:space:]#]*}"
    [[ -z "$reference" || "$reference" == ./* || "$reference" == docker://* ]] && continue
    if [[ ! "$reference" =~ ^[^@[:space:]]+@[0-9a-f]{40}$ ]]; then
      printf 'workflow-pin-policy: mutable or malformed action reference in %s: %s\n' "${workflow#$ROOT_DIR/}" "$reference" >&2
      violations=1
    fi
  done < <(grep -E '^[[:space:]]*uses:[[:space:]]+' "$workflow" || true)
done < <(find "$WORKFLOW_DIR" -type f \( -name '*.yml' -o -name '*.yaml' \) -print | sort)

(( violations == 0 )) || exit 1
printf 'workflow-pin-policy: all third-party actions use immutable full commit pins\n'

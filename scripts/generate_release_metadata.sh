#!/usr/bin/env bash
# Writes non-sensitive provenance metadata for locally built Android artifacts.
# Signing key locations, signing key material, and release.properties are intentionally excluded.
set -euo pipefail

readonly ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
readonly OUTPUT_FILE="${1:-$ROOT_DIR/android/app/build/outputs/RELEASE_METADATA.txt}"
readonly APK_DIR="$ROOT_DIR/android/app/build/outputs/apk"

mkdir -p "$(dirname "$OUTPUT_FILE")"
[[ -d "$APK_DIR" ]] || { printf 'release-metadata: no Android artifact directory found at %s; build the APKs first\n' "$APK_DIR" >&2; exit 1; }

{
  printf 'STEC Android build provenance\n'
  printf 'commit=%s\n' "$(git -C "$ROOT_DIR" rev-parse HEAD)"
  printf 'commit_timestamp=%s\n' "$(git -C "$ROOT_DIR" show -s --format=%cI HEAD)"
  printf 'source_dirty=%s\n' "$([[ -z "$(git -C "$ROOT_DIR" status --porcelain)" ]] && printf false || printf true)"
  printf 'node=%s\n' "$(node --version 2>/dev/null || printf unavailable)"
  printf 'java=%s\n' "$(java -version 2>&1 | head -n 1 || printf unavailable)"
  printf 'generated_at_utc=%s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  printf '\nSHA-256\n'
  find "$APK_DIR" -type f \( -name '*.apk' -o -name '*.aab' \) -print0 \
    | sort -z \
    | xargs -0 -r sha256sum
} > "$OUTPUT_FILE"

if ! grep -qE '^[0-9a-f]{64}  ' "$OUTPUT_FILE"; then
  printf 'release-metadata: no APK or AAB artifacts found in %s\n' "$APK_DIR" >&2
  exit 1
fi

printf 'release-metadata: wrote %s\n' "${OUTPUT_FILE#$ROOT_DIR/}"

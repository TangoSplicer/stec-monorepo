#!/usr/bin/env bash
# Rehearses the Android signing path with an externally supplied non-production release.properties file.
# This script never prints property values and never copies keys into source control.
set -euo pipefail

readonly ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
readonly ANDROID_DIR="$ROOT_DIR/android"
readonly TARGET_PROPERTIES="$ANDROID_DIR/release.properties"

usage() {
  printf 'Usage: %s /absolute/path/to/non-production-release.properties\n' "${0##*/}" >&2
  exit 64
}

fail() {
  printf 'signing-rehearsal: %s\n' "$1" >&2
  exit 1
}

[[ $# -eq 1 ]] || usage
readonly SOURCE_PROPERTIES="$1"
[[ "$SOURCE_PROPERTIES" = /* ]] || fail 'properties path must be absolute'
[[ -f "$SOURCE_PROPERTIES" ]] || fail 'properties file does not exist'
[[ ! -e "$TARGET_PROPERTIES" ]] || fail 'android/release.properties already exists; remove it or use an isolated checkout'

for key in storeFile storePassword keyAlias keyPassword; do
  grep -Eq "^${key}=.+" "$SOURCE_PROPERTIES" || fail "missing required ${key} setting"
done

store_file="$(sed -n 's/^storeFile=//p' "$SOURCE_PROPERTIES" | head -n 1)"
[[ -f "$store_file" ]] || fail 'the configured storeFile does not exist'

apksigner_path="${APKSIGNER:-}"
if [[ -z "$apksigner_path" ]]; then
  apksigner_path="$(command -v apksigner || true)"
fi
[[ -n "$apksigner_path" ]] || fail 'apksigner is unavailable; install Android Build Tools or set APKSIGNER'

cleanup() {
  rm -f -- "$TARGET_PROPERTIES"
}
trap cleanup EXIT

cp -- "$SOURCE_PROPERTIES" "$TARGET_PROPERTIES"
(
  cd "$ANDROID_DIR"
  ./gradlew --no-daemon :app:assembleRelease
)

release_apk="$(find "$ANDROID_DIR/app/build/outputs/apk/release" -maxdepth 1 -type f -name '*.apk' ! -name '*-unsigned.apk' -print -quit)"
[[ -n "$release_apk" ]] || fail 'no signed release APK was produced'
"$apksigner_path" verify --verbose "$release_apk" >/dev/null

printf 'signing-rehearsal: signed APK verification passed; temporary properties were removed\n'

#!/usr/bin/env bash
# Fails closed on source-level controls required by the sensitive Android release path.
# This is a static regression check; it does not replace native-device validation.
set -euo pipefail

readonly ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
readonly CONFIG="$ROOT_DIR/ui/capacitor.config.ts"
readonly DATABASE_SERVICE="$ROOT_DIR/ui/src/capacitor/db.ts"
readonly MANIFEST="$ROOT_DIR/android/app/src/main/AndroidManifest.xml"
readonly EXTRACTION_RULES="$ROOT_DIR/android/app/src/main/res/xml/data_extraction_rules.xml"
readonly BUILD_GRADLE="$ROOT_DIR/android/app/build.gradle"

fail() {
  printf 'release-policy: %s\n' "$1" >&2
  exit 1
}

require_text() {
  local file="$1"
  local text="$2"
  local description="$3"
  grep -Fq -- "$text" "$file" || fail "missing $description in ${file#$ROOT_DIR/}"
}

for required in "$CONFIG" "$DATABASE_SERVICE" "$MANIFEST" "$EXTRACTION_RULES" "$BUILD_GRADLE"; do
  [[ -f "$required" ]] || fail "required file does not exist: ${required#$ROOT_DIR/}"
done

# Native data path: the browser adapter is intentionally separate; the native path must request SQLCipher secret mode.
require_text "$CONFIG" 'androidIsEncryption: true' 'Capacitor SQLite encryption configuration'
require_text "$DATABASE_SERVICE" "const NATIVE_ENCRYPTION_MODE = 'secret';" 'native SQLCipher secret mode'
require_text "$DATABASE_SERVICE" 'await prepareNativeEncryption();' 'native encryption preparation before database opening'
require_text "$DATABASE_SERVICE" 'isDatabaseEncrypted(DATABASE_NAME)' 'plaintext-database detection'
require_text "$DATABASE_SERVICE" 'throw new PlaintextDatabaseMigrationRequiredError();' 'failure-closed plaintext migration block'
require_text "$DATABASE_SERVICE" 'setEncryptionSecret(createDatabaseSecret())' 'native encryption-secret provisioning'
require_text "$DATABASE_SERVICE" 'createConnection(DATABASE_NAME, true, NATIVE_ENCRYPTION_MODE' 'encrypted native connection'

# Android manifest and extraction policy.
require_text "$MANIFEST" 'android:allowBackup="false"' 'backup disabled setting'
require_text "$MANIFEST" 'android:usesCleartextTraffic="false"' 'cleartext traffic block'
require_text "$MANIFEST" 'android:dataExtractionRules="@xml/data_extraction_rules"' 'data extraction rules reference'
for domain in root database sharedpref external; do
  require_text "$EXTRACTION_RULES" "<exclude domain=\"$domain\" path=\".\" />" "backup exclusion for $domain"
done
require_text "$EXTRACTION_RULES" '<device-transfer>' 'device-transfer exclusion section'

# Release build must remain non-debuggable, optimized, and use the explicitly controlled signing path when supplied.
require_text "$BUILD_GRADLE" 'debuggable = false' 'release debuggable false setting'
require_text "$BUILD_GRADLE" 'minifyEnabled = true' 'release minification setting'
require_text "$BUILD_GRADLE" 'shrinkResources = true' 'release resource shrinking setting'
require_text "$BUILD_GRADLE" "rootProject.file('release.properties')" 'external release signing configuration'

# Never permit release credentials or generated field artifacts to be staged in source control.
if git -C "$ROOT_DIR" ls-files | grep -E '(^|/)(release\.properties|.*\.(jks|keystore)|.*\.apk|.*\.aab|.*\.(db|sqlite|sqlite3))$' >/dev/null; then
  fail 'tracked signing key, release artifact, or local database detected'
fi

printf 'release-policy: passed static encryption, Android hardening, and source-hygiene checks\n'

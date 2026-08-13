#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ANDROID_SDK_ROOT="${ANDROID_SDK_ROOT:-${ANDROID_HOME:-/opt/android-sdk}}"
export ANDROID_SDK_ROOT
export ANDROID_HOME="$ANDROID_SDK_ROOT"
export PATH="$ANDROID_SDK_ROOT/platform-tools:$PATH"

if [[ ! -x "$ANDROID_SDK_ROOT/platform-tools/adb" ]]; then
  echo "Android SDK platform-tools were not found at $ANDROID_SDK_ROOT. Install the pinned SDK components first." >&2
  exit 1
fi

cd "$ROOT_DIR/ui"
npm ci
npm run build

if [[ ! -f "$ROOT_DIR/android/gradlew" ]]; then
  npx cap add android
fi
npx cap sync android

cd "$ROOT_DIR/android"
./gradlew --no-daemon :app:assembleDebug

echo "Android wrapper synchronized and debug APK built successfully."

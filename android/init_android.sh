#!/bin/bash
set -e
echo "Initializing Native Android Wrapper via Capacitor..."
cd ../ui
npm run build
npx cap add android
if [ -d "android" ]; then
    echo "Relocating generated Android project to monorepo root..."
    mv android/* ../android/
    rm -rf android
fi
npx cap sync android
echo "Android Native Wrapper initialization complete."

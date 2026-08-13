SHELL := /bin/sh

.PHONY: all install build build-ui build-core build-android-debug build-android-release test test-ui test-core check audit-ui sync-android clean

all: build

install:
	cd ui && npm ci

build: build-ui

build-ui:
	cd ui && npm run build

# Requires Rust, the Android NDK, and cargo-ndk. See CONTRIBUTING.md for setup.
build-core:
	cd core && cargo ndk -t arm64-v8a build --release --workspace --locked

test: test-ui

test-ui:
	cd ui && npm test

test-core:
	cd core && cargo test --workspace --all-targets --locked

check: test-ui
	cd ui && npm run typecheck

audit-ui:
	cd ui && npm run audit:production

sync-android: build-ui
	cd ui && npx cap sync android

# Requires ANDROID_SDK_ROOT (or ANDROID_HOME), Java 17+, and the generated android wrapper.
build-android-debug: sync-android
	cd android && ./gradlew --no-daemon :app:assembleDebug

# Produces an unsigned release APK unless android/release.properties is supplied by a controlled build environment.
build-android-release: sync-android
	cd android && ./gradlew --no-daemon :app:assembleRelease

clean:
	rm -rf ui/dist ui/coverage
	cd core && cargo clean
	rm -rf android/app/build

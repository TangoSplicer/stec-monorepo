.PHONY: all init build-core build-ui clean

all: build-core build-ui

init:
	@echo "Initializing NPM Packages..."
	cd ui && npm install
	cd android && ./init_android.sh

build-core:
	@echo "Cross-compiling Rust workspace for aarch64-linux-android..."
	cd core && cargo ndk -t arm64-v8a build --release

build-ui:
	@echo "Building Svelte UI and syncing to Capacitor..."
	cd ui && npm run build
	cd ui && npx cap sync android

clean:
	@echo "Purging build artifacts..."
	cd core && cargo clean
	rm -rf ui/dist
	rm -rf ui/node_modules
	rm -rf android/app/build

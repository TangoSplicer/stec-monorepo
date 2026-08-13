# Validation Notes

## Browser smoke test

On 13 August 2026, the Vite-served UI was opened through a controlled preview host. The first attempt was blocked by Vite host protection, which was corrected by limiting the development-server allow-list to `.manus.computer`. The restarted preview then rendered successfully with the page title **CrimeGraph** and the expected first-run **System Commissioning** state.

The rendered commissioning screen displayed the hardened requirement that a master-administrator password contain at least 12 characters. No credentials were entered during this smoke test, so no local browser profile or persisted test operator was created.

## Automated validation

The final clean validation run completed the following gates successfully:

| Gate | Result |
|---|---|
| Locked UI installation (`npm ci`) | Passed |
| UI tests and configured coverage threshold | Passed: 10 tests; 86.31% statements, 76.19% branches, 100% functions, 93.75% lines across focused utilities |
| TypeScript checking and production UI bundle | Passed |
| Production UI dependency audit | Passed: 0 vulnerabilities |
| Rust format check | Passed |
| Rust Clippy with warnings denied | Passed |
| Rust workspace tests | Passed |
| Git whitespace/diff check | Passed |

## Validation limitations

The local environment did not include a connected Android device or Android NDK build configuration, so Android package installation, native encrypted-storage integration, biometrics on real hardware, and Android ARM64 cross-compilation remain CI/device validation obligations. These are intentionally retained as release-checklist gates rather than represented as completed local tests.

## Android wrapper and release validation

A reproducible Capacitor Android project was generated at `android/` and built with Android SDK Platform 35, Build Tools 35.0.0, NDK 26.3.11579264, OpenJDK 21, and the generated Gradle wrapper. The SQLite plugin is configured with `androidIsEncryption: true`; on a native platform, the database adapter creates or opens `crimegraph_db` in SQLCipher `secret` mode after establishing the plugin’s Keystore-backed encrypted-preferences secret. It refuses to open a detected legacy plaintext database and presents an explicit controlled-migration block rather than silently treating it as a new installation.

| Gate | Result |
|---|---|
| Android wrapper generation and Capacitor synchronization | Passed |
| Debug APK assembly | Passed |
| Optimized unsigned release APK assembly with R8/resource shrinking | Passed |
| Release artifact | `android/app/build/outputs/apk/release/app-release-unsigned.apk`, 16,315,242 bytes |
| Native SQLCipher linkage | Present in the release build; the Gradle build reported `libsqlcipher.so` packaged intact |
| Manifest hardening review | `allowBackup=false`, `fullBackupContent=false`, data-extraction exclusions, and `usesCleartextTraffic=false` configured |
| UI tests/type check/coverage/audit | Passed; 10 tests; 0 production dependency vulnerabilities |
| Rust format/Clippy/tests | Passed; Cargo emitted a third-party future-incompatibility warning for `proc-macro-error2` only |

A clean Android 35 virtual device was provisioned. Hardware acceleration is unavailable in this sandbox because `/dev/kvm` is not exposed. A software-emulation attempt initialized but could not complete a stable device boot within the available environment. Consequently, APK installation, SQLCipher on-device open verification, hardware-backed Keystore security-level inspection, real biometric prompts, background lock behavior, and backup/restore behavior remain **real-device or virtualized-CI evidence gates**, not completed runtime assertions.

## Corrective validation: browser storage bootstrap and API 35 toolchain

On 13 August 2026, the initial browser bootstrap issue was remediated by replacing the browser-only Jeep SQLite lifecycle with a direct SQL.js WebAssembly adapter. The adapter loads the bundled `/assets/sql-wasm.wasm` asset and persists database bytes in a dedicated IndexedDB store. The native Capacitor path is unchanged: Android still creates or retrieves `crimegraph_db` through SQLCipher `secret` mode after native encryption preparation.

| Corrective check | Verified result |
|---|---|
| Fresh production-preview origin | Rendered **System Commissioning**, rather than a loading state or **Secure Migration Required** screen |
| Browser commissioning | Accepted a non-production test password and transitioned to authentication |
| Browser persistence | A reload showed authentication rather than first-run commissioning |
| Browser administrator authentication | The persisted test administrator completed local authorization and reached the Operations workspace |
| Browser console | No runtime errors or unhandled rejections observed after commissioning |
| Focused browser storage tests | Passed: clean startup without Jeep/native plugin, production WASM path resolution, and data persistence after close/reopen |
| Full UI suite | Passed: 12 tests; coverage 86.92% statements, 71.67% branches, 93.65% functions, and 95.43% lines; all configured thresholds passed |
| UI type check, production bundle, and production dependency audit | Passed; production audit found 0 vulnerabilities |
| Rust format, Clippy with warnings denied, and workspace tests | Passed; 3 Rust unit tests passed; Cargo retained a transitive `proc-macro-error2` future-incompatibility notice only |
| Android build toolchain | Upgraded to Android Gradle Plugin 8.6.1 and Gradle 8.7; debug and unsigned optimized release assemblies passed with API 35, without the prior unsupported `compileSdk` warning |
| Release APK inspection | Verified `com.stec.daemon`, min SDK 23, target SDK 35, hardened backup/cleartext manifest attributes, and SQLCipher libraries for arm64-v8a, armeabi-v7a, x86, and x86_64 |

A local API 35 virtual device was available, but this sandbox lacks `/dev/kvm`. A deliberate `-no-accel` software-emulation attempt began Android startup but failed to reach a stable ADB boot state; the emulator terminated without an application-installation opportunity. This is a recorded infrastructure limitation rather than a passing runtime test. The real-device/virtualized-CI field evidence gates in the release checklist remain required before signing and deployment.

The browser adapter is intentionally a browser testing and demonstration path. Sensitive field deployment evidence must be gathered on the native Android SQLCipher route, including encrypted-at-rest verification, hardware-backed Keystore inspection, real biometric challenge behavior, background locking, and backup/restore assertions.

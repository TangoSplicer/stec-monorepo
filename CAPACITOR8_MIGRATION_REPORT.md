# Capacitor 8 Migration Report

**Repository:** `TangoSplicer/stec-monorepo`
**Branch:** `upgrade/capacitor-8`
**Baseline:** `d41764bccb18067ec71b548e6f86aaba65b3068c`
**Status:** Technically validated in the sandbox; non-production and pending native-device evidence

## Summary

The repository was advanced from the validated Capacitor 7 branch to an isolated Capacitor 8 branch. The known-tested `main` branch was not modified. The migration updates the JavaScript/native package cohort, Android project toolchain, SDK targets, manifest configuration, and encrypted SQLite plugin while preserving the existing SQLCipher and backup restrictions.

The current Capacitor 8 package cohort is:

| Component | Version |
|---|---:|
| `@capacitor/core`, `@capacitor/cli`, `@capacitor/android`, `@capacitor/ios` | 8.5.0 |
| `@capacitor/app` | 8.1.1 |
| `@capacitor/camera` | 8.2.2 |
| `@capacitor/filesystem` | 8.1.2 |
| `@capacitor/haptics` | 8.0.2 |
| `@capacitor/preferences` | 8.0.1 |
| `@capacitor/share` | 8.0.1 |
| `@capacitor/status-bar` | 8.0.3 |
| `@capacitor-community/sqlite` | 8.1.1 |
| `@aparajita/capacitor-biometric-auth` | 10.0.0 |
| `cordova-plugin-bluetoothle` | 6.7.4, retained and synchronized |

## Android migration

The Android project now uses min SDK 24, compile/target SDK 36, AGP 8.13.0, Gradle 8.14.3, and the Capacitor 8 AndroidX dependency baselines. The activity configuration includes `density` to avoid WebView reloads during resize. The manifest merger exposed a legacy `requestLegacyExternalStorage` declaration from the camera library; this was resolved explicitly with `tools:replace` while retaining the application’s `requestLegacyExternalStorage=false` policy.

The existing release hardening remains in place: backup is disabled, cloud/device extraction rules exclude root, database, shared preferences, and external storage, cleartext traffic is disabled, and `androidIsEncryption=true` remains configured. SQLCipher is packaged in all four configured ABIs.

## Validation results

| Gate | Result |
|---|---|
| Capacitor 8 package installation | Passed |
| Capacitor Android sync | Passed; 9 Capacitor plugins and Bluetooth Cordova plugin registered |
| UI tests | Passed; 4 files and 12 tests |
| TypeScript strict check | Passed |
| Production UI build | Passed; SQL.js WebAssembly asset packaged |
| Production dependency audit | Passed; 0 vulnerabilities with `npm audit --omit=dev` |
| Rust formatting | Passed |
| Rust Clippy with warnings denied | Passed |
| Rust locked workspace tests | Passed |
| Android debug APK | Passed; API 36 build |
| Android unsigned release APK | Passed; API 36 build with R8/resource shrinking |
| APK static inspection | Passed; SDK, backup, cleartext, request-legacy-storage, data-extraction, and SQLCipher checks verified |
| Browser first run | Passed; fresh origin reached System Commissioning |
| Browser commissioning | Passed; synthetic provisioning reached authentication |
| Browser reload persistence | Passed; reload remained on authentication rather than returning to commissioning |
| Native device runtime | Not run; no connected physical device or stable emulator |

The Capacitor 8 debug APK SHA-256 is `a678b8848134b69d01e96533165ddd57ae6834fc62621be9200652c4753d3ccf`. The unsigned release APK SHA-256 is `0b2d20c66d536ec7bf8bbca46bbc647de4890c20548a9914559078f22684ffc4`.

## Audit note

The production dependency audit reports zero vulnerabilities. A full development audit reports three moderate findings through the Capacitor CLI’s transitive Xcode/UUID tooling. These do not enter the production Android dependency graph, and no unvalidated override was applied. The issue should be tracked for a future compatible CLI/toolchain release rather than forcing a dependency override that could break native synchronization.

## Native validation boundary

This branch must not be represented as field-production approved. Native validation still requires a physical Android device or a managed physical-device lab for SQLCipher upgrade-in-place from the Capacitor 7 release, wrong-key and corruption fail-closed behavior, Android Keystore security level, biometric success/cancellation/lockout, process death, background locking, backup/data-extraction behavior, and Bluetooth/native plugin lifecycle behavior. The browser path is only a development and demonstration fallback and does not prove Android at-rest encryption.

The isolated branch is suitable for continued development, CI, browser testing, static review, and non-production integration. `main` remains the production baseline until native evidence and release-owner approval are available.

## References

[1]: https://capacitorjs.com/docs/updating/8-0 "Official Capacitor 7 to 8 migration guide"
[2]: https://github.com/capacitor-community/sqlite "Capacitor Community SQLite plugin"
[3]: https://github.com/aparajita/capacitor-biometric-auth "Capacitor biometric authentication plugin"

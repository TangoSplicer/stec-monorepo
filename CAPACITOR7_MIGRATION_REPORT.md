# Capacitor 7 Migration Report

**Repository:** `TangoSplicer/stec-monorepo`
**Branch:** `upgrade/capacitor-7`
**Baseline:** `4a33f3a75e2fceb96ef447fcf0d09b8f6681ab4c`
**Status:** Technically validated in the sandbox; pending device-owner approval gates

## Executive summary

The repository was migrated from Capacitor 6 to Capacitor 7 in an isolated branch. The migration preserved the native SQLCipher configuration, Android backup restrictions, the browser SQL.js/IndexedDB fallback, protected administrator authentication, and the existing Rust service boundary.

The official migration tool completed successfully. It updated the Android project to AGP 8.7.2 and Gradle 8.11.1, retained API 35 and min SDK 23, added the recommended `navigation` activity configuration, and migrated plugin manifest handling. The active native plugin cohort is now aligned to Capacitor 7:

| Component | Version after migration |
|---|---:|
| `@capacitor/core` | 7.6.8 |
| `@capacitor/cli` | 7.6.8 |
| `@capacitor/android` and official plugins | 7.x cohort |
| `@capacitor-community/sqlite` | 7.0.3 |
| `@aparajita/capacitor-biometric-auth` | 9.1.2 |
| `cordova-plugin-bluetoothle` | 6.7.4, retained and synchronized |
| `capacitor-native-biometric` | Removed; it was unused by application code and advertised Capacitor 3-era dependency metadata |

## Validation evidence

| Gate | Result |
|---|---|
| Clean UI dependency installation | Passed with `npm ci` |
| UI tests | 12 tests passed across 4 files |
| TypeScript strict check | Passed |
| Production UI build | Passed; SQL.js WebAssembly asset packaged |
| Production dependency audit | Passed with 0 vulnerabilities |
| Rust formatting | Passed |
| Rust Clippy with warnings denied | Passed |
| Rust workspace tests | Passed |
| Capacitor Android sync | Passed; 9 Capacitor plugins and the Bluetooth Cordova plugin registered |
| Android debug APK | Passed with constrained Gradle resources; 28,631,004 bytes |
| Android unsigned release APK | Passed with constrained Gradle resources; 22,479,656 bytes |
| SQLCipher packaging | Present in debug and release APKs for arm64-v8a, armeabi-v7a, x86, and x86_64 |
| Browser first run | Passed on fresh origin; reached **System Commissioning** |
| Browser commissioning | Passed with a synthetic test password |
| Browser persistence | Passed after reload; protected admin route authenticated and opened Operations |

The first unconstrained release attempt was terminated by the sandbox under memory pressure. Retrying with one Gradle worker and a bounded 768 MB heap completed both APK variants successfully. This is a sandbox-resource observation, not a source or migration failure.

## Security preservation checks

The migrated Android manifest retains `allowBackup=false`, `fullBackupContent=false`, explicit data-extraction exclusions, and disabled cleartext traffic. `androidIsEncryption=true` remains in the Capacitor configuration, and the SQLCipher native library is packaged for all configured ABIs. The protected three-second shield gesture remains required before the master administrator route is displayed.

The browser path remains intentionally non-sensitive demonstration and test storage. Production field data must use the native Android SQLCipher path. The browser E2E used only a synthetic password and synthetic local origin.

## Remaining release gates

The migration is not by itself a field-production approval. A deployment owner must still collect evidence on supported physical Android devices or a properly provisioned virtualized CI environment for encrypted database open/close, migration from the previous release, hardware-backed Keystore security level, biometric prompts and cancellation, process death, background locking, backup exclusion, package import/export, and audit-chain recovery. No production signing key was generated or stored in this branch.

The next branch after this one should be a dedicated device-validation branch. It should install a pre-migration build, commission synthetic data, upgrade in place to this Capacitor 7 build, verify SQLCipher continuity, and capture signed evidence before merging or tagging a production release.

## References

[1]: https://capacitorjs.com/docs/updating/7-0 "Official Capacitor 6 to 7 migration guide"
[2]: https://github.com/capacitor-community/sqlite "Capacitor Community SQLite plugin"

# Capacitor 7 Merge-Readiness Report

**Repository:** `TangoSplicer/stec-monorepo`
**Branch:** `upgrade/capacitor-7`
**Commit:** `085e60ae1049f6e01445457688ee3eb651178061`

## Decision summary

The branch is a strong merge candidate from a source, build, browser, and automated-quality perspective. It is **not yet approved for production merge** because native runtime evidence for encrypted storage, Android Keystore, biometrics, lifecycle locking, backup exclusion, and native plugin behavior could not be collected in this sandbox.

The best autonomous runtime attempt provisioned an API 35 Google APIs x86_64 software AVD and launched it without KVM acceleration. The emulator repeatedly dropped offline and never completed boot. No native runtime pass is claimed from that attempt.

## Completed gates

| Gate | Result | Evidence |
|---|---|---|
| Remote provenance | Passed | Clean checkout commit and remote branch both equal `085e60ae1049f6e01445457688ee3eb651178061`. |
| Clean-checkout UI install | Passed | `npm ci` completed from the pushed lockfile. |
| UI tests | Passed | 4 test files, 12 tests passed. |
| TypeScript | Passed | Strict typecheck passed. |
| Production UI build | Passed | Vite production build completed with SQL.js WebAssembly asset. |
| Production audit | Passed | `npm audit --omit=dev` reported 0 vulnerabilities. |
| Rust | Passed | Formatting, Clippy with warnings denied, and locked workspace tests passed. |
| Capacitor sync | Passed | Capacitor 7 Android sync registered the 9-plugin Capacitor cohort and Bluetooth Cordova plugin. |
| Android debug | Passed | `BUILD SUCCESSFUL`; SHA-256 `b2faf5232f9219dd47a1e08ef238c548c6c67f0b9c494b213677455a826b5c32`. |
| Android release | Passed | `BUILD SUCCESSFUL`; SHA-256 `c26037d71cdb3c39e492db8fe1767c2ec77ee5c9fd8d88cc318e8e5a226a2c11`. |
| APK security inspection | Passed statically | Both APKs report min SDK 23, target/compile SDK 35, backup disabled, cleartext disabled, data-extraction rules present, and four SQLCipher ABIs. |
| Browser first run | Passed | Fresh origin reached System Commissioning. |
| Browser commissioning and persistence | Passed | Synthetic administrator provisioning, protected admin authentication, and reload persistence opened Operations successfully. |
| Worktree integrity | Passed | Clean checkout working tree remained clean after all gates. |

## Required external evidence before merge

The following tests must run on supported physical Android devices or a properly provisioned virtualized CI environment. Each result should attach device model, Android API level, APK hash, timestamp, test operator, and logs to the pull request.

| Area | Required test | Required result |
|---|---|---|
| Upgrade-in-place | Install the pre-Capacitor-7 build, create synthetic cases and audit events, install this branch over it, and reopen the database. | Existing encrypted data is readable; no plaintext fallback, data loss, or schema bypass occurs. |
| Failure behavior | Try a wrong database key, damaged database, interrupted migration, and malformed package. | Each failure is rejected closed with no partial state exposed. |
| Keystore | Inspect key generation and security level on each supported device class. | Keys remain device-bound and the recorded security level meets the deployment policy. |
| Biometrics | Test success, cancellation, lockout, unavailable sensor, process death, and relaunch. | A valid biometric challenge is required where enabled; failure never creates an authenticated session. |
| Lifecycle lock | Background, screen-lock, task removal, force-stop, and cold relaunch. | Sensitive state closes or re-locks according to the field policy. |
| Backup and transfer | Exercise Android backup/data extraction and device transfer on supported API levels. | Database, keys, credentials, and audit material are excluded as designed. |
| Native plugins | Exercise SQLite, Bluetooth, filesystem, camera, haptics, preferences, sharing, and status bar. | No Capacitor 7 runtime regressions or permission failures. |
| Release signing | Build and sign through the deployment-controlled signing path. | Signature, provenance, artifact hash, and release metadata are independently verified. |

## Merge procedure after evidence completion

The pull request should require all CI checks, at least one code-owner review, and an explicit security/release-owner approval. The device evidence must be attached before approval. After merge, rerun the clean-checkout gates on the merge commit, build the signed release candidate, install it on the same device matrix, and only then create a production tag.

Until those steps are complete, the correct decision is **NO-GO for merge to main**, while retaining the branch as a validated merge candidate.

## Supporting records

- `CAPACITOR7_MIGRATION_REPORT.md`
- `upgrade-evidence/CAPACITOR7_BASELINE.md`
- `upgrade-evidence/CAPACITOR7_BROWSER_E2E.md`
- `upgrade-evidence/MERGE_READINESS_RUNTIME_BASELINE.md`
- `upgrade-evidence/CAPACITOR7_NATIVE_RUNTIME_ATTEMPT.md`

## References

[1]: https://capacitorjs.com/docs/updating/7-0 "Official Capacitor 6 to 7 migration guide"
[2]: https://developer.android.com/guide/topics/data/autobackup "Android backup and restore documentation"
[3]: https://developer.android.com/privacy-and-security/keystore "Android Keystore system documentation"

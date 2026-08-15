# Capacitor 8 Merge-Readiness Report

**Repository:** `TangoSplicer/stec-monorepo`
**Branch:** `upgrade/capacitor-8`
**Commit:** `ce3bbc2ebcc2acd21815a12440f207745ac6f092`
**Baseline:** Capacitor 7 branch commit `d41764bccb18067ec71b548e6f86aaba65b3068c`

## Decision summary

The Capacitor 8 branch is a strong merge candidate from a source, dependency, browser, Android-build, static-security, Rust, and automated-quality perspective. It is **not approved for production merge** because native runtime evidence for encrypted storage, Android Keystore, biometrics, lifecycle locking, backup exclusion, native plugin behavior, upgrade-in-place, and deployment-controlled signing has not been collected in this environment.

The known-tested `main` branch was not modified by the migration. The Capacitor 7 branch remains available as the immediately preceding upgrade baseline. The correct current decision is **NO-GO for merge to main until the external evidence gates below are completed or formally waived by the security and release owners**.

## Completed gates on Capacitor 8

| Gate | Result | Evidence |
|---|---|---|
| Remote provenance | Passed | Local and remote `upgrade/capacitor-8` refs equal `ce3bbc2ebcc2acd21815a12440f207745ac6f092`; clean worktree. |
| Locked UI installation | Passed | `npm ci` completed from the pushed lockfile. |
| UI tests | Passed | 12 tests passed with configured coverage thresholds. |
| TypeScript | Passed | Strict typecheck passed. |
| Production UI build | Passed | Vite production build completed with the SQL.js WebAssembly asset. |
| Production dependency audit | Passed | `npm audit --omit=dev` reported 0 vulnerabilities. |
| Rust quality | Passed | Formatting, Clippy with warnings denied, and locked workspace tests passed. |
| Capacitor sync | Passed | Capacitor 8 Android sync completed with the official plugin cohort and Bluetooth Cordova plugin. |
| Android debug build | Passed | API 36 debug APK assembled successfully; SHA-256 `a678b8848134b69d01e96533165ddd57ae6834fc62621be9200652c4753d3ccf`. |
| Android release build | Passed | API 36 unsigned optimized release APK assembled successfully; SHA-256 `0b2d20c66d536ec7bf8bbca46bbc647de4890c20548a9914559078f22684ffc4`. |
| Static APK security inspection | Passed statically | SQLCipher libraries present for four configured ABIs; backup/data-extraction exclusions and cleartext restrictions retained. |
| Browser first run | Passed | Fresh origin reached System Commissioning. |
| Browser persistence | Passed | Synthetic commissioning and reload persistence reached the authentication state; the browser adapter is explicitly non-native evidence. |
| Documentation and hygiene | Passed | Migration report, changelog, evidence records, and repository ignore rules are source-controlled; generated APKs, credentials, databases, and secrets are excluded. |

## External evidence required before merge

Each result should attach the branch commit, APK hash, device model, Android API level, security patch level, timestamp, test operator, expected result, actual result, and sanitized logs to the pull request or approved evidence system.

| Area | Required test | Required result |
|---|---|---|
| Upgrade-in-place | Install the preceding encrypted build, create synthetic cases and audit events, install Capacitor 8 over it, and reopen the database. | Existing encrypted data remains readable with no plaintext fallback, data loss, or schema bypass. |
| Encryption | Inspect the native database file and open it only through the approved SQLCipher path. | Raw file is not readable as ordinary SQLite; SQLCipher integrity and encryption checks pass. |
| Failure behavior | Exercise wrong key, damaged database, interrupted migration, malformed package, and invalid key metadata. | Every failure rejects closed with no partial state exposed. |
| Keystore | Record `KeyInfo` security level, authentication requirements, invalidation, and StrongBox/TEE policy on each supported device class. | Key material remains non-exportable and device-bound according to the approved threat model. |
| Biometrics | Test success, cancellation, lockout, unavailable sensor, credential fallback, biometric enrollment change, process death, and relaunch. | A valid approved challenge is required; failures never create an authenticated session. |
| Lifecycle lock | Background, screen lock, task removal, force-stop, timeout, reboot, and cold relaunch. | Sensitive state closes or re-locks according to field policy. |
| Backup and transfer | Exercise Android backup, restore, and device-transfer paths. | Database, keys, credentials, attachments, and audit material are excluded as designed. |
| Native plugins | Exercise SQLite, Bluetooth, filesystem, camera, haptics, preferences, sharing, and status bar. | No Capacitor 8 runtime regressions or permission failures. |
| Release signing | Build and sign through the deployment-controlled signing path. | Signature, provenance, artifact hash, SBOM, and release metadata are independently verified. |
| Governance | Complete threat-model, data-governance, privacy/legal, independent security, forensic-validation, support, rollback, and incident-response reviews. | Named owners approve the residual-risk and operational controls. |

## Work that can proceed before device testing

The repository can still gain meaningful assurance before native execution. The prioritized work is recorded in `upgrade-evidence/CAPACITOR8_PRE_DEVICE_VALIDATION_PLAN.md` and includes clean-checkout reruns, manifest/static-policy assertions, SBOM and license inventory, non-production signing rehearsal, deterministic security fixtures, production-path scans for plaintext configuration, plugin-cohort checks, compatibility matrices, and an operator-ready device test pack.

These activities improve readiness but must not be described as native runtime validation. In particular, the browser SQL.js adapter is a development, demonstration, and browser-test path; sensitive field deployment requires the native SQLCipher route.

## Merge procedure after evidence completion

The pull request should require all CI checks, at least one code-owner review, explicit security/release-owner approval, and attachment of the native evidence. After merge, rerun the clean-checkout gates on the merge commit, build the signed release candidate through the controlled signing path, install it on the approved device matrix, and only then create a production tag.

## Historical records

The following records remain intentionally published for provenance and comparison, but they are not Capacitor 8 pass claims:

- `CAPACITOR7_MIGRATION_REPORT.md`
- `upgrade-evidence/CAPACITOR7_BASELINE.md`
- `upgrade-evidence/CAPACITOR7_BROWSER_E2E.md`
- `upgrade-evidence/CAPACITOR7_NATIVE_RUNTIME_ATTEMPT.md`
- `upgrade-evidence/MERGE_READINESS_RUNTIME_BASELINE.md`

## References

[1]: https://capacitorjs.com/docs/updating/8-0 "Official Capacitor 8 migration documentation"
[2]: https://developer.android.com/guide/topics/data/autobackup "Android backup and restore documentation"
[3]: https://developer.android.com/privacy-and-security/keystore "Android Keystore system documentation"
[4]: https://developer.android.com/build/building-cmdline "Android command-line build documentation"

# Validation Notes

**Repository:** `TangoSplicer/stec-monorepo`
**Active upgrade:** `upgrade/capacitor-8`
**Commit:** `ce3bbc2ebcc2acd21815a12440f207745ac6f092`
**Status:** Technically validated in the sandbox; native field-production evidence pending.

## Browser smoke and persistence

A controlled production-preview origin rendered the expected first-run **System Commissioning** state with the minimum 12-character administrator-password instruction. The direct SQL.js plus IndexedDB browser adapter replaced the stalled Jeep SQLite browser bootstrap. Fresh-origin commissioning, synthetic administrator provisioning, reload persistence, and the transition back to the authentication state were verified.

The browser adapter is a development, demonstration, and browser-testing path. It is not evidence that native Android SQLCipher, Android Keystore, biometric prompts, lifecycle locking, backup exclusion, or native plugins behave correctly on a device.

## Capacitor 8 automated validation

| Gate | Result |
|---|---|
| Locked UI installation (`npm ci`) | Passed |
| UI tests and configured coverage thresholds | Passed: 12 tests |
| Strict TypeScript checking | Passed |
| Production UI bundle | Passed |
| Production UI dependency audit | Passed: 0 vulnerabilities |
| Rust format check | Passed |
| Rust Clippy with warnings denied | Passed |
| Rust workspace tests | Passed |
| Capacitor Android synchronization | Passed |
| Git whitespace and diff checks | Passed |
| Clean worktree and remote provenance | Passed |

## Android API 36 build validation

The Capacitor 8 Android project uses min SDK 24, compile/target SDK 36, Android Gradle Plugin 8.13.0, Gradle 8.14.3, and Java 21. Debug and unsigned optimized release APK assembly completed successfully. SQLCipher remained packaged for the configured ABIs, and static inspection confirmed the intended backup/data-extraction restrictions and cleartext policy.

| Artifact | Result |
|---|---|
| Debug APK | Passed; SHA-256 `a678b8848134b69d01e96533165ddd57ae6834fc62621be9200652c4753d3ccf` |
| Unsigned release APK | Passed; SHA-256 `0b2d20c66d536ec7bf8bbca46bbc647de4890c20548a9914559078f22684ffc4` |

## Security implementation recorded in source

The repository includes versioned salted PBKDF2-SHA-256 credential verification, biometric-gated sign-in, authenticated `CGX1` export packages, bounded schema-validated imports, audit-chain verification, case-scoped mutations, foreign-key enforcement, administrator-only wiping, and the native encrypted-storage configuration. These are source and automated-test assertions; they do not substitute for native execution evidence.

## Validation limitations

The sandbox has no connected Android device and no usable KVM-backed emulator. A software-emulation attempt did not reach a stable ADB boot state. Therefore the following remain external evidence gates: native SQLCipher open and raw-file inspection, Android Keystore security-level and invalidation behavior, real biometric prompts, process-death/background locking, upgrade-in-place, backup/device transfer, native Bluetooth and other plugin lifecycles, and deployment-controlled release signing.

The correct transition is from **technical validation** to **field-production approval** only after those tests pass on the approved device or virtualized-CI matrix and the results are attached to the release decision.

## Historical records

Capacitor 7 records remain available for migration provenance and comparison. They should not be read as Capacitor 8 runtime pass claims. The active Capacitor 8 decision is maintained in `MERGE_READINESS_REPORT.md`, `CAPACITOR8_MIGRATION_REPORT.md`, and `upgrade-evidence/CAPACITOR8_PRE_DEVICE_VALIDATION_PLAN.md`.

## References

[1]: https://capacitorjs.com/docs/updating/8-0 "Official Capacitor 8 migration documentation"
[2]: https://developer.android.com/privacy-and-security/keystore "Android Keystore system documentation"
[3]: https://developer.android.com/guide/topics/data/autobackup "Android backup and restore documentation"

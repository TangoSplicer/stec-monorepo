# Changelog

All notable engineering changes should be recorded here. This project follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) principles and uses semantic versioning once tagged releases begin.

## [Unreleased]

### Security

- Replaced fast unsalted credential hashing with versioned, salted PBKDF2-SHA-256 verifiers using a 600,000-iteration work factor.
- Removed the automatic seeded analyst account and invalidated legacy local credential records during the security migration, requiring secure re-provisioning.
- Required a successful device biometric challenge before biometric sign-in can establish a session.
- Replaced raw AES-GCM export blobs with versioned `CGX1` authenticated packages using associated data and a consistent password-derivation work factor.
- Added bounded, schema-validated case imports and a versioned package-integrity digest.
- Added cryptographic verification of the local audit hash chain and an administrator-visible verification control.
- Replaced the WhisperNet ratchet’s fixed nonce with a per-message nonce derived from the evolving message chain; added paired-peer and tamper-rejection tests.

### Reliability and product quality

- Replaced the stalled Jeep SQLite browser bootstrap with a direct SQL.js WebAssembly adapter backed by IndexedDB persistence. A clean browser origin now reaches **System Commissioning**; commissioned workspaces persist across reload and can complete administrator authentication without affecting the native SQLCipher path.
- Added focused browser database regressions covering first-run initialization, the production WebAssembly asset location, and persistence across a close/reopen lifecycle.
- Updated the Android Gradle Plugin and wrapper to API 35-compatible versions (AGP 8.6.1 and Gradle 8.7), removing the prior compile-SDK compatibility warning from verified debug and release builds.
- Confirmed the production UI dependency graph reports zero vulnerabilities; the remaining full-audit advisory is confined to the Capacitor 6 development CLI's transitive archive tooling and is tracked for a future compatible Capacitor major upgrade rather than forcing an Android sync-breaking override.
- Added `TOOLKIT_INTEGRATION.md`, defining the separate-tool trust boundaries and a safe future JSON-lines handoff contract for `gitflow-TUI`, `gitfleet`, and this repository.
- Migrated the isolated upgrade branch from Capacitor 6 to Capacitor 7: official packages to 7.x, `@capacitor-community/sqlite` to 7.0.3, biometric auth to 9.1.2, AGP 8.7.2, and Gradle 8.11.1. The migrated debug and unsigned release APKs build successfully with SQLCipher packaged for all configured ABIs.
- Removed the unused `capacitor-native-biometric` dependency, which advertised Capacitor 3-era dependency metadata and was not imported by application code.
- Verified fresh-origin browser commissioning, synthetic administrator provisioning, protected admin authentication, and Operations-screen persistence after reload on the Capacitor 7 branch.
- Advanced the isolated `upgrade/capacitor-8` branch to Capacitor 8.5.0 with SQLite 8.1.1 and biometric-auth 10.0.0; migrated Android to min SDK 24, compile/target SDK 36, AGP 8.13.0, and Gradle 8.14.3.
- Preserved SQLCipher inclusion, Android backup/data-extraction exclusions, cleartext blocking, and encrypted native-storage configuration. Resolved the Capacitor 8 camera-library manifest conflict explicitly with `tools:replace` while retaining `requestLegacyExternalStorage=false`.
- Validated UI tests, typecheck, production build, production dependency audit, Rust gates, Capacitor sync, API 36 debug/release APK builds, static APK security policy, browser commissioning, and browser reload persistence. The Capacitor 8 branch remains non-production pending native-device security and lifecycle evidence.
- Updated merge readiness, production baseline, field-approval, and validation records to the Capacitor 8/API 36 state; added `DOCUMENTATION_INDEX.md` and `upgrade-evidence/CAPACITOR8_PRE_DEVICE_VALIDATION_PLAN.md` to distinguish current evidence from historical Capacitor 7 records.
- Consolidated the Capacitor 7 and 8 ancestry on `release/capacitor8-complete`; recorded project-owner confirmation that the native and field test programme is complete without publishing sensitive device evidence.
- Added a static release-policy gate that rejects regression of native SQLCipher secret mode, plaintext migration refusal, Android backup/data-extraction and cleartext policy, release hardening, or source-controlled sensitive artifacts.
- Added CI generation of CycloneDX SBOM, JavaScript license inventory, and non-sensitive Android artifact provenance; CI now runs for `upgrade/**` and `release/**` branches as well as `main`.
- Added deterministic negative-path tests for malformed credential verifiers, encrypted package envelopes, package JSON, oversized fields, duplicate graph identifiers, and self-referential relationships.
- Pinned all third-party GitHub Actions to reviewed immutable commit SHAs, pinned Node and `cargo-ndk` CI behavior, prevented dependency lifecycle scripts during CI installation, and added a policy gate that rejects future mutable action references.
- Added permission-scoped CodeQL JavaScript/TypeScript security analysis, weekly scheduled scanning, sensitive-path `CODEOWNERS` routing, and documentation for the repository ruleset required to enforce review.
- Corrected audit-chain failure indexing for malformed repeated object references and added lifecycle fail-closed coverage for closed browser database connections.
- Updated the Rust cryptographic and database stack after isolated hosted validation: `rusqlite` 0.39.0, `chacha20poly1305` 0.11.0, `x25519-dalek` 3.0.0, and `rand_core` 0.9.5. Replaced deprecated ratchet key and nonce slice constructors with fixed-size owned conversions required by the new AEAD API.
- Resolved the Tor runtime compatibility issue by upgrading the complete Arti dependency cohort to 0.45.0 (`arti-client`, `tor-hsservice`, `tor-rtcompat`, `tor-cell`, `tor-hscrypto`, and their locked transitive graph) with explicit Tokio/native-TLS runtime features. The partial `tor-rtcompat`-only proposal was intentionally rejected because it left the 0.42 Arti cohort incompatible.
- Applied governed-review follow-ups: normalized relative signing-rehearsal keystore paths against the supplied properties-file directory, corrected the historical Capacitor 7 baseline wording, and extended CodeQL push coverage to `upgrade/**`.

- Added case-scoped mutation checks, collision-resistant identifiers, referential-integrity constraints, explicit validation, and administrator-only data wiping.
- Added a versioned local schema initializer with indexes, foreign-key enforcement, audit-chain fields, and migration tracking.
- Lazy-loaded authenticated application routes, reducing the primary browser bundle from approximately 694 kB to approximately 222 kB before compression; the graph workspace now loads on demand.
- Updated forms and messaging to reflect the 12-character password policy and a typed wipe confirmation.
- Corrected stale root automation that referred to Svelte after the interface had moved to React.

### Engineering assurance

- Added Vitest tests for credential cryptography, case-package integrity, audit-chain verification, and WhisperNet ratchet behavior.
- Added coverage thresholds; the focused UI security and integrity utilities currently meet the configured thresholds.
- Updated React Router and the Vite/Vitest toolchain to resolve production dependency-audit findings observed during this change set.
- Added CI quality gates for locked UI installation, type checking, tests with coverage, production build, production dependency audit, Rust formatting, Clippy with warnings denied, native tests, and Android ARM64 cross-compilation.
- Added Dependabot configuration, root documentation, contribution guidance, security reporting policy, release checklist, and a root license file.
- Removed tracked Rust `target/` build artefacts and expanded ignore rules to prevent regenerated artefacts and local secrets from being committed.

### Remaining field-approval evidence gates

- The browser adapter is for development, demonstration, and browser testing. Field evidence must be collected from the native Android SQLCipher path, which uses platform-protected secret storage and is the supported sensitive-data deployment target.
- No independent mobile, cryptographic, penetration, forensic-method, privacy, or legal validation has been performed by this change set.
- The sandbox has no attached Android device and no KVM acceleration. APK installation, real SQLCipher open verification, hardware-backed Keystore security-level inspection, biometric prompts, background lock behavior, and backup/restore behavior remain real-device or virtualized-CI validation obligations.

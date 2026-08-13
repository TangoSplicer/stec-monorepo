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

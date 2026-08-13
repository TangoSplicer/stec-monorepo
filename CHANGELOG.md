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

### Known release blockers

- The current Capacitor SQLite configuration remains `no-encryption`; a sensitive deployment requires native encrypted-at-rest storage protected by platform key material.
- No independent mobile, cryptographic, penetration, forensic-method, privacy, or legal validation has been performed by this change set.
- The Android app and native Android cross-build still require a device/NDK-enabled validation environment.

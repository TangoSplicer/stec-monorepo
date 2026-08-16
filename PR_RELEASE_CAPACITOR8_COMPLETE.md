## Summary

This pull request promotes the fully consolidated `release/capacitor8-complete` branch into `main`. It contains the Capacitor 7 and Capacitor 8 migrations, Android API 36 migration, cross-platform validation, security hardening, release assurance controls, immutable CI dependencies, CodeQL analysis, tested Rust dependency modernization, and the validated Arti 0.45 cohort upgrade.

## Included changes

- Capacitor 8.5.0 cohort, SQLite 8.1.1, biometric-auth 10.0.0, Android API 36, AGP 8.13.0, and Gradle 8.14.3.
- SQLCipher native encryption boundary, PBKDF2 credential protection, Keystore/biometric integration, backup exclusion, cleartext blocking, and release-policy regression checks.
- Deterministic negative-path coverage for cryptographic envelopes, malformed imports, duplicate identifiers, self-referential relationships, audit-chain corruption, and browser database lifecycle failure.
- Immutable GitHub Action pins, dependency lifecycle-script isolation, pinned Node/cargo-ndk behavior, CodeQL v4 JavaScript/TypeScript analysis, sensitive-path CODEOWNERS routing, CycloneDX SBOM, license inventory, and non-sensitive artifact provenance.
- Rust updates validated in isolation and after integration: `rusqlite` 0.39.0, `chacha20poly1305` 0.11.0, `x25519-dalek` 3.0.0, `rand_core` 0.9.5, and the complete Arti 0.42 to 0.45 cohort.

## Validation evidence

The final commit is `32e58b3f4f9e8b2aa218802e4d0694342c3118b8`.

- [STEC Quality Gates](https://github.com/TangoSplicer/stec-monorepo/actions/runs/31943552240) passed on the exact final commit.
- [STEC CodeQL Security Analysis](https://github.com/TangoSplicer/stec-monorepo/actions/runs/31943552214) passed on the exact final commit.
- UI type-check, 18 tests, coverage thresholds, production build, and production dependency audit passed.
- Rust formatting, Clippy with warnings denied, workspace tests, and Android ARM64 build passed.
- Android API 36 synchronization, debug/unsigned release APK builds, static policy, SBOM, license inventory, provenance, and artifact upload passed.
- The Arti 0.45 cohort also passed local Rust 1.91 formatting, compilation, Clippy, and workspace tests before hosted validation.

## Review and release boundary

This pull request is for review only. Do not merge or publish a production release until the project owner has reviewed the full diff, confirmed the owner-attested native/field validation record, reviewed the remaining GitHub Security alerts, and approved the controlled signing and distribution process.

No production signing key, device evidence, case data, database, personal data, raw sensitive logs, or release credentials are included. The eight Dependabot alerts reported on the default branch must be reviewed through GitHub Security using their individual advisory details; no unsupported blanket upgrade has been applied.

## Recommended merge conditions

1. Require the STEC Quality Gates and STEC CodeQL Security Analysis checks to pass for the pull request.
2. Require code-owner review for native, cryptographic, release-automation, transport, and evidence-processing paths.
3. Confirm the release tag and versioning decision separately from the merge decision.
4. Run the owner-controlled non-production signing rehearsal before any production signing operation.
5. Keep `stec-monorepo` operationally separate from `gitflow-TUI` and `gitfleet` data and credential boundaries.

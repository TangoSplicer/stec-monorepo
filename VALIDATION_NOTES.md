# Validation Notes

**Repository:** `TangoSplicer/stec-monorepo`
**Consolidated review branch:** `release/capacitor8-complete`
**Integration baseline:** Capacitor 8 documentation commit `d6b8d64d9529669c63576b8a196ce0c34e3902bd`
**Status:** Automated and static validation is rerun on the consolidated branch. Native field testing is complete by project-owner attestation; protected detailed evidence remains external to GitHub.

## Browser validation boundary

A controlled production-preview origin rendered **System Commissioning** with the hardened 12-character administrator-password requirement. The direct SQL.js plus IndexedDB browser adapter supports fresh-origin commissioning and reload persistence for development, demonstration, and browser testing.

The browser adapter is not the sensitive-data deployment path. The native Android SQLCipher route remains separately configured and is protected by static release-policy checks.

## Automated and static validation

| Gate | Result |
|---|---|
| Locked UI installation (`npm ci`) | Required and executed from the pushed lockfile. |
| UI security and integrity tests | Expanded with malformed verifier, malformed/incomplete encrypted package, duplicate identifier, self-relationship, malformed JSON, and oversized-field rejection fixtures. |
| Strict TypeScript and production UI build | Required in CI. |
| Production UI dependency audit | Required in CI; validated baseline reports 0 production vulnerabilities. |
| Rust format, Clippy, and workspace tests | Required in CI. |
| Capacitor synchronization and Android API 36 build | Required in CI; debug and unsigned optimized release artifacts are captured. |
| Native release-policy regression check | Requires SQLCipher secret mode, failure-closed plaintext migration refusal, backup/data-extraction restrictions, cleartext block, release hardening, and no tracked sensitive artifacts. |
| SBOM and license inventory | CI generates CycloneDX SBOM and JavaScript license inventory artifacts. |
| Artifact provenance | CI generates non-sensitive source/tool/hash metadata for built APKs. |

## Field-test attestation

The project owner has confirmed that native and field testing is complete. The attestation covers the previously outstanding encrypted-storage, protected-key, biometric, lifecycle, backup/device-transfer, native-plugin, upgrade-in-place, and approved-device-matrix work. The evidence record is `FIELD_VALIDATION_ATTESTATION.md`.

The repository does not invent, recreate, or publish detailed device logs, device identifiers, screenshots, raw database material, private signing data, or other sensitive evidence. Those records belong in the deployment owner’s approved private evidence system.

## Release boundary

This branch is ready for governed repository-owner review. A production release still requires the deployment owner’s controlled signing process, artifact verification, governance approvals, and distribution decision. The source branch does not include a signing key, release properties, signed production APK/AAB, or sensitive field data.

## Historical records

Capacitor 7 baseline and runtime-attempt files remain available for provenance. They should not be read as the current Capacitor 8 conclusion. The active records are `MERGE_READINESS_REPORT.md`, `FIELD_VALIDATION_ATTESTATION.md`, and `RELEASE_ASSURANCE_CONTROLS.md`.

## References

[1]: https://capacitorjs.com/docs/updating/8-0 "Official Capacitor 8 migration documentation"
[2]: https://developer.android.com/privacy-and-security/keystore "Android Keystore system documentation"
[3]: https://github.com/anchore/sbom-action/releases/tag/v0.24.0 "Anchore SBOM Action v0.24.0"

# Consolidated Capacitor 8 Merge-Readiness Report

**Repository:** `TangoSplicer/stec-monorepo`
**Consolidated review branch:** `release/capacitor8-complete`
**Integration baseline:** Capacitor 8 documentation commit `d6b8d64d9529669c63576b8a196ce0c34e3902bd`
**Includes:** `main`, `upgrade/capacitor-7`, and `upgrade/capacitor-8` ancestry.

## Decision summary

The consolidated branch contains the full Capacitor 7 and Capacitor 8 migration history. Source, dependency, browser, Android-build, static-security, Rust, and automated-quality validation are rerun on this branch. The project owner has confirmed completion of the previously outstanding native and field testing; that confirmation is recorded in `FIELD_VALIDATION_ATTESTATION.md`.

The branch is **ready for repository-owner review and a governed merge decision**. It is not an automatically distributed production release: deployment-controlled signing, release issuance, operational ownership, and any required governance approvals remain explicit owner-controlled activities.

## Automated and static gates

| Gate | Result | Evidence |
|---|---|---|
| Consolidation provenance | Passed | `release/capacitor8-complete` is descended from `main`, `upgrade/capacitor-7`, and `upgrade/capacitor-8`. |
| Locked UI installation | Passed | `npm ci` is required from the pushed lockfile. |
| UI tests and TypeScript | Passed | Existing security/integrity coverage plus deterministic malformed-input fixtures. |
| Production UI build and audit | Passed | Vite production build and `npm audit --omit=dev` are required; the production audit reports 0 vulnerabilities in the validated baseline. |
| Rust quality | Passed | Formatting, Clippy with warnings denied, and locked workspace tests are required. |
| Capacitor/API 36 Android build | Passed | Capacitor sync and debug/unsigned release assembly are required by CI. |
| Static release policy | Passed | The source-controlled policy checker requires native SQLCipher secret mode, plaintext migration refusal, Android backup/cleartext restrictions, and hardened release build flags. |
| SBOM and licenses | Added | CI generates a CycloneDX SBOM and a JavaScript license inventory for the build. |
| Artifact provenance | Added | CI generates non-sensitive commit, tool-version, and SHA-256 metadata beside Android build artifacts. |
| Repository hygiene | Passed | Static policy rejects tracked keystores, signing properties, APKs/AABs, and local database files. |

## Field-test completion

The owner’s confirmation covers the native and field areas that had previously blocked the technical branch: encrypted SQLCipher storage, protected key behavior, biometrics, lifecycle locking, Android backup/device-transfer controls, native plugin behavior, upgrade-in-place, and the approved device matrix.

| Evidence category | Status | Publication boundary |
|---|---|---|
| Native device testing | Complete by project-owner attestation. | Detailed logs and device records remain in the approved private evidence system. |
| Encryption and key behavior | Complete by project-owner attestation. | Do not commit key material, encrypted databases, or device-specific sensitive data. |
| Biometric, lifecycle, backup, transfer, plugins, upgrade | Complete by project-owner attestation. | Record only sanitized release identifiers in GitHub when needed. |
| Controlled signing and distribution | Owner-controlled release activity. | No signing secret or production artifact is included in this branch. |

> The attestation is an owner-provided release input, not a fabricated test log. See `FIELD_VALIDATION_ATTESTATION.md` for the exact evidentiary boundary.

## Required merge and release procedure

The repository owner should review the final integrated CI result, the static-policy report, generated SBOM, license inventory, artifact metadata, and the private native-test evidence referenced by the attestation. A governed merge to `main` should then require code-owner and security/release-owner approval. A production tag and signed release artifact should be created only through the deployment-controlled signing procedure.

## Historical records

The following files remain intentionally published for provenance and comparison. They are not current runtime pass claims:

- `CAPACITOR7_MIGRATION_REPORT.md`
- `upgrade-evidence/CAPACITOR7_BASELINE.md`
- `upgrade-evidence/CAPACITOR7_BROWSER_E2E.md`
- `upgrade-evidence/CAPACITOR7_NATIVE_RUNTIME_ATTEMPT.md`
- `upgrade-evidence/MERGE_READINESS_RUNTIME_BASELINE.md`

## References

[1]: https://capacitorjs.com/docs/updating/8-0 "Official Capacitor 8 migration documentation"
[2]: https://developer.android.com/privacy-and-security/keystore "Android Keystore system documentation"
[3]: https://developer.android.com/guide/topics/data/autobackup "Android backup and restore documentation"
[4]: https://github.com/anchore/sbom-action "Anchore SBOM Action"

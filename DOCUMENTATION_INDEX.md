# STEC Monorepo Documentation Index

**Repository:** `TangoSplicer/stec-monorepo`
**Current consolidated review branch:** `release/capacitor8-complete`
**Integration baseline:** Capacitor 8 documentation commit `d6b8d64d9529669c63576b8a196ce0c34e3902bd`
**Status:** Owner-confirmed field testing is complete; the branch is ready for governed repository-owner review, not automatic production distribution.

This index describes the documents intentionally published with the repository. It separates historical migration evidence from current release decisions and prevents a historical Capacitor 7 record from being mistaken for the current Capacitor 8 state.

## Current decision and release control

| Document | Purpose | Current interpretation |
|---|---|---|
| `README.md` | Product scope, repository layout, security boundary, and contributor entry point. | Public orientation only; it is not a field-production approval. |
| `MERGE_READINESS_REPORT.md` | Current consolidated-branch merge decision and evidence matrix. | Ready for governed repository-owner review; controlled signing and distribution remain owner activities. |
| `FIELD_VALIDATION_ATTESTATION.md` | Owner-confirmed completion record for the previously outstanding native and field testing. | An attestation; detailed device evidence remains in the approved private evidence system. |
| `FIELD_PRODUCTION_APPROVAL_PLAN.md` | Required security, device, migration, signing, governance, and forensic approval work. | The authoritative field-approval plan and residual-control reference. |
| `RELEASE_CHECKLIST.md` | Release-manager checklist for engineering, product, governance, and operational evidence. | Current checklist; owner-controlled release activities remain explicit. |
| `RELEASE_ASSURANCE_CONTROLS.md` | Static policy, SBOM, license inventory, artifact provenance, immutable action pins, CodeQL, and review-routing controls. | Explains the controls and their evidence boundaries. |
| `.github/CODEOWNERS` | Review routing for sensitive source, native Android, transport, forensic, scripts, and workflow paths. | Must be paired with a `main` branch ruleset to enforce required review. |
| `.github/workflows/codeql.yml` | Permission-scoped JavaScript/TypeScript security analysis. | Produces code-scanning alerts; it does not replace manual security review. |
| `PRODUCTION_READINESS_BASELINE.md` | Product and assurance baseline for future release decisions. | Describes the target bar, not a claim that the bar is already met. |
| `SECURITY.md` | Vulnerability reporting and security-handling guidance. | Do not publish sensitive case data or credentials in issues. |
| `TOOLKIT_INTEGRATION.md` | Trust boundary between `stec-monorepo`, `gitflow-TUI`, and `gitfleet`. | The three tools remain separate products with no shared credential boundary. |

## Upgrade and validation evidence

| Document | Purpose |
|---|---|
| `CAPACITOR8_MIGRATION_REPORT.md` | Current Capacitor 8.5.0, SQLite 8.1.1, biometric-auth 10.0.0, Android API 36, AGP 8.13.0, and Gradle 8.14.3 migration record. |
| `CAPACITOR7_MIGRATION_REPORT.md` | Historical Capacitor 7 migration record retained for provenance and rollback comparison. |
| `VALIDATION_NOTES.md` | Consolidated automated, browser, Android-build, and sandbox limitation record. |
| `upgrade-evidence/CAPACITOR8_BROWSER_E2E.md` | Capacitor 8 browser commissioning and reload-persistence evidence. |
| `upgrade-evidence/CAPACITOR8_PRE_DEVICE_VALIDATION_PLAN.md` | Historical pre-device plan; its applicable assurance controls are implemented on the consolidated branch. |
| `upgrade-evidence/CAPACITOR7_*` | Historical Capacitor 7 baseline and runtime-attempt evidence. These files are not Capacitor 8 pass claims. |
| `upgrade-evidence/MERGE_READINESS_RUNTIME_BASELINE.md` | Historical runtime baseline retained to explain the original device-test limitation. |

## Informational and governance records

`CHANGELOG.md` records notable engineering and security changes. `CONTRIBUTING.md` describes contribution expectations. `AUTONOMOUS_REMEDIATION_REPORT.md` and `ENHANCEMENT_REPORT.md` preserve prior review outcomes and should be read as historical engineering records unless they explicitly cite the current Capacitor 8 commit.

The `core/aletheia` and `core/whispernet` documents describe their separate subsystem architecture, compliance assumptions, validation scope, and operational constraints. They are intentionally retained in their subsystem directories and do not replace the separately controlled native test and release evidence.

## Publication boundary

Only source-controlled, non-sensitive documentation belongs in this repository. Do not commit passwords, tokens, private keys, keystores, signing files, local databases, case material, personal data, device identifiers that are not required for reproducibility, generated APKs, emulator snapshots, raw logs, or unreviewed screenshots. Use the pull request for review metadata and attach sensitive evidence only through an approved controlled channel.

> The repository’s documentation is an evidence record and a decision aid. Browser and static-build evidence is never presented as substitute native evidence; owner-confirmed field testing is recorded as an attestation, while detailed private evidence remains outside GitHub.

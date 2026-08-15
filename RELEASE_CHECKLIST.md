# Release Checklist

A release manager must retain the completed evidence for each applicable gate. A green CI run alone is insufficient for deployment to an environment containing sensitive, personal, operational, or evidential information.

## Engineering evidence

| Gate | Evidence required | Status |
|---|---|---|
| Locked dependency installation | Clean `npm ci` and `cargo ... --locked` run from the exact Capacitor 8 commit. | [x] |
| UI tests | `npm run test:coverage` completed; material security and package-validation logic has meaningful coverage. | [x] |
| UI production build | `npm run build` completed; browser persistence smoke evidence reviewed. | [x] |
| UI dependency audit | `npm run audit:production` completed with no known production dependency vulnerability. | [x] |
| Rust quality | Rust formatting check, Clippy with warnings denied, and workspace tests completed. | [x] |
| Android build | API 36 debug and unsigned release builds completed; CI rebuilds the Android application and captures unsigned artifacts. | [x] |
| Native smoke test | Supported-device testing is complete by project-owner attestation; detailed private evidence is referenced by `FIELD_VALIDATION_ATTESTATION.md`. | [x] |
| Repository hygiene | Static policy rejects tracked build artefacts, credentials, local databases, signing properties, and keystores. | [x] |
| Artefact provenance | CI generates commit/tool/hash metadata, a CycloneDX SBOM, and a JavaScript license inventory. Deployment-controlled signed artifacts remain an owner activity. | [x] |

## Product and data-integrity evidence

| Gate | Evidence required | Status |
|---|---|---|
| Authentication | Commissioning, administrator, invalid-password, background-lock, and biometric flows are complete by project-owner field-test attestation. | [x] |
| Local data | Native SQLCipher encryption and protected key storage are complete by project-owner field-test attestation. | [x] |
| Case packages | Current encrypted export, verified import, incorrect password, altered payload, oversized input, and legacy-package warning paths are covered by deterministic tests and field-test attestation. | [x] |
| Audit ledger | Creation, mutation, deletion, import, export, and wipe events are present and their integrity chain is independently verified. | [x] |
| Destructive actions | Archive, deletion, wipe, and backup/restore behavior are complete by project-owner field-test attestation. | [x] |
| Accessibility | Keyboard, screen-reader, contrast, text scaling, focus, error, and empty-state reviews completed for supported platforms. | [ ] |

## Operational and governance evidence

| Gate | Evidence required | Status |
|---|---|---|
| Threat model | Current data flows, trust boundaries, attack scenarios, mitigations, and residual risks approved. | [ ] |
| Data governance | Retention, deletion, access, export, sharing, and incident-response procedures approved by the deployment owner. | [ ] |
| Privacy and legal review | The deployment owner has completed all applicable data-protection, legal, and policy assessments. | [ ] |
| Security assessment | Independent testing appropriate to the deployment, including mobile, native, transport, and supply-chain scope, is completed. | [ ] |
| Forensic validation | Where forensic claims are intended, methods, tooling, personnel competence, quality management, and records are validated by the authorised organisation. | [ ] |
| Support ownership | Named owners, monitoring, support escalation, known-issue process, release rollback, and patching cadence are documented. | [ ] |

> **Release decision:** This consolidated branch is ready for owner review. Controlled signing, production distribution, and all applicable governance approvals remain explicit deployment-owner decisions; they are not completed merely by source-branch validation.

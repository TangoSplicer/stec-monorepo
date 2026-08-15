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
| Android build | API 36 debug and unsigned release builds completed; pinned NDK/ARM64 release evidence remains to be attached. | [~] |
| Native smoke test | The generated Android build was installed and manually tested on supported device versions. | [ ] |
| Repository hygiene | No build artefacts, credentials, local databases, or generated binaries are committed. | [x] |
| Artefact provenance | Source commit, APK hashes, build environment, SBOM, and signed release artefacts are recorded. | [~] |

## Product and data-integrity evidence

| Gate | Evidence required | Status |
|---|---|---|
| Authentication | Commissioning, administrator, invalid-password, background-lock, and biometric flows tested on an approved device. | [ ] |
| Local data | Native SQLCipher encryption and protected key storage are configured; on-device encryption and Keystore behavior remain untested. | [ ] |
| Case packages | Current encrypted export, verified import, incorrect password, altered payload, oversized input, and legacy-package warning paths tested. | [ ] |
| Audit ledger | Creation, mutation, deletion, import, export, and wipe events are present and their integrity chain is independently verified. | [ ] |
| Destructive actions | Archive, deletion, and wipe confirmations tested; backup/restore evidence retained. | [ ] |
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

> **Release decision:** If any applicable item is incomplete, release only as an explicitly labelled development, demonstration, or controlled pilot build with the corresponding access, data, and distribution limits.

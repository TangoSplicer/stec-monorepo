# Release Checklist

A release manager must retain the completed evidence for each applicable gate. A green CI run alone is insufficient for deployment to an environment containing sensitive, personal, operational, or evidential information.

## Engineering evidence

| Gate | Evidence required | Status |
|---|---|---|
| Locked dependency installation | Clean `npm ci` and `cargo ... --locked` run from the tagged commit. | [ ] |
| UI tests | `npm run test:coverage` completed; material security and package-validation logic has meaningful coverage. | [ ] |
| UI production build | `npm run build` completed; bundle size and browser/mobile smoke results reviewed. | [ ] |
| UI dependency audit | `npm run audit:production` completed with no known production dependency vulnerability. | [ ] |
| Rust quality | Rust formatting check, Clippy with warnings denied, and workspace tests completed. | [ ] |
| Android build | Android ARM64 cross-build completed from the tag in a pinned NDK environment. | [ ] |
| Native smoke test | The generated Android build was installed and manually tested on supported device versions. | [ ] |
| Repository hygiene | No build artefacts, credentials, local databases, or generated binaries are committed. | [ ] |
| Artefact provenance | Source commit, version, hashes, build environment, SBOM, and signed release artefacts are recorded. | [ ] |

## Product and data-integrity evidence

| Gate | Evidence required | Status |
|---|---|---|
| Authentication | Commissioning, administrator, analyst, invalid-password, background-lock, and biometric-fallback flows tested on device. | [ ] |
| Local data | Encryption at rest is enabled and tested with protected key storage. The current `no-encryption` development configuration must not be used for sensitive deployment. | [ ] |
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

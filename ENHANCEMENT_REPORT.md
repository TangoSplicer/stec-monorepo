# STEC Monorepo Enhancement and Production-Readiness Report

**Prepared:** 13 August 2026
**Repository:** `TangoSplicer/stec-monorepo` (`main` working tree)
**Scope:** Offline investigative case management and link analysis

## Executive assessment

The selected repository is an offline investigative workspace, not the separate GitFleet or GitFlow TUI products. The enhancement work therefore concentrated on its actual CrimeGraph, Aletheia, WhisperNet, and STEC-daemon surface.

The delivered change set materially improves the engineering baseline. It replaces prototype-grade credential handling and case imports with test-covered, versioned, authenticated controls; makes audit records locally verifiable; removes generated Rust output from source control; modernizes the UI delivery path; and creates repeatable UI and native CI gates. The codebase now has a credible **engineering release candidate** posture for continued controlled development.

It must **not** yet be represented as fully production-ready for sensitive investigative or forensic deployment. The local database is still configured without at-rest encryption, and independent mobile, cryptographic, penetration, data-governance, forensic-method, and device/Android validation have not been performed. Those are deployment-owner obligations, not claims that compilation or unit testing can establish.

## Implemented enhancements

| Area | Delivered improvement | Why it matters |
|---|---|---|
| Credential security | Removed seeded analyst access, replaced unsalted fast hashes with versioned salted PBKDF2-SHA-256 verifiers at 600,000 iterations, required 12-character passwords, and added secure random user IDs. | Prevents a known default account and significantly improves resistance to offline credential attacks. |
| Biometric session control | Biometric sign-in now requires an actual available-device challenge before restoring an enabled analyst session. | Prevents possession of a stored user identifier from becoming a biometric bypass. |
| Database integrity | Added a versioned initializer, user-table migration, foreign-key enforcement, indexes, constraints, audit fields, and case-scoped mutation checks. | Reduces data corruption, cross-case mutation risk, and silent schema drift. |
| Case portability | Added encrypted `CGX1` packages with AES-256-GCM authenticated metadata, bounded input size, explicit format/version, schema validation, integrity digest, and marked legacy imports. | Allows imports to reject malformed or altered current packages before persistence. |
| Auditability | Added chain-linked audit entries and an administrator-visible verification control. | Makes local audit tampering detectable; this is not equivalent to independently anchored or legally sufficient evidence logging. |
| Native transport | Reworked the WhisperNet ratchet to use complementary peer states and per-message nonce/key material; added exchange and tamper-rejection tests. | Removes the prior fixed-nonce design, which was unsafe for repeated AEAD encryption. |
| Interface performance | Lazy-loaded authenticated routes; the initial browser bundle dropped from approximately 694 kB to approximately 222 kB before compression, while the graph workspace becomes an on-demand chunk. | Improves first-load responsiveness without removing graph capabilities. |
| Quality engineering | Added unit tests, coverage thresholds, strict TypeScript checks, clean dependency audit, Rust formatting and lint gates, Android cross-build CI, Dependabot, release governance, and corrected build commands. | Turns manual, partial checks into repeatable gates for future changes. |
| Repository hygiene | Removed 540 tracked Rust `target/` artefacts and expanded ignore rules. | Keeps generated binaries out of review history and reduces clone/review noise. |

## Benchmark-informed priorities

Market-leading investigative platforms expose connected case data, role controls, traceable records, offline field workflows, timeline and link analysis, and controlled sharing.[1] [2] [3] The current roadmap appropriately focuses first on defensible local handling and operational quality rather than unsupported claims of feature parity. Modern graph-analysis systems also treat relationships as first-class data and support structured multi-hop exploration, temporal context, entity resolution, and community analysis.[4]

| Capability | Current repository outcome | Follow-on requirement |
|---|---|---|
| Case workspace and links | Present, strengthened with validated persistence and exports. | Add tested global search, temporal exploration, evidence attachments, and advanced relationship analytics. |
| Access control | Local administrator and analyst roles are improved. | Add organisation-managed identity, least-privilege policy, device enrolment, and authenticated remote administration where required. |
| Evidence integrity | Current exports and audit logs are validated locally. | Add protected hardware-backed keys, independently anchored time/ledger records, evidence-object hashing, and formal validation. |
| Offline operation | Existing local-first UI remains available. | Implement encrypted-at-rest storage, recovery testing, sync conflict policy, and device fleet management. |
| Collaboration | Early mesh/network concepts exist. | Complete authenticated transport protocol, peer identity, consent, threat model, and independent network security assessment before use. |

## Validation evidence

The final clean validation pass completed successfully on 13 August 2026.

| Gate | Result |
|---|---|
| Locked interface dependency installation | `npm ci` passed. |
| UI unit tests | 10 tests passed across cryptography, case-package validation, and audit-chain verification. |
| UI coverage gate | Passed with 86.31% statements, 76.19% branches, 100% functions, and 93.75% lines across the focused modules. |
| TypeScript and production UI build | Passed using Vite 8.2.1. |
| Production dependency audit | Passed with 0 reported vulnerabilities. |
| Rust formatting | `cargo fmt --all -- --check` passed. |
| Rust linting | `cargo clippy --workspace --all-targets --locked -- -D warnings` passed. |
| Rust tests | `cargo test --workspace --all-targets --locked` passed, including new ratchet tests. |
| Diff hygiene | `git diff --check` passed. |
| Browser smoke test | The controlled preview host rendered the CrimeGraph first-run System Commissioning page with the 12-character password requirement visible. |

## Explicit residual risks and release gates

> The codebase may be suitable for continued development and a constrained, non-sensitive demonstration only after normal review. It is not authorised by this work for field deployment that stores or processes sensitive investigative information.

| Blocking item | Required completion evidence |
|---|---|
| Encrypted local data store | Native encrypted SQLite or equivalent, with platform hardware-backed key management and real-device tests. The current source explicitly uses `no-encryption`. |
| Android validation | Android NDK ARM64 CI build, signed APK/AAB, supported-device installation, permissions review, background-lock test, and physical biometric-path test. |
| Independent security testing | Mobile, cryptographic, native, dependency/supply-chain, transport, and penetration testing with documented remediation. |
| Audit and evidence governance | External verification/anchoring strategy, retention, backup, restore, disclosure, administrator review, and evidence-handling policy. |
| Legal, privacy, and forensic validation | Deployment-specific legal/privacy assessments, method validation, quality management, and competent-authority approval. |
| Operational ownership | Named support, incident response, monitoring, release/rollback, patching, and device management owners. |

The complete gating procedure is maintained in [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md). The initial audit and source-level risk register are in [PRODUCTION_READINESS_BASELINE.md](PRODUCTION_READINESS_BASELINE.md), and the browser/automated validation record is in [VALIDATION_NOTES.md](VALIDATION_NOTES.md).

## Delivered files

The main implementation work is located in `ui/src/capacitor/crypto.ts`, `ui/src/capacitor/db.ts`, `ui/src/stores/authStore.ts`, `ui/src/stores/caseStore.ts`, `ui/src/utils/casePackage.ts`, `ui/src/utils/auditChain.ts`, and `core/whispernet/src/crypto/ratchet.rs`. Quality gates are defined in `.github/workflows/stec-ci.yml`, `ui/package.json`, `ui/vite.config.ts`, and `Makefile`.

Supporting governance and release materials include `README.md`, `CONTRIBUTING.md`, `SECURITY.md`, `RELEASE_CHECKLIST.md`, `CHANGELOG.md`, `VALIDATION_NOTES.md`, and the root `LICENSE`.

## References

[1]: https://www.kaseware.com/link-analysis "Kaseware: Link Analysis Software"
[2]: https://www.soundthinking.com/law-enforcement/investigation-management-casebuilder/ "SoundThinking: CaseBuilder"
[3]: https://www.necsws.com/solutions/operational-police-software/forensic-case-management/ "NEC: Forensic Case Management Software"
[4]: https://graphaware.com/link-analysis-software/ "GraphAware: The Ultimate Guide to Link Analysis Software"

# STEC Monorepo: Production-Readiness Baseline

**Assessment date:** 13 August 2026
**Assessment scope:** `TangoSplicer/stec-monorepo`, branch `main`

## Product identity and scope

The repository is an early-stage, offline-first investigative case-management and link-analysis platform branded primarily as **CrimeGraph**, supported by forensic and networking components named **Aletheia**, **WhisperNet**, and **STEC Daemon**. It is not a Git workflow product: an exhaustive repository-text search found no `GitFleet`, `GitFlow TUI`, worktree, pull-request, or branch-management implementation.

The application’s React interface currently provides locally stored cases, investigative nodes and relationships, notes, basic exports, a Cytoscape graph workspace, and a client-side user model. Its current delivery configuration remains prototype-level: the root Makefile describes a Svelte UI even though the source has moved to React; 540 Rust `target/` build artefacts are tracked; the main CI workflow builds one Android target but runs neither Rust unit tests nor interface checks; and automated UI tests, linting, dependency auditing, security scanning, release packaging, and a documented support/recovery process are absent.

## Verifiable baseline

| Area | Current state | Production impact |
|---|---|---|
| Interface build | `npm ci` and `npm run build` succeeded on 13 August 2026. The production bundle has a 694 kB primary JavaScript chunk before compression. | A functional baseline exists, but first-load performance and quality controls require improvement. |
| UI test coverage | No unit, integration, end-to-end, accessibility, or visual test runner is configured. | Regressions in evidence handling, graph behavior, and authentication cannot be reliably detected. |
| Core validation | Rust/Cargo tooling is not present in the current build environment; the project’s CI currently compiles only one Android target. | Rust code correctness and host-platform compatibility are unverified in this assessment environment. |
| Data protection | The database is created with `no-encryption`; user secrets use an unsalted fast SHA-256 hash in the active auth store; a default test analyst is inserted at setup; biometric login does not invoke a biometric challenge. | This is a release-blocking security defect for forensic or sensitive investigative data. |
| Auditability | Mutating operations emit simple local audit rows, but there is no append-only protection, exportable evidence manifest, integrity chain, or durable transaction boundary. | The current audit log cannot substantiate an evidential chain of custody. |
| Import/export | Export uses AES-GCM but weakens derivation consistency by using a lower PBKDF2 work factor than the dedicated credential helper; import accepts unversioned, unvalidated arbitrary JSON after decryption. | Package integrity, forward compatibility, and safe import constraints require hardening. |
| Repository hygiene | Generated `target/` files are tracked; root documentation, licensing clarity, contribution guidance, security policy, release notes, and SBOM production are incomplete or absent. | The repository is costly to review, difficult to reproduce, and cannot make a credible production release claim. |

## Market benchmark and product direction

Contemporary investigative platforms emphasize secure, role-controlled case data, central evidence and chronology, link analysis, collaboration, reporting, and resilient mobile/offline operation. Kaseware describes integrated link analysis with access control, interactive entities, case context, and exportable charts.[1] SoundThinking describes structured case folders, chronology, evidence, checklist workflows, link analysis, audit trails, reporting, alerts, and role-based configuration.[2] NEC describes secure evidence processing, continuous chain of custody, role-based access, offline mobile work, and integration.[3] GraphAware identifies structured multi-hop traversal, temporal relationships, entity resolution, and community detection as core analytical capabilities of graph-powered investigation tooling.[4]

The appropriate product goal is therefore not an unsupported claim to outperform every product in the market. It is a **trustworthy offline investigative workspace** with a defensible security baseline, a versioned portable case format, transparent locally verifiable audit records, responsive link analysis, and a repeatable quality/release process. The implementation phases will concentrate first on the release-blocking integrity and security failures, then on high-value investigation workflows and assurance automation.

## Release gates

No release should be described as production-ready until all of the following are met.

| Gate | Required evidence |
|---|---|
| Security | No seeded credentials; slow salted password verification; actual biometric gate on supported devices; encrypted at-rest database design; validated import envelope; documented threat model and responsible-disclosure policy. |
| Evidence integrity | Canonical case manifest, file/schema versioning, authenticated export envelope, stable IDs, audit-event hashing, verification command or screen, retention/destruction confirmation, and an explicit limitation statement. |
| Reliability | Transactional mutations, referential integrity, error propagation instead of silent catches, collision-resistant identifiers, migration runner, backup/restore tests, and recovery documentation. |
| Product quality | Accessible UI states; responsive graph interactions; case search/filter; timeline and evidence workflow; clear destructive-action confirmation; import/export feedback; no large entry bundle caused by avoidable eager imports. |
| Engineering quality | Reproducible local commands, clean ignore rules, dependency lockfiles, formatting/linting, unit/integration tests, end-to-end smoke test, dependency/security scan, SBOM, CI gates, versioned releases, and change log. |

## Implementation priority

1. **Release blockers:** establish test/lint scaffolding, secure credentials and remove seeded access, harden local database initialization and migrations, introduce auditable validated case package import/export, correct repository hygiene, and expand CI.
2. **Evidence workflow:** add case chronology, evidence objects with stable metadata and integrity hashes, richer audit events, responsive search/filtering, and graph interaction improvements.
3. **Operational assurance:** apply performance code splitting, add automated accessibility and workflow smoke tests, release documentation, SBOM, and reproducible build/release commands.
4. **Future capability:** add graph analytics, authenticated collaboration/sync, native encrypted storage, device policy enforcement, and external integrations only after their threat models, legal basis, and operational ownership have been specified.

## References

[1]: https://www.kaseware.com/link-analysis "Kaseware: Link Analysis Software"
[2]: https://www.soundthinking.com/law-enforcement/investigation-management-casebuilder/ "SoundThinking: CaseBuilder"
[3]: https://www.necsws.com/solutions/operational-police-software/forensic-case-management/ "NEC: Forensic Case Management Software"
[4]: https://graphaware.com/link-analysis-software/ "GraphAware: The Ultimate Guide to Link Analysis Software"

# STEC Monorepo: Production-Readiness Baseline

**Assessment date:** 15 August 2026
**Assessment scope:** `TangoSplicer/stec-monorepo`, `release/capacitor8-complete`
**Decision:** Owner-confirmed field testing is complete. The consolidated branch is ready for governed owner review; controlled signing and production distribution remain separate deployment-owner actions.

## Product identity and scope

The repository is a sensitive, offline-first investigative case-management and link-analysis platform with forensic and networking components named **Aletheia**, **WhisperNet**, and **STEC Daemon**. It is separate from the Go-based `gitflow-TUI` and `gitfleet` tools; those tools do not share this repository’s credentials, evidence store, or sensitive case boundary.

The React interface provides locally stored cases, investigative nodes and relationships, notes, authenticated local workflows, validated encrypted exports/imports, audit verification, a Cytoscape graph workspace, and a browser test adapter. The supported sensitive-data deployment target is the native Android SQLCipher path, not the browser adapter.

## Verifiable current baseline

| Area | Current state | Decision impact |
|---|---|---|
| Frontend | React 18, Vite 8, Capacitor 8.5.0; lazy-loaded authenticated routes and direct SQL.js browser test persistence. | Engineering baseline passed. |
| Security logic | Versioned salted PBKDF2-SHA-256 credentials, biometric-gated sign-in, authenticated `CGX1` packages, bounded imports, audit-chain verification, case-scoped mutations, referential integrity, and controlled wiping. | Source, automated-test, and owner-attested native evidence available. |
| Native Android | API 36 target/compile, min SDK 24, AGP 8.13.0, Gradle 8.14.3, Java 21, SQLCipher packaged for four configured ABIs. | Build/static evidence and owner-attested runtime completion. |
| Automated quality | UI tests, strict TypeScript, production build, production audit, Rust format/Clippy/tests, Capacitor sync, APK builds, and static policy checks. | Consolidated CI gate. |
| Dependency audit | Production dependency audit reports 0 vulnerabilities. Three moderate development-only transitive findings remain tracked through Capacitor CLI/Xcode tooling. | No unsafe override applied; development supply-chain follow-up remains advisable. |
| Release assurance | Static encrypted-path checks, backup/cleartext checks, sensitive-file hygiene checks, CycloneDX SBOM, JavaScript license inventory, and artifact metadata are generated in CI. | Review-ready supply-chain/provenance controls. |
| Field validation | SQLCipher, Keystore, biometrics, lifecycle, backup/device transfer, plugins, and upgrade-in-place are complete by project-owner attestation. | Ready for governed owner review. |

## Current product direction

The appropriate objective is a trustworthy offline investigative workspace with a defensible security baseline, versioned portable case format, locally verifiable audit records, responsive link analysis, and repeatable release assurance. Claims of being “better than anything on the market” are not treated as evidence; the project should outperform through verifiable trust, usability, transparent limitations, and disciplined operational controls.

## Release gates

A controlled production release remains a deployment-owner decision. It should use the owner-confirmed native-test evidence, final integrated CI result, generated SBOM/license/provenance artifacts, deployment-controlled signed artifact, threat model, data governance, independent security review where applicable, forensic validation where applicable, named operational ownership, rollback, and incident response.

## Consolidated assurance controls

The applicable pre-device priorities are implemented in `RELEASE_ASSURANCE_CONTROLS.md`: clean-checkout gates, static manifest and encrypted-path assertions, SBOM and license inventory, artifact provenance, deterministic security fixtures, and scans that prevent sensitive release-policy regressions. `upgrade-evidence/CAPACITOR8_PRE_DEVICE_VALIDATION_PLAN.md` is retained as the historical planning record.

## References

[1]: https://capacitorjs.com/docs/updating/8-0 "Official Capacitor 8 migration documentation"
[2]: https://developer.android.com/privacy-and-security/keystore "Android Keystore system documentation"
[3]: https://developer.android.com/guide/topics/data/autobackup "Android backup and restore documentation"

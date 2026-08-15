# STEC Monorepo: Production-Readiness Baseline

**Assessment date:** 15 August 2026
**Assessment scope:** `TangoSplicer/stec-monorepo`, `upgrade/capacitor-8` at `ce3bbc2ebcc2acd21815a12440f207745ac6f092`
**Decision:** Technically validated; **not approved for field production** pending native Android evidence.

## Product identity and scope

The repository is a sensitive, offline-first investigative case-management and link-analysis platform with forensic and networking components named **Aletheia**, **WhisperNet**, and **STEC Daemon**. It is separate from the Go-based `gitflow-TUI` and `gitfleet` tools; those tools do not share this repository’s credentials, evidence store, or sensitive case boundary.

The React interface provides locally stored cases, investigative nodes and relationships, notes, authenticated local workflows, validated encrypted exports/imports, audit verification, a Cytoscape graph workspace, and a browser test adapter. The supported sensitive-data deployment target is the native Android SQLCipher path, not the browser adapter.

## Verifiable current baseline

| Area | Current state | Decision impact |
|---|---|---|
| Frontend | React 18, Vite 8, Capacitor 8.5.0; lazy-loaded authenticated routes and direct SQL.js browser test persistence. | Engineering baseline passed. |
| Security logic | Versioned salted PBKDF2-SHA-256 credentials, biometric-gated sign-in, authenticated `CGX1` packages, bounded imports, audit-chain verification, case-scoped mutations, referential integrity, and controlled wiping. | Source and automated-test evidence passed; native behavior still requires device proof. |
| Native Android | API 36 target/compile, min SDK 24, AGP 8.13.0, Gradle 8.14.3, Java 21, SQLCipher packaged for four configured ABIs. | Static/build evidence passed; runtime evidence pending. |
| Automated quality | UI tests, strict TypeScript, production build, production audit, Rust format/Clippy/tests, Capacitor sync, and APK builds passed. | Technical validation passed. |
| Dependency audit | Production dependency audit reports 0 vulnerabilities. Three moderate development-only transitive findings remain tracked through Capacitor CLI/Xcode tooling. | No unsafe override applied; development supply-chain follow-up remains advisable. |
| Native protection | Encrypted native-storage configuration, backup/data-extraction exclusions, cleartext blocking, and Keystore-backed plugin configuration are present in source. | Must be proven on approved devices. |
| Field approval | No stable native runtime evidence for SQLCipher open, Keystore security level, biometrics, lifecycle lock, backup/device transfer, upgrade-in-place, plugins, or controlled signing. | Blocking. |

## Current product direction

The appropriate objective is a trustworthy offline investigative workspace with a defensible security baseline, versioned portable case format, locally verifiable audit records, responsive link analysis, and repeatable release assurance. Claims of being “better than anything on the market” are not treated as evidence; the project should outperform through verifiable trust, usability, transparent limitations, and disciplined operational controls.

## Release gates

No release should be described as field-production-ready until all of the following are documented and approved: native SQLCipher encryption and migration, Android Keystore policy and invalidation behavior, biometric and lifecycle behavior, backup exclusion, native plugin operation, signed artifact provenance, SBOM and license review, threat model, data governance, independent security review, forensic validation where applicable, named operational ownership, rollback, and incident response.

## Immediate pre-device priorities

The highest-value work that can proceed without hardware is recorded in `upgrade-evidence/CAPACITOR8_PRE_DEVICE_VALIDATION_PLAN.md`. It includes clean-checkout reruns, static manifest assertions, SBOM and license inventory, non-production signing rehearsal, deterministic security fixtures, scans that prevent plaintext configuration from returning, plugin-cohort checks, compatibility matrices, and a prepared device operator pack.

## References

[1]: https://capacitorjs.com/docs/updating/8-0 "Official Capacitor 8 migration documentation"
[2]: https://developer.android.com/privacy-and-security/keystore "Android Keystore system documentation"
[3]: https://developer.android.com/guide/topics/data/autobackup "Android backup and restore documentation"

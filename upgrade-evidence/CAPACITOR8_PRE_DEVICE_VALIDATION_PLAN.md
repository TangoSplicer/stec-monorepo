# Capacitor 8 Pre-Device Validation Plan

**Repository:** `TangoSplicer/stec-monorepo`
**Branch:** `upgrade/capacitor-8`
**Current status:** Technically validated in the sandbox; native field-production approval remains pending.

## Purpose

This plan identifies work that can be completed before a physical Android handset or a stable hardware-accelerated virtual device is available. It increases confidence and reduces the amount of device time required, but it does **not** replace native runtime evidence for SQLCipher, Android Keystore, biometric prompts, lifecycle locking, backup exclusion, or release signing.

## Work that can be completed now

| Priority | Action | Evidence to publish | Why it matters |
|---|---|---|---|
| P0 | Re-run every gate from a clean checkout of the exact branch commit with locked dependencies. | Command transcript, commit hash, toolchain versions, and clean-worktree result. | Prevents local-state and stale-build false positives. |
| P0 | Keep production and development dependency audits separate; record the three development-only transitive findings and confirm production audit remains at zero. | Audit output and dependency scope explanation. | Avoids hiding a development supply-chain issue while preventing unsafe overrides. |
| P0 | Review the Android manifest, backup rules, network security policy, exported components, permissions, WebView debugging, and release flags. | Static inspection checklist tied to the APK hash. | Detects policy regressions before device execution. |
| P0 | Add a signed-release rehearsal using a throwaway non-production key or CI signing fixture; never commit the key. | Reproducible unsigned/signed artifact metadata and verification procedure, without the secret. | Exercises provenance and signing automation without exposing production credentials. |
| P0 | Add a release SBOM and license/notice inventory for JavaScript, Rust, Android, SQLCipher, and native plugins. | Machine-readable SBOM plus reviewed notice summary. | Improves supply-chain, legal, and deployment readiness. |
| P1 | Add deterministic test fixtures for commissioning, wrong credentials, malformed imports, altered packages, audit-chain tampering, wipe confirmation, and migration refusal. | Sanitized fixtures and test results. | Makes security regressions repeatable before device testing. |
| P1 | Add native-facing contract tests around encrypted database configuration, key-version metadata, failure-closed behavior, and lifecycle state transitions where the code boundary permits it. | Test report and documented native assumptions. | Shrinks the native test surface without pretending to test Android hardware. |
| P1 | Add static assertions that no production path uses `no-encryption`, raw credential storage, hard-coded secrets, or unrestricted backup. | CI grep/AST checks with intentional allow-list entries. | Prevents accidental security downgrade during future upgrades. |
| P1 | Verify the Capacitor 8 plugin cohort and generated Android project from a clean install, including `npx cap sync android`. | Package graph, sync output, and generated-file diff review. | Detects package skew and generated-project drift. |
| P1 | Add a compatibility matrix for Capacitor 7-to-8 upgrade, Android API 24-to-36 range, and supported plugin versions. | Markdown matrix linked from the migration report. | Provides a repeatable path for future major upgrades. |
| P2 | Run browser persistence, import/export, audit verification, and negative-path tests repeatedly with isolated origins. | Browser evidence records that identify the adapter as non-native. | Improves confidence in application logic while preserving the native boundary. |
| P2 | Prepare sanitized device test scripts, synthetic data, expected hashes, and evidence templates. | Operator-ready test pack. | Makes later device testing faster and less error-prone. |
| P2 | Perform documentation and repository hygiene review on every published branch. | Documentation index, stale-reference scan, and secret-pattern scan. | Keeps informational records aligned with the actual release state. |

## Work that cannot be honestly completed without native execution

The following remain external evidence gates: opening a real SQLCipher database on Android, confirming Android Keystore security level and invalidation behavior, displaying and handling biometric prompts, proving background/process-death locking, exercising Android backup/device transfer, installing and upgrading over a prior encrypted build, validating native Bluetooth and other plugins, and producing a deployment-controlled signed artifact.

## Recommended execution order

First freeze the exact branch commit and rerun the clean automated gates. Next complete manifest/static security checks, SBOM and license review, production-path assertions, and a non-production signing rehearsal. Then finalize deterministic fixtures and the device operator pack. Only after those records are attached should native testing begin. A failed native test must be recorded as a release blocker rather than worked around by enabling plaintext storage, weakening backup rules, bypassing biometric authorization, or using an untracked signing path.

## Acceptance boundary

> Pre-device work can establish that the source, build, static policy, browser adapter, and evidence process are ready. It cannot establish that the Android application is safe for sensitive field deployment. That transition requires reproducible native runtime results from the approved device or virtualized-CI matrix.

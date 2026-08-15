# Release Assurance Controls

**Applies to:** `release/capacitor8-complete` and successor release branches.
**Purpose:** Provide repeatable, non-sensitive supply-chain, static-policy, and artifact-provenance evidence for the Android release workflow.

## Controls implemented

| Control | Implementation | Output | Boundary |
|---|---|---|---|
| Static release-policy check | `scripts/check_release_policy.sh` | CI log | Confirms source configuration; it does not execute Android hardware behavior. |
| UI quality gate | Locked installation, typecheck, Vitest coverage, production build, and production audit. | CI log and coverage output. | Browser tests are not native SQLCipher evidence. |
| Rust quality gate | Format, Clippy with warnings denied, and locked workspace tests. | CI log. | Does not replace platform-specific runtime validation. |
| Android build gate | Capacitor sync and API 36 debug/unsigned-release assembly. | Unsigned APK artifacts and mapping files. | Unsigned APKs are not deployable production artifacts. |
| Artifact provenance | `scripts/generate_release_metadata.sh` | `RELEASE_METADATA.txt` | Records commit, build time, available tool versions, and artifact SHA-256 hashes; never reads signing keys. |
| Signing rehearsal | `scripts/rehearse_release_signing.sh` with an externally supplied non-production properties file. | Local verification result only. | Never commits, prints, uploads, or retains properties or key material. |
| JavaScript license inventory | `scripts/generate_js_license_inventory.mjs` | `JS_LICENSE_INVENTORY.json` | Captures installed JavaScript package metadata; the SBOM remains the broader machine-readable component inventory. |
| Software bill of materials | Pinned Anchore SBOM Action produces CycloneDX JSON. | Workflow artifact named `stec-sbom-<commit>`. | Review generated content before external distribution. |
| Workflow dependency integrity | `scripts/check_workflow_action_pins.sh` requires every third-party action to use an immutable full commit SHA. | CI log. | Pinning reduces mutable-reference drift; Dependabot remains responsible for proposed updates. |
| Code scanning | Pinned CodeQL workflow scans JavaScript and TypeScript on pull requests, release/main pushes, weekly schedule, and manual dispatch. | GitHub code-scanning alerts. | Static analysis complements, but does not replace, threat modeling or independent assessment. |
| Review routing | `.github/CODEOWNERS` routes sensitive source, Android, transport, forensic, scripts, and workflow changes to the project owner. | Pull-request review request. | A repository ruleset or branch protection policy must require code-owner review for enforcement. |
| Sensitive-file hygiene | Static policy refuses tracked `release.properties`, keystores, APK/AAB artifacts, and local databases. | CI log. | Approved private evidence and signing systems remain external to GitHub. |

## Static policy assertions

The release-policy script fails if the native configuration stops requesting encrypted SQLite, if the native code no longer refuses a detected plaintext database, if native secret preparation is bypassed, if backup/data-extraction protections disappear, if cleartext traffic is re-enabled, if the release build becomes debuggable or unoptimized, or if prohibited sensitive artifacts are tracked by Git. The companion workflow-pin policy rejects mutable or malformed third-party GitHub Action references.

The script is deliberately narrow and source-specific. It checks the native application path, not the SQL.js browser adapter. This avoids treating browser demonstration storage as a substitute for sensitive Android field storage.

## Running controls locally

Run the repository policy check from the repository root:

```bash
bash scripts/check_release_policy.sh
```

Run it through the UI command from `ui/`:

```bash
npm run release:policy
```

After building Android artifacts, generate review metadata and the license inventory from the repository root:

```bash
bash scripts/generate_release_metadata.sh
node scripts/generate_js_license_inventory.mjs
```

The generated outputs are build artifacts and are ignored by Git. They should be uploaded by CI or retained in the approved release-evidence system, not committed to source control.

A deployment owner can rehearse the controlled signing path in an isolated checkout using an externally managed **non-production** signing configuration:

```bash
bash scripts/rehearse_release_signing.sh /absolute/path/to/non-production-release.properties
```

The script requires an absolute properties path, validates that the referenced store exists, creates only a temporary ignored `android/release.properties`, verifies the produced signed APK with `apksigner`, and removes the temporary properties file on exit. It must never be pointed at an unapproved or production signing configuration without the deployment owner’s normal key-management procedure.

## CI and review scope

The quality workflow runs for `main`, `upgrade/**`, and `release/**` pushes, pull requests targeting `main`, and manual dispatch. Dependency installation uses `npm ci --ignore-scripts`; only source-controlled project commands are then invoked explicitly. All third-party actions are pinned to immutable reviewed commits, and the SBOM action is pinned to the commit corresponding to the reviewed `v0.24.0` release.[1]

The CodeQL workflow performs JavaScript/TypeScript `security-extended` and `security-and-quality` analysis on `main` and release changes, pull requests to `main`, a weekly scheduled run, and manual dispatch. It has a job-specific `security-events: write` permission only for uploading analysis results.[2]

`.github/CODEOWNERS` supplies the repository-level review map. The deployment owner should configure a `main` branch ruleset to require a pull request, passing quality and CodeQL checks, and code-owner review before merging. This repository change intentionally does not alter remote branch enforcement or bypass policy.

> These controls improve repeatability and reduce accidental release-policy regression. They do not eliminate the need for owner-controlled signing, private native-test evidence, operational approval, or a governed production release decision.

## References

[1]: https://github.com/anchore/sbom-action/releases/tag/v0.24.0 "Anchore SBOM Action v0.24.0"
[2]: https://docs.github.com/code-security/code-scanning "GitHub Code Scanning documentation"

# Governed Review: PR #17

**Pull request:** [#17 — release: consolidate Capacitor 8, security hardening, and Arti 0.45](https://github.com/TangoSplicer/stec-monorepo/pull/17)

**Head reviewed:** `4c4fd10441c9ac22cd175b104476fc0380b80c2d`

**Base:** `main` at `4a33f3a75e2fceb96ef447fcf0d09b8f6681ab4c`
**Review posture:** Governed review only; no approval or merge performed.

## Executive conclusion

The pull request is **technically ready for owner review**. I found no high-severity blocker in the reviewed scope. The complete PR-triggered check set is green, the active `main` ruleset is enforcing the expected review and security gates, and the changed sensitive paths are covered by CODEOWNERS and static policy checks.

The pull request remains correctly blocked because it has no approving review. It should not be approved until the project owner has reviewed the sensitive native, cryptographic, release-automation, and dependency changes and accepts the two low-priority follow-up items below.

## Evidence reviewed

| Evidence | Result |
|---|---|
| Changed files | 44 files reviewed, including workflows, Android manifest/build files, Rust lockfile and transport code, cryptographic/browser tests, scripts, and release documentation. |
| Diff hygiene | `git diff --check` passed. No private keys, access tokens, APKs, databases, or release credentials were detected in added lines. |
| PR checks | 14 checks completed successfully; 0 failed and 0 remained pending. |
| Required gates | UI build/tests/audit, Rust formatting/Clippy/tests, static release policy, Android application/release build, Android ARM64 build, and CodeQL passed. |
| Governance | Active ruleset `STEC main governed protection`, ID `20911263`, applies to the default branch. |
| Review metadata | One external review submission from `sourcery-ai[bot]`, state `COMMENTED`; no owner approval exists. |
| Dependency alerts | GitHub reports eight alerts on the default branch, but detailed alert access is unavailable to this integration. No unverified blanket remediation was applied. |

## Active governance verified

The `main` ruleset requires a pull request, one approving review, CODEOWNERS approval for owned paths, stale-approval dismissal after new pushes, resolved review threads, and protection against deletion and force-push history rewrites. It requires these exact contexts, bound to the GitHub Actions integration ID 15368:

- `UI quality and production build`
- `Rust formatting, linting, and tests`
- `Static release policy`
- `Android application build and release checks`
- `Android ARM64 core build`
- `CodeQL JavaScript and TypeScript`

The check bindings were strengthened during this review from context-name-only matching to trusted GitHub Actions integration matching. The effective branch-rules endpoint confirmed the updated bindings.

## Findings

### F-01 — Resolved: normalize relative signing keystore paths

**Location:** `scripts/rehearse_release_signing.sh:30–31`

The signing rehearsal accepts an absolute properties-file path but evaluates `storeFile` relative to the caller’s current working directory. A valid relative keystore path can therefore fail when the rehearsal is invoked from a different directory. This does not weaken production security because the script fails closed and does not run automatically in CI, but it reduces operator reliability.

**Recommendation:** Resolve non-absolute `storeFile` values against the properties-file directory or document and enforce one stable base directory. Add a shell test for invocation from a different working directory before the signing rehearsal is used operationally.

**Disposition:** Resolved in the autonomous follow-up. Relative `storeFile` values are now normalized against the supplied properties-file directory; the controlled signing rehearsal still requires a separate operator run.

### F-02 — Resolved: correct historical baseline wording

**Location:** `upgrade-evidence/CAPACITOR7_BASELINE.md:128`

The sentence currently reads: `Captured after clean  on the upgrade branch.` It is missing a word and contains doubled spacing.

**Recommendation:** Change it to `Captured after clean runs on the upgrade branch.`

**Disposition:** Resolved in the autonomous follow-up. The historical sentence now reads `Captured after clean runs on the upgrade branch.`

### F-03 — Resolved: CodeQL does not push-scan `upgrade/**`

**Location:** `.github/workflows/codeql.yml:4–7`

CodeQL runs on pushes to `main` and `release/**`, pull requests targeting `main`, weekly schedule, and manual dispatch. It does not run automatically on pushes to `upgrade/**`. Pull requests targeting `main` are covered, and the current release PR is fully covered, so this is not a gap for PR #17.

**Recommendation:** Add `upgrade/**` to push triggers if upgrade branches are expected to be long-lived or independently consumed. This is optional because the full quality workflow already covers upgrade pushes and CodeQL covers the governed PR boundary.

**Disposition:** Resolved in the autonomous follow-up. CodeQL push triggers now include `upgrade/**`; pull requests to `main` remain covered as before.

### F-04 — Accepted design trade-off: static policy uses explicit text assertions

**Location:** `scripts/check_release_policy.sh` and `scripts/check_workflow_action_pins.sh`

The policy checks use explicit file paths and text/regular-expression assertions rather than full YAML/XML/Gradle parsers. This is intentionally simple and fails closed for the known sensitive invariants, but it can be sensitive to harmless formatting or refactoring.

**Disposition:** Accepted for this PR because the checks are source-controlled, rerun after Capacitor synchronization, and covered by green CI. A future structured-parser rewrite can reduce maintenance cost but is not required for merge.

## Autonomous follow-up

The autonomous follow-up corrected F-01 and F-02 and extended CodeQL push coverage to `upgrade/**`. These changes require a fresh PR validation cycle before approval.

## Approval conditions

Before approval, the project owner should review the PR diff and confirm that the owner-attested native/field validation record is acceptable for the project’s governance standard. The owner should review the resolved follow-up changes, review the eight default-branch Dependabot alerts through GitHub Security, and confirm the controlled release governance decisions.

Approval does not itself authorize production signing or distribution. Those remain separate owner-controlled release decisions requiring the documented signing rehearsal, artifact provenance, SBOM/license review, release tag, rollback owner, and distribution approval.

## Decision

**Recommendation: approve after owner review once the fresh validation cycle is green.** F-01, F-02, and F-03 are resolved. Do not merge or release automatically from this review. The active ruleset is functioning as intended by keeping PR #17 blocked until the required code-owner approval is supplied.

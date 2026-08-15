# Field-Production Approval Plan

**Prepared:** 15 August 2026
**Repository:** `TangoSplicer/stec-monorepo`
**Active branch:** `upgrade/capacitor-8` at `ce3bbc2ebcc2acd21815a12440f207745ac6f092`
**Decision:** **Not approved for field production.** The current source is a technically validated Capacitor 8/API 36 engineering release candidate. Native SQLCipher, Keystore, biometric, lifecycle, backup/transfer, plugin, upgrade-in-place, and controlled-signing evidence remains outstanding.

## 1. Current blocking position

The browser test adapter intentionally uses SQL.js and IndexedDB, while the native Android path is configured for SQLCipher encryption and protected secret storage. The browser path must not be mistaken for sensitive field deployment. Native encryption, key protection, and lifecycle behavior remain unproven until the Android application is executed on an approved device or stable virtualized-CI runtime.

The repository now contains a reproducible Capacitor 8 Android Gradle project targeting API 36, with static backup/cleartext restrictions and successful debug and unsigned release builds. These are build and static-policy results, not proof of on-device SQLCipher, Keystore, biometric, plugin, upgrade, backup, or signing behavior.

| Blocker | Present status | Approval impact |
|---|---|---|
| Database encryption at rest | Native SQLCipher configuration is present; runtime encrypted-open and raw-file inspection are not yet evidenced. | Blocking. |
| Database-key protection | Native protected-storage configuration is present; Keystore security level, invalidation, and recovery behavior are not yet evidenced. | Blocking. |
| Native Android wrapper | Capacitor 8/API 36 Gradle project is committed and builds successfully; installation and runtime evidence are pending. | Blocking. |
| Release signing | Unsigned release assembly is reproducible; deployment-controlled signing and provenance evidence are pending. | Blocking. |
| Real-device tests | No stable device or virtualized-CI runtime evidence exists. | Blocking. |
| Backup/data-extraction control | Manifest and data-extraction restrictions are configured and statically inspected; device transfer/restore behavior is untested. | Blocking. |
| Independent security and forensic assurance | Not performed. | Blocking for any sensitive or evidential deployment. |

> A green JavaScript or Rust build is necessary engineering evidence, but it cannot demonstrate Android keystore behavior, native SQLCipher encryption, signed-artifact integrity, device lifecycle behavior, or field-operational suitability.

## 2. Recommended encrypted local-storage architecture

The lowest-risk initial route is to **retain the installed `@capacitor-community/sqlite` plugin**, rather than combine an unrelated storage rewrite with a field-release schedule. The plugin documents native SQLCipher support, encrypted connection modes, secret-management operations, `isDatabaseEncrypted`, and transaction APIs.[1] Its configuration also documents Android encryption and biometric options.[1] This approach still requires a small project-owned native key-management bridge; plugin encryption alone is not sufficient key management.

The alternative is to migrate to a supported commercial Capacitor SQLite stack that documents SQLCipher and integration with secure preferences, but that is a procurement and platform-migration decision, not a shortcut to approval.[2] No transition should proceed without a compatibility prototype, licensing review, and Android migration test. Both alternatives must use a hardware-protected Android Keystore key and a proven data migration.

### 2.1 Required key hierarchy

| Layer | Required design | Acceptance evidence |
|---|---|---|
| Database key | Generate a unique, cryptographically random 256-bit SQLCipher passphrase per enrolled device. Do not derive it directly from an analyst password or store it in source, Preferences, localStorage, a log, or a recoverable plaintext file. | Unit test entropy/format; device test proves distinct installations have distinct passphrases. |
| Key-encryption key | Generate an AES-256 Android Keystore key with an app-specific alias. Require a secure device lock and set user-authentication requirements appropriate to the approved idle/session policy. Prefer StrongBox when available, but accept a TEE-backed key only if the approved threat model allows it. | Native test records `KeyInfo.getSecurityLevel()` and key authorizations for every supported model. |
| Wrapped secret | Use the Android Keystore key to wrap the SQLCipher passphrase with AES-GCM. Persist only the wrapped blob, nonce, metadata, and key-version in app-private storage. The unwrap operation must require the approved `BiometricPrompt` or device-credential path. | Native test proves that a stored blob cannot be used after deleting/invalidation of the keystore key. |
| Runtime handling | Unwrap the passphrase only immediately before opening SQLCipher. Keep it in the shortest-lived bridge boundary possible, clear JavaScript references on lock, logout, and background, and close the database before clearing the session. | Lifecycle test and static review show no secret logging, export, or long-lived persistence. |
| Recovery | Define an organisation-approved recovery design before field use. The default policy should be **no silent recovery**: a device reset or keystore invalidation requires controlled restoration from a separately encrypted, authorised backup. Do not create a hidden universal recovery password. | Signed recovery procedure, role approval, and restore-drill record. |

The Android Keystore keeps key material non-exportable and can restrict use to authenticated users; where available, it can bind the key to secure hardware.[3] Hardware backing is device- and algorithm-dependent, so the implementation must query and record `KeyInfo.getSecurityLevel()` rather than assume every handset has the same protection.[3] StrongBox offers stronger isolation but has functional and performance trade-offs; it should be a preferred capability, not an untested universal requirement.[3]

### 2.2 Required source and native changes

| Work item | Required change | Done when |
|---|---|---|
| Generate the native project | Run the Capacitor bootstrap in a controlled Android SDK/JDK environment, review generated files, then commit the Gradle wrapper, module build files, manifest, resource XML, and deterministic build configuration. | A clean checkout can run `npm ci`, `npm run build`, `npx cap sync android`, and Gradle assemble without hand-created files. |
| Enable SQLCipher | Set `androidIsEncryption: true` in the Capacitor SQLite configuration and open `crimegraph_db` in encrypted `secret` mode after the passphrase is available. Do not change only the configuration flag while retaining a plaintext connection mode. | A fresh install creates an encrypted database; `isDatabaseEncrypted` and SQLCipher integrity checks pass. |
| Add the key bridge | Add a minimal Kotlin Capacitor plugin for generate/wrap/unwrap/delete/inspect operations. It must create a non-exportable Keystore AES key, expose capability and error states, and never log key material. | Native unit/instrumentation tests cover generated, unavailable, invalidated, locked, and biometric-cancelled paths. |
| Bind database opening to session | Refactor `initDatabase()` so it cannot obtain a writable database before the key bridge has authorised and supplied the encrypted-connection secret. Close and discard the connection on logout, inactivity lock, app background, or biometric cancellation. | UI/instrumentation tests prove data access is denied while locked and resumed only after valid authentication. |
| Exclude backups | Configure `android:allowBackup="false"`, `android:fullBackupContent="false"`, and data-extraction rules excluding database, shared preferences, external, and root domains. The community-plugin Android documentation identifies these as required protective settings.[1] | Manifest/resource inspection and install/restore test prove no application database is included in backup or device transfer. |
| Harden release variant | Set `debuggable=false`, remove diagnostic logging and test endpoints, use R8/ProGuard rules validated for Capacitor/SQLite, set minimal permissions, and ensure WebView debugging is disabled in release. Android’s release guidance explicitly calls for a signed, optimized release build and disabling debug/logging paths.[4] | CI artifact inspection and signed-device test pass. |

### 2.3 Data migration: plaintext database to SQLCipher

No automatic migration should be attempted on field data until the recovery and rollback policy is approved. The migration must be transactionally controlled and audit-recorded.

| Stage | Required behavior | Failure behavior |
|---|---|---|
| Preflight | Confirm the app is unlocked, sufficient storage is available, the device has an approved Keystore security level, and a verified encrypted backup/export exists. Count cases, nodes, edges, notes, users, and audit entries; compute a canonical migration manifest. | Do not begin. Show an actionable reason and preserve the original data. |
| Quiesce | Block concurrent writes, close active case editing, and record a `MIGRATION_STARTED` event outside the source database if feasible. | Resume unchanged source database only. |
| Copy | Create a new encrypted database with the generated SQLCipher key. Copy schema/data inside explicit transactions, preserving identifiers and timestamps. Recreate indexes and run schema migrations. | Roll back encrypted target; retain source database; emit an error record. |
| Verify | Compare table counts and canonical manifest; validate package/audit integrity; run `PRAGMA foreign_key_check`; run the SQLCipher integrity check on the encrypted target. | Do not switch the active database. Retain both copies for controlled investigation. |
| Cutover | Atomically rename or switch a versioned database pointer only after all checks pass. Log `MIGRATION_VERIFIED` with the source/target manifest hash and migration version. | Reopen source database only after explicit operator acknowledgement. |
| Sanitise | After an approved retention window and successful recovery drill, securely delete plaintext database, WAL, SHM, journals, temporary exports, and unencrypted backups. File-system secure deletion is not sufficient as a sole control on flash storage; compensate with Android full-disk/file-based encryption, backup exclusion, and managed-device policy. | Escalate to the security owner; do not claim erasure without evidence. |

### 2.4 Explicit encryption acceptance tests

The following tests are mandatory and must be preserved with build hash, device model, Android release, patch level, and test timestamp.

| Test | Expected result |
|---|---|
| Fresh device provisioning | The database opens only in encrypted mode; `isDatabaseEncrypted` returns true; SQLCipher integrity check succeeds after authorized open. |
| Offline cold start | With airplane mode enabled, an authorized operator can unlock the local encrypted database and access only permitted cases. |
| Locked start | Without biometric/device-credential authorization, the app cannot query, export, or mutate the database. |
| Database-file inspection | A test-harness attempt to open/copy the raw database without the passphrase fails; the file does not expose a normal SQLite header or readable case strings. Perform only on non-production synthetic data. |
| Background/lock transition | On background and timeout, connection is closed and the runtime key reference is cleared; reopening requires approved authentication. |
| Biometric change/credential reset | Key invalidation, new biometric enrollment, lock-screen credential change, and device reset produce the documented recovery path without silently falling back to plaintext or an unsecured secret. |
| Backup/device transfer | Database, wrapped-secret data, and attachments are excluded from Android backup/transfer as designed. |
| Rotation | A controlled SQLCipher passphrase rotation succeeds, preserves data and audit-chain verification, and records the key version without logging secrets. |
| Restore | A separately encrypted, authorised backup restores to a newly enrolled device under the documented recovery policy; no uncontrolled bulk copy is accepted. |

## 3. Android wrapper and real-device validation

### 3.1 Bootstrap and build evidence

The Android native wrapper is now a versioned Capacitor 8 project targeting API 36. The release engineering owner must still lock the complete toolchain, controlled signing process, artifact provenance, and approved device evidence described below. A successful unsigned build is not a production release.

| Asset | Required decision/evidence |
|---|---|
| Toolchain | Pinned Node, Capacitor, JDK, Android Gradle Plugin, Gradle wrapper, compile SDK, target SDK, min SDK, NDK, and `cargo-ndk` versions. |
| Package identity | Final application ID, version-code policy, version-name policy, app label, icons, support contacts, privacy/security notices, and any required developer-verification record. |
| Signing | Release upload/signing keys held in an approved secret-management system; documented rotation and loss procedure; CI receives short-lived or protected signing access only. Android requires release packages to be signed.[4] |
| Manifest | Minimal permissions, disabled backup/data transfer, disabled debug in release, network security settings, exported-component review, and no test providers/components. |
| Release variant | Debug off, minification/resource shrinking configured and tested, WebView debugging disabled, observability scrubbed of secrets and case content. |
| Native artefacts | ARM64 build proof, dependency/license notices, SQLCipher export-regulation assessment, and source/binary SBOM. SQLCipher use carries export-control and notice obligations described by the plugin and SQLCipher documentation.[1] [2] |

Android’s release documentation recommends testing a signed release build under real-world conditions and, at a minimum, on both handset- and tablet-sized devices; it also identifies physical and virtual device testing via Firebase Test Lab as useful coverage.[4]

### 3.2 Minimum real-device matrix

The release manager must approve the exact supported-device policy. The following is a minimum technical matrix, not a claim that two devices establish field fitness.

| Dimension | Minimum coverage | Required evidence |
|---|---|---|
| Form factor | One managed handset and one managed tablet or large-screen device. | Screenshot/video-free test record, build hash, result, and tester. |
| Android versions | The selected minimum supported version, the fleet’s most common version, and the current target version. | Test-lab/device report and release sign-off. |
| OEM/security capability | At least one device exposing TEE-backed Keystore; test StrongBox if field policy requires or prefers it. Include a device lacking StrongBox to verify the approved fallback/rejection behavior. | Captured non-sensitive `KeyInfo` security-level result and policy outcome. |
| Authentication | Enrolled biometric, device credential only, biometric unavailable, cancelled prompt, biometric enrollment change, and lock-screen credential change. | Expected lock/unlock/recovery outcome for each state. |
| Connectivity | Offline/airplane mode, reconnect, captive/untrusted network, and no-network first start. | Case integrity and no unintended sync/telemetry result. |
| Lifecycle | Cold start, rotation, process death, low-storage warning, background/resume, screen lock, timeout, reboot, and app update. | Database remains encrypted, consistent, and correctly locked. |
| Data-path | Create/edit/archive case; add node/edge/note; validated export/import; altered package rejection; audit verification; backup/restore; authorised wipe. | Deterministic test cases with synthetic data and expected audit results. |
| Accessibility | Font scaling, TalkBack, external keyboard where relevant, dark/light conditions, focus order, error announcements, and destructive-action confirmations. | Accessibility review record and resolved defects. |

### 3.3 Release sequence and approval artefacts

| Gate | Owner | Required artefact | Decision rule |
|---|---|---|---|
| Threat model and data classification | Security owner and operational owner | Approved data-flow map, adversaries, residual risks, device policy, recovery model. | No cryptographic implementation starts without approved assumptions. |
| Native implementation review | Mobile lead and security reviewer | Reviewed Kotlin bridge, SQLCipher mode, manifest, backup rules, migration design, code/tests. | No release candidate if plaintext fallback or universal secret remains. |
| CI build | Release engineering | Immutable build log, dependency locks, SBOM, signed artifact hash, reproducible build notes. | Build fails on audit, lint, unit, native, or release-config failure. |
| Device validation | QA lead and security reviewer | Matrix results with device/OS/patch/build identifiers and defect disposition. | All security-critical and data-integrity cases pass. |
| Migration/restore drill | Data owner and QA lead | Synthetic migration report, manifest comparisons, encrypted-backup restore evidence, rollback result. | Zero unexplained count/hash differences; recovery procedure passes. |
| Independent assessment | Qualified independent tester | Mobile/native/cryptographic penetration report and remediation evidence. | No unresolved critical/high issues; residual medium findings formally accepted. |
| Field pilot | Operational owner | Limited cohort, managed devices, synthetic/non-sensitive data where possible, monitoring and rollback readiness. | Pilot exit criteria met before wider deployment. |
| Production approval | Accountable executive or designated authority | Signed release decision, operating procedures, support ownership, incident response, retention policy. | Approval is explicit, version-specific, and time-bounded. |

## 4. Priority and sequencing

The shortest credible path is not to enable `androidIsEncryption` alone. It is to complete the native wrapper, make the key hierarchy testable, migrate only synthetic test data first, and then establish device evidence.

| Priority | Work package | Exit criterion |
|---|---|---|
| P0 | Establish supported Android baseline and commit/reproducibly generate the Gradle project. | Signed debug build installs on a managed test device; Android CI actually runs. |
| P0 | Implement Keystore-wrapped SQLCipher key and remove `no-encryption`. | Fresh encrypted DB, locked-state denial, and backup exclusion tests pass. |
| P0 | Build and test a reversible, manifest-verified migration with synthetic fixtures. | Successful encrypted migration, rollback, and restore drill. |
| P0 | Build signed release candidate and execute security/device test matrix. | All mandatory functional and security scenarios pass on approved matrix. |
| P1 | Add SBOM, reproducible signing, app licensing/export notices, secure logging/telemetry policy, and release-artifact retention. | Reviewable release package is reproducible and traceable. |
| P1 | Obtain independent mobile/native/cryptographic testing and run controlled pilot. | Findings remediated or formally accepted by accountable owner. |
| P2 | Evidence-object model, independently anchored audit records, managed device attestation, controlled collaboration/sync, and higher-order graph analytics. | Each capability has its own threat model and validation plan. |

## 5. Approval criteria

Field production is permitted only when every P0 item is complete and supported by version-specific evidence, P1 items have an accountable dated plan or are completed according to the deployment owner’s risk policy, and the accountable authority accepts residual risk. The approval must name the exact source commit, Android package ID and version, signing certificate lineage, supported-device policy, encrypted-storage/key version, test matrix, backup/recovery procedure, data-retention policy, incident-response owner, and expiry/reassessment date.

No release may use the label “field production”, “forensic-grade”, “evidentially defensible”, or an equivalent assurance claim solely because the application runs on a device. Those claims require organisation-specific operational, legal, and validation evidence beyond this repository.

## References

[1]: https://github.com/capacitor-community/sqlite "Capacitor Community SQLite README and API overview"
[2]: https://capawesome.io/docs/sdks/capacitor/sqlite/ "Capawesome Capacitor SQLite documentation"
[3]: https://developer.android.com/privacy-and-security/keystore "Android Developers: Android Keystore system"
[4]: https://developer.android.com/studio/publish/preparing "Android Developers: Prepare your app for release"
[5]: https://source.android.com/docs/security/features/keystore "Android Open Source Project: Hardware-backed Keystore"

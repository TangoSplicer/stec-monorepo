# STEC Monorepo

STEC is an **offline-first investigative case-management and link-analysis workspace**. The repository currently combines a React/Capacitor operator interface with Rust components for forensic processing, secure transport experimentation, and daemon orchestration.

> **Operational status:** this repository is an engineering project, not a certified forensic system. Do not represent it as compliant with CJIS, ISO/IEC 17025, the UK Forensic Science Regulator Code, or any evidential standard until an authorised validation programme has produced the required evidence and the deployment has completed its own security assessment.

## Repository layout

| Path | Purpose |
|---|---|
| `ui/` | React, TypeScript, Vite, and Capacitor operator workspace. |
| `core/aletheia/` | Rust forensic-framework research and validation components. |
| `core/whispernet/` | Rust authenticated transport and anonymity-network components. |
| `core/crimegraph/` | Rust CrimeGraph integration crate. |
| `core/stec-daemon/` | Rust command-line orchestration service. |
| `android/` | Android project generated and synchronized by Capacitor. |

## Quick start

The user interface is the currently testable product surface. It requires Node.js 22 or newer. Native checks require a current stable Rust toolchain with the `rustfmt` and `clippy` components.

```bash
make install
make check
make build-ui
```

| Command | Purpose |
|---|---|
| `make install` | Install the exact locked UI dependency graph. |
| `make check` | Run UI unit tests and TypeScript checks. |
| `make build-ui` | Produce the optimized web bundle in `ui/dist/`. |
| `make test-core` | Run Rust workspace tests. |
| `make build-core` | Cross-compile the Rust workspace for Android ARM64; requires Android NDK and `cargo-ndk`. |
| `make sync-android` | Build the UI and synchronize it into the Android Capacitor project. |
| `make audit-ui` | Audit production UI dependencies. |

## Security model

The current UI hardening provides slow salted password verification, device biometric prompts where supported, authenticated AES-256-GCM case exports, versioned and schema-validated case packages, and locally chain-linked audit records. These controls reduce common integrity and credential risks; they do **not** make the full product a secure evidence system by themselves.

The following conditions remain mandatory before a field deployment involving sensitive personal or evidential information:

| Required control | Why it remains necessary |
|---|---|
| Native encrypted database backed by hardware-protected key material | Android uses the native SQLCipher `secret` path and platform-protected secret storage; real-device verification remains a release gate. |
| Independent mobile, cryptographic, and penetration testing | Repository tests cannot establish device, OS, or operational security. |
| Data-protection impact assessment, retention policy, and access governance | These controls are organisation- and jurisdiction-specific. |
| Forensic method validation and controlled release evidence | Engineering tests do not establish court admissibility or regulatory conformance. |
| Tested backups, restoration procedures, incident response, and support ownership | These are operational duties that cannot be replaced by source code. |

Read [PRODUCTION_READINESS_BASELINE.md](PRODUCTION_READINESS_BASELINE.md) for the initial assessment, [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md) before any release decision, and [TOOLKIT_INTEGRATION.md](TOOLKIT_INTEGRATION.md) for the safe relationship between this repository, `gitflow-TUI`, and `gitfleet`.

## Contributing and security reporting

Development and review practices are documented in [CONTRIBUTING.md](CONTRIBUTING.md). Please report potential vulnerabilities privately according to [SECURITY.md](SECURITY.md); do not publish exploit details in public issues.

## License

Unless a more specific file states otherwise, this repository is distributed under the GNU Affero General Public License v3.0. See [LICENSE](LICENSE).

# Security Policy

## Supported branches

Security fixes are prepared against the current `main` branch. Releases should identify the exact commit, application version, dependency lockfiles, and mobile build artefacts that were assessed.

## Reporting a vulnerability

Please **do not** file a public issue for a suspected vulnerability, exploit, credential exposure, data-integrity weakness, or security-sensitive design concern. Instead, contact the repository owner through the private contact channel configured for the project and include a concise description, affected path or build, reproduction steps, impact assessment, and any suggested mitigation.

If no private channel has been configured, open a minimal public issue requesting a private security contact **without publishing exploit details**. The maintainers should acknowledge receipt, establish a private channel, reproduce the report, assess affected deployments, prepare a fix and tests, coordinate disclosure timing, and publish an advisory after remediation.

## Scope and handling expectations

Reports are especially valuable for the following areas:

| Area | Examples |
|---|---|
| Local data protection | Credential storage, database encryption, key handling, export/import handling, and residual-data exposure. |
| Identity and access | Authentication bypass, role escalation, biometric handling, session behavior, and destructive actions. |
| Evidence integrity | Audit-log tampering, identifier collision, package verification bypass, and unvalidated import paths. |
| Native and network code | Cryptographic nonce/key reuse, transport authentication, parsing defects, denial of service, and unsafe platform bindings. |
| Delivery pipeline | Dependency compromise, CI privilege misuse, signing artefacts, generated binaries, and leaked secrets. |

Do not attempt to access data that you do not own, bypass real user controls, disrupt operational systems, or publish personal or sensitive information. Good-faith reports that respect these boundaries will be handled constructively.

## Release security requirements

No build should be presented as secure for sensitive operational use solely because its source compiles or its unit tests pass. The deployment owner remains responsible for device hardening, encrypted-at-rest storage, key management, independent security testing, data governance, mobile-store policy, incident response, and applicable legal or regulatory controls.

# Contributing to STEC

## Development principles

STEC processes potentially sensitive investigative information. Contributions must favour **correctness, explicit failure, testability, and traceability** over novelty or unsupported claims. Do not describe a feature as compliant, secure, court-admissible, or production-ready without the independent evidence required for that claim.

## Local setup

Install Node.js 22 or newer, a current stable Rust toolchain, and the Rust `rustfmt` and `clippy` components. Android cross-compilation additionally requires the Android NDK and `cargo-ndk`.

```bash
make install
make check
make test-core
```

| Change area | Required local checks |
|---|---|
| `ui/` TypeScript or React | `npm test`, `npm run typecheck`, and `npm run build` from `ui/`. |
| `ui/` dependencies | `npm audit --omit=dev` from `ui/`; explain any deliberate exception in the pull request. |
| `core/` Rust | `cargo fmt --all -- --check`, `cargo clippy --workspace --all-targets --locked -- -D warnings`, and `cargo test --workspace --all-targets --locked` from `core/`. |
| Android-specific native changes | `make build-core` in an Android-NDK configured environment. |
| Sensitive workflows | Add or update negative tests that demonstrate rejected malformed, unauthenticated, unauthorised, or tampered input. |

## Pull requests

Keep pull requests focused and describe the problem, design, test evidence, user-visible changes, migrations, data handling, security impact, and rollback procedure. Avoid committing build outputs, local databases, `.env` files, test credentials, private keys, signing material, or captured sensitive evidence. The repository ignores common generated files, but reviewers must still inspect every change.

## Database and package compatibility

Database changes must be forward-migratable without silent data deletion. Any breaking migration requires explicit release notes, data-backup instructions, an operator confirmation path, and a tested rollback or recovery plan. Case packages must preserve a version identifier, validate all untrusted fields before persistence, and retain their integrity-verification result in the audit log.

## Review expectations

At least one reviewer should evaluate correctness and tests. Changes affecting authentication, cryptography, database persistence, permissions, import/export, native bindings, or networking require an additional reviewer with relevant security knowledge and a documented threat-model update. Public pull-request discussion must not contain real personal, operational, or evidential data.

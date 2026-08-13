# Three-Tool Toolkit Integration

This document defines the relationship between the three independently maintained tools:

| Tool | Primary role | Safe default |
|---|---|---|
| `gitflow-TUI` | Interactive GitHub-oriented terminal workspace for issues, pull requests, CI runs, notifications, local files, and review workflows. | Read-only exploration until the operator explicitly invokes a mutating action. |
| `gitfleet` | Local multi-repository status, synchronization, and stale-branch maintenance tool. | Operate only inside an explicitly selected workspace; every repository mutation is visible in the result report. |
| `stec-monorepo` | Offline-first investigative case-management, link-analysis, authenticated transport, and Android delivery platform. | Treat as the sensitive-data system of record; do not expose its local evidence store or credentials to the Go tools. |

## Integration principle

The tools are **separate products**, not a single process and not a shared credential boundary. Their strongest package-level relationship is an operator workflow:

1. `gitfleet` inventories and synchronizes a workspace containing one or more repositories.
2. `gitflow-TUI` provides interactive GitHub and code-review operations for the selected repository.
3. `stec-monorepo` is built, tested, and released through its own locked UI, Rust, and Android gates.

A future automation layer may orchestrate these steps, but it must invoke each binary as a bounded subprocess with an explicit working directory, timeout, cancellation path, and captured exit status.

## Security rules

The tools must not share GitHub tokens through command-line arguments, files in a repository, environment snapshots, or generated logs. `gitflow-TUI` may use the authenticated `gh` client or a short-lived in-memory API token; `gitfleet` does not require GitHub API credentials and should never request them. The stec application’s database keys, case exports, biometric state, and audit material are never inputs to either Go tool.

Mutating operations require explicit operator intent. A package wrapper must not silently merge pull requests, close issues, pull changes, delete branches, wipe evidence, or alter a case database. Each operation should emit a structured result containing the repository path, action, start and finish time, exit status, and a redacted human-readable summary.

## Interoperability contract

The recommended future boundary is a small JSON-lines result protocol on standard output. Inputs should be passed through argv or a pipe, never through shell interpolation:

```json
{"tool":"gitfleet","repository":"/workspace/stec-monorepo","action":"status","success":true,"summary":"Clean"}
```

The contract is intentionally descriptive rather than a current runtime dependency. It permits a package orchestrator to compose the tools without coupling their internal Go, Rust, React, or Capacitor implementations.

## Release and trust boundary

The Go tools may inspect source trees and invoke Git commands. They are not trusted with sensitive case data. The Android/native stec path remains the only intended field-deployment path for sensitive local evidence because its encrypted-storage and platform-key controls must be validated on approved devices. Browser storage is a test and demonstration path, not a substitute for native field evidence.

# Security Development Practices

**Status:** Draft
**Milestone:** 9 — Engineering Foundation & Development Setup
**Date:** 2026-08-07

This document turns
[Security Architecture](../milestone-6-technical-architecture/04-security-architecture.md)
and
[Authentication & Authorization Architecture](../milestone-8-technology-stack-development-architecture/05-authentication-authorization-architecture.md)
into day-to-day engineering practice.

## Secure Coding Principles

- **Validate at every boundary.** Input is validated where it enters a
  module, not assumed clean because another layer already checked it —
  restated from
  [Coding Standards Framework](./05-coding-standards-framework.md)
  because it is a security practice first and a code-quality practice
  second.
- **Encode output, never trust it implicitly.** Anything reflecting user
  input back to a user or another system is treated as untrusted until
  encoded/escaped appropriately for its destination.
- **Least privilege in code, not just in RBAC.** A module requests only
  the data it needs from another module (per
  [Security Architecture §Least Privilege](../milestone-6-technical-architecture/04-security-architecture.md)) —
  this applies to internal module-to-module calls, not just Role
  Assignment scope.

## Secrets Management

- **No secret is ever committed to version control** — not in code, not
  in configuration files under `config/` (per
  [Repository Structure](./02-repository-structure.md)), not in test
  fixtures.
- Secrets are injected at runtime through environment-specific
  mechanisms, kept out of the repository entirely — the specific
  mechanism (a managed secrets service, environment variables through
  the hosting platform) is an implementation-time decision, deferred
  per [Technology Selection Principles](../milestone-8-technology-stack-development-architecture/01-technology-selection-principles.md)'s
  "managed services for operational concerns" rule.
- Local Development uses placeholder, non-functional credentials only,
  per
  [Development Environment Strategy](./03-development-environment-strategy.md).

## Dependency Management

- New dependencies are evaluated against
  [Technology Selection Principles](../milestone-8-technology-stack-development-architecture/01-technology-selection-principles.md)'s
  "avoid unnecessary complexity" rule before being added — a dependency
  is a security surface, not a free convenience.
- Dependencies are kept patched on an ongoing basis; automated
  vulnerability scanning of the dependency tree is a standard,
  continuous practice, not a periodic audit.
- A dependency vulnerability affecting a module touching sensitive data
  categories (per
  [Security Architecture](../milestone-6-technical-architecture/04-security-architecture.md))
  is treated with the same urgency as a first-party bug in that module.

## Authentication Protection

- Login attempts are rate-limited to resist brute-force attempts,
  consistent with the server-side session model in
  [Authentication & Authorization Architecture](../milestone-8-technology-stack-development-architecture/05-authentication-authorization-architecture.md).
- Credentials are never logged, in any environment, including Local
  Development and Development/Test.
- Session tokens are treated as sensitive data in transit and at rest,
  per
  [Security Architecture §Sensitive Data Handling](../milestone-6-technical-architecture/04-security-architecture.md).

## Authorization Testing

Restated as a firm practice, not just a testing-layer description
(fuller detail in
[Testing Strategy Implementation §Security Testing](./06-testing-strategy-implementation.md)):
every Role Assignment's boundaries are actively tested, on an ongoing
basis, against the
[Permission Framework](../milestone-2-user-roles-permission-architecture/02-permission-framework.md) —
authorization is treated as a property that must be continuously
verified, not a feature that's "done" once implemented.

## Audit Logging Expectations

- Every module emits an audit event for every Create, Edit, or Approve
  action it performs on a record of consequence, per the
  [Audit and Accountability Framework](../milestone-2-user-roles-permission-architecture/05-audit-accountability-framework.md) —
  this is a checked item in code review (per
  [Version Control & Development Workflow](./07-version-control-development-workflow.md)),
  not an optional addition.
- A feature that creates, edits, or approves a consequential record
  without a corresponding audit event is treated as incomplete, exactly
  like a missing test.

## Data Protection

- Sensitive data categories (per
  [Security Architecture §Sensitive Data Handling](../milestone-6-technical-architecture/04-security-architecture.md))
  are encrypted in transit and at rest, as a baseline engineering
  practice — the specific encryption mechanism is an implementation-time
  detail tied to the eventual database/hosting selection from
  [Milestone 8](../milestone-8-technology-stack-development-architecture/README.md).
- Data minimization is practiced by default: a module stores only the
  data it needs to fulfill its role in
  [Service Boundaries](../milestone-6-technical-architecture/03-service-boundaries.md),
  not data "in case it's useful later."

## Vulnerability Management

- Discovered vulnerabilities are triaged by the sensitivity of the data
  or capability affected — a vulnerability touching RBAC enforcement,
  Audit Logging, or the AI Safety & Scope Gate is treated as the highest
  priority category, mirroring
  [Engineering Philosophy §Quality Over Speed Balance](./01-engineering-philosophy.md).
- **⚠️ Needs Verification:** a formal, external vulnerability disclosure/
  reporting process is named as **Future** in
  [Security Architecture §Future Compliance Considerations](../milestone-6-technical-architecture/04-security-architecture.md);
  this document does not establish one, only confirms internal triage
  practice for vulnerabilities discovered by the team itself.

## Current / Planned / Future

| Element | Status |
|---|---|
| Secure coding principles (validation, encoding, least privilege) | **Current** — firm engineering practice |
| Secrets never committed to version control | **Current** — non-negotiable |
| Ongoing dependency vulnerability scanning | **Planned** |
| Rate-limited authentication | **Planned** |
| Continuous RBAC boundary testing | **Current** — restated from [Testing Strategy Implementation](./06-testing-strategy-implementation.md) |
| Audit logging as a required, reviewed part of every consequential-action feature | **Current** — non-negotiable |
| Encryption in transit and at rest | **Planned**, specific mechanism deferred to implementation |
| Formal external vulnerability disclosure process | **Future** |

## ⚠️ Needs Verification

- Formal external vulnerability disclosure/reporting process, named
  Future since Milestone 6.
- Specific encryption mechanisms depend on the database/hosting
  selections deferred in Milestone 8.

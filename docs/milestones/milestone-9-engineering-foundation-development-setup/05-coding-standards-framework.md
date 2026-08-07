# Coding Standards Framework

**Status:** Draft
**Milestone:** 9 — Engineering Foundation & Development Setup
**Date:** 2026-08-07

This document defines the standards Minara-LMS code is held to. It
states principles and, where useful, concrete recommended baselines —
not a language style guide, which is an implementation-time artifact
generated once the technology from Milestone 8 is actually set up.

## Naming Conventions

- **Domain-first naming.** Every name for an entity, function, or
  module should be recognizable against
  [Milestone 5](../milestone-5-domain-model-data-architecture/README.md)'s
  ubiquitous language — an `Enrollment`, a `TeachingAssignment`, an
  `Approval` in code should read the same as in the documentation, per
  [Engineering Philosophy](./01-engineering-philosophy.md).
- **No implementation leaking into domain names.** A name should
  describe what something *is* in the business, not how it's currently
  stored or transmitted (e.g., `Enrollment`, not `EnrollmentRow` or
  `EnrollmentDto`, inside domain logic).
- Consistent casing/formatting conventions follow from whichever
  specific language tooling is set up during real implementation — not
  specified here.

## Code Organization Philosophy

- **One module, one service boundary.** Every file lives inside exactly
  one of the thirteen `services/` folders (per
  [Repository Structure](./02-repository-structure.md)) or in `apps/`
  or `packages/` — never split across a boundary in a way that
  obscures ownership.
- **Business rules live where they're owned.** A rule from the
  [Business Rules Catalog](../milestone-5-domain-model-data-architecture/08-business-rules-catalog.md)
  is implemented inside the module that owns the entity it governs (per
  [Backend Architecture §Business Logic Organization](../milestone-8-technology-stack-development-architecture/03-backend-architecture.md)) —
  never duplicated across modules or pushed up into the Application/
  Orchestration Layer.

## Documentation Requirements

- Every non-obvious business rule implemented in code references the
  specific
  [Business Rules Catalog](../milestone-5-domain-model-data-architecture/08-business-rules-catalog.md)
  entry it implements, so a future reader can trace code back to
  documented intent without guessing.
- Every module's entry point documents which
  [Service Boundaries](../milestone-6-technical-architecture/03-service-boundaries.md)
  entity it owns and which Direct/Event-Driven interactions it
  participates in.
- Public-facing interfaces (what one module exposes to another) are
  documented at the point of definition — internal implementation detail
  is not.

## Error Handling Principles

- **Fail closed, per [Security Architecture](../milestone-6-technical-architecture/04-security-architecture.md).**
  An error in an authorization check, a business rule evaluation, or an
  AI Safety & Scope Gate classification is always treated as a denial or
  an escalation, never as a silent pass-through.
- **Errors of consequence are never swallowed silently.** An error
  affecting a record of academic, financial, or clinical consequence is
  surfaced — to the user where appropriate, and to the Audit Log
  regardless — never caught and discarded without a trace.
- **User-facing errors are distinct from system errors.** A Student
  seeing "your payment couldn't be processed" and an engineer seeing the
  underlying system fault are two different, deliberately separate
  outputs from the same failure.

## Security Practices

Detailed fully in
[Security Development Practices](./08-security-development-practices.md);
restated here as a coding-standard baseline:

- Input is validated at every module boundary, not assumed clean because
  "the frontend already checked it."
- Output shown to a user is never trusted input echoed back unvalidated.
- Every module honors least privilege — it requests only the data and
  permissions it actually needs from another module, per
  [Security Architecture §Least Privilege](../milestone-6-technical-architecture/04-security-architecture.md).

## Review Expectations

Detailed fully in
[Version Control & Development Workflow](./07-version-control-development-workflow.md);
restated here: every change is reviewed against these standards before
merge, with particular scrutiny on anything touching RBAC, the AI Safety
Gate, or an approval gate from the
[Business Rules Catalog](../milestone-5-domain-model-data-architecture/08-business-rules-catalog.md).

## Accessibility Standards

- **Recommended baseline: WCAG 2.1 Level AA**, as the widely-recognized
  industry standard consistent with
  [Guiding Principles §3](../milestone-1-product-vision-platform-strategy/03-guiding-principles.md)'s
  accessibility commitment. This is a working recommendation for this
  milestone, not a final institutional confirmation — see Needs
  Verification below.
- Enforced primarily through the shared UI component library (per
  [Frontend Architecture](../milestone-8-technology-stack-development-architecture/02-frontend-architecture.md)) —
  accessible primitives built once, reused everywhere, checked
  automatically per
  [Testing Strategy Implementation](./06-testing-strategy-implementation.md).

## Performance Expectations

- **Recommended working baseline:** pages should feel responsive to a
  user on a typical mobile connection, consistent with
  [Guiding Principles §4](../milestone-1-product-vision-platform-strategy/03-guiding-principles.md)'s
  mobile-first commitment — this document does not set a specific
  millisecond target, deliberately, since
  [Scalability & Reliability Framework §Performance](../milestone-6-technical-architecture/09-scalability-reliability-framework.md)
  already flagged concrete targets as an unresolved institutional
  decision.
- Read-heavy and write-heavy code paths are treated differently in
  review, per that same document's caching philosophy — a slow read on
  cacheable content is a different severity than a slow write on a
  grade submission.

## Current / Planned / Future

| Element | Status |
|---|---|
| Domain-first naming and code organization | **Current** — this milestone's standard |
| Error handling principles | **Current** |
| Security practice baseline | **Current** |
| WCAG 2.1 AA as the working accessibility baseline | **Planned**, final confirmation **⚠️ Needs Verification** |
| Concrete performance targets (specific numbers) | **Future**, pending institutional decision |
| Automated linting/formatting tooling enforcing these standards | **Future** — belongs to actual implementation setup |

## ⚠️ Needs Verification

- Whether WCAG 2.1 AA is the institution's actual accessibility target,
  or a different/higher standard is required — this document recommends
  AA as a reasonable, defensible industry baseline, not as a confirmed
  institutional requirement.
- Concrete performance targets remain unset, consistent with
  [Milestone 6](../milestone-6-technical-architecture/09-scalability-reliability-framework.md).

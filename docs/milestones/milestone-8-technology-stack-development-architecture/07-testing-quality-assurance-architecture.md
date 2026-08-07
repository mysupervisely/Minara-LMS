# Testing & Quality Assurance Architecture

**Status:** Draft
**Milestone:** 8 — Technology Stack & Development Architecture
**Date:** 2026-08-07

This document defines the testing philosophy for Minara-LMS —
what gets tested, at what level, and why — without naming specific
testing tools, which remains an implementation-time decision.

## Testing Philosophy

**Tests exist to protect the Business Rules Catalog and the Permission
Framework, first — everything else, second.** Given Minara-LMS handles
academic, financial, and clinical-adjacent records
([Security Architecture §Sensitive Data Handling](../milestone-6-technical-architecture/04-security-architecture.md)),
the highest-value tests are the ones verifying that a rule like "A
Program Director's approval authority is scoped to their own Program"
([Business Rules Catalog](../milestone-5-domain-model-data-architecture/08-business-rules-catalog.md))
actually holds — not just that the UI renders correctly.

Testing effort is prioritized in this order:

1. Business rules and RBAC/permission boundaries (highest stakes, per
   [Security Architecture](../milestone-6-technical-architecture/04-security-architecture.md))
2. Core workflow completion (per
   [Milestone 3](../milestone-3-student-journey-core-workflows/README.md) —
   a Student can actually complete a course, a Faculty Instructor can
   actually submit grades)
3. Everything else

## Unit Testing

- Scoped to individual modules from
  [Service Boundaries](../milestone-6-technical-architecture/03-service-boundaries.md) —
  each module's business rules (per the
  [Business Rules Catalog](../milestone-5-domain-model-data-architecture/08-business-rules-catalog.md))
  are unit-tested within that module, in isolation from the others.
- The **Modular Monolith**'s enforced module boundaries (per
  [Backend Architecture](./03-backend-architecture.md)) directly enable
  this: a module that doesn't reach into another module's internals can
  be unit-tested without standing up the whole platform.

## Integration Testing

- Verifies that modules interact correctly through the Direct and
  Event-Driven interaction styles defined in
  [Service Boundaries](../milestone-6-technical-architecture/03-service-boundaries.md) —
  e.g., that a "Grade Approved" event actually reaches Notifications and
  Certificates as designed.
- Verifies the centralized permission-enforcement component (per
  [Authentication & Authorization Architecture](./05-authentication-authorization-architecture.md))
  correctly blocks and allows access across realistic multi-module
  request paths.

## End-to-End Testing

- Verifies complete workflows from
  [Milestone 3](../milestone-3-student-journey-core-workflows/README.md)
  through the actual user interface — e.g., a full run of the
  [Certificate & Graduation Workflow](../milestone-3-student-journey-core-workflows/05-certificate-graduation-workflow.md)
  from Completion Verification through Certificate Issuance and Student
  notification.
- Prioritized according to
  [MVP Feature Prioritization](../milestone-7-mvp-definition-implementation-planning/04-mvp-feature-prioritization.md) —
  MUST HAVE workflows get end-to-end coverage before SHOULD/COULD HAVE
  ones.

## Content Testing

A category specific to an LMS: verifying that curriculum content
delivered from Minara-Curriculum (per the
[Academic Domain Model](../milestone-5-domain-model-data-architecture/02-academic-domain-model.md)'s
authored-by/operated-by split) actually renders and tracks correctly
once inside Minara-LMS — a Lesson's completion state updates correctly,
a Learning Object of a given type displays as intended, an Assessment's
Question Bank references resolve. This tests the **delivery** mechanism,
not the content's academic correctness, which remains Minara-Curriculum's
responsibility per
[Scope Boundaries](../milestone-1-product-vision-platform-strategy/09-scope-boundaries.md).

## Security Testing

- **RBAC boundary testing:** systematically verifying that every Role
  Assignment can do exactly what the
  [Permission Framework](../milestone-2-user-roles-permission-architecture/02-permission-framework.md)
  says it can — and nothing more. This is treated as a first-class,
  ongoing test category, not a one-time audit, because a permission
  regression (a Faculty Instructor gaining access to another section's
  grades, for example) is a serious failure mode for this platform
  specifically.
- **Audit Log integrity testing:** verifying the immutability guarantees
  from the
  [Audit and Accountability Framework](../milestone-2-user-roles-permission-architecture/05-audit-accountability-framework.md)
  actually hold — that no role, including Administrator, can edit or
  delete an entry.
- Independent security review (e.g., penetration testing) is named as a
  **Future** practice in
  [Security Architecture §Future Compliance Considerations](../milestone-6-technical-architecture/04-security-architecture.md);
  this document does not change that timing.

## Accessibility Testing

- Automated accessibility checks run against the shared component
  library (per
  [Frontend Architecture §Accessibility Considerations](./02-frontend-architecture.md)) —
  testing the primitives once catches most issues before they propagate
  to all seven portals.
- Manual accessibility testing supplements automated checks for
  interaction patterns automated tools can't fully verify (e.g., screen
  reader navigation through the Portal Switcher).
- Directly implements
  [Guiding Principles §3](../milestone-1-product-vision-platform-strategy/03-guiding-principles.md).

## AI Output Validation

Specific to the AI module (per
[AI Platform Architecture](../milestone-6-technical-architecture/06-ai-platform-architecture.md)),
and treated with the same seriousness as security testing given the
stakes:

- **Safety & Scope Gate testing:** adversarial testing to verify the
  Gate correctly classifies crisis/safety signals and academic-integrity
  concerns *before* any response generation — a gate that can be talked
  around is a gate that doesn't work.
- **Boundary testing for the governing principle:** explicit tests
  confirming the AI module cannot approve grades, approve graduation, or
  take any action that finalizes an academic or clinical outcome, per
  the
  [Business Rules Catalog](../milestone-5-domain-model-data-architecture/08-business-rules-catalog.md)'s
  AI & Human Oversight Rules — this is tested as a hard boundary, not a
  soft expectation.
- **Escalation path testing:** verifying that an escalation actually
  reaches a human, actionable, per the
  [AI Learning Assistant Workflow](../milestone-3-student-journey-core-workflows/06-ai-learning-assistant-workflow.md).
- Full AI output correctness (whether a given tutoring response is
  *pedagogically good*) is not something automated testing can fully
  cover — this is where the Human Review Queue (per
  [AI Platform Architecture](../milestone-6-technical-architecture/06-ai-platform-architecture.md))
  does ongoing, ordinary-operation-time work that testing alone cannot
  replace.

## Current / Planned / Future

| Element | Status |
|---|---|
| Testing priority order (rules/RBAC → workflows → everything else) | **Current** — this milestone's philosophy |
| Unit and integration testing aligned to module boundaries | **Planned** |
| End-to-end testing of MUST HAVE workflows | **Planned** |
| Content testing | **Planned** |
| RBAC boundary and Audit Log integrity testing | **Planned** — treated as ongoing, not one-time |
| Accessibility automated + manual testing | **Planned** |
| AI Safety Gate, boundary, and escalation testing | **Planned**, required before AI Tutor ships per [Implementation Phases](../milestone-7-mvp-definition-implementation-planning/05-implementation-phases.md) |
| Independent security review/penetration testing | **Future** |

## ⚠️ Needs Verification

- No specific testing tools or frameworks are named in this document by
  design — appropriate tool selection should follow from the frontend/
  backend technology choices in Docs 2–3, once those are confirmed.
- The exact cadence of ongoing RBAC/audit-integrity testing (continuous,
  per-release, periodic) is not yet defined.

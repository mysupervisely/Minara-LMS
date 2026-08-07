# Security Architecture

**Status:** Draft
**Milestone:** 6 — Technical Architecture & System Design
**Date:** 2026-08-07

This document translates
[Guiding Principles §2 (Security)](../milestone-1-product-vision-platform-strategy/03-guiding-principles.md)
and the [Permission Framework](../milestone-2-user-roles-permission-architecture/02-permission-framework.md)
into conceptual technical architecture: how authentication, authorization,
and data protection are meant to work as system behavior, not just
policy. As with the rest of this milestone, no specific authentication
protocol, identity provider, or encryption product is named here — those
are technology-selection decisions for later.

## Authentication

Authentication establishes **who** is interacting with the platform,
independent of what they're allowed to do (that's Authorization, below).

- Every interaction with the platform beyond the Public Website (see
  [System Architecture](./01-system-architecture.md)) requires a valid,
  established identity, resolved through the **Identity** service (see
  [Service Boundaries](./03-service-boundaries.md)).
- Authentication is conceptually separate from the **User** entity it
  authenticates (see
  [Platform Services Domain Model](../milestone-5-domain-model-data-architecture/06-platform-services-domain-model.md)) —
  a User can exist and be referenced by other records even when no
  active authentication session exists.
- **⚠️ Needs Verification:** whether the platform will support more than
  one authentication method per User (e.g., institutional single
  sign-on alongside direct login) is an open question already flagged in
  the [Platform Services Domain Model](../milestone-5-domain-model-data-architecture/06-platform-services-domain-model.md);
  this document does not resolve it, only notes that Authentication
  Identity was modeled to allow for it.

## Authorization & RBAC

Authorization determines **what an authenticated User may do**, and is
built entirely on the model already established in
[Milestone 2](../milestone-2-user-roles-permission-architecture/README.md) —
this document does not redefine it, only specifies where and how it is
technically enforced.

- **Enforcement point:** authorization checks happen at the Application
  / Orchestration Layer (see
  [System Architecture](./01-system-architecture.md)), before a request
  reaches a Domain Service — a Service should never need to independently
  re-derive whether the caller is allowed to act; it can trust that the
  layer above it already checked.
- **What's checked:** every check resolves to a Role Assignment's
  `(Role, Scope)` — per the
  [Multi-School and Multi-Program Access Model](../milestone-2-user-roles-permission-architecture/04-multi-school-multi-program-access-model.md) —
  against the View/Create/Edit/Approve action the request represents,
  per the [Permission Framework](../milestone-2-user-roles-permission-architecture/02-permission-framework.md).
- **Scope resolution is hierarchical**, exactly as defined in Milestone
  2: a Role Assignment scoped to a Program includes everything beneath
  it (Cohorts, Course Offerings) unless narrowed.

## Least Privilege

- A Role Assignment grants only the access defined for its Role at its
  Scope — never broader access "to be safe" or "for convenience."
- Where a person needs broader access than their current Role Assignment
  provides, the correct response is an **additional, explicit Role
  Assignment** (see
  [Faculty & Administration Domain Model](../milestone-5-domain-model-data-architecture/04-faculty-administration-domain-model.md)),
  not a broadening of an existing one.
- Default state for any new capability this architecture doesn't yet
  explicitly grant is **no access** — access is additive and explicit,
  never assumed.

## Audit Logging

This document does not redefine the
[Audit and Accountability Framework](../milestone-2-user-roles-permission-architecture/05-audit-accountability-framework.md);
it specifies that, architecturally, **Audit Logging is a cross-cutting
concern** (see [System Architecture](./01-system-architecture.md)),
implemented as the **Audit** service (see
[Service Boundaries](./03-service-boundaries.md)) subscribing to events
from every other service — so that no individual service can omit
logging one of its own consequential actions by oversight, and no
service (including a future Administration service) can suppress or
alter an entry after the fact.

## Session Management

- A session represents an authenticated User's active engagement with
  the platform and is distinct from the User's identity or any specific
  Role Assignment.
- Where a User holds multiple Role Assignments (see the
  [Global Navigation Framework §2](../milestone-4-information-architecture/01-global-navigation-framework.md)'s
  Portal Switcher), the session tracks which Role Assignment is
  currently active — authorization checks are always evaluated against
  the *active* Role Assignment, not the full set the User holds.
- **⚠️ Needs Verification:** concrete session lifetime, idle timeout, and
  re-authentication requirements for high-risk actions are not defined
  in this milestone — these are policy decisions with real security and
  usability trade-offs that should be set deliberately, not defaulted.

## Sensitive Data Handling

Not all data carries the same sensitivity, and the architecture should
treat it accordingly, even before specific technical safeguards
(encryption, masking, etc. — all explicitly implementation decisions) are
selected:

| Data Category | Examples | Handling Posture |
|---|---|---|
| Identity & Contact | User profile, contact information | Protected; visible per Role Assignment scope |
| Academic Records | Grades, Transcript, Academic Record | Protected; Student sees own, Faculty/Program Director see per scope |
| Financial | Payment, Invoice | Protected; narrower visibility than general academic data (see [Permission Framework](../milestone-2-user-roles-permission-architecture/02-permission-framework.md)) |
| Clinical/Externship | Placement, Evaluation, Hours Log | Protected; health-sciences-adjacent, warrants particular care given Minara's domain |
| AI Conversation | Student's AI Tutor interactions | Protected; governed additionally by the [AI Learning Assistant Workflow](../milestone-3-student-journey-core-workflows/06-ai-learning-assistant-workflow.md)'s human-review principles |
| Audit Log | Action/change history | Protected at the highest level — Administrator-only, per the [Permission Framework](../milestone-2-user-roles-permission-architecture/02-permission-framework.md) |

**⚠️ Needs Verification:** whether any data handled by Minara-LMS falls
under a specific regulatory framework (e.g., educational-record
protections, or health-information-adjacent obligations given the
clinical/externship context) has not been confirmed in this repository
and should be resolved with Minara-Master-Plan and legal counsel before
implementation — see Future Compliance Considerations below.

## Administrative Actions

Administrator Role Assignments carry institution-wide authority (see
[Role Hierarchy](../milestone-2-user-roles-permission-architecture/03-role-hierarchy.md)),
which makes them a higher-consequence target than most other roles.
Architecturally:

- Every Administrator action of consequence (role grants, certificate
  issuance, financial oversight actions) is Audit Logged exactly like
  any other role's actions — Administrator is never exempt from audit
  (per the [Audit and Accountability Framework](../milestone-2-user-roles-permission-architecture/05-audit-accountability-framework.md)).
- **⚠️ Needs Verification:** whether particularly high-risk
  Administrator actions (e.g., revoking another Administrator's access)
  should require additional confirmation (such as re-authentication or
  a second approver) is a real safeguard worth considering, but not yet
  decided.

## Future Compliance Considerations

Explicitly **Future**, not current scope:

- Formal mapping to educational-record protection frameworks relevant to
  Minara's jurisdiction(s).
- Formal mapping to any health-information-adjacent obligations relevant
  to the clinical/externship context.
- Accreditation-body-specific evidentiary requirements, once known (see
  [Guiding Principles §11](../milestone-1-product-vision-platform-strategy/03-guiding-principles.md)).
- Independent security review/penetration testing processes.
- Formal data residency or sovereignty requirements, should the platform
  ever expand beyond its initial jurisdiction.

## Current / Planned / Future

| Element | Status |
|---|---|
| Authentication as a foundational, session-establishing concern | **Current** |
| RBAC enforcement at the Application/Orchestration Layer | **Current** |
| Least-privilege, additive Role Assignment model | **Current** — direct expression of Milestone 2 |
| Audit Logging as a cross-cutting, event-subscribed service | **Current** |
| Session-tracked active Role Assignment for multi-role Users | **Planned** |
| Sensitive data category handling posture | **Planned** |
| High-risk action re-authentication safeguards | **Future**, pending the Needs Verification note above |
| Formal regulatory compliance mapping | **Future** |

## ⚠️ Needs Verification (Summary)

- Multiple authentication methods per User.
- Concrete session lifetime and re-authentication policy.
- Applicable regulatory frameworks (educational-record and
  health-information-adjacent).
- High-risk Administrator action safeguards.

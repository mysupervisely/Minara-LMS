# ADR-005: RBAC and Audit-First Security Model

**Status:** Draft (Proposed)
**Date:** 2026-08-07
**Source:** [Guiding Principles §6, §9](../../milestones/milestone-1-product-vision-platform-strategy/03-guiding-principles.md),
[Permission Framework](../../milestones/milestone-2-user-roles-permission-architecture/02-permission-framework.md),
[Audit and Accountability Framework](../../milestones/milestone-2-user-roles-permission-architecture/05-audit-accountability-framework.md)

## Context / Problem

Minara-LMS holds academic records, financial records, and
clinical-adjacent records for real students across multiple roles —
Student, Faculty, Program Director, Admissions Staff, Clinical
Coordinator, Employer Partner, and Administrator. Educational records of
this kind require controlled access (not everyone should see everything)
and defensible accountability (the institution must be able to show who
did what, when, for accreditation and dispute-resolution purposes).
Without a foundational decision, access control and audit logging risk
being treated as features added to specific screens as convenient,
rather than as properties the entire platform holds uniformly.

## Decision

**Role-Based Access Control (RBAC) and audit logging are foundational
platform capabilities, not optional features layered on top of
individual screens or modules.** Every one of the seven roles — Student,
Faculty Instructor, Program Director, Admissions Staff, Clinical
Coordinator, Employer Partner, and Administrator — operates strictly
within the `(Role, Scope)` model from the
[Multi-School and Multi-Program Access Model](../../milestones/milestone-2-user-roles-permission-architecture/04-multi-school-multi-program-access-model.md),
and every action of consequence any of them takes is captured in an
immutable Audit Log, per the
[Audit and Accountability Framework](../../milestones/milestone-2-user-roles-permission-architecture/05-audit-accountability-framework.md).

## Role Coverage

| Role | RBAC Scope | Audit Coverage |
|---|---|---|
| Student | Self | Own actions (submissions, payments, AI Tutor use) |
| Faculty Instructor | Section/Course Offering | Grading, feedback, communication |
| Program Director | Program | Approvals (grades, graduation, staffing proposals) |
| Admissions Staff | Institution/School | Application review, decisions |
| Clinical Coordinator | Program | Placement, evaluation, completion verification |
| Employer Partner | Own placement relationships | Evaluation submissions |
| Administrator | Institution-wide | Role assignments, certificate issuance, financial oversight — with no audit exemption |

## Rationale

- **Permissions and auditability are not optional features.** They are
  architected at the Application/Orchestration Layer (per
  [System Architecture](../../milestones/milestone-6-technical-architecture/01-system-architecture.md))
  as cross-cutting concerns every module passes through — a module
  cannot opt out of authorization checks or audit emission any more than
  it can opt out of using the shared domain model.
- **Least privilege is the default, not an exception.** Per
  [Security Architecture §Least Privilege](../../milestones/milestone-6-technical-architecture/04-security-architecture.md),
  a Role Assignment grants exactly what its Role and Scope define — no
  broader access "for convenience," and no role, including
  Administrator, is exempt from audit logging.
- **This is what makes accreditation defensibility possible.** Per
  [Guiding Principles §11](../../milestones/milestone-1-product-vision-platform-strategy/03-guiding-principles.md),
  the platform must eventually produce evidentiary records for
  accreditation review — that is only possible if audit logging was
  designed in from the start, not retrofitted once the need becomes
  urgent.

## Options Considered

| Option | Description | Why Not Chosen |
|---|---|---|
| **Per-screen access checks, added as needed** | Authorization logic implemented ad hoc wherever a screen needs it. | Produces inconsistent enforcement and gaps that are hard to find — exactly the "scattered checks" anti-pattern already rejected in [System Architecture](../../milestones/milestone-6-technical-architecture/01-system-architecture.md). |
| **Audit logging as an optional, later addition** | Build features first, add logging once compliance needs are concrete. | Retrofitting audit coverage after the fact is expensive and error-prone, and leaves the platform undefensible in the interim — unacceptable given the stakes described in [Security Architecture](../../milestones/milestone-6-technical-architecture/04-security-architecture.md). |
| **RBAC and Audit as foundational, cross-cutting capabilities** *(chosen)* | Every module inherits enforcement and logging from a shared, centralized mechanism. | Guarantees uniform coverage and matches [Guiding Principles §6, §9](../../milestones/milestone-1-product-vision-platform-strategy/03-guiding-principles.md), which named both as non-negotiable from the very first milestone. |

## Consequences

**Benefits:**
- Defensible institutional operation from day one — no retrofit risk.
- Consistent enforcement across all thirteen modules, since none can
  bypass the shared mechanism.
- A real foundation for future accreditation and compliance work,
  whenever those requirements become concrete.

**Tradeoffs:**
- Every feature requires permission-and-audit design *before* it ships,
  which adds development overhead compared to shipping access control
  as an afterthought — a deliberate tradeoff of short-term velocity for
  foundational safety, consistent with
  [Engineering Philosophy §Quality Over Speed Balance](../../milestones/milestone-9-engineering-foundation-development-setup/01-engineering-philosophy.md).

## Future Review Considerations

This decision should be revisited only if the underlying role model
itself (Milestone 2) changes substantially — the RBAC/audit-first
posture should remain fixed even as specific roles or scopes evolve.

## Current / Planned / Future

| Element | Status |
|---|---|
| RBAC as a cross-cutting, non-optional capability | **Current** |
| Audit logging as a cross-cutting, non-optional capability | **Current** |
| No role exemption from audit logging, including Administrator | **Current** |

## ⚠️ Needs Verification

- Concrete session/audit retention durations remain unresolved, carried
  forward from
  [Audit and Accountability Framework](../../milestones/milestone-2-user-roles-permission-architecture/05-audit-accountability-framework.md).

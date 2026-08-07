# Business Rules Catalog

**Status:** Draft
**Milestone:** 5 — Domain Model & Data Architecture
**Date:** 2026-08-07

This document catalogs the conceptual business rules that govern the
entities defined in
[02](./02-academic-domain-model.md)–[06](./06-platform-services-domain-model.md).
Each rule is a plain, declarative statement about how the business
operates — not a database constraint, validation function, or any other
implementation mechanism. Where a rule directly restates a principle
already established in an earlier milestone, it is cited rather than
re-argued.

## Academic Structure Rules

- An Institution has one or more Schools.
- A School belongs to exactly one Institution.
- A Program belongs to exactly one School.
- A Course belongs to exactly one Program.
- A Module belongs to exactly one Course.
- A Lesson belongs to exactly one Module.
- A Learning Object belongs to exactly one Lesson.
- A Question Bank may supply questions to more than one Assessment or
  Quiz, potentially across more than one Course.
- A Program defines exactly one Certificate.

## Student & Enrollment Rules

- A person becomes a Student only upon confirmed Enrollment; before
  that, they are an Applicant (see
  [Student Domain Model](./03-student-domain-model.md)).
- A Student may hold more than one Enrollment, across different
  Programs, concurrently or over time — the platform's "one account,
  multiple programs" principle (see
  [Platform Philosophy](../milestone-1-product-vision-platform-strategy/04-platform-philosophy.md)).
- A Student belongs to one or more Cohorts, one per active Enrollment.
- An Enrollment belongs to exactly one Program and exactly one Cohort.
- A Student's Grades belong to the Enrollment (and therefore the
  Program) under which they were earned, not to the Student generically.
- An Enrollment cannot progress to Active status while an unresolved
  payment hold blocks it (see
  [Student Lifecycle Workflow](../milestone-3-student-journey-core-workflows/01-student-lifecycle-workflow.md)).
- A Certificate (Student-held) can only be produced from an Enrollment
  that has reached Completed status with all Program requirements
  verified.

## Faculty & Staffing Rules

- A Faculty member may teach multiple Course Offerings, across multiple
  Programs and Schools.
- A Teaching Assignment links exactly one Faculty Role Assignment to
  exactly one Course Offering.
- A Faculty Instructor may enter Grades only for Students enrolled in a
  Course Offering they hold a Teaching Assignment for.
- Final Grades require approval by the Program Director of the Program
  the Course belongs to before they are considered final (see
  [Faculty Workflows §Approval Points](../milestone-3-student-journey-core-workflows/02-faculty-workflows.md)).
- A Program Director's approval authority is scoped to the Program(s)
  they hold a Role Assignment for; it does not extend to Programs
  outside that scope (see
  [Multi-School and Multi-Program Access Model](../milestone-2-user-roles-permission-architecture/04-multi-school-multi-program-access-model.md)).
- An Administrator's Role Assignment is institution-wide by default and
  can act across every School and Program.

## Clinical & Externship Rules

- An Employer may operate multiple Clinical Sites.
- An Employer may, indirectly through its Clinical Sites, host multiple
  Externship placements concurrently.
- A Student may not begin a Placement until Externship Eligibility has
  been confirmed for their Enrollment (see
  [Externship Management Workflow](../milestone-3-student-journey-core-workflows/04-externship-management-workflow.md)).
- A Placement fulfills exactly one Externship requirement, tied to
  exactly one Program.
- Completion Verification for a Placement requires joint confirmation
  from the Clinical Coordinator and the Program Director.
- Hours logged toward a Placement must be reviewed and approved by the
  Clinical Coordinator before counting toward completion.

## Certification & Graduation Rules

- Certificates require successful completion of all Program
  requirements — academic, and, where applicable, externship and
  financial (see
  [Certificate & Graduation Workflow](../milestone-3-student-journey-core-workflows/05-certificate-graduation-workflow.md)).
- A Certificate cannot be issued until the corresponding Program
  Director has approved the graduation review.
- Certificate issuance is performed by an Administrator, distinct from
  the Program Director's academic approval — preserving the separation
  between academic judgment and institutional recordkeeping established
  in [Role Hierarchy](../milestone-2-user-roles-permission-architecture/03-role-hierarchy.md).
- A Certificate Record, once issued, is never deleted; a correction
  produces a new record rather than erasing the old one, consistent with
  the [Audit and Accountability Framework](../milestone-2-user-roles-permission-architecture/05-audit-accountability-framework.md)'s
  immutability principle.

## AI & Human Oversight Rules

- The AI Learning Assistant may support learning but **may never
  approve grades, approve graduation, or take any action that finalizes
  an academic or clinical outcome** (see
  [Guiding Principles §10](../milestone-1-product-vision-platform-strategy/03-guiding-principles.md)).
- Any AI-influenced outcome affecting a Student's academic record must
  be reviewed and approved by a human Role Assignment before it takes
  effect.
- AI Conversations that signal crisis, safety, or a clinical-judgment
  concern with real patient-safety consequence must escalate to a human
  immediately, bypassing ordinary AI response generation (see
  [AI Learning Assistant Workflow](../milestone-3-student-journey-core-workflows/06-ai-learning-assistant-workflow.md)).
- Every AI Conversation is retained as a record; the AI itself is never
  the accountable party for an outcome — the reviewing human is.

## Financial Rules

- An Invoice belongs to exactly one Enrollment.
- A Payment is always applied against an Invoice.
- Financial clearance, where a Program requires it, is a distinct gate
  from academic completion and does not by itself indicate a Student
  has met academic requirements (see
  [Certificate & Graduation Workflow](../milestone-3-student-journey-core-workflows/05-certificate-graduation-workflow.md)).

## Audit & Accountability Rules

- Every Create, Edit, or Approve action on a record of consequence
  generates an Audit Log entry attributable to a specific Role
  Assignment.
- Audit Log entries are immutable and append-only; no Role Assignment,
  including Administrator, may edit or delete one.
- A Grade, once approved, may only be changed through a formal grade
  change/appeal process that itself generates a new Audit Log entry — it
  is never silently overwritten.

## Multi-School / Multi-Program Rules

- A Role Assignment's authority is bounded by its Scope; a Role
  Assignment scoped to one Program does not grant authority over
  another Program, even for the same Role.
- A person may hold multiple Role Assignments simultaneously, each with
  an independent Role and Scope.
- A Student's own-record access (Scope = Self) always spans every
  Enrollment they hold, regardless of Program or School.

## Current / Planned / Future

| Rule Group | Status |
|---|---|
| Academic Structure Rules | **Current** — direct expression of the [Academic Domain Model](./02-academic-domain-model.md) |
| Student & Enrollment Rules | **Current** |
| Faculty & Staffing Rules | **Current** |
| Clinical & Externship Rules | **Planned** |
| Certification & Graduation Rules | **Planned** |
| AI & Human Oversight Rules | **Current** — direct expression of an already-approved Milestone 1 principle |
| Financial Rules | **Planned**; exception-handling detail **Future** |
| Audit & Accountability Rules | **Current** |
| Multi-School / Multi-Program Rules | **Current** |

## ⚠️ Needs Verification

- Whether any exception process exists for the "unresolved payment hold
  blocks Active Enrollment" rule (e.g., institutional financial aid,
  payment plan approval) is not yet defined.
- Whether Certificate Record revocation (an "exceptional case," per the
  [Platform Services Domain Model](./06-platform-services-domain-model.md))
  has a defined business process, or is purely a theoretical state at
  this stage.
- Every rule here inherits the Needs Verification status of the entity
  or workflow it derives from; see the cited source documents for
  specifics not repeated here.

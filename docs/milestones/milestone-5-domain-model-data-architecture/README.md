# Milestone 5 — Domain Model & Data Architecture

**Status:** Draft
**Phase:** Phase 1 — Product Architecture
**Date:** 2026-08-07
**Scope:** Documentation only. No SQL, ORM schemas, database engines,
APIs, frameworks, or vendors are introduced in this milestone.

## Purpose

Milestones 1–4 established why Minara-LMS exists, who uses it, how it
operates, and where each interaction lives on screen. Milestone 5
defines **the language underneath all of it**: the conceptual entities,
relationships, and business rules that every workflow in
[Milestone 3](../milestone-3-student-journey-core-workflows/README.md)
and every screen in
[Milestone 4](../milestone-4-information-architecture/README.md)
actually operates on.

This is a **domain model**, not a database design. It defines what a
"Course" *is*, conceptually, what it relates to, who is responsible for
it, and what states it moves through — not what table it lives in, what
columns it has, or what database engine stores it. Every future database
table, API endpoint, service, and user interface should ultimately trace
back to a concept defined here, the same way Milestone 4's screens trace
back to Milestone 3's workflow steps.

## Documents in This Milestone

| # | Document | Summary |
|---|---|---|
| 1 | [Domain-Driven Design Principles](./01-domain-driven-design-principles.md) | Why a domain model, the platform's ubiquitous language, and its bounded-context philosophy |
| 2 | [Academic Domain Model](./02-academic-domain-model.md) | Institution, School, Program, Cohort, Course, Module, Lesson, Learning Object, Assessment, Assignment, Quiz, Question Bank, Competency, Learning Outcome, Certificate |
| 3 | [Student Domain Model](./03-student-domain-model.md) | Applicant, Student, Enrollment, Academic Record, Course Progress, Attendance, Grades, Transcript, Certificate, Student Support, Learning Analytics |
| 4 | [Faculty & Administration Domain Model](./04-faculty-administration-domain-model.md) | Faculty, Program Director, Admissions Staff, Clinical Coordinator, Employer Partner, Administrator, Teaching Assignment, Approval, Review, Communication, Reporting |
| 5 | [Clinical & Externship Domain Model](./05-clinical-externship-domain-model.md) | Clinical Site, Employer, Preceptor, Placement, Externship, Hours Log, Midpoint/Final Evaluation, Completion Verification, Site Agreement |
| 6 | [Platform Services Domain Model](./06-platform-services-domain-model.md) | User, Authentication Identity, Role, Permission, Notification, Announcement, Message, Calendar Event, Task, File, Audit Log, AI Conversation, AI Recommendation, Payment, Invoice, Receipt, Certificate Record |
| 7 | [Domain Relationship Catalog](./07-domain-relationship-catalog.md) | Master catalog of entity relationships across all five domain models, with Mermaid diagrams |
| 8 | [Business Rules Catalog](./08-business-rules-catalog.md) | Conceptual business rules governing the domain — no implementation detail |
| 9 | [Future Data Architecture Considerations](./09-future-data-architecture-considerations.md) | Scalability, versioning, multi-campus, future program types — explicitly Future, not current scope |

## Relationship to Milestones 1–4

This milestone assumes and cross-references, rather than repeats:

- **Roles** ([Milestone 2](../milestone-2-user-roles-permission-architecture/README.md))
  become domain entities in
  [Faculty & Administration](./04-faculty-administration-domain-model.md) —
  a role assignment is the domain-level record of "who may act as what,
  where," not a re-derivation of the Permission Framework.
- **Workflows** ([Milestone 3](../milestone-3-student-journey-core-workflows/README.md))
  are what move entities through their lifecycles. This milestone
  defines the *states* an Enrollment or a Placement can be in; Milestone
  3 already defines *what causes* those state changes and who approves
  them.
- **Screens** ([Milestone 4](../milestone-4-information-architecture/README.md))
  are where a user views or acts on these entities. This milestone does
  not re-list screens; it defines what each screen is ultimately backed
  by, conceptually.
- **Scope Boundaries** ([Milestone 1](../milestone-1-product-vision-platform-strategy/09-scope-boundaries.md))
  — the distinction between Minara-Curriculum (authors academic content)
  and Minara-LMS (delivers it) has direct consequences for this
  milestone's Academic Domain Model and is addressed explicitly there,
  not assumed away.

## Documentation Conventions for This Milestone

- Entities are documented with **Purpose**, **Key Relationships**,
  **Ownership** (which bounded context — or which repository —
  authoritatively owns the concept), and **Lifecycle** (the states the
  entity moves through), consistent with the Domain-Driven Design
  principles established in Document 1.
- **Mermaid diagrams** in this milestone represent conceptual
  relationships between business entities — cardinality and meaning, not
  database structure. They are deliberately not written as
  database-engine-flavored ER diagrams, consistent with this milestone's
  "no ERDs tied to a database engine" instruction.
- **Status labels** and **Current/Planned/Future** tables follow the
  same convention established in
  [docs/README.md](../../README.md).

## What This Milestone Does Not Do

Per its instructions, this milestone does not:

- Write SQL, Prisma models, or any ORM schema
- Design APIs, REST/GraphQL contracts, or endpoints
- Select a database engine, cloud provider, or any vendor
- Write production or example code
- Produce database-engine-specific ER diagrams

## Approval

This milestone is **Draft** pending stakeholder review. Milestone 6 will
not begin until Milestone 5 is reviewed and approved.

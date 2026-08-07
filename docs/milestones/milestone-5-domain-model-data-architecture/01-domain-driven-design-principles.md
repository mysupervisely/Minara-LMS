# Domain-Driven Design Principles

**Status:** Draft
**Milestone:** 5 — Domain Model & Data Architecture
**Date:** 2026-08-07

This document establishes the thinking that governs every other document
in Milestone 5: why Minara-LMS needs an explicit domain model, how the
platform's concepts are named and organized, and how the model
deliberately avoids collapsing into implementation detail before
implementation decisions are ready to be made.

## Purpose of the Domain Model

A domain model exists to answer one question consistently, everywhere:
**what is this thing, really?** Not what table it's stored in, not what
field type holds its identifier — what it *means* in the business of
running Minara's schools and programs.

Without an explicit domain model, the same real-world concept
("enrollment," "grade," "placement") tends to be understood slightly
differently by whoever last touched it — a screen, a workflow step, a
future database table — and those small drifts compound into
inconsistency that is expensive to unwind once code exists. This
milestone exists to fix the meaning of each core concept once, in
public, before any of that code is written, so that Milestones 6+
(technical architecture) have a single, agreed-upon vocabulary to build
from.

## Common Language (Ubiquitous Language)

Every entity defined in this milestone ([02](./02-academic-domain-model.md)–[06](./06-platform-services-domain-model.md))
is intended to be the **one name** used for that concept everywhere in
the project going forward — in conversation with stakeholders, in
Milestone 3 workflow documents, in Milestone 4 screen names, and
eventually in code and data structures. This is the practice Eric
Evans's *Domain-Driven Design* calls **ubiquitous language**: the
business and the system should use the same words for the same things,
so that translation errors between "what the institution means" and
"what the platform does" stop happening.

Concretely, this means:

- A "Cohort" in this milestone is the same Cohort referenced in
  [Role Hierarchy](../milestone-2-user-roles-permission-architecture/03-role-hierarchy.md)
  and [Cohort Assignment](../milestone-3-student-journey-core-workflows/01-student-lifecycle-workflow.md) —
  not a new, competing definition.
- Where a Milestone 3 workflow step and a Milestone 5 entity lifecycle
  state appear to describe the same moment (e.g., "Enrollment" the
  workflow step vs. "Enrollment" the entity), they are treated as two
  views of one concept, and this milestone says so explicitly rather
  than silently introducing a near-duplicate term.
- Where this milestone must introduce a genuinely new term not used in
  Milestones 1–4 (e.g., "Preceptor" in the
  [Clinical & Externship Domain Model](./05-clinical-externship-domain-model.md)),
  it says so and explains why the existing vocabulary wasn't sufficient.

## Bounded Context Philosophy

A single, flat glossary of every entity in the platform would eventually
become unmanageable — "Assignment" means something different to a
Faculty Instructor grading coursework than "assignment" does to an
Administrator assigning a role. Domain-Driven Design's answer to this is
the **bounded context**: a boundary within which a term has one
unambiguous meaning, even if the same word means something else in a
neighboring boundary.

This milestone organizes Minara-LMS's domain into five bounded contexts,
each documented separately:

| Bounded Context | Document | Owns Concepts Like |
|---|---|---|
| **Academic** | [02](./02-academic-domain-model.md) | Institution, School, Program, Course, curriculum structure |
| **Student** | [03](./03-student-domain-model.md) | Applicant, Student, Enrollment, academic progress and records |
| **Faculty & Administration** | [04](./04-faculty-administration-domain-model.md) | Staff roles, teaching assignments, approvals, reviews |
| **Clinical & Externship** | [05](./05-clinical-externship-domain-model.md) | Sites, placements, hours, evaluations |
| **Platform Services** | [06](./06-platform-services-domain-model.md) | Identity, permissions, communication, records that support every other context |

**These are conceptual boundaries, not a commitment to five separate
software services.** Nothing in this milestone implies microservices,
separate databases, or any particular technical decomposition — that
would be an implementation choice explicitly out of scope here, per
[Scope Boundaries](../milestone-1-product-vision-platform-strategy/09-scope-boundaries.md)
and this milestone's own instructions. The boundaries exist so that this
documentation — and, eventually, the people and systems built from it —
know which context is the authoritative source of truth for a given
term.

### A Shared Kernel: Identity

One concept is deliberately **not** owned by any single bounded context:
a person's underlying identity. Per
[Platform Philosophy](../milestone-1-product-vision-platform-strategy/04-platform-philosophy.md)'s
"one account, one profile, multiple programs" principle, the **User**
entity (defined in the
[Platform Services Domain Model](./06-platform-services-domain-model.md))
is a **shared kernel** — a small, deliberately minimal concept that every
other bounded context references but does not redefine. A Student, a
Faculty Instructor, and an Employer Partner contact are all, at the
identity level, a User; what makes them a Student or a Faculty Instructor
is a role-scoped relationship documented in their respective bounded
context, not a different kind of underlying account.

## Separation of Business Concepts from Implementation

Every document in this milestone deliberately stops at the boundary
where a business concept would otherwise turn into a technical
decision. In practice, that means:

- Entities are described by what they **mean** and what they **relate
  to**, not by field names, data types, or storage structure.
- Relationships are described by their **business cardinality** ("a
  Program has many Cohorts") without specifying how that would be
  enforced or represented in any particular database technology.
- **Lifecycle** describes the states a business concept can meaningfully
  be in (e.g., an Enrollment can be Pending, Active, or Withdrawn) — not
  a state machine implementation, event schema, or workflow engine.
- Where a term could be read as implying a technology (e.g.,
  "Question Bank" might suggest a specific storage pattern), this
  milestone treats it strictly as a business concept: a named
  collection of reusable assessment questions, however it eventually
  gets built.

This separation is what makes the domain model durable: implementation
technology can change without invalidating the model, because the model
never depended on that technology in the first place.

## Relationship to Previous Milestones

| Milestone | What It Defined | What Milestone 5 Adds |
|---|---|---|
| [1 — Product Vision & Platform Strategy](../milestone-1-product-vision-platform-strategy/README.md) | Why the platform exists; scope boundaries with Minara-Master-Plan and Minara-Curriculum | This milestone's Ownership fields operationalize those scope boundaries at the level of individual entities |
| [2 — User Roles & Permission Architecture](../milestone-2-user-roles-permission-architecture/README.md) | Who can do what | This milestone gives the roles, and the Role Assignment concept, a formal place in the domain model ([04](./04-faculty-administration-domain-model.md), [06](./06-platform-services-domain-model.md)) |
| [3 — Student Journey & Core Platform Workflows](../milestone-3-student-journey-core-workflows/README.md) | How the platform operates, step by step | This milestone defines the entities and lifecycle states those workflow steps actually move |
| [4 — Information Architecture & User Experience](../milestone-4-information-architecture/README.md) | Where each interaction lives on screen | This milestone defines what each screen is conceptually backed by |

## Current / Planned / Future

| Element | Status |
|---|---|
| Five bounded contexts as organizing structure for this milestone's documentation | **Current** |
| Ubiquitous language alignment with Milestones 1–4 | **Current** |
| Shared-kernel identity concept | **Current** (conceptual); its concrete shape is detailed in [06](./06-platform-services-domain-model.md) |
| Formal mapping of bounded contexts to technical service boundaries | **Future** — explicitly deferred to a technical architecture milestone |
| Context-mapping patterns beyond shared kernel (e.g., anti-corruption layers between Minara-LMS and Minara-Curriculum) | **Future** |

## ⚠️ Needs Verification

- Whether five bounded contexts is the right long-term granularity, or
  whether (for example) Clinical & Externship should eventually merge
  into or split further from Student, is a judgment call made for this
  milestone's documentation purposes and should be revisited once a
  technical architecture milestone considers service boundaries.
- The "shared kernel" pattern for identity assumes a single, unified
  User concept is desirable platform-wide; this is consistent with
  [Platform Philosophy](../milestone-1-product-vision-platform-strategy/04-platform-philosophy.md)
  but has not been independently re-confirmed with stakeholders in this
  milestone.

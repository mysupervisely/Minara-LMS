# ADR-004: Domain-Driven Module Boundaries

**Status:** Draft (Proposed)
**Date:** 2026-08-07
**Source:** [Domain-Driven Design Principles](../../milestones/milestone-5-domain-model-data-architecture/01-domain-driven-design-principles.md),
[Service Boundaries](../../milestones/milestone-6-technical-architecture/03-service-boundaries.md)

## Context / Problem

Software modules can be organized around many different lines: technical
layers (all database code together, all UI code together), team
structure, or the business domain itself. Without a deliberate choice,
module boundaries tend to drift toward whatever is convenient at
implementation time — which produces a codebase that's hard for anyone
who understands the *business* of running Minara-LMS to reason about,
even if it's technically coherent.

## Options Considered

| Option | Description |
|---|---|
| **Technical-layer organization** | Modules organized by technical concern (e.g., "all data access," "all validation logic"). |
| **Team-structure organization** | Modules organized around whichever team happens to own them. |
| **Domain-driven organization** *(chosen)* | Modules organized around business/educational domain boundaries, independent of technology or team. |

## Decision

**Software modules align with educational/business domains, not
technical convenience or team structure.** The thirteen modules from
[Service Boundaries](../../milestones/milestone-6-technical-architecture/03-service-boundaries.md) —
Admissions, Identity, Learning, Assessments, Gradebook, Payments,
Messaging, Notifications, Certificates, Externships, Analytics, AI, and
Audit — are the direct implementation of the five bounded contexts
established in
[Milestone 5](../../milestones/milestone-5-domain-model-data-architecture/README.md)
(Academic, Student, Faculty & Administration, Clinical & Externship,
Platform Services).

## Relationship to Milestone 5 Bounded Contexts

| Milestone 5 Bounded Context | Corresponding Service Boundaries Modules |
|---|---|
| Academic | Learning (absorbs Institution/School/Program/Cohort structure, per the ownership note in [Service Boundaries](../../milestones/milestone-6-technical-architecture/03-service-boundaries.md)) |
| Student | Admissions (Applicant), and student-facing data spread across Learning, Assessments, Gradebook |
| Faculty & Administration | Identity (Role Assignments), Gradebook (Approval) |
| Clinical & Externship | Externships |
| Platform Services | Payments, Messaging, Notifications, Certificates, Analytics, AI, Audit |

## Why Business Language Should Drive Architecture

- **It preserves the ubiquitous language.** Per
  [Domain-Driven Design Principles](../../milestones/milestone-5-domain-model-data-architecture/01-domain-driven-design-principles.md),
  every entity and rule in this project uses one consistent name
  everywhere — in conversation with stakeholders, in workflow documents,
  and eventually in code. Technical-layer or team-based organization has
  no reason to preserve that; domain-driven organization does, by
  construction.
- **It keeps the architecture legible to non-engineers.** A Program
  Director, an accreditation reviewer, or a new Administrator can look
  at the module list — Admissions, Learning, Gradebook, Externships,
  Certificates — and understand what the platform is made of without
  any technical translation. That legibility is a real asset for an
  institution whose stakes include accreditation defensibility (per
  [Guiding Principles §11](../../milestones/milestone-1-product-vision-platform-strategy/03-guiding-principles.md)).
- **It's what makes the Modular Monolith (see [ADR-001](./ADR-001-modular-monolith-architecture.md))
  safe.** A module boundary drawn along business meaning stays correct
  even as implementation details change; a module boundary drawn along
  technical convenience has no reason to survive a refactor. This
  decision is the reason ADR-001's "boundaries can be trusted" claim is
  actually true.
- **It matches how the business itself changes.** When Minara adds a new
  program requirement or Prepped product, that change naturally lands
  inside one or two existing modules (per
  [Prepped Ecosystem Architecture](../../milestones/milestone-8-technology-stack-development-architecture/10-prepped-ecosystem-architecture.md)) —
  a technical-layer organization would scatter that same change across
  every layer instead.

## Consequences

**Benefits:**
- Code readability and long-term maintainability, per
  [Technology Selection Principles](../../milestones/milestone-8-technology-stack-development-architecture/01-technology-selection-principles.md).
- A codebase stakeholders can partially understand without engineering
  background — a real, if secondary, benefit for an institution this
  documentation-driven.
- Direct support for the Modular Monolith's future-extraction path (per
  [ADR-001](./ADR-001-modular-monolith-architecture.md)).

**Tradeoffs:**
- Requires every engineer to genuinely understand the domain model (per
  [Milestone 5](../../milestones/milestone-5-domain-model-data-architecture/README.md)),
  a higher upfront learning cost than organizing around familiar
  technical patterns.
- Requires ongoing discipline in code review (per
  [Version Control & Development Workflow](../../milestones/milestone-9-engineering-foundation-development-setup/07-version-control-development-workflow.md))
  to prevent boundaries from eroding under schedule pressure — a
  business-driven boundary doesn't enforce itself any more than a
  technical one would.

## Future Review Considerations

This decision should be revisited only if the underlying domain model
itself (Milestone 5) is substantially revised — module boundaries should
follow the domain model's evolution, not diverge from it.

## Current / Planned / Future

| Element | Status |
|---|---|
| Domain-driven module organization | **Current** |
| Thirteen modules mapped to the five bounded contexts | **Current** |

## ⚠️ Needs Verification

- None beyond what is already carried forward in
  [Service Boundaries §Needs Verification](../../milestones/milestone-6-technical-architecture/03-service-boundaries.md)
  regarding the specific granularity of the thirteen-module
  decomposition.

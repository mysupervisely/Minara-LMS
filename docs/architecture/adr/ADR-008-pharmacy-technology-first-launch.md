# ADR-008: Pharmacy Technology First Launch

**Status:** Draft (Proposed) — **new decision, ratified in this ADR**
**Date:** 2026-08-07
**Source:** This ADR resolves a question left open across
[Student Lifecycle Workflow](../../milestones/milestone-3-student-journey-core-workflows/01-student-lifecycle-workflow.md),
[MVP Philosophy](../../milestones/milestone-7-mvp-definition-implementation-planning/01-mvp-philosophy.md),
[MVP Scope Definition](../../milestones/milestone-7-mvp-definition-implementation-planning/02-mvp-scope-definition.md),
[Implementation Phases](../../milestones/milestone-7-mvp-definition-implementation-planning/05-implementation-phases.md),
and
[First Implementation Roadmap](../../milestones/milestone-9-engineering-foundation-development-setup/10-first-implementation-roadmap.md).

## Context / Problem

Since Milestone 3, this documentation set has repeatedly flagged the
same **⚠️ Needs Verification** item: *which School and Program launches
first, and does it require an externship?* That single unanswered
question has shaped MVP scope, the Implementation Phases roadmap, and
the Vertical Slice Development Strategy without ever being resolved —
every document touching it could only reason conditionally. This ADR
closes that question.

## Decision

**Minara-LMS's first implementation targets a Pharmacy Technology
program** — directly corresponding to PharmTechPrepped in the Prepped
family (see
[Supported Schools and Programs](../../milestones/milestone-1-product-vision-platform-strategy/06-supported-schools-and-programs.md)
and
[ADR-007](./ADR-007-minara-as-education-engine.md)). Every other Program
and School remains real future scope, per
[Implementation Phases §Phase 6](../../milestones/milestone-7-mvp-definition-implementation-planning/05-implementation-phases.md) —
this decision selects the first, not the only, Program.

## Rationale

- **Existing curriculum.** A Pharmacy Technology curriculum already
  exists to build against, meaning the Learning and Assessments modules
  (per
  [Service Boundaries](../../milestones/milestone-6-technical-architecture/03-service-boundaries.md))
  have real content to deliver from day one rather than needing content
  development to happen in parallel with platform development.
- **Existing quality framework.** A quality/accreditation framework
  already associated with this program reduces the number of unknowns
  the platform's Certificate and reporting design (per the
  [Academic Domain Model](../../milestones/milestone-5-domain-model-data-architecture/02-academic-domain-model.md))
  needs to accommodate speculatively.
- **Founder expertise.** Direct institutional expertise in this specific
  program area reduces the risk of the platform being built against
  misunderstood requirements — a meaningful risk mitigation for the
  first real Program any LMS launches against.
- **Clear student journey.** A Pharmacy Technology program's journey —
  admission, coursework, assessment, and (typically) a practicum/
  externship component — maps cleanly onto the
  [Student Lifecycle Workflow](../../milestones/milestone-3-student-journey-core-workflows/01-student-lifecycle-workflow.md)
  already designed, making it a strong first proof of that workflow's
  correctness.

## Consequences for Prior Open Questions

This decision has direct, concrete effects on several previously
conditional documents:

- **Externship applicability:** Pharmacy Technician training commonly
  includes an experiential/externship component. This ADR treats
  Clinical Operations
  ([Implementation Phases §Phase 4](../../milestones/milestone-7-mvp-definition-implementation-planning/05-implementation-phases.md);
  [Version 1.2 of the Release Roadmap](../../milestones/milestone-7-mvp-definition-implementation-planning/07-release-roadmap.md))
  as **likely in scope for the near-term roadmap**, though the specific
  hours, competencies, and site requirements remain
  **⚠️ Needs Verification**, pending Minara-Curriculum's authoritative
  program design.
- **MVP scope:** the Externship area in
  [MVP Scope Definition](../../milestones/milestone-7-mvp-definition-implementation-planning/02-mvp-scope-definition.md),
  previously "Conditional MUST HAVE," should be re-evaluated as
  **likely MUST HAVE or an early SHOULD HAVE**, pending the confirmation
  above.
- **First Implementation Roadmap:** the vertical slice in
  [Milestone 9, Doc 10](../../milestones/milestone-9-engineering-foundation-development-setup/10-first-implementation-roadmap.md)
  deliberately excludes Externships regardless of this decision — that
  remains correct, since the vertical slice's purpose is to prove the
  architecture generally, not to model this specific Program's full
  requirements.

## Options Considered

| Option | Why Not Chosen |
|---|---|
| **Launch with a not-yet-specified Program, decided later** | Left every downstream planning document conditional indefinitely — the cost this ADR exists to end. |
| **Launch with multiple Programs simultaneously** | Contradicts [MVP Philosophy](../../milestones/milestone-7-mvp-definition-implementation-planning/01-mvp-philosophy.md)'s "launch narrow" principle; multiplies first-launch risk without a corresponding benefit. |
| **Pharmacy Technology as the first launch Program** *(chosen)* | Leverages existing curriculum, quality framework, and expertise; provides a concrete, real Program to validate every architectural decision against. |

## Consequences

**Benefits:**
- Every conditional decision across Milestones 3, 7, and 9 can now be
  resolved concretely instead of held open.
- Reduced execution risk: the first real Program launches against
  existing institutional assets rather than assets still being built.
- A clear connection between the institutional launch and the Prepped
  ecosystem (PharmTechPrepped), reinforcing
  [ADR-007](./ADR-007-minara-as-education-engine.md)'s hybrid model from
  day one.

**Tradeoffs:**
- Other Prepped products (PharmDPrepped, TherapyPrepped, MedCodePrepped)
  and other Minara schools wait for
  [Implementation Phases §Phase 6](../../milestones/milestone-7-mvp-definition-implementation-planning/05-implementation-phases.md).
- If Pharmacy Technology's specific requirements turn out to be
  atypical relative to other future programs, some general-purpose
  assumptions elsewhere in this documentation set may need revisiting
  once a second Program is added.

## Future Review Considerations

This decision should be revisited only if institutional priorities
change before implementation begins. Once implementation begins against
this Program, this ADR should not be casually reversed — a second
launch-Program decision this late would invalidate meaningful planning
work already in flight.

## Current / Planned / Future

| Element | Status |
|---|---|
| Pharmacy Technology as the first launch Program | **Current** — ratified by this ADR |
| Specific program requirements (hours, competencies, site requirements) | **Planned**, pending Minara-Curriculum confirmation |
| Additional Prepped products and Minara schools | **Future**, per [Implementation Phases](../../milestones/milestone-7-mvp-definition-implementation-planning/05-implementation-phases.md) |

## ⚠️ Needs Verification

- Specific Pharmacy Technology program requirements (externship hours,
  competencies, site/preceptor requirements) from Minara-Curriculum.
- Whether this Program formally corresponds to PharmTechPrepped, a
  distinct Minara-chartered School program, or both simultaneously (per
  the still-open question in
  [Supported Schools and Programs](../../milestones/milestone-1-product-vision-platform-strategy/06-supported-schools-and-programs.md)
  about the relationship between Prepped products and accredited
  programs).

# ADR-011: Vertical Slice Development Strategy

**Status:** Draft (Proposed)
**Date:** 2026-08-07
**Source:** [First Implementation Roadmap](../../milestones/milestone-9-engineering-foundation-development-setup/10-first-implementation-roadmap.md),
[Application Foundation Plan](../../milestones/milestone-9-engineering-foundation-development-setup/04-application-foundation-plan.md)

## Context / Problem

After nine milestones of architecture and planning, the temptation is
to begin implementation by building broadly — starting several MUST
HAVE features from
[MVP Scope Definition](../../milestones/milestone-7-mvp-definition-implementation-planning/02-mvp-scope-definition.md)
in parallel. That approach risks discovering, only after significant
investment, that the Modular Monolith's module boundaries
([ADR-001](./ADR-001-modular-monolith-architecture.md)), RBAC model
([ADR-005](./ADR-005-rbac-and-audit-first-security-model.md)), or
approval-gate pattern don't actually compose correctly under real
implementation — expensive lessons to learn late.

## Decision

**Build the first working product slice before expanding features.**
The first thing Minara-LMS's engineering team builds is a single,
narrow, end-to-end path through the platform — smaller than the MVP
itself — proving the architecture works before any broader effort is
invested.

## The Vertical Slice

```
Authentication
    ↓
Roles (Role Assignment)
    ↓
Student Dashboard
    ↓
Courses (Enrollment + Course Offering)
    ↓
Lessons (Course Content + Completion)
    ↓
Assessments
    ↓
Grades (Grade Recording)
    ↓
Faculty Review
    ↓
Program Director Approval
    ↓
Audit Trail
```

This restates and extends
[First Implementation Roadmap](../../milestones/milestone-9-engineering-foundation-development-setup/10-first-implementation-roadmap.md)'s
sequence, elevating **Audit Trail** to an explicit, final step of its
own — not merely a side effect of Program Director Approval, but a
deliberate proof point that the platform's Audit service correctly
captures a full, multi-actor sequence as one attributable, immutable
record.

## Why This Validates the Platform

- **It proves the Modular Monolith's boundaries hold under real
  implementation**, not just on paper — this single slice touches
  Identity, Learning, Assessments, Gradebook, and Audit, five of the
  thirteen modules from
  [Service Boundaries](../../milestones/milestone-6-technical-architecture/03-service-boundaries.md),
  interacting through the Direct and Event-Driven patterns
  [ADR-001](./ADR-001-modular-monolith-architecture.md) depends on.
- **It proves RBAC works across roles, not in isolation** — Student,
  Faculty Instructor, and Program Director each act on the same
  underlying data through three different Role Assignments and scopes,
  a far stronger test of
  [ADR-005](./ADR-005-rbac-and-audit-first-security-model.md) than any
  single role working alone.
- **It proves the approval-gate pattern** — the single most-repeated
  structural idea across
  [Milestone 3](../../milestones/milestone-3-student-journey-core-workflows/README.md)'s
  workflows (grade approval, certificate approval, externship
  completion verification all share this shape). Getting it right once,
  here, de-risks every other approval gate the platform needs later.
- **It proves the Audit Log captures a real, multi-actor chain
  correctly** — the harder and more realistic case than logging a single
  isolated action, and a direct test of
  [ADR-005](./ADR-005-rbac-and-audit-first-security-model.md)'s audit
  guarantees.
- **It is deliberately smaller than the MVP** — excluding Payments,
  Certificates, Admissions, and Externships, everything
  [MVP Scope Definition](../../milestones/milestone-7-mvp-definition-implementation-planning/02-mvp-scope-definition.md)
  also classifies MUST HAVE, but not needed to prove the architecture
  itself. This slice is the **walking skeleton** underneath the MVP —
  once it works, the rest of MUST HAVE scope is repetition of a proven
  pattern, not a fresh discovery of whether the pattern works at all.

## Options Considered

| Option | Description | Why Not Chosen |
|---|---|---|
| **Build broadly across several MUST HAVE features in parallel** | Start Admissions, Course Delivery, and Payments simultaneously. | Risks discovering architectural composition problems late, after significant parallel investment — the opposite of what a foundational proof should achieve. |
| **Build the full MVP in sequence, feature by feature, without a dedicated proof slice** | Follow [Application Foundation Plan](../../milestones/milestone-9-engineering-foundation-development-setup/04-application-foundation-plan.md)'s phases directly into full feature-building. | Still leaves the approval-gate and cross-role RBAC patterns unproven until deep into the MVP build, when a discovered problem is far more expensive to fix. |
| **A single, narrow, cross-module vertical slice first** *(chosen)* | As decided above. | Cheapest possible way to discover architectural problems, before broad investment — directly consistent with [Engineering Philosophy §Avoiding Premature Complexity](../../milestones/milestone-9-engineering-foundation-development-setup/01-engineering-philosophy.md). |

## Consequences

**Benefits:**
- Architectural risk is discovered and resolved early, cheaply, before
  broad feature investment.
- Provides a working, demonstrable proof of the platform for
  stakeholders well before the full MVP ships.
- Establishes real, working patterns (module interaction, RBAC
  enforcement, approval gates, audit capture) that every subsequent
  feature can follow rather than reinvent.

**Tradeoffs:**
- Delivers no directly student-usable functionality on its own — its
  value is architectural proof, not immediate product value, which
  requires stakeholder patience during this phase.
- A team eager to show broad feature progress may find this narrow
  approach counterintuitive; it requires discipline to resist expanding
  scope before the slice is proven.

## Future Review Considerations

This decision is specific to the *first* implementation effort and does
not govern how subsequent features are built — once the vertical slice
succeeds, feature development can proceed according to
[Implementation Phases](../../milestones/milestone-7-mvp-definition-implementation-planning/05-implementation-phases.md)'s
broader sequencing without needing a new "slice" for each one.

## Current / Planned / Future

| Element | Status |
|---|---|
| The ten-step vertical slice (Authentication through Audit Trail) | **Current** — the recommended first working software this project produces |
| Broader MUST HAVE scope beyond this slice | **Planned**, sequenced after this slice succeeds |

## ⚠️ Needs Verification

- Per
  [First Implementation Roadmap §Needs Verification](../../milestones/milestone-9-engineering-foundation-development-setup/10-first-implementation-roadmap.md),
  this slice assumes no externship dependency for its initial proof,
  independent of [ADR-008](./ADR-008-pharmacy-technology-first-launch.md)'s
  launch-Program decision.

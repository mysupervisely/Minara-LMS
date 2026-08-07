# ADR-009: System of Record Strategy

**Status:** Draft (Proposed) — **new decision, ratified in this ADR**
**Date:** 2026-08-07
**Source:** This ADR resolves a question left open since
[Scope Boundaries](../../milestones/milestone-1-product-vision-platform-strategy/09-scope-boundaries.md)
and repeated across
[Student Domain Model](../../milestones/milestone-5-domain-model-data-architecture/03-student-domain-model.md),
[Integration Architecture](../../milestones/milestone-6-technical-architecture/07-integration-architecture.md),
and
[Implementation Readiness Review](../../milestones/milestone-7-mvp-definition-implementation-planning/09-implementation-readiness-review.md).

## Context / Problem

Since [Milestone 1](../../milestones/milestone-1-product-vision-platform-strategy/09-scope-boundaries.md),
this documentation set has flagged an unresolved question: is
Minara-LMS the authoritative Student Information System (SIS), or does
it integrate with a separate, external SIS that holds that authority
instead? This matters architecturally because it determines whether
Enrollment, Academic Record, and related entities in the
[Student Domain Model](../../milestones/milestone-5-domain-model-data-architecture/03-student-domain-model.md)
are the *source of truth* or merely a *reflection* of data owned
elsewhere.

## Decision

**The initial MVP treats Minara-LMS as the system of record** for the
full student lifecycle — Applicant, Student, Enrollment, Academic
Record, Grades, and Transcript, exactly as modeled in
[Milestone 5](../../milestones/milestone-5-domain-model-data-architecture/README.md),
are authoritative within Minara-LMS itself. No external SIS is
integrated at launch.

## Rationale

- **No external SIS dependency to resolve before launch.** Per
  [MVP Philosophy](../../milestones/milestone-7-mvp-definition-implementation-planning/01-mvp-philosophy.md)'s
  "launch narrow" principle, depending on an external system's
  availability and data quality before the first real cohort can enroll
  would introduce risk this project doesn't need to accept.
- **Faster time-to-value.** [Manual Enrollment](../../milestones/milestone-7-mvp-definition-implementation-planning/02-mvp-scope-definition.md)
  and the rest of the MVP's core loop can proceed immediately, without
  waiting on an integration project.
- **Full control over the core data model during the period it matters
  most.** The first real cohort (per
  [ADR-008](./ADR-008-pharmacy-technology-first-launch.md)) is exactly
  when the domain model most needs to be validated against reality —
  owning that data directly, rather than through a reflection of an
  external system, makes that validation cleaner.
- **The architecture was already built to allow this to change later.**
  The Integration Layer pattern in
  [Integration Architecture](../../milestones/milestone-6-technical-architecture/07-integration-architecture.md)
  exists specifically so an external SIS integration could be added
  later without redesigning the Identity or Admissions modules — this
  decision spends nothing that can't be recovered.

## Options Considered

| Option | Description | Why Not Chosen (at MVP stage) |
|---|---|---|
| **Integrate with an external SIS as the system of record** | Minara-LMS reflects, but does not own, core student lifecycle data. | Introduces a dependency and integration project before any real cohort can be onboarded — directly conflicts with [MVP Philosophy](../../milestones/milestone-7-mvp-definition-implementation-planning/01-mvp-philosophy.md)'s launch-narrow posture. |
| **Dual system of record (both own parts of the data)** | Split authority between Minara-LMS and an external SIS. | Highest complexity option; risks data consistency issues between two authoritative sources, contradicting [Technology Selection Principles](../../milestones/milestone-8-technology-stack-development-architecture/01-technology-selection-principles.md)'s "avoid unnecessary complexity" rule. |
| **Minara-LMS as sole system of record at launch** *(chosen)* | As decided above. | Fastest, lowest-risk path to a working MVP; defers integration complexity until (and unless) it's actually needed. |

## Consequences

**Benefits:**
- No external dependency blocks MVP launch.
- One authoritative data model, avoiding consistency risk between two
  systems.
- Full architectural control during the period the domain model is
  being validated against real use for the first time.

**Tradeoffs:**
- If the institution already operates, or later adopts, a separate SIS,
  reconciling records between the two becomes a **future integration
  project**, not something designed in from day one — a real cost if
  that need turns out to be more urgent than currently understood.
- Any future SIS integration must be built against the Integration
  Layer pattern, which is sound but not yet exercised in practice.

## Future Review Considerations

This decision should be revisited if:
- The institution identifies an existing or required external SIS that
  Minara-LMS must integrate with.
- Multi-school expansion (per
  [Implementation Phases §Phase 6](../../milestones/milestone-7-mvp-definition-implementation-planning/05-implementation-phases.md))
  introduces a school that already operates its own SIS.

## Current / Planned / Future

| Element | Status |
|---|---|
| Minara-LMS as system of record for the MVP | **Current** — ratified by this ADR |
| External SIS integration | **Future**, via the Integration Layer pattern |

## ⚠️ Needs Verification

- Whether the institution has any existing SIS commitment not yet
  surfaced in this documentation set — this ADR assumes none exists at
  MVP launch, and should be confirmed directly with institutional
  stakeholders.

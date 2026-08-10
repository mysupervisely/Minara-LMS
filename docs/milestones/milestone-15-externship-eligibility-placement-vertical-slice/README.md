# Milestone 15 — Planning & Architecture Checkpoint, then Implementation

**Status:** Implemented
**Phase:** Architecture/product review (2026-08-07), followed by implementation (2026-08-10)
**Date:** 2026-08-07 (planning) / 2026-08-10 (implementation)
**Scope:** Documents 01–06 below are the original documentation-only
planning package, unchanged since they were drafted. Document 07 is the
[Implementation Completion Record](./07-implementation-completion-record.md)
added once the recommended slice was actually built — see that document
for exactly what was implemented versus what remains Planned/Future.

## Purpose

Milestones 10, 13, and 14 built three successive narrow vertical slices
per [ADR-011](../../architecture/adr/ADR-011-vertical-slice-development-strategy.md):
Foundation Build, Curriculum Delivery, and Content Versioning. Before
starting a fourth, this milestone performs the architecture/product
review the user's Milestone 15 brief required: an honest inventory of
what actually works today, an evaluation of whether Milestone 14's own
suggested next step (Course-level versioning) is actually needed now,
a ranking of every plausible next feature against what a real operating
Pharmacy Technology school needs, a focused deep-dive on Externship
Management specifically (since Pharmacy Technology, the chosen launch
Program, likely requires one), and one concrete recommendation for what
Milestone 15's *implementation* should actually be.

**Documents 01–06 were written as planning, not code** — the same
discipline Milestone 12 followed before Milestone 13's implementation.
Unlike that split, this milestone's implementation was carried out under
the same milestone number (per the user's own framing of the
implementation task as "Milestone 15... Implementation") rather than a
new Milestone 16 — see [07-implementation-completion-record.md](./07-implementation-completion-record.md)
for the as-built record.

## Documents in This Milestone

| # | Document | Answers |
|---|---|---|
| 1 | [README](./README.md) | This document |
| 2 | [Architecture Checkpoint — Capability Inventory](./01-architecture-checkpoint-capability-inventory.md) | Question 1 (what's Implemented/Partial/Documentation-only/Not-yet across every named platform area) and Question 5 (Pharmacy Technology curriculum repository review) |
| 3 | [Course-Level Versioning Evaluation](./02-course-level-versioning-evaluation.md) | Question 2 — BUILD NOW / **DEFER** / DO NOT BUILD |
| 4 | [Next Vertical Slice — Candidate Ranking](./03-vertical-slice-candidate-ranking.md) | Question 3 — ranked top 5 of 10 candidates |
| 5 | [Externship Management — Deep Dive](./04-externship-deep-dive.md) | Question 4 — 20-item evaluation of every named Externship capability |
| 6 | [Milestone 15 Recommendation](./05-milestone-15-recommendation.md) | Question 6 — the one recommended Milestone 15: Externship Eligibility & Placement Vertical Slice |
| 7 | [Implementation Readiness Review](./06-implementation-readiness-review.md) | Question 7 — **CONDITIONAL GO**, consolidated Needs Verification list, exact implementation sequence |
| 8 | [Implementation Completion Record](./07-implementation-completion-record.md) | What was actually built, once the CONDITIONAL GO's default resolutions were accepted and implementation proceeded |

## The Recommendation, In Brief

**Externship Eligibility & Placement Vertical Slice** (Coordinator-facing,
deliberately narrower than the full Milestone 5 Clinical & Externship
Domain Model): activates the already-declared `CLINICAL_COORDINATOR`
role to track eligibility, placement, evaluation, and joint
Coordinator + Program Director completion verification for the real
launch Program's practicum requirement — without yet standing up
Employer self-service login, itemized hour logging, or Site Agreement
tracking. See [Recommendation](./05-milestone-15-recommendation.md) for
the full detail and [Readiness Review](./06-implementation-readiness-review.md)
for exactly what should be confirmed before coding starts.

## Relationship to Milestones 10–14

| Milestone | Role in This Checkpoint |
|---|---|
| **Milestone 10 (Foundation Build)** | The implemented base every capability in the [inventory](./01-architecture-checkpoint-capability-inventory.md) is measured against. |
| **Milestone 13/14 (Curriculum Delivery / Content Versioning)** | The most recently proven pattern (approval-gate, audit extension, fail-closed visibility) this checkpoint recommends reusing a fourth time, not reinventing. |
| **Milestone 15 (this checkpoint)** | Planned, then implemented, the Externship Eligibility & Placement Vertical Slice — see [Implementation Completion Record](./07-implementation-completion-record.md). |

## Scope Boundaries

**In scope:** the seven-question architecture/product review specified
in this milestone's brief, as documentation only.

**Out of scope (this milestone, and consequently deferred from whatever
implementation phase follows):**

- Any production code, database schema, migration, or API.
- Building Course-level versioning (see
  [Evaluation](./02-course-level-versioning-evaluation.md) — DEFER).
- Building Payments, self-service Admissions, Certificates,
  Notifications, Analytics, or AI Tutor — all ranked but not recommended
  as *this* milestone's implementation, per
  [Candidate Ranking](./03-vertical-slice-candidate-ranking.md).
- Employer Portal / Employer Partner login access, itemized Hours Log,
  Site Agreement tracking, an automated eligibility rule engine, and any
  specific hour/competency/eligibility number — all explicitly narrowed
  out of the Externship recommendation itself, see
  [Deep Dive](./04-externship-deep-dive.md).
- Any new RBAC role — `CLINICAL_COORDINATOR` is activated, not created;
  `EMPLOYER_PARTNER` remains dormant.
- Any AI implementation.
- Vendor selections of any kind.
- Any fabricated accreditation, curriculum, hour, or qualification
  requirement — every such figure is named ⚠️ Needs Verification against
  Minara-Curriculum, never invented.

## Current / Planned / Future

| Element | Status |
|---|---|
| Milestones 10, 13, 14 (implemented) | **Current** |
| This checkpoint's seven-question review (documents 01–06) | **Current** — the historical planning record, unmodified |
| Externship Eligibility & Placement Vertical Slice | **Implemented** — see [Implementation Completion Record](./07-implementation-completion-record.md) |
| Certificate & Graduation, Payments, self-service Admissions | **Planned**, sequenced after this slice, per [Candidate Ranking](./03-vertical-slice-candidate-ranking.md) |
| Course-level versioning, Employer self-service, itemized Hours Log, Analytics, AI Tutor | **Future** |

## Approval

The planning package (documents 01–06) went through the
[Implementation Readiness Review](./06-implementation-readiness-review.md)'s
**CONDITIONAL GO** — its three named conditions were resolved with the
pragmatic defaults that review itself proposed (Coordinator/Program-
Director judgment fields instead of platform-enforced numbers; the
narrowing decisions accepted; `src/services/externship/` as the service
module location). Implementation then proceeded and is complete — see
[07-implementation-completion-record.md](./07-implementation-completion-record.md).

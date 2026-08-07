# Milestone 15 — Planning & Architecture Checkpoint

**Status:** Draft
**Phase:** Architecture/product review — plans the next extension of Milestones 10–14's implementation
**Date:** 2026-08-07
**Scope:** Documentation only. No production code, database schemas,
APIs, or vendor selections are introduced in this milestone.

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

**This milestone is planning, not code** — exactly like Milestone 12 was
for Milestone 13. Implementation begins only after this package is
reviewed, per the same gate every prior milestone's planning phase went
through.

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
| **Milestone 15 (this checkpoint)** | Plans the next implementation milestone. Per ADR-011, that implementation happens only after this plan is reviewed — the same gate Milestone 12 went through before Milestone 13 began. |

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
| This checkpoint's seven-question review | **Draft** — this milestone |
| Externship Eligibility & Placement Vertical Slice (recommended implementation) | **Planned**, **CONDITIONAL GO** — see [Readiness Review](./06-implementation-readiness-review.md) |
| Certificate & Graduation, Payments, self-service Admissions | **Planned**, sequenced after this slice, per [Candidate Ranking](./03-vertical-slice-candidate-ranking.md) |
| Course-level versioning, Employer self-service, itemized Hours Log, Analytics, AI Tutor | **Future** |

## Approval

This milestone is **Draft** pending stakeholder review. Per
[ADR-011](../../architecture/adr/ADR-011-vertical-slice-development-strategy.md),
implementation should not begin until this plan — and specifically the
three conditions in the
[Implementation Readiness Review](./06-implementation-readiness-review.md) —
are reviewed and confirmed.

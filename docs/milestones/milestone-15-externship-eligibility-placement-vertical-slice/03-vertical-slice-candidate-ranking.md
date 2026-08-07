# Next Vertical Slice — Candidate Ranking

**Status:** Draft
**Milestone:** 15 — Planning (Architecture Checkpoint, Question 3)
**Date:** 2026-08-07

Ranked against one test: **what moves Minara-LMS closer to actually
operating a real Pharmacy Technology school**, not what is technically
interesting to build. Every candidate is scored against its [MVP Scope
Definition](../milestone-7-mvp-definition-implementation-planning/02-mvp-scope-definition.md)
tier, whether it is required specifically by the real, chosen launch
Program (per [ADR-008](../../architecture/adr/ADR-008-pharmacy-technology-first-launch.md)),
and how narrow a first slice through it can be, per ADR-011.

## Ranked Candidates (Top 5)

### 1. Certificate & Graduation Workflow

**MUST HAVE** ([MVP Scope Definition](../milestone-7-mvp-definition-implementation-planning/02-mvp-scope-definition.md):
*"a program that can't confer its credential hasn't finished its job"*).
Directly completes the story Milestones 10–14 already built — a Student
who learns, is assessed, and is graded end to end currently has no way
to actually *graduate*. Reuses the exact two-step approval-gate pattern
(Program Director approves readiness → Administrator issues the
credential of record) already proven three times over
(`content-workflow.ts` M13/M14, `gradebook.ts` M10). Low new-entity
count (`Certificate`, `CertificateRecord`).

**The one complication:** its first stage
(["All Coursework & Externship Requirements Reported Complete"](../milestone-3-student-journey-core-workflows/05-certificate-graduation-workflow.md))
is not truthfully answerable for the *actual* launch Program
(`requiresExternship: true`) without Externship tracking existing first.
See Candidate 2 and the [Recommendation](./05-milestone-15-recommendation.md).

### 2. Externship Management — narrow slice

Elevated from "Conditional MUST HAVE" to "likely MUST HAVE" by
[ADR-008](../../architecture/adr/ADR-008-pharmacy-technology-first-launch.md)
itself, once Pharmacy Technology was chosen as the launch Program. The
schema already carries `Program.requiresExternship = true` for the real
seeded Program, and `CLINICAL_COORDINATOR`/`EMPLOYER_PARTNER` were
pre-declared in `src/domain/roles.ts` specifically so this would not
require a new-role architectural decision when the time came. Largest
scope/unknowns of the top candidates (see
[Externship Deep Dive](./04-externship-deep-dive.md)), but a narrow
slice through it is what makes Candidate 1 honest for the program this
platform is actually launching.

### 3. Payments (basic)

**MUST HAVE** (basic tier: Invoice, Payment, Receipt gating Enrollment),
per [Implementation Phases §Phase 1](../milestone-7-mvp-definition-implementation-planning/05-implementation-phases.md).
A real school has real financial obligations. Ranked below Certificates
and Externship because the vertical slice already proves manual,
Administrator-provisioned Enrollment *without* payment gating (as MVP
Scope explicitly permits for the "manual" tier), so nothing about the
core academic loop is currently blocked by its absence — this is
operational completeness, not an architecture-proving gap.

### 4. Self-service Admissions

**SHOULD HAVE**, not MUST HAVE, for the first cohort — the manual,
Administrator-provisioned tier is already Implemented (`createEnrollment`,
exercised in `prisma/seed.ts`). Matters materially for recruiting
*cohort two* without manual data entry, but nothing about cohort one's
journey is blocked by its absence today.

### 5. Notifications (critical-event tier)

**MUST HAVE** per MVP Scope, but cross-cutting and small relative to the
others — best delivered *inside* whichever workflow milestone needs a
"you've been notified" moment (e.g., a Certificate issued, a Grade
posted, an Externship Placement approved) rather than standing alone as
its own vertical slice. Ranked here to acknowledge it is a genuine,
un-deferred MUST HAVE gap (see the [Capability Inventory](./01-architecture-checkpoint-capability-inventory.md)),
not to recommend it as an independent Milestone 15.

## Explicitly Ranked Below the Top 5

| Candidate | Why Not Higher |
|---|---|
| **Employer Portal** | Not independent — it is a subset of Externship Management (Candidate 2), and this checkpoint's own [Externship Deep Dive](./04-externship-deep-dive.md) recommends deferring Employer-facing login access specifically, even within the Externship slice. |
| **Analytics** | Every source document tags it explicitly **FUTURE** — it needs real usage data the platform has not yet generated. Building it now would produce dashboards over near-empty tables. |
| **AI Tutor** | **COULD HAVE**, and this checkpoint's own constraints forbid adding AI because it is available rather than because it is needed. The platform demonstrably operates a real program without it, per MVP Scope's own language. |
| **Additional curriculum capabilities** (Question Banks, Rubrics, Module hierarchy, full Competency chain) | Explicitly excluded by this task's constraints ("do not build the entire Milestone 11 Content Engine at once") and by ADR-011's own discipline — the narrow slices built so far (M13, M14) are working; there is no signal any of these specific richer capabilities are blocking real operation yet. |
| **Course-level composition/versioning** | See [dedicated evaluation](./02-course-level-versioning-evaluation.md): **DEFER** — no concrete trigger exists yet. |

## Current / Planned / Future

| Element | Status |
|---|---|
| This ranking | **Current** — this checkpoint's own analysis |
| Recommended Milestone 15 (Candidate 2, narrowed) | See [Recommendation](./05-milestone-15-recommendation.md) |
| Candidates 1, 3, 4, 5 | **Planned** — sequenced after Milestone 15, see [Implementation Readiness Review](./06-implementation-readiness-review.md) |

## ⚠️ Needs Verification

- This ranking reflects this checkpoint's judgment against documented
  MVP tiers and ADR-008's launch-Program decision, not a
  stakeholder-confirmed prioritization — consistent with the same caveat
  [MVP Feature Prioritization](../milestone-7-mvp-definition-implementation-planning/04-mvp-feature-prioritization.md)
  already carries.

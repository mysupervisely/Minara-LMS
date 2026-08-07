# Milestone 15 Recommendation

**Status:** Draft — recommended, pending review
**Milestone:** 15 — Planning (Architecture Checkpoint, Question 6)
**Date:** 2026-08-07

## Milestone Name

**Externship Eligibility & Placement Vertical Slice** (Coordinator-facing)

## Why Now

Three independent lines of evidence converge on this being the correct
next slice, not merely a plausible one:

1. **[ADR-008](../../architecture/adr/ADR-008-pharmacy-technology-first-launch.md)**
   already reclassified Externship from "Conditional MUST HAVE" to
   "likely MUST HAVE or an early SHOULD HAVE" the moment Pharmacy
   Technology was chosen as the launch Program.
2. **The schema already anticipated this.** `Program.requiresExternship`
   is `true` for the real, seeded launch Program today, and
   `CLINICAL_COORDINATOR`/`EMPLOYER_PARTNER` were pre-declared in
   `src/domain/roles.ts` specifically — per that file's own header
   comment — "so a later milestone can wire them up without touching
   this file's shape." This is that later milestone.
3. **It unblocks the next MUST HAVE honestly.** Certificate & Graduation
   (ranked #1 in [Candidate Ranking](./03-vertical-slice-candidate-ranking.md))
   cannot truthfully evaluate "All Coursework & Externship Requirements
   Reported Complete" for the real launch Program without this slice
   existing first — building Certificates first would mean building
   against an imagined externship-free version of Pharmacy Technology,
   not the real one ADR-008 committed to.

## User Problem Solved

Today, a Pharmacy Technology Student can complete every Lesson, pass
every Assessment, and have every Grade approved — and the platform still
has no way to represent whether they completed the off-campus practicum
component their program actually requires. This slice closes that gap:
the platform gains an honest, auditable answer to "has this Student
completed their externship requirement?" for the one real Program that
needs one.

## Roles Involved

| Role | Involvement |
|---|---|
| **Student** | Read-only visibility into their own Placement status, evaluation summaries, and completion state. Existing Self-scoped RBAC pattern, no new mechanism. |
| **Externship/Clinical Coordinator** | **Newly activated** (not newly created — see Why Now #2). Records Sites, determines eligibility, requests/approves Placements, records Midpoint/Final evaluations, attests hours-complete. |
| **Program Director** | Existing role, existing authority — second signer on Completion Verification, exactly like the existing Content and Grade approval gates. |
| **Administrator** | Existing role — oversight, `CLINICAL_COORDINATOR` role assignment, audit visibility. |
| **Employer Partner** | **Explicitly NOT activated** as a platform actor in this slice — see [Externship Deep Dive #20](./04-externship-deep-dive.md). Represented only as data the Coordinator records. |

## Core Workflow

```
Eligibility confirmed (Coordinator, from existing academic record)
    ↓
Clinical Site + capacity recorded (Coordinator)
    ↓
Placement requested and approved (Coordinator)
    ↓
Student assigned
    ↓
Midpoint Evaluation recorded (Coordinator, on Employer's behalf)
    ↓
Final Evaluation + hours-complete attestation (Coordinator)
    ↓
Completion Verification — Coordinator + Program Director joint approval
    ↓
Student sees Verified status
    ↓
(feeds a future Certificate milestone's "Externship Requirement Complete" gate)
```

A "Not Verified" outcome at the final gate routes back to an Active
Placement state (the remediation loop), mirroring the return-with-reason
pattern already proven in Content Approval.

## Screens Affected

| Portal | Change |
|---|---|
| **New: Coordinator Portal** (`/coordinator`) | Dashboard/queue, Sites, Eligibility Queue, Placements, Evaluations, Completion Verification — mirrors the existing `/faculty` and `/program-director` route-group conventions. |
| **Program Director Portal** | New Completion Verification approval queue, alongside the existing content/grade approval queues. |
| **Student Portal** | New read-only "My Externship" status view, rendered only when `program.requiresExternship`. |
| **Admin Portal** | `CLINICAL_COORDINATOR` added to the existing (already-generic) role-assignment selector; Audit Log filter coverage for the new action types. |

## Services Affected

- **New:** `src/services/externship/externship.ts` — a new bounded-context
  module per [ADR-004](../../architecture/adr/ADR-004-domain-driven-module-boundaries.md),
  analogous to how `assessments/` and `enrollment/` are already separate
  from `academic/`.
- **Extended:** `src/services/audit/audit.ts` — new `AuditAction` union
  members only, no second audit mechanism.
- **Extended:** `src/domain/roles.ts` — move `CLINICAL_COORDINATOR` from
  declared-only to `IMPLEMENTED_ROLES`; update `ROLE_HOME_ROUTE`. Zero
  shape change to the file, exactly as its header comment anticipated.

## Domain Models Affected (additive only)

| Model | Purpose | Deliberately NOT built (see Deep Dive) |
|---|---|---|
| `ClinicalSite` | A site a Student can be placed at | `Employer` as a separate entity/actor, `SiteAgreement` |
| `Placement` | Student ↔ Site, status lifecycle (Requested → Approved → Active → Completed) | Itemized `HoursLog` |
| `Evaluation` | Generic: type (`MIDPOINT`/`FINAL`), free-text content, recorded-by | Structured multi-criteria evaluation forms |
| Completion state | Either a status field on `Placement`, or a small `CompletionVerification` record — decided at Implementation Plan time | `Preceptor` as a full entity |

## Audit Events Required

`PLACEMENT_REQUESTED`, `PLACEMENT_APPROVED`, `EVALUATION_RECORDED`,
`EXTERNSHIP_COMPLETION_VERIFIED`, `EXTERNSHIP_COMPLETION_RETURNED` —
naming pattern directly parallel to Milestone 14's `VERSION_*` additions,
on the same `AuditAction` union, same service, same append-only table.

## RBAC Considerations

- Activates an **already-declared** role (`CLINICAL_COORDINATOR`) — not
  a new RBAC decision, per this task's own constraint against
  introducing new roles without explicit architectural reason.
- Scope is already defined: `ROLE_SCOPE.CLINICAL_COORDINATOR = "program"`.
- Fail-closed, service-layer enforcement exactly as Milestone 14
  established for Students: a Student must never retrieve another
  Student's Placement/evaluation data by direct route or action
  invocation; a Coordinator/Program Director must never reach a
  Placement outside their own Program.

## Testing Strategy

- New `tests/externship-management.test.ts`, mirroring the shape of
  `tests/content-versioning.test.ts`: full lifecycle (eligibility →
  placement → midpoint → final → completion verification → Student
  visibility → cross-program denial → audit reconstruction).
- Extend, not replace, `tests/helpers/fixtures.ts` and `reset-db.ts`
  with Externship fixtures (`buildExternshipScenario` or similar).
- The full existing 62-test suite must continue passing unmodified —
  this slice is purely additive to the schema and services, exactly like
  Milestone 13's addition alongside Milestone 10.

## Explicitly NOT Included

Per [Externship Deep Dive](./04-externship-deep-dive.md): Employer
Portal / Employer Partner login access, itemized Hours Log, structured
multi-criteria evaluation forms, Site Agreement legal/contractual
tracking, an automated eligibility rule engine, specific numeric
hour/competency requirements (Coordinator/Program-Director-entered, not
platform-defined), scheduling-conflict detection beyond "one Active
placement at a time," and the Certificate & Graduation workflow itself
(a separate, subsequent milestone this one sets up for).

## Current / Planned / Future

| Element | Status |
|---|---|
| This recommendation | **Draft** — pending review, per [Implementation Readiness Review](./06-implementation-readiness-review.md) |
| Implementation of this slice | **Planned** — begins only after review, per ADR-011 |
| Certificate & Graduation (the slice this one unblocks) | **Planned** — Milestone 16 candidate |
| Employer self-service, itemized Hours Log, Site Agreement | **Future** |

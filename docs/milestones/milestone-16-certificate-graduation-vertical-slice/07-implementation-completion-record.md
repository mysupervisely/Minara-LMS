# Implementation Completion Record

**Status:** Implemented
**Milestone:** 16 — Certificate & Graduation Vertical Slice
**Date:** 2026-08-11

## Files Created

| File | Purpose |
|---|---|
| `prisma/migrations/20260811104336_m16_certificate_graduation/migration.sql` | Additive migration — `graduation_requests`, `certificates` tables |
| `src/services/graduation/graduation.ts` | Eligibility determination, review workflow, certificate issuance, reads |
| `src/app/(portal)/program-director/graduation/page.tsx` | Graduation Candidates queue |
| `src/app/(portal)/program-director/graduation/[requestId]/page.tsx` | Candidate review detail |
| `src/app/(portal)/program-director/graduation/return-graduation-form.tsx` | Return-with-reason client form |
| `src/app/(portal)/admin/graduation/page.tsx` | Certificate Issuance queue + history |
| `src/app/(portal)/admin/graduation/[requestId]/page.tsx` | Issuance detail |
| `src/app/(portal)/student/graduation/page.tsx` | Student's read-only Graduation & Certificate view |
| `tests/certificate-graduation.test.ts` | 19-test integration suite (see [Testing & Verification Results](./08-testing-verification-results.md)) |
| `docs/milestones/milestone-16-certificate-graduation-vertical-slice/` (9 documents) | This documentation package |

## Files Modified

| File | Change |
|---|---|
| `prisma/schema.prisma` | Added `GraduationRequest`, `Certificate` models and their relations on `User`/`Program` |
| `prisma/seed.ts` | Fixed a pre-existing minor bug (`createLesson`'s returned `lesson` id was previously discarded); added "Gina Graduate," a second demo Student who completes academic work, an externship (new "Cedar Grove Pharmacy" site), and the full graduation → certificate → alumni lifecycle, without touching Sam Student's existing Milestone 14/15 demo state |
| `src/services/audit/audit.ts` | Extended `AuditAction` with 6 graduation/certificate actions |
| `src/app/(portal)/program-director/actions.ts` | Added `submitForGraduationReviewAction`, `approveGraduationAction`, `returnGraduationReviewAction`, `ReturnGraduationState`, `messageForGraduationError` |
| `src/app/(portal)/admin/actions.ts` | Added `issueCertificateAction` |
| `src/app/(portal)/admin/page.tsx` | Added "Graduation Requests Awaiting Issuance" and "Certificates Issued" stat cards |
| `src/app/(portal)/layout.tsx` | Added one nav link each for Student, Program Director, Administrator |
| `tests/helpers/fixtures.ts` | Added `completeAcademicWork`, `verifyExternshipForStudent`, `buildGraduationReadyScenario` |
| `tests/helpers/reset-db.ts` | Added `certificate`/`graduationRequest` cleanup (before other cleanup, since `Certificate` has a required FK to `GraduationRequest`) |

## Database Changes

Purely additive — two new tables, no columns altered or dropped on any
existing table:

- `graduation_requests` (`GraduationRequest`): `studentId`, `programId`
  (unique together), `status`, `returnReason`, `submittedById`,
  `submittedAt`, `approvedById`, `approvedAt`, timestamps.
- `certificates` (`Certificate`): `graduationRequestId` (unique, 1:1),
  `studentId`, `programId`, `credentialNumber` (unique), `status`,
  `issuedById`, `issuedAt`.

Verified against the real seeded `dev.db`: applied via `prisma migrate
deploy`, confirmed zero data loss (pre-existing row counts — including
both Users and Milestone 15's Placements — unchanged after migration).

## Services Added / Modified

- **Added:** `src/services/graduation/graduation.ts` — the entire
  Graduation & Certificate bounded context (see
  [Graduation Eligibility Design](./03-graduation-eligibility-design.md),
  [Certificate Model & Design](./04-certificate-model-design.md), and
  [Workflow & State Transitions](./05-workflow-state-transitions.md)).
  Written from the start to import Role/Scope predicates from
  `src/services/identity/rbac.ts` (the pure, Next.js-independent module
  split out in Milestone 15), avoiding a repeat of that milestone's
  `prisma/seed.ts`-breaking import issue.
- **Modified:** `src/services/audit/audit.ts` — extended, not replaced.
- **Unmodified:** every other service (`gradebook.ts`, `externship.ts`,
  `content-workflow.ts`, `enrollment.ts`, etc.) — this milestone reads
  their output, never rewrites their logic.

## Routes Added

| Route | Role |
|---|---|
| `/program-director/graduation` | Program Director |
| `/program-director/graduation/[requestId]` | Program Director |
| `/admin/graduation` | Administrator |
| `/admin/graduation/[requestId]` | Administrator |
| `/student/graduation` | Student |

All five appear in the production build's route manifest (see
[Testing & Verification Results](./08-testing-verification-results.md)).

## RBAC Changes

**None.** No new role was declared or activated. All authority uses the
five already-implemented roles (`STUDENT`, `FACULTY` — no authority
granted, unchanged; `PROGRAM_DIRECTOR`, `ADMINISTRATOR`,
`CLINICAL_COORDINATOR` — no authority granted, unchanged). Per-role
authority for this slice:

| Role | Authority |
|---|---|
| Student | View own eligibility/request/certificate only |
| Faculty | None |
| Program Director | Submit for review, approve, return (own Program only) |
| Administrator | Submit/approve/return (institution-wide, via the same functions' Administrator bypass); issue Certificate (exclusive) |
| Clinical Coordinator | None — their Milestone 15 verification output is read, not re-triggered |

`EMPLOYER_PARTNER` and `ADMISSIONS_STAFF` remain declared but dormant,
per the brief's explicit instruction not to activate `EMPLOYER_PARTNER`.

## Audit Actions Added

`GRADUATION_ELIGIBILITY_DETERMINED`, `GRADUATION_SUBMITTED`,
`GRADUATION_APPROVED`, `GRADUATION_RETURNED`, `CERTIFICATE_ISSUED`,
`ALUMNI_STATUS_ASSIGNED` — appended to the single existing `AuditAction`
union in `src/services/audit/audit.ts`. No second audit table or system.

## Architectural Decisions Discovered

Two implementation-level decisions were made that are worth recording,
but neither meets this project's ADR threshold (expensive to reverse,
cross-cutting across bounded contexts, foundational, or likely to shape
future architecture) — **No new ADR required.**

1. **Program Director (or Administrator) both submits and approves a
   Graduation Request.** The brief's authority table did not explicitly
   assign submission authority to any role. Rather than inventing a new
   authority split, this milestone gave the Program Director (already the
   sole reviewing authority "within their program" for every prior
   approval gate) both actions — the same actor who would approve is the
   one positioned to know a Student is ready to be formally submitted.
   This is reversible without data loss (a future milestone could split
   "submit" out to a different role by adding one more authorization
   branch to `submitForGraduationReview`) and affects only this one
   workflow, not a cross-cutting concern — an implementation detail, not
   an architectural commitment.
2. **`Enrollment.status = "ALUMNI"` as an additive string value, not a
   new field or entity.** `Enrollment.status` was already a plain
   `String` (not a native enum) with only `"ACTIVE"` ever written by any
   service — adding `"ALUMNI"` required no schema change at all. This
   follows the schema's own precedent (Milestone 15's
   `Placement.completionStatus` values are handled the same way) rather
   than establishing a new one, so it does not rise to a decision this
   project would need to formally record and revisit.

## Follow-Up Verification Pass

A second prompt restated this same milestone with a fuller specification
(a granular eligibility-breakdown UX and a 25-point test list). Since the
implementation described above already existed on this branch, this was
treated as a verification-and-gap-closing pass rather than a rebuild.
Two small, additive changes resulted:

- `GraduationEligibilityResult` gained a `breakdown:
  GraduationRequirementBreakdownItem[]` field — one row per requirement
  area (Academic Requirements, Externship Requirement, Financial
  Clearance, Other Program Requirements) with an explicit `PASSED` /
  `FAILED` / `NOT_APPLICABLE` / `NEEDS_VERIFICATION` status, rendered as
  a table on both the Student's and Program Director's eligibility
  screens. `eligible`'s underlying computation is unchanged — the
  breakdown is read-only disclosure, not a new gate. See
  [Graduation Eligibility Design §Disclosure Breakdown](./03-graduation-eligibility-design.md#disclosure-breakdown).
- Two tests added to `tests/certificate-graduation.test.ts` (now 21):
  a non-externship-Program gate check, and a Clinical-Coordinator-cannot-
  approve-graduation boundary check (distinct from the existing
  cannot-issue-certificates check).

No schema change, no new route, no new audit action, no RBAC change —
this pass touched only `src/services/graduation/graduation.ts`'s return
shape and two existing portal pages' rendering.

## Files NOT Modified (by design)

`src/services/externship/externship.ts`, `src/services/gradebook/gradebook.ts`,
`src/services/academic/*`, `src/domain/roles.ts`, and every Milestone
10–15 portal page outside the five new/three modified files above — all
read, none rewritten, per this milestone's "reuse, do not rewrite"
instruction.

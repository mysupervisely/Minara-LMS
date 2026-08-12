# Application Domain & Workflow

**Status:** Implemented
**Milestone:** 17 — Admissions & Enrollment Vertical Slice
**Date:** 2026-08-12
**Implementation:** `prisma/schema.prisma`'s `Application`/`ApplicationRequirement`; `src/services/admissions/admissions.ts`

## Two Models, Following the Established Pattern

`Application` (the review/workflow row, reusing the approval-gate shape)
and `ApplicationRequirement` (the checklist, reusing Milestone 16's
disclosure-breakdown design) — the same "workflow row separate from the
artifact/detail it tracks" pattern already used throughout this schema.

```prisma
model Application {
  id             String
  applicantId    String   // -> User
  programId      String   // -> Program
  status         String   @default("DRAFT")
  applicantNotes String?
  decisionReason String?
  submittedAt    DateTime?
  decisionAt     DateTime?
  decidedById    String?  // -> User
  cohortId       String?  // -> Cohort, set once Accepted
  requirements   ApplicationRequirement[]
  enrollment     Enrollment?
}

model ApplicationRequirement {
  id            String
  applicationId String   // -> Application, onDelete: Cascade
  label         String
  status        String   @default("NEEDS_VERIFICATION")
  note          String?
  updatedById   String?  // -> User
}
```

## State Machine

Follows [Admissions Workflows](../milestone-3-student-journey-core-workflows/03-admissions-workflows.md)'s
own stage sequence exactly — no new terminology invented:

```
DRAFT → SUBMITTED → UNDER_REVIEW → ACCEPTED | DENIED | WAITLISTED | DEFERRED
                                       │
                          ┌────────────┴────────────┐
                    ACCEPTANCE_CONFIRMED      ACCEPTANCE_DECLINED
                          │
                       ENROLLED
```

`WAITLISTED`/`DEFERRED` → `UNDER_REVIEW` is supported (`reopenForReview`)
— the doc's own "Spot Opens" / "Future Cohort Opens" re-entry branches.
There is no `WAITLISTED`/`DEFERRED` → `ACCEPTED` direct edge; a reopened
Application goes back through `UNDER_REVIEW` and a fresh Decision, the
same re-review path a `RETURNED` `GraduationRequest` (Milestone 16) takes.

| Transition | Function | Actor |
|---|---|---|
| *(none)* → `DRAFT` | `startOrResumeApplication` | Applicant (self) |
| `DRAFT` → `SUBMITTED` | `submitApplication` | Applicant (self) |
| `SUBMITTED` → `UNDER_REVIEW` | `startReview` | Admissions Staff/Administrator |
| `UNDER_REVIEW` → `ACCEPTED`/`DENIED`/`WAITLISTED`/`DEFERRED` | `recordDecision` | Admissions Staff/Administrator |
| `WAITLISTED`/`DEFERRED` → `UNDER_REVIEW` | `reopenForReview` | Admissions Staff/Administrator |
| `ACCEPTED` → `ACCEPTANCE_CONFIRMED` | `confirmOffer` | Applicant (self) |
| `ACCEPTED` → `ACCEPTANCE_DECLINED` | `declineOffer` | Applicant (self) |
| `ACCEPTANCE_CONFIRMED` → `ENROLLED` | `createEnrollmentFromApplication` | Admissions Staff/Administrator |

Every transition function re-checks its own guard from the database
(never trusts a caller-supplied status) and records at least one audit
event — the same discipline established in `content-workflow.ts`,
`externship.ts`, and `graduation.ts`.

## Why No `NOT_READY`/`ELIGIBLE` States

Unlike Milestone 16's suggested (and ultimately not persisted)
`NOT_READY`/`ELIGIBLE` states, this milestone's brief did not suggest
equivalent computed pre-states, and none were introduced — `DRAFT` and
`SUBMITTED` already fully describe "not yet under review" without a
separate readiness computation to persist or compute.

## Checklist: Fail-Closed by Construction

`ApplicationRequirement.status` is one of exactly four values —
`RECEIVED`, `MISSING`, `NEEDS_VERIFICATION`, `NOT_APPLICABLE` — validated
against a fixed union in `updateRequirementStatus`, never freeform.
Every newly-started Application is seeded with exactly two generic,
non-invented rows: "Supporting Documents" and "Program-Specific
Requirements," both starting `NEEDS_VERIFICATION`. Admissions Staff can
update either, or add more via `addRequirement`. See
[Admissions Staff Portal](./06-admissions-staff-portal.md) for the UI and
[⚠️ Needs Verification](./10-needs-verification.md) for why these two
generic rows exist instead of a real Pharmacy Technology document list.

**No automated acceptance gate exists.** `recordDecision` does not check
checklist completeness before allowing `ACCEPTED` — inventing an
"all-requirements-RECEIVED" rule would itself be fabricating an
admissions policy this repository has no authority to define. The
checklist informs a human reviewer; it never silently blocks or silently
permits a Decision.

## What Was Deliberately Not Invented

Per this milestone's explicit instruction, none of the following are
checked, stored, or referenced anywhere in `admissions.ts` or the
`Application`/`ApplicationRequirement` schema:

- GPA requirements
- Age requirements
- Prerequisite courses
- Background-check rules
- Immunization rules
- Residency rules
- License requirements
- Standardized test requirements
- A specific required-document list

Where the real Pharmacy Technology curriculum would eventually supply
such requirements, this milestone instead exposes a generic,
staff-editable checklist that defaults to `NEEDS_VERIFICATION` — see
[⚠️ Needs Verification](./10-needs-verification.md).

## Current / Planned / Future

| Element | Status |
|---|---|
| `Application`/`ApplicationRequirement` schema | **Implemented** |
| DRAFT → SUBMITTED → UNDER_REVIEW → Decision → Confirm/Decline → ENROLLED | **Implemented** |
| WAITLISTED/DEFERRED re-review loop | **Implemented** |
| Fail-closed checklist (never silently passes) | **Implemented** |
| Automated/AI acceptance decision | **Not built** — explicitly out of scope |
| Real Pharmacy Technology requirement list | **Future** — pending Minara-Curriculum |

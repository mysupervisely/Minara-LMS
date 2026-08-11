# Workflow & State Transitions

**Status:** Implemented
**Milestone:** 16 — Certificate & Graduation Vertical Slice
**Date:** 2026-08-11
**Implementation:** `src/services/graduation/graduation.ts`

## State Machine

```
 (computed, never persisted)
        │
   ┌────▼─────┐
   │ ELIGIBLE │  determineGraduationEligibility() === true
   └────┬─────┘
        │ submitForGraduationReview (Program Director / Administrator)
        ▼
  ┌────────────┐   returnGraduationReview (reason required)   ┌──────────┐
  │ SUBMITTED  │ ─────────────────────────────────────────────▶ RETURNED │
  └─────┬──────┘                                                └────┬─────┘
        │ approveGraduation                       resubmit (submitForGraduationReview) │
        ▼                                                             │
  ┌────────────┐                                                      │
  │  APPROVED  │◀─────────────────────────────────────────────────────┘
  └─────┬──────┘
        │ issueCertificate (Administrator)
        ▼
┌────────────────────┐        (same atomic call also sets
│ CERTIFICATE_ISSUED  │         Enrollment.status = "ALUMNI")
└────────────────────┘
```

`GraduationRequest.status` holds exactly these four values:
`SUBMITTED → APPROVED → CERTIFICATE_ISSUED`, with `RETURNED` as the one
side-branch back to `SUBMITTED` (via resubmission) — the same
remediation-loop shape as Milestone 13's `LessonVersion.status` and
Milestone 15's `Placement.completionStatus`.

## Why "NOT_READY" and "ELIGIBLE" Are Not Persisted States

The brief suggested (not mandated) a six-state machine: `DRAFT/NOT_READY
→ ELIGIBLE → SUBMITTED → APPROVED → CERTIFICATE_ISSUED → ALUMNI`, and
explicitly invited using existing terminology instead where a better
equivalent exists, rather than inventing unnecessary parallel concepts.
This implementation collapses the first two suggested states into a
single computed value:

- **`NOT_READY`/`ELIGIBLE` have no row to occupy.** There is no
  `GraduationRequest` yet at this point in a Student's journey — nothing
  has been submitted for review. Persisting "not ready" or "eligible" as
  a stored status would mean creating a row (and therefore a workflow
  action to create it) purely to hold a fact that
  `determineGraduationEligibility` already computes correctly, live,
  every time it's asked — see
  [Graduation Eligibility Design](./03-graduation-eligibility-design.md)'s
  "Derived, Never Persisted" principle. Storing it would violate this
  milestone's own instruction not to "store a second copy... merely to
  calculate eligibility," since a stored `ELIGIBLE` flag is exactly that
  second copy, and it would immediately risk going stale the moment a new
  Lesson is published or a Grade is corrected.
- **`ALUMNI` is not a `GraduationRequest` status at all.** It is the
  terminal value of the Student's existing `Enrollment.status` field (see
  [Certificate Model & Design](./04-certificate-model-design.md) and
  below) — a different entity's field, not a fifth
  `GraduationRequest.status` value, because Alumni-ness describes the
  Student's standing in the Program as a whole, not the lifecycle of one
  Graduation Request document.

The four persisted `GraduationRequest.status` values plus the
`Enrollment.status = "ALUMNI"` transition together cover the same ground
the suggested six-state machine did — just without inventing a status
field to hold a value that was always computable.

## Transition-by-Transition

| Transition | Function | Actor | Guard | Audit action(s) |
|---|---|---|---|---|
| *(none)* → `SUBMITTED` | `submitForGraduationReview` | Program Director (own Program) or Administrator | No existing non-`RETURNED` request for this `(student, program)`; `determineGraduationEligibility` re-run live and must return `eligible: true` | `GRADUATION_ELIGIBILITY_DETERMINED`, then `GRADUATION_SUBMITTED` |
| `SUBMITTED` → `APPROVED` | `approveGraduation` | Program Director (own Program) or Administrator | Request must currently be `SUBMITTED` | `GRADUATION_APPROVED` |
| `SUBMITTED` → `RETURNED` | `returnGraduationReview` | Program Director (own Program) or Administrator | Request must currently be `SUBMITTED`; non-empty trimmed reason required | `GRADUATION_RETURNED` |
| `RETURNED` → `SUBMITTED` | `submitForGraduationReview` (resubmission) | Program Director (own Program) or Administrator | Same eligibility re-check as the first submission; `returnReason` is cleared, `submittedById`/`submittedAt` refreshed | `GRADUATION_ELIGIBILITY_DETERMINED`, then `GRADUATION_SUBMITTED` |
| `APPROVED` → `CERTIFICATE_ISSUED` | `issueCertificate` | Administrator only | Request must currently be `APPROVED` | `CERTIFICATE_ISSUED`, then `ALUMNI_STATUS_ASSIGNED` |

Every transition function independently re-checks its own guard from the
database (never trusts a caller-supplied status), and every transition
records at least one audit event before returning — the same discipline
established in `content-workflow.ts` (Milestone 13) and `externship.ts`
(Milestone 15).

## Why Eligibility Is Re-Checked at Submission, Not Trusted from the Candidates List

The Program Director's Graduation Candidates screen
(`listGraduationCandidatesForProgram`) already shows a live-computed
eligibility badge per Student. `submitForGraduationReview` does not trust
that badge — it calls `determineGraduationEligibility` again, inside the
same function, and throws `GraduationStateError` if the result is not
`eligible: true`. This closes the (however narrow) window between a
Program Director loading the candidates page and clicking "Submit for
Review," during which a fact the eligibility computation depends on could
theoretically change. This is the same "fail-closed, recompute rather
than trust a snapshot" discipline the eligibility design itself commits
to.

## Why Certificate Issuance and Alumni Transition Are One Atomic Act

`issueCertificate` performs three things inside one function call: create
the `Certificate`, set `GraduationRequest.status =
"CERTIFICATE_ISSUED"`, and set the Student's `Enrollment.status =
"ALUMNI"` — followed by two audit events (`CERTIFICATE_ISSUED`, then
`ALUMNI_STATUS_ASSIGNED`) rather than one. The brief's own six-state
suggested machine places `CERTIFICATE_ISSUED` and `ALUMNI` as two
separate states, but does not describe any real-world scenario in which
an institution would want a Certificate issued *without* the recipient
also being considered an alumnus of that Program (or vice versa) — they
are two facets of the same institutional act (formal graduation
completion), not two independently-triggerable business events. Keeping
them as one function call also avoids a partial-completion failure mode
(a Certificate existing while the Student's Enrollment still reads
`"ACTIVE"`, or vice versa) that a two-step, two-permission-gated process
would have to reconcile.

## Remediation Loop

`RETURNED → SUBMITTED` reuses `submitForGraduationReview` itself (not a
separate "resubmit" function) — an `upsert` on the same
`(studentId, programId)` unique key, which clears `returnReason` and
refreshes `submittedById`/`submittedAt`. This is the same "resubmission
reuses the original submit path" shape already used by
`content-workflow.ts`'s `submitVersionForReview` (Milestone 14) and
`externship.ts`'s `submitCompletionForVerification` (Milestone 15) — no
new function was written to handle the return branch's forward edge.

## Current / Planned / Future

| Element | Status |
|---|---|
| `SUBMITTED → APPROVED → CERTIFICATE_ISSUED` primary path | **Implemented** |
| `RETURNED` remediation loop with required reason | **Implemented** |
| Live eligibility re-check at submission (fail-closed) | **Implemented** |
| Atomic Certificate issuance + Alumni transition | **Implemented** |
| Certificate revocation / re-issuance workflow | **Future** — `Certificate.status` field exists but no workflow built |

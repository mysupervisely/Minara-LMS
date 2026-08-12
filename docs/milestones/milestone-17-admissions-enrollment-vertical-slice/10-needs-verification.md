# ⚠️ Needs Verification

**Status:** Implemented
**Milestone:** 17 — Admissions & Enrollment Vertical Slice
**Date:** 2026-08-12

Every open question below is carried forward from
[Admissions Workflows](../milestone-3-student-journey-core-workflows/03-admissions-workflows.md)
(where most were already flagged before this milestone began) or
surfaced newly by this implementation. None are invented answers —
each is either left unresolved in the platform (defaulting to the safer,
narrower behavior) or explicitly deferred to Minara-Curriculum/
Minara-Master-Plan.

## Carried Forward from the Admissions Workflows Document

- **Reapplication policy after denial.** Not defined. This milestone
  does not build a reapplication-cooldown or reapplication-limit rule —
  a denied Applicant's `User` account still exists and nothing in this
  codebase prevents `startOrResumeApplication` from being called again
  for the same Program once the existing `Application` reaches a
  terminal state, but no dedicated "reapply" UI or policy exists either.
- **Exact Decision-authority split between Admissions Staff and Program
  Director.** This milestone resolved it narrowly and conservatively —
  Program Director is read-only everywhere in this slice (see
  [Admissions RBAC Design](./04-admissions-rbac-design.md)) — but the
  real institutional answer (join review? veto power? informational
  only?) is not confirmed against Minara-Master-Plan.
- **Deferral re-entry mechanics.** This milestone implements the
  simplest reading (`reopenForReview` sends a `DEFERRED` Application
  straight back to `UNDER_REVIEW`) — whether a deferred Applicant should
  instead be tied to a *specific* future Cohort/cycle, or require a new
  Application entirely, is not confirmed.
- **Whether an Applicant can apply to multiple Programs/Schools
  concurrently.** Not prevented by this schema (an `Application` is
  scoped to one `(applicantId, programId)` pair with no cross-Program
  uniqueness constraint), but no UI surfaces "apply to a second Program"
  either — untested territory.

## New to This Milestone

- **Real Pharmacy Technology admissions requirements** — no GPA,
  age, prerequisite course, background-check, immunization, residency,
  license, or standardized-test requirement is checked or invented
  anywhere. The starter checklist ("Supporting Documents,"
  "Program-Specific Requirements") is generic and staff-editable,
  explicitly not a real requirement list — see
  [Application Domain & Workflow](./03-application-domain-workflow.md).
- **Exact Admissions Staff scope.** [Multi-School and Multi-Program
  Access Model](../milestone-2-user-roles-permission-architecture/04-multi-school-multi-program-access-model.md)
  itself hedges with "potentially Admissions Staff" for institution-wide
  scope — not a confirmed final answer, just the existing fixed value
  this milestone chose to honor rather than redesign.
- **Cohort auto-assignment rules.** No automatic Cohort-capacity or
  eligibility rule exists; assignment is entirely manual, by Admissions
  Staff/Administrator judgment. Whether a real capacity limit should
  eventually block over-assignment is unconfirmed.
- **Whether a rejected/withdrawn Applicant's account should be
  deactivated or purged.** Neither happens in this slice — a denied or
  declined Applicant's `User` row and `Application` history remain
  exactly as they are, readable by that Applicant indefinitely (subject
  to this milestone's own access-control boundaries). No data-retention
  or deletion policy is implemented or assumed.

## Current / Planned / Future

| Item | Status |
|---|---|
| Reapplication policy | **⚠️ Needs Verification** — no rule built |
| Admissions Staff vs. Program Director decision authority | **⚠️ Needs Verification** — resolved narrowly (read-only PD) pending confirmation |
| Deferral re-entry mechanics | **⚠️ Needs Verification** — simplest reading implemented |
| Multi-Program concurrent application | **⚠️ Needs Verification** — not prevented, not built for |
| Real Pharmacy Technology requirements | **⚠️ Needs Verification** — pending Minara-Curriculum |
| Cohort capacity/auto-assignment | **⚠️ Needs Verification** — entirely manual today |
| Account retention/deactivation policy | **⚠️ Needs Verification** — no policy implemented |

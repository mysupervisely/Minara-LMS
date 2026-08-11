# Graduation Eligibility Design

**Status:** Implemented
**Milestone:** 16 — Certificate & Graduation Vertical Slice
**Date:** 2026-08-11
**Implementation:** `src/services/graduation/graduation.ts`'s `determineGraduationEligibility`

## Principle: Derived, Never Persisted

Eligibility is **never stored**. `determineGraduationEligibility(studentId, programId, actor)`
is a pure, read-only computation, re-run every time it's needed —
on the Student's own Graduation & Certificate page, on the Program
Director's Graduation Candidates screen, and again, freshly, at the
moment a Program Director attempts to submit a Graduation Request. This
directly follows this milestone's own instruction: *"The eligibility
result should be a derived determination wherever practical... Do not
store a second copy of grades or externship completion merely to
calculate eligibility."*

This is a step further than Milestone 15's `ExternshipEligibility`,
which persists a Coordinator's *judgment call* (there is no fact in the
database that says "eligible" — a human decided it). Graduation
eligibility has no equivalent judgment call to persist: every fact it
depends on (a Grade's approval status, a Lesson completion, a Placement's
verification) already exists and is itself the single source of truth.

## What It Checks

```
eligible = academicComplete AND (NOT externshipRequired OR externshipVerified)
```

### Academic completion

For every `CourseOffering` in the Student's `Cohort` (resolved via their
`Enrollment`), for every currently **published** Lesson and Assessment
in that Course:

- A `LessonCompletion` must exist for `(studentId, lesson.publishedVersionId)`.
- A `Submission` must exist for `(assessment.publishedVersionId, studentId)`, with a `Grade` whose `status === "APPROVED"`.

Only *published* content is checked — a Lesson/Assessment still in
Draft/Submitted/Approved-but-unpublished review is not part of the
delivered curriculum yet, so it is never counted as a requirement,
consistent with Milestone 14's versioning guarantee. A Program with
**zero** Course Offerings in the Student's Cohort is treated as **not**
academically complete (nothing to confirm) — not vacuously satisfied.

No GPA, minimum score, or credit-hour threshold is checked anywhere.
"Academic completion" means *the curriculum that was actually delivered
was actually completed and its Grade actually approved* — nothing more,
nothing invented.

### Externship completion (conditional)

Read directly from `Program.requiresExternship`. When `true`, eligibility
additionally requires a `Placement` for `(studentId, programId)` with
`completionStatus === "VERIFIED"` — the exact signal Milestone 15 built
and audits (`EXTERNSHIP_COMPLETION_VERIFIED`). No specific hour count,
evaluation score, or site requirement is checked — only whether the
Program Director already verified the completion through the Milestone
15 workflow.

## Fail-Closed by Construction

| Condition | Result |
|---|---|
| No `Enrollment` exists for `(studentId, programId)` | Not eligible — `missingRequirements: ["No Enrollment found..."]` |
| Zero Course Offerings in the Cohort | Not eligible — nothing to confirm |
| A Lesson/Assessment lacks a `LessonCompletion`/approved `Grade` | Not eligible — listed by Course title |
| `requiresExternship` and no `VERIFIED` Placement | Not eligible — explicit message |
| Any of the above cannot be positively confirmed | **Never** silently treated as met |

There is no code path in `determineGraduationEligibility` that returns
`eligible: true` by default, by omission, or by catching an error —
every `true` traces to a real, positively-confirmed row in the database.

## Extension Point (Explicitly Not Built)

The function returns a `missingRequirements: string[]` — human-readable,
not machine-typed per-requirement-kind. This is deliberate: this
milestone does not build a "Requirement" entity or a rules engine, per
its own "do not build a full graduation audit engine" exclusion. If a
future milestone needs to add a program-specific requirement (a minimum
GPA, a specific competency, a specific number of externship hours) that
Minara-Curriculum eventually makes authoritative, it can be added as one
more check inside this same function without redesigning its shape or
its callers — the function's signature and fail-closed contract do not
change.

## ⚠️ Needs Verification

- Specific Pharmacy Technology graduation requirements (minimum GPA,
  course list, specific competencies, specific evaluation scores) —
  still pending Minara-Curriculum, per ADR-008. None are checked here;
  none are invented.
- Whether a Program-level "minimum requirements" configuration should
  eventually exist as data (vs. remaining implicit in "every published
  Lesson/Assessment") — no such gap has been observed in practice yet
  (see the same reasoning Milestone 15's Course-level-versioning
  evaluation used to defer a similar question).

## Current / Planned / Future

| Element | Status |
|---|---|
| Derived academic-completion check | **Implemented** |
| Derived externship-completion check | **Implemented** |
| Fail-closed defaults | **Implemented** |
| Program-specific requirement configuration (GPA, hours, competencies) | **Future** — pending Minara-Curriculum |

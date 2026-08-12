# Enrollment Handoff

**Status:** Implemented
**Milestone:** 17 — Admissions & Enrollment Vertical Slice
**Date:** 2026-08-12

## Reuses, Never Duplicates, `createEnrollment`

`createEnrollmentFromApplication` (`src/services/admissions/admissions.ts`)
does not reimplement Enrollment creation — it calls the existing
`createEnrollment` (`src/services/enrollment/enrollment.ts`, unmodified
since Milestone 10) directly, which already:

- Creates the `Enrollment` row.
- Auto-grants the `STUDENT` Role Assignment if the User doesn't already
  hold one (emitting `ROLE_ASSIGNED`).
- Emits `ENROLLMENT_CREATED`.

`createEnrollmentFromApplication` then adds exactly two things on top:
a `sourceApplicationId` trace-back link, and the Application's own
`ENROLLED` transition — followed by its own
`ENROLLMENT_CREATED_FROM_APPLICATION` audit event, a distinct fact
layered on top of (never replacing) `ENROLLMENT_CREATED`, the same
"two complementary audit facts" pattern Milestone 14's
`VERSION_CREATED` alongside `LESSON_CREATED` already established.

## The Additive Schema Decision: `Enrollment.sourceApplicationId`

```prisma
model Enrollment {
  // ...unchanged fields...
  sourceApplicationId String?      @unique
  sourceApplication   Application? @relation(fields: [sourceApplicationId], references: [id])
}
```

Nullable, additive, unique. Nullable because most existing Enrollments
(every one created before this milestone, and every one an Administrator
still creates directly via the unchanged Milestone 10 path) have no
Application to trace back to — those keep working exactly as before,
with `sourceApplicationId: null`. Unique because an Application converts
to at most one Enrollment, ever — the same 1:1 invariant Milestone 16's
`Certificate.graduationRequestId` enforces at the database level.

This is the smallest possible schema footprint that answers "did this
Enrollment come from an Application, and if so, which one" — no
duplicate copy of the Application's own fields onto Enrollment, no
second identity, just a nullable foreign key.

## No Duplicate Identity

The Applicant's `User` row is the same row that becomes the enrolled
Student's `User` row — `createEnrollmentFromApplication` passes
`application.applicantId` directly as `createEnrollment`'s `studentId`.
There is no "convert Applicant record into Student record" step, no
data copy, no second row. `User → Applicant (no Role) → Student (STUDENT
Role, via Enrollment)` is the same identity moving through the same
table the whole way, exactly as this milestone's brief specified.

## Fail-Closed Ordering

`createEnrollmentFromApplication` refuses to run unless:

1. `Application.status === "ACCEPTANCE_CONFIRMED"` — an Applicant who
   never confirmed their offer (or was never Accepted at all) cannot be
   enrolled.
2. `Application.cohortId` is already set — enrollment cannot be created
   from an Application that has not yet been assigned a Cohort (Phase 8's
   "the minimum needed to enroll... into an available Cohort").

Both are independently tested (see
[Testing & Browser Verification](./09-testing-browser-verification.md)).

## Application History Preserved

Nothing about `createEnrollmentFromApplication` deletes or overwrites
the `Application` row — its `applicantNotes`, `decisionReason`,
`decidedById`/`decisionAt`, and full checklist remain exactly as they
were, now simply carrying `status: "ENROLLED"`. The Student's own
`/apply/[applicationId]` page continues to render this history
afterward — the admissions record and the academic record are two
distinct, both-preserved facts about the same person.

## Current / Planned / Future

| Element | Status |
|---|---|
| `createEnrollmentFromApplication` reusing `createEnrollment` | **Implemented** |
| `Enrollment.sourceApplicationId` (nullable, additive, unique) | **Implemented** |
| Fail-closed ordering (Confirmed status + Cohort assigned) | **Implemented** |
| Application history preserved post-Enrollment | **Implemented** |
| Itemized transcript/credit-hour import from Application | **Not built** — out of scope |

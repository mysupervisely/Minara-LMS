# Testing & Browser Verification

**Status:** Implemented
**Milestone:** 17 — Admissions & Enrollment Vertical Slice
**Date:** 2026-08-12

## New Test Suite — `tests/admissions-enrollment.test.ts`

24 tests, in the same shape and rigor as `tests/certificate-graduation.test.ts`
(Milestone 16): one full end-to-end integration test, plus focused tests
mapped to the brief's 26-point list.

| # | Requirement | Test |
|---|---|---|
| 1–3, 6, 9, 14–15, 17–22 | Full lifecycle: account → Draft → Submit → Review → Accept → Confirm → Cohort → Enrollment → full audit reconstruction | Main integration test |
| 2 | Draft can be saved | "2. saves a draft" |
| 3 | Application can be submitted | "3. submits a Draft Application" |
| 4 | A Submitted Application cannot be silently reverted | "4. a Submitted Application cannot be silently reverted by the Applicant" |
| 5 | Applicant can only see their own Application | "5. an Applicant can only see their own Application" |
| 7 | Cross-Program isolation | "7a. denies a Program Director viewing another Program's Applications"; "7b. Admissions Staff is institution-wide by design..." (documents the deliberate scope choice — see [RBAC Design](./04-admissions-rbac-design.md)) |
| 8 | Checklist never silently passes | "8. checklist items start as ⚠️ Needs Verification, never silently pass, and Decisions are not blocked by an incomplete checklist" |
| 9 | Authorized acceptance succeeds | Main integration test + "a Decision can only be recorded on an Application Under Review" |
| 10 | Unauthorized acceptance denied | "10. denies Faculty recording a Decision" |
| 11 | Denial succeeds | "11. denial succeeds" |
| 12 | Waitlist succeeds | "12. waitlist succeeds, and can be reopened for review" |
| 13 | Deferral succeeds | "13. deferral succeeds" |
| 14 | Decision reason/history preserved | Main integration test |
| 15 | Accepted applicant can confirm offer | Main integration test |
| 16 | Non-Accepted-Confirmed Application cannot be enrolled | "16. a non-Accepted-Confirmed Application cannot be enrolled" |
| 17–19 | Enrollment correctness, Student Role activation, User reuse | "17-19. enrollment is created only after the correct workflow, activates the Student Role, and reuses the existing User" |
| 21 | Cohort assignment works, gates Enrollment | "21. enrollment cannot be created from an Application with no Cohort assigned" |
| 22 | Audit trail reconstructs lifecycle | Main integration test |
| 23 | Applicant cannot self-accept | "23. an Applicant cannot self-accept their own Application" |
| 24 | Student cannot access someone else's Application | "24. a Student (with no relation to the Application) cannot access someone else's Application" |
| 25 | No hard-coded Pharmacy Technology admission rule | "25. never hard-codes the Pharmacy Technology program name anywhere in the admissions service" |
| 26 | Existing Milestones 15/16 behavior intact | "26. leaves Milestones 15/16's existing externship/graduation behavior intact" |

Additional tests beyond the 26-point list: fail-closed for a
Role-less/unrelated User; a full "decline the offer" path; an Applicant
cannot self-enroll even after confirming their own offer;
`registerApplicant` refuses a duplicate email.

## Security / Data-Isolation Verification

| Boundary | Result |
|---|---|
| Applicant can only see/edit own Draft | ✅ Verified |
| Applicant cannot view another Applicant's Application | ✅ Denied |
| Applicant cannot record a Decision, even on their own Application | ✅ Denied |
| Applicant cannot self-enroll, even after confirming the offer | ✅ Denied |
| Admissions Staff sees every Program's Applications (by design) | ✅ Verified |
| Program Director denied another Program's Applications | ✅ Denied |
| Faculty cannot record a Decision | ✅ Denied |
| Student (unrelated) cannot access someone else's Application | ✅ Denied |
| Role-less/unrelated User denied at the service layer | ✅ Denied |

All enforced inside `src/services/admissions/admissions.ts` itself, not
only in `actions.ts` — consistent with the service-layer authorization
pattern established in Milestone 15/16.

## Full Suite Regression

```
Test Files  14 passed (14)
     Tests  132 passed (132)
```

Up from 108 passing tests pre-Milestone-17 (132 total including this
milestone's 24 new tests). Run via `npm test` (which correctly points
`DATABASE_URL` at the dedicated `test.db`, per `package.json`'s
`pretest`/`test` scripts) — no existing test file was modified in a way
that changes its assertions; `tests/helpers/reset-db.ts` and
`tests/helpers/fixtures.ts` were extended, not rewritten.

## TypeScript

```
npx tsc --noEmit
```
Zero errors.

## ESLint

```
npm run lint
```
Zero errors, zero warnings.

## Production Build

```
npm run build
```
Succeeded. All eight new routes appear in the route manifest. One route
naming conflict was discovered and resolved during development — the
initial public route `apply/[slug]` collided with the portal route
`apply/[applicationId]` (both resolve to `/apply/[*]` once Next.js's
route groups are stripped from the URL); the public route was moved to
`apply/program/[slug]` to disambiguate. No functional impact — this is
purely a route-naming fix, not a design change.

## Database Migration

```
npx prisma migrate deploy
```
Applied cleanly against the real, already-seeded `dev.db`. Verified via
direct query before/after: all pre-existing rows preserved; the schema
was then re-verified with a full fresh reseed producing the expected
12-account demo dataset (5 staff/faculty roles, Sam Student, Gina
Graduate/Alumni, and 5 Applicants spanning Draft/Under-Review/Accepted/
Waitlisted/Enrolled).

## Browser Verification (Playwright)

A full 18-step multi-role journey was run against the dev server with
freshly seeded data, using the same `pollForText`/href-extraction
navigation pattern established in Milestones 15/16's browser
verification:

1. Visits the public Program page.
2. Follows "Apply" into the account-creation flow.
3. Creates an account and lands on a Draft Application.
4. Saves a Draft note.
5. Submits the Application; status becomes `SUBMITTED`.
6. Admissions Staff sees the submitted Application in the queue.
7. Opens the Application detail.
8. Moves the Application into `UNDER_REVIEW`.
9. Records an `ACCEPTED` Decision.
10. Applicant sees the Accepted status.
11. Applicant confirms the offer (`ACCEPTANCE_CONFIRMED`).
12. Admissions Staff assigns a Cohort.
13. Admissions Staff completes Enrollment.
14. The new Student is routed into the authenticated portal after login.
15. Student Portal shows the correct Program and Cohort.
16. Administrator reconstructs the full lifecycle from the Audit Log
    (all 7 key admissions/enrollment actions present).
17. **Waitlist path** — the pre-seeded Wes Waitlisted's `WAITLISTED`
    Application is visible in the Admissions queue.
18. **Unauthorized cross-role path** — a Program Director attempting to
    reach `/admissions` is redirected away, never shown the page.

All 18 steps passed. Two bugs were found and fixed during this pass (not
present in the final code): `createEnrollmentFromApplication` initially
returned the pre-update `Enrollment` object rather than the one carrying
the just-set `sourceApplicationId`; the smoke test's own `login` helper
initially reused the seeded-demo password constant for every login,
including the freshly self-registered Applicant's actually-different
password.

## Current / Planned / Future

| Element | Status |
|---|---|
| 24-test dedicated suite covering the brief's 26-point list | **Implemented** |
| Full-suite regression (132/132) | **Verified** |
| TypeScript, ESLint, production build | **Verified clean** |
| Migration against real seeded data | **Verified, zero data loss** |
| Browser smoke test — 18 steps, multi-role, waitlist path, unauthorized path | **Verified** |

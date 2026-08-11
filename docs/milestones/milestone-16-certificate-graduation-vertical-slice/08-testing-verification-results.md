# Testing & Verification Results

**Status:** Implemented
**Milestone:** 16 — Certificate & Graduation Vertical Slice
**Date:** 2026-08-11

## New Test Suite — `tests/certificate-graduation.test.ts`

19 tests, in the same shape and rigor as
`tests/externship-management.test.ts` (Milestone 15) and
`tests/content-versioning.test.ts` (Milestone 14): one full
end-to-end integration test, plus focused tests for every point the
brief's 20-point list named explicitly. (Point count exceeds test count
because the main integration test alone covers 11 of the 20 numbered
points in a single, fully-reconstructable run — its inline comments map
each assertion back to its point number.)

| # | Requirement | Test |
|---|---|---|
| 1–4, 11 | Full lifecycle: eligibility → submission → approval → issuance → Alumni → full audit reconstruction | Main integration test |
| 1 | Not eligible without required academic work | "1. is NOT eligible when the Student has not completed required academic work" |
| 2 | Not eligible without Verified externship (when required) | "2. is NOT eligible when the Program requires an externship and it has not been Verified" |
| 3 | Externship gate passes once Verified | "3. the externship gate passes once the externship completion is Verified" |
| 4 | Eligible once every requirement is met | "4. is eligible once every requirement is satisfied" |
| 5 | Submission refused for an ineligible Student | "5. refuses to submit a Graduation Request for a Student who is not eligible" |
| 6 | Program Director reviews within their own Program | "6. lets a Program Director review authorized Students within their own Program" |
| 7 | Program Director denied another Program's Student | "7. denies a Program Director reviewing another Program's Student" |
| 8 | Faculty cannot approve graduation | "8. denies Faculty approving graduation" |
| 9 | Clinical Coordinator cannot issue certificates | "9. denies a Clinical Coordinator issuing certificates" |
| 10 | Certificate cannot be issued before Approval | "10. refuses to issue a Certificate before the Graduation Request is Approved" |
| 11–12 | Administrator issues after approval, correct audit event | "11-12. lets the Administrator issue a Certificate after approval, with the correct audit event" |
| 14 | Student sees their own certificate | "14. lets a Student see their own certificate" |
| 15 | One Student can never see another Student's certificate | "15. never lets one Student see another Student's certificate" |
| 16 | Return preserves reason; resubmission works | "16. preserves the reason on a returned Graduation Request review" |
| 18 | No hard-coded Pharmacy Technology program name anywhere in the service | "18. never hard-codes the Pharmacy Technology program name anywhere in the graduation service" |
| 19, 19b | Fails closed with no Enrollment, and for a Role-less User | "19. fails closed when there is no Enrollment to evaluate at all"; "19b. fails closed for a User with no relevant Role Assignment at all" |
| 20 | Milestone 15's externship behavior unaffected | "20. leaves Milestone 15's existing externship behavior intact" |

Point 13 and 17 (institutional issuance authority; Program-scoped
approval authority) are exercised implicitly across the main integration
test and the RBAC block above rather than as separately-numbered tests,
since they are the same authority checks points 6, 7, 9, and 11–12 already
isolate individually.

## Security / Data-Isolation Verification

Every boundary the brief named explicitly is covered by a passing test:

| Boundary | Result |
|---|---|
| Student cannot see another Student's certificate | ✅ Denied — `GraduationAuthorizationError` |
| Program Director cannot approve outside their own Program | ✅ Denied |
| Clinical Coordinator cannot issue certificates | ✅ Denied |
| Faculty cannot approve graduation | ✅ Denied |
| Unauthorized/Role-less User denied at the service layer | ✅ Denied — fails closed, not merely hidden by portal navigation |

All five are enforced inside `src/services/graduation/graduation.ts`
itself (not only in `actions.ts`), consistent with the service-layer
authorization pattern established in Milestone 15.

## Full Suite Regression

```
Test Files  13 passed (13)
     Tests  106 passed (106)
  Duration  193.29s
```

Up from 87 passing tests pre-Milestone-16 (106 total including this
milestone's 19 new tests). No existing test was modified in a way that
changes its assertions — `tests/helpers/reset-db.ts` and
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
Zero errors, zero warnings. (One `react/no-unescaped-entities` violation
was found and fixed during development — see
[Implementation Completion Record](./07-implementation-completion-record.md).)

## Production Build

```
npm run build
```
Succeeded. All five new routes appear in the route manifest:
`/admin/graduation`, `/admin/graduation/[requestId]`,
`/program-director/graduation`, `/program-director/graduation/[requestId]`,
`/student/graduation` — alongside every pre-existing Milestone 10–15
route, unchanged.

## Database Migration

```
npx prisma migrate deploy
```
Applied cleanly against the real, already-seeded `dev.db`. Verified via
direct query before/after: all pre-existing rows (Users, Placements, and
every other table) present and unchanged; the two new tables
(`graduation_requests`, `certificates`) empty until `prisma/seed.ts`'s
new Milestone 16 section populated them for the demo Student "Gina
Graduate."

## Browser Verification (Playwright)

A full multi-role journey was run against the dev server with seeded
data, using the same `pollForText`/`gotoLinkByText` helper pattern
established in Milestone 15's browser verification (necessary because
Next.js Server Action revalidation and this environment's Link-click
behavior are both asynchronous/unreliable to check with one-shot
assertions):

1. Admin confirms role assignments (Program Director, Clinical
   Coordinator, Administrator) are in place.
2. Student ("Gina Graduate," seeded already at the graduation-ready
   point) is confirmed to have completed all academic work.
3. Externship completion is confirmed `VERIFIED` (Milestone 15's own
   workflow, unmodified).
4. Student's `/student/graduation` page shows eligible status with all
   requirements met.
5. Program Director's `/program-director/graduation` shows the Student
   as an eligible candidate.
6. Program Director submits for review; status becomes `SUBMITTED`.
7. Program Director approves from the candidate detail page; status
   becomes `APPROVED`.
8. Administrator's `/admin/graduation` shows the request in "Awaiting
   Issuance."
9. Administrator issues the Certificate; status becomes
   `CERTIFICATE_ISSUED`, credential number displayed.
10. Student's `/student/graduation` now shows the ALUMNI badge and the
    issued Certificate's details.

**Failure path:** an attempt to submit a Student for graduation review
before their externship completion was Verified was confirmed to be
rejected with the expected eligibility error message, and no
`GraduationRequest` row was created for that attempt — verified both in
the UI and by direct database query.

All 10 steps, plus the failure path, passed.

## Current / Planned / Future

| Element | Status |
|---|---|
| 19-test dedicated suite covering the brief's 20-point list | **Implemented** |
| Full-suite regression (106/106) | **Verified** |
| TypeScript, ESLint, production build | **Verified clean** |
| Migration against real seeded data | **Verified, zero data loss** |
| Browser smoke test, multi-role + failure path | **Verified** |

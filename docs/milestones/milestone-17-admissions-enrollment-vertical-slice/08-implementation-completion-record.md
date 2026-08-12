# Implementation Completion Record

**Status:** Implemented
**Milestone:** 17 — Admissions & Enrollment Vertical Slice
**Date:** 2026-08-12

## Files Created

| File | Purpose |
|---|---|
| `prisma/migrations/20260812021619_m17_admissions_enrollment/migration.sql` | Additive migration — `applications`, `application_requirements` tables, `enrollments.sourceApplicationId` |
| `src/services/admissions/admissions.ts` | The entire Admissions bounded context |
| `src/app/(public)/apply/program/[slug]/page.tsx`, `actions.ts`, `register-form.tsx` | Public Apply entry point + self-service account creation |
| `src/app/(portal)/apply/page.tsx`, `[applicationId]/page.tsx`, `draft-form.tsx`, `actions.ts` | Applicant's own authenticated Application view |
| `src/app/(portal)/admissions/page.tsx`, `applications/page.tsx`, `applications/[applicationId]/page.tsx`, `applications/[applicationId]/application-forms.tsx`, `requirements/page.tsx`, `actions.ts` | Admissions Staff portal |
| `src/app/(portal)/program-director/admissions/page.tsx` | Program Director's read-only admissions view |
| `tests/admissions-enrollment.test.ts` | 24-test integration suite (see [Testing & Browser Verification](./09-testing-browser-verification.md)) |
| `docs/milestones/milestone-17-admissions-enrollment-vertical-slice/` (11 documents) | This documentation package |

## Files Modified

| File | Change |
|---|---|
| `prisma/schema.prisma` | Added `Application`, `ApplicationRequirement` models; added `sourceApplicationId` to `Enrollment`; added back-relations on `User`/`Program`/`Cohort` |
| `src/domain/roles.ts` | Added `ADMISSIONS_STAFF` to `IMPLEMENTED_ROLES`; repointed `ROLE_HOME_ROUTE.ADMISSIONS_STAFF` from `/admin` to `/admissions` |
| `src/services/identity/users.ts` | Added `registerApplicant` (the one self-service exception) and `EmailAlreadyRegisteredError`; updated module comment |
| `src/services/identity/authorization.ts` | `resolveHomeRoute`'s no-Role fallback changed from `/login` to `/apply` (see "Architectural Decisions Discovered" below) |
| `src/services/audit/audit.ts` | Extended `AuditAction` with 11 admissions/enrollment actions |
| `src/app/(portal)/layout.tsx` | Added "Admissions" nav section (ADMISSIONS_STAFF), "Admissions (View Only)" link (Program Director), "Admissions" link (Administrator), and an "Applicant" nav section shown only when a User holds zero Roles |
| `src/app/(portal)/admin/page.tsx` | Added "Applications Awaiting Admissions" stat card |
| `src/app/(portal)/admin/users/page.tsx` | Updated comment — Admissions Staff no longer listed as portal-less |
| `src/app/(public)/programs/[slug]/page.tsx` | Split the single "Apply / Log In" button into separate "Apply" (`/apply/program/[slug]`) and "Log In" buttons |
| `tests/helpers/fixtures.ts` | Added `buildAdmissionsScenario`, `startApplicationFor` |
| `tests/helpers/reset-db.ts` | Added `application`/`applicationRequirement` cleanup (before `enrollment`'s existing cleanup is too late — see the file's own inline comment on ordering) |

## Database Changes

Purely additive — two new tables, one new nullable+unique column on an
existing table, no columns altered or dropped:

- `applications` (`Application`): `applicantId`, `programId`, `status`,
  `applicantNotes`, `decisionReason`, `submittedAt`, `decisionAt`,
  `decidedById`, `cohortId`, timestamps.
- `application_requirements` (`ApplicationRequirement`): `applicationId`
  (cascade delete), `label`, `status`, `note`, `updatedById`, timestamps.
- `enrollments.sourceApplicationId` (nullable, unique FK to
  `applications.id`).

Verified against the real seeded `dev.db`: applied via `prisma migrate
deploy`, confirmed zero data loss (all pre-existing rows across every
table — Users, Enrollments, Certificates, GraduationRequests, Placements
— preserved after migration; re-verified with a full fresh reseed
producing the expected demo dataset).

## Services Added / Modified

- **Added:** `src/services/admissions/admissions.ts` — the entire
  Admissions bounded context (see
  [Application Domain & Workflow](./03-application-domain-workflow.md),
  [Admissions RBAC Design](./04-admissions-rbac-design.md), and
  [Enrollment Handoff](./07-enrollment-handoff.md)). Imports Role/Scope
  predicates from `src/services/identity/rbac.ts` directly, following
  Milestone 15/16's precedent (never `authorization.ts`, avoiding that
  earlier milestone's `prisma/seed.ts`-breaking import issue).
- **Modified:** `src/services/identity/users.ts` (added
  `registerApplicant`), `src/services/audit/audit.ts` (extended),
  `src/services/identity/authorization.ts` (`resolveHomeRoute` fallback).
- **Unmodified:** `src/services/enrollment/enrollment.ts` — read and
  called, never rewritten. Every other service (`gradebook.ts`,
  `externship.ts`, `graduation.ts`, `content-workflow.ts`) is untouched.

## Routes Added

| Route | Audience |
|---|---|
| `/apply/program/[slug]` | Public |
| `/apply` | Any authenticated User (including zero-Role) |
| `/apply/[applicationId]` | Any authenticated User (including zero-Role), narrowed to the Application's own Applicant |
| `/admissions` | Admissions Staff |
| `/admissions/applications` | Admissions Staff |
| `/admissions/applications/[applicationId]` | Admissions Staff |
| `/admissions/requirements` | Admissions Staff |
| `/program-director/admissions` | Program Director |

All eight appear in the production build's route manifest (see
[Testing & Browser Verification](./09-testing-browser-verification.md)).

## RBAC Changes

`ADMISSIONS_STAFF` activated (no new role declared). Per-role authority
detailed in [Admissions RBAC Design](./04-admissions-rbac-design.md).
`EMPLOYER_PARTNER` remains dormant, untouched.

## Audit Actions Added

`APPLICATION_CREATED`, `APPLICATION_SUBMITTED`,
`APPLICATION_REVIEW_STARTED`, `APPLICATION_REOPENED_FOR_REVIEW`,
`REQUIREMENT_UPDATED`, `APPLICATION_ACCEPTED`, `APPLICATION_DENIED`,
`APPLICATION_WAITLISTED`, `APPLICATION_DEFERRED`,
`APPLICATION_COHORT_ASSIGNED`, `OFFER_CONFIRMED`, `OFFER_DECLINED`,
`ENROLLMENT_CREATED_FROM_APPLICATION` — 13 actions appended to the single
existing `AuditAction` union. No second audit table or system.
(`APPLICATION_REOPENED_FOR_REVIEW` and `APPLICATION_COHORT_ASSIGNED`
were added beyond the brief's own "possible actions" list because Phase
3's reopen-for-review transition and Phase 8's Cohort assignment are
each independently consequential and needed their own attributable
event — the brief's list was explicitly described as "likely," not
exhaustive.)

## Architectural Decisions Discovered

Three implementation-level decisions were made that are worth recording,
but none meets this project's ADR threshold (expensive to reverse,
cross-cutting across bounded contexts, foundational, or likely to shape
future architecture) — **No new ADR required.**

1. **Self-service account creation, scoped only to `/apply`.**
   `registerApplicant` is the first public, unauthenticated
   account-creation path in this codebase. It is narrowly scoped (grants
   no Role, only usable through the Apply flow) and easily reversible
   (removing the one call site returns the codebase to fully
   Administrator-provisioned accounts) — an implementation choice this
   milestone's own brief directly requested ("Create an account or sign
   in"), not a new identity-architecture decision. Every other account
   type (Faculty, Program Director, Administrator, Clinical Coordinator,
   Admissions Staff) remains Administrator-provisioned, unchanged.
2. **`resolveHomeRoute`'s no-Role fallback changed from `/login` to
   `/apply`.** Before this milestone, every User had at least one Role
   Assignment from the moment of creation (Administrator-provisioned),
   so `resolveHomeRoute`'s `!primary` branch was dead code in practice.
   Self-service registration makes a zero-Role User a real, common case
   — the fallback needed a real destination. This is a one-line,
   backward-compatible change (every pre-existing account still resolves
   via its first Role exactly as before) to a shared utility, not a
   redesign of the authentication/authorization flow.
3. **`ADMISSIONS_STAFF`'s institution-wide scope honored, not
   redesigned, despite the brief's "cross-program access denied"
   framing.** See
   [Admissions RBAC Design §Why Admissions Staff Is Institution-Wide](./04-admissions-rbac-design.md#why-admissions-staff-is-institution-wide-not-program-scoped)
   for the full reasoning — this is a disclosed interpretation choice
   (honoring Milestone 10's own fixed `ROLE_SCOPE`, applying the
   isolation test to the role that is genuinely Program-scoped instead),
   not a new architectural commitment.

## Files NOT Modified (by design)

`src/services/enrollment/enrollment.ts`, `src/services/gradebook/gradebook.ts`,
`src/services/externship/externship.ts`, `src/services/graduation/graduation.ts`,
`src/services/academic/*`, and every Milestone 10–16 portal page outside
the files listed above — all read where relevant, none rewritten, per
this milestone's "do not recreate or redesign existing architecture"
instruction.

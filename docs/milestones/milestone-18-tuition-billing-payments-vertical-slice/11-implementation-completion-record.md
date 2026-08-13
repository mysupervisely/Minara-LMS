# Implementation Completion Record

**Status:** Implemented
**Milestone:** 18 — Tuition, Billing & Payments Vertical Slice
**Date:** 2026-08-13

## Files Created

| File | Purpose |
|---|---|
| `prisma/migrations/20260813184701_m18_tuition_billing_payments/migration.sql` | Additive migration — `tuition_configurations`, `student_charges`, `payments` tables |
| `src/services/billing/billing.ts` | The entire Billing bounded context |
| `src/services/billing/payment-provider.ts` | `PaymentProviderAdapter` interface + `MockPaymentProvider` |
| `src/lib/money.ts` | Shared `formatCents` helper |
| `src/app/(portal)/student/billing/page.tsx`, `actions.ts` | Student Billing & Payments |
| `src/app/(portal)/admin/billing/page.tsx`, `actions.ts` | Administrator Billing & Tuition |
| `src/app/pay/[sessionId]/page.tsx`, `actions.ts` | Simulated hosted-checkout page |
| `src/app/api/webhooks/payments/route.ts` | The real webhook Route Handler |
| `tests/tuition-payments.test.ts` | 19-test integration suite (see [Testing & Browser Verification](./12-testing-browser-verification.md)) |
| `docs/milestones/milestone-18-tuition-billing-payments-vertical-slice/` (14 documents) | This documentation package |

## Files Modified

| File | Change |
|---|---|
| `prisma/schema.prisma` | Added `TuitionConfiguration`, `StudentCharge`, `Payment` models and their relations on `User`/`Program`/`Cohort`/`Enrollment` |
| `.env.example` | Added `PAYMENT_WEBHOOK_SECRET` placeholder (`.env` itself, gitignored, given a local dev-only value) |
| `src/services/audit/audit.ts` | Extended `AuditAction` with 7 billing actions |
| `src/services/admissions/admissions.ts` | `createEnrollmentFromApplication` now calls `createChargeForEnrollment` after creating the Enrollment |
| `src/services/graduation/graduation.ts` | `determineGraduationEligibility` reads real Financial Clearance instead of a hard-coded placeholder — see [Graduation Integration](./07-graduation-integration.md) |
| `src/app/(portal)/layout.tsx` | Added "Billing & Payments" (Student) and "Billing & Tuition" (Administrator) nav links |
| `src/app/(portal)/admin/page.tsx` | Added "Charges With Outstanding Balance" stat card |
| `prisma/seed.ts` | Configures tuition for the Fall 2026 Cohort (after Owen's Milestone 17 enrollment, so Owen deliberately demonstrates the `NEEDS_VERIFICATION` no-charge case); adds Beth Balance (Scenario A — unpaid) and Paula Paid (Scenario B — paid in full) |
| `tests/helpers/fixtures.ts` | Added `configureTuitionForScenario`, `buildEnrolledApplicant`, `completeAcademicWorkForStudent` |
| `tests/helpers/reset-db.ts` | Added `payment`/`studentCharge`/`tuitionConfiguration` cleanup (before `enrollment`'s existing cleanup, matching the file's established ordering discipline) |

## Database Changes

Purely additive — three new tables, no columns altered or dropped on any
existing table:

- `tuition_configurations` (`TuitionConfiguration`): `cohortId` (unique),
  `amountCents`, `currency`, `description`, `createdById`, timestamps.
- `student_charges` (`StudentCharge`): `enrollmentId`+`category` (unique
  together), `studentId`, `programId`, `description`, `amountCents`,
  `currency`, `createdAt`.
- `payments` (`Payment`): `chargeId`, `studentId`, `amountCents`,
  `currency`, `status`, `provider`, `providerSessionId` (unique),
  `providerEventId` (unique), `initiatedById`, `createdAt`,
  `confirmedAt`.

Verified against the real seeded `dev.db`: applied via `prisma migrate
deploy`, confirmed zero data loss (all pre-existing rows — 13 Users, 4
Enrollments, 6 Applications, 1 Certificate — preserved after migration);
re-verified with a full fresh reseed producing the expected demo dataset
including the new financial-clearance scenarios.

## Services Added / Modified

- **Added:** `src/services/billing/billing.ts` (the entire Billing
  bounded context — see
  [Tuition Configuration Design](./03-tuition-configuration-design.md),
  [Charge/Payment Domain Design](./04-charge-payment-domain-design.md),
  and [Financial-Clearance Design](./06-financial-clearance-design.md))
  and `src/services/billing/payment-provider.ts` (see
  [Payment-Provider Architecture](./05-payment-provider-architecture.md)).
  Both import Role/Scope predicates from `src/services/identity/rbac.ts`
  directly, following Milestone 15/16/17's precedent (never
  `authorization.ts`, avoiding that earlier milestone's
  `prisma/seed.ts`-breaking import issue).
- **Modified:** `src/services/admissions/admissions.ts` (one new call),
  `src/services/graduation/graduation.ts` (see
  [Graduation Integration](./07-graduation-integration.md)),
  `src/services/audit/audit.ts` (extended).
- **Unmodified:** `src/services/enrollment/enrollment.ts` — the
  Milestone 10 `createEnrollment` function is never called by, or
  touched from, this milestone's billing code. Every other service
  (`gradebook.ts`, `externship.ts`, `content-workflow.ts`) is untouched.

## Routes Added

| Route | Audience |
|---|---|
| `/student/billing` | Student |
| `/admin/billing` | Administrator |
| `/pay/[sessionId]` | Public (unauthenticated, simulating an external provider page) |
| `POST /api/webhooks/payments` | Payment provider (server-to-server) |

All four appear in the production build's route manifest (see
[Testing & Browser Verification](./12-testing-browser-verification.md)).

## RBAC Changes

**None.** No new role was declared or activated. All authority uses the
existing six roles. See
[Security & RBAC](./09-security-rbac.md#per-role-authority-table) for
the full authority table.

## Audit Actions Added

`TUITION_CONFIGURED`, `STUDENT_CHARGE_CREATED`, `PAYMENT_STARTED`,
`PAYMENT_CONFIRMED`, `PAYMENT_FAILED`, `PAYMENT_REFUNDED`,
`FINANCIAL_CLEARANCE_CHANGED` — appended to the single existing
`AuditAction` union. No second audit table or system.

## Architectural Decisions Discovered

Two implementation-level decisions were made that are worth recording,
but neither meets this project's ADR threshold (expensive to reverse,
cross-cutting across bounded contexts, foundational, or likely to shape
future architecture) — **No new ADR required.**

1. **`NEEDS_VERIFICATION` financial clearance does not gate graduation
   eligibility; only a real, positive `FAILED` balance does.** Fully
   explained in [Financial-Clearance Design](./06-financial-clearance-design.md#why-needs_verification-does-not-block-but-failed-does)
   — a disclosed, regression-safety-motivated design choice, reversible
   by changing one boolean expression, not a new institutional policy.
2. **Charge creation is hooked into `admissions.ts`'s
   `createEnrollmentFromApplication` only, not the shared Milestone 10
   `createEnrollment`.** This means an Enrollment created directly by an
   Administrator (the original Milestone 10 path, still supported and
   unchanged) never gets a Charge automatically. This follows this
   milestone's own explicit Section 3 framing ("through the existing
   Milestone 17 flow") and keeps Milestone 10's foundational function
   completely untouched — a scoping choice, not an architectural
   commitment, and easily extended later (adding the same hook to
   `createEnrollment` itself) if institutional policy requires it.

## Files NOT Modified (by design)

`src/services/enrollment/enrollment.ts`, `src/services/gradebook/gradebook.ts`,
`src/services/externship/externship.ts`, `src/domain/roles.ts`, and
every Milestone 10–17 portal page outside the files listed above — all
read where relevant, none rewritten, per this milestone's "do not
recreate existing functionality or redesign established architecture"
instruction.

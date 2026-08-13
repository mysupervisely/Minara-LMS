# Testing & Browser Verification

**Status:** Implemented
**Milestone:** 18 — Tuition, Billing & Payments Vertical Slice
**Date:** 2026-08-13

## New Test Suite — `tests/tuition-payments.test.ts`

19 tests, in the same shape and rigor as
`tests/tuition-payments.test.ts`'s predecessors (`tests/admissions-enrollment.test.ts`,
`tests/certificate-graduation.test.ts`): one full end-to-end integration
test walking Charge → Payment → Balance → Financial Clearance →
Graduation → Certificate, fully reconstructed from the Audit Log at the
end, plus focused tests mapped to the brief's 25-point list.

| # | Requirement | Test |
|---|---|---|
| 1, 4, 9, 10, 13–15, 17, 19–22 | Full lifecycle: Charge → Payment → Balance → Clearance → Graduation → Certificate → full audit reconstruction | Main integration test |
| 2 | Duplicate enrollment does not duplicate the Charge | "2. does not duplicate a Charge when the enrollment hook runs twice" |
| 3 | Charge preserves the historical tuition amount | "3. preserves the historical tuition amount even after the Cohort's rate later changes" |
| 5 | Student cannot see another Student's financial record | "5. a Student cannot see another Student's financial record" |
| 6 | Faculty denied | "6. denies Faculty" |
| 7 | Clinical Coordinator denied | "7. denies a Clinical Coordinator" |
| 8 | Unauthorized user denied | "8. fails closed for a User with no relevant Role Assignment at all" |
| 11 | Duplicate provider confirmation is idempotent | Main integration test + "11. a second, distinct webhook event for an already-resolved Payment is also treated as idempotent" |
| 12 | Failed payment does not reduce balance | "12. a failed payment does not reduce the balance" |
| 16 | Financial clearance fails when balance > 0 | Main integration test (asserted before payment) |
| 18 | Program Director sees only the appropriate (status-only) clearance state | "18. Program Director sees only the status-only clearance signal, never a raw dollar amount..." |
| 23 | Payment secret/data boundaries hold | "23. a webhook payload with an invalid signature is rejected outright"; "23. the public checkout view never exposes the Student's identity" |
| 24 | No hard-coded Pharmacy Technology tuition | "24. never hard-codes the Pharmacy Technology program name anywhere in the billing service" |
| 25 | Existing Milestones 10–17 behavior remains intact | "25. leaves Milestones 15/16/17's existing behavior intact for a Student never touched by billing" |

Additional tests beyond the 25-point list: Admissions Staff has no
financial-management authority; a Payment cannot be started once the
balance is already zero; a Student cannot start a payment against
another Student's Charge; no Charge is created when the Cohort has no
`TuitionConfiguration`.

## Security / Data-Isolation Verification

| Boundary | Result |
|---|---|
| Student cannot see another Student's financial record | ✅ Denied |
| Faculty denied | ✅ Denied |
| Clinical Coordinator denied | ✅ Denied |
| Admissions Staff denied (no financial-management authority) | ✅ Denied |
| Role-less/unrelated User denied | ✅ Denied |
| Program Director sees status-only, never a raw amount | ✅ Verified (structural assertion — `balanceCents`/`payments` absent from the row it reads) |
| Webhook with an invalid signature is rejected | ✅ Rejected, Payment unchanged |
| Public checkout view exposes no Student identity | ✅ Verified (exact key-set assertion) |

All enforced inside `src/services/billing/billing.ts` itself, not only
in `actions.ts` — consistent with the service-layer authorization
pattern established in Milestone 15/16/17.

## Full Suite Regression

```
Test Files  15 passed (15)
     Tests  151 passed (151)
```

Up from 132 passing tests pre-Milestone-18 (151 total including this
milestone's 19 new tests). Run via `npm test` (which correctly points
`DATABASE_URL` at the dedicated `test.db`, per `package.json`'s
`pretest`/`test` scripts) — run in isolation, not concurrently with a
production build (a transient SQLite resource-contention failure was
observed once when the two were run simultaneously in this sandboxed
environment; re-run alone, the suite passed cleanly, and the reset-db.ts
foreign-key ordering was independently re-verified by inspection to be
correct). No existing test file was modified in a way that changes its
assertions.

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
Succeeded. All four new routes appear in the route manifest:
`/student/billing`, `/admin/billing`, `/pay/[sessionId]`,
`/api/webhooks/payments` — alongside every pre-existing Milestone 10–17
route, unchanged. No route-naming collisions (the root-level `/pay/*`
route sits outside both existing route groups).

## Database Migration

```
npx prisma migrate deploy
```
Applied cleanly against the real, already-seeded `dev.db`. Verified via
direct query before/after: all pre-existing rows preserved; the schema
was then re-verified with a full fresh reseed producing the expected
demo dataset, and `determineFinancialClearance` was queried directly
against the freshly seeded data to confirm all three states appear
correctly (Owen Onboarded: `NEEDS_VERIFICATION`; Beth Balance: `FAILED`;
Paula Paid: `PASSED`).

## Browser Verification (Playwright)

A full 16-step multi-role journey was run against the dev server with
freshly seeded data, using the same `pollForText`/href-extraction
navigation pattern established in Milestones 15–17's browser
verification:

1. Creates an account and lands on a Draft Application (via the public
   Apply flow).
2. Submits the Application.
3. Admissions Staff moves it into review and accepts it.
4. Applicant confirms the offer.
5. Admissions Staff assigns the Fall 2026 Cohort (tuition-configured)
   and completes Enrollment — triggering the tuition Charge.
6. Student sees the tuition Charge and outstanding balance
   ($5,000.00).
7. Student clicks "Pay Now" and is redirected to the simulated
   hosted-checkout page.
8. Completes the test payment — the checkout page shows "Payment
   confirmed."
9. Student sees a zero balance and a receipt in Payment History.
10. Financial Clearance reads `PASSED` on the Graduation page.
11. **Unpaid Student remains blocked** — the pre-seeded Beth Balance's
    Graduation page reads Financial Clearance `FAILED`.
12. **Unauthorized user cannot access financial records** — Faculty
    attempting to reach `/admin/billing` is redirected away.
13. Administrator sees the Student's Charge/Payment on `/admin/billing`.
14. Administrator reconstructs the financial lifecycle from the Audit
    Log (`STUDENT_CHARGE_CREATED`, `PAYMENT_STARTED`,
    `PAYMENT_CONFIRMED`, `FINANCIAL_CLEARANCE_CHANGED` all present).
15. **Duplicate payment confirmation over real HTTP** — a second,
    distinct signed webhook event for the same (already-resolved)
    session, POSTed directly to `/api/webhooks/payments`, returns
    `idempotent: true`.
16. Exactly one Payment row exists in the Student's Payment History
    after the duplicate webhook.

All 16 steps passed. Two bugs were found and fixed during this pass (not
present in the final code): the smoke test's own premature URL check
after clicking "Pay Now" (before the Server Action's redirect
completed) produced a false-negative on step 7 in an earlier attempt —
replaced with a short polling loop; and a naive substring-count
assertion for the final duplicate-payment check was replaced with a
structural row-count assertion. Both were test-script bugs, not product
bugs — independently confirmed by a direct database query showing
exactly one `SUCCEEDED` Payment existed even during the failing attempt.

## Current / Planned / Future

| Element | Status |
|---|---|
| 19-test dedicated suite covering the brief's 25-point list | **Implemented** |
| Full-suite regression (151/151) | **Verified** |
| TypeScript, ESLint, production build | **Verified clean** |
| Migration against real seeded data | **Verified, zero data loss** |
| Browser smoke test — 16 steps, unpaid-blocked path, unauthorized path, duplicate-webhook-over-HTTP path | **Verified** |

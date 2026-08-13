# Security & RBAC

**Status:** Implemented
**Milestone:** 18 — Tuition, Billing & Payments Vertical Slice
**Date:** 2026-08-13

## No New Role

Every authorization check in `src/services/billing/billing.ts` uses the
five already-implemented roles (`STUDENT`, `FACULTY`, `PROGRAM_DIRECTOR`,
`ADMINISTRATOR`, `CLINICAL_COORDINATOR`, `ADMISSIONS_STAFF`) via
`src/services/identity/rbac.ts`'s existing predicates
(`isAdministrator`, `hasRoleForProgram`, `hasAnyRole`). No new role was
declared or activated.

## Per-Role Authority Table

| Role | Authority |
|---|---|
| **Student** | View own Charges/Payments/balance/receipt (`getBillingSummaryForStudent`, self-only); initiate own payment (`startPayment`, self-only, verified against the Charge's own `studentId`). Cannot alter any financial record, cannot mark themselves paid — no function in `billing.ts` accepts a Student actor for any write except starting a payment attempt; only the (simulated) provider's own signed webhook can transition a Payment to `SUCCEEDED`/`FAILED`. |
| **Faculty** | None. Denied by every read/write function's authorization check. |
| **Clinical Coordinator** | None. Denied by every read/write function's authorization check. |
| **Admissions Staff** | None — explicitly, per this milestone's Section 14 ("no financial-management authority unless existing architecture explicitly grants it"). Nothing in this milestone's brief or this platform's existing architecture grants it, so `assertAdministratorOrAdmissionsStaff` (used only by the internal `createChargeForEnrollment` hook, not by any read/write an Admissions Staff User could call directly) is the *only* place Admissions Staff's identity is even checked in this module — and that check exists solely because Admissions Staff is the actor who legitimately triggers `createEnrollmentFromApplication` in the first place, not because they can view or manage billing afterward. |
| **Program Director** | Sees Financial Clearance **status only** (`PASSED`/`FAILED`/`NEEDS_VERIFICATION` + human-readable detail text, never a dollar amount), and only through the pre-existing Graduation Eligibility breakdown — never through a direct billing read. `getBillingSummaryForStudent` explicitly denies Program Director. |
| **Administrator** | Institutional financial oversight: configure tuition, view every Charge/Payment institution-wide, full billing summary for any Student. The only role that can `configureTuition`. |
| **A bare `SessionUser` with no relevant Role Assignment** | Fails closed — denied by every function's authorization check, verified explicitly in tests. |

## Data-Minimization Design (Not Just a Read Restriction)

Program Director's limited visibility is enforced at the **type** level,
not merely by choosing not to render a field: `determineFinancialClearance`
returns `FinancialClearanceResult` (`{ status, balanceCents, detail }`),
and the *breakdown row* Program Director actually reads
(`GraduationRequirementBreakdownItem`, in
`src/services/graduation/graduation.ts`) carries only `{ label, status,
detail }` — `balanceCents` and every `Payment`/`StudentCharge` field are
structurally absent from what Program Director's own read path can ever
receive, not merely hidden by a page's rendering choice. A test verifies
this directly (`18. Program Director sees only the status-only clearance
signal... via the Graduation Eligibility breakdown`, asserting the
breakdown row lacks `balanceCents`/`payments` properties entirely).

## Service-Layer Enforcement

Every function in `src/services/billing/billing.ts` asserts its own
authorization independently — `assertAdministrator`,
`assertAdministratorOrAdmissionsStaff`, `assertStudentSelf`,
`assertFullBillingReadAccess`, `assertClearanceReadAccess` — none of
this module's functions relies solely on its `actions.ts` caller's
`requireSessionUserWithRole` check. A direct, unauthorized service call
fails closed with `BillingAuthorizationError`, verified explicitly in
tests independent of any page-level protection.

## Sensitive Payment Information

- **No raw card data is ever modeled, collected, or stored** — no field
  for a card number, CVV, or magnetic-stripe data exists anywhere in
  `prisma/schema.prisma`; the checkout page never renders a form asking
  for one.
- **No payment-provider secret reaches a client component.**
  `PAYMENT_WEBHOOK_SECRET` is read only inside `payment-provider.ts`
  (a `server-only` module) and is never passed as a prop, never embedded
  in rendered HTML, never referenced by any `"use client"` file (this
  milestone introduces none).
- **The public checkout view is deliberately minimal.**
  `getPublicCheckoutView` returns exactly `{ id, status, amountCents,
  currency, description, providerSessionId }` — no Student name, no
  email, no other Payment's history. Verified by an explicit test
  asserting the exact key set returned.
- **No sensitive data is logged.** `recordAuditEvent`'s metadata for
  every billing action carries only amounts, ids, and status strings —
  never a signature, a webhook secret, or (since none exists) card data.

## Current / Planned / Future

| Element | Status |
|---|---|
| No new role; reuses the five existing roles | **Implemented** |
| Student self-only read/initiate, Administrator institutional oversight | **Implemented** |
| Program Director status-only visibility, enforced at the type level | **Implemented** |
| Admissions Staff/Faculty/Coordinator denied | **Implemented, verified** |
| Bare SessionUser fails closed | **Implemented, verified** |
| No raw card data, no leaked secrets, minimal public checkout view | **Implemented, verified** |

# Audit & Idempotency

**Status:** Implemented
**Milestone:** 18 — Tuition, Billing & Payments Vertical Slice
**Date:** 2026-08-13

## Audit Actions Added

Seven actions appended to the single existing `AuditAction` union in
`src/services/audit/audit.ts` — the brief's own suggested list, used
verbatim:

| Action | Emitted by | Actor |
|---|---|---|
| `TUITION_CONFIGURED` | `configureTuition` | Administrator |
| `STUDENT_CHARGE_CREATED` | `createChargeForEnrollment` | Admissions Staff/Administrator (whoever triggered enrollment) |
| `PAYMENT_STARTED` | `startPayment` | Student (self) |
| `PAYMENT_CONFIRMED` | `processPaymentWebhookPayload` | `null` — system/external-provider-initiated |
| `PAYMENT_FAILED` | `processPaymentWebhookPayload` | `null` — system/external-provider-initiated |
| `FINANCIAL_CLEARANCE_CHANGED` | `processPaymentWebhookPayload` (only when a successful payment actually changes the clearance status) | `null` — system/external-provider-initiated |
| `PAYMENT_REFUNDED` | *(declared, never emitted — no code path creates a refund; see Known Limitations)* | — |

`actorId: null` for the three webhook-triggered events follows the exact
precedent `src/services/identity/auth.ts` already established for
`USER_LOGIN_FAILED` on an unrecognized email — a genuinely
system/external-initiated event with no authenticated Minara User to
attribute it to, recorded as such rather than silently omitted.

## Full Lifecycle Reconstruction

An Administrator can trace, from the Audit Log alone: `TUITION_CONFIGURED`
→ `STUDENT_CHARGE_CREATED` → `PAYMENT_STARTED` → `PAYMENT_CONFIRMED` →
`FINANCIAL_CLEARANCE_CHANGED` → (separately, via the pre-existing
Milestone 16 actions) `GRADUATION_SUBMITTED`/`GRADUATION_APPROVED`/
`CERTIFICATE_ISSUED` — the complete Enrollment → Charge → Payment →
Balance → Financial Clearance → Graduation Eligibility Impact chain this
milestone's Section 16 requires, verified end-to-end in this milestone's
main integration test.

## Idempotency — Three Independent Guarantees

This milestone's Section 17 calls idempotency "mandatory." Three
mechanisms, at three different layers, each independently sufficient:

1. **Duplicate Charge creation (browser refresh / re-triggered
   enrollment action).** `StudentCharge`'s own `@@unique([enrollmentId,
   category])` constraint is the database-level guarantee.
   `createChargeForEnrollment` also checks for an existing Charge first
   (an application-level fast path), and catches the constraint
   violation as a fallback if a race loses that check — either way, the
   caller always gets back the one true Charge, never a duplicate.
2. **Duplicate `startPayment` calls (browser refresh, double-click).**
   `startPayment` looks for an existing `PENDING` Payment on the Charge
   first and reuses it rather than creating a second one — verified by
   an explicit test asserting exactly one `Payment` row exists after two
   calls.
3. **Duplicate/retried webhook events.**
   `Payment.providerEventId`'s own `@unique` constraint is the final,
   database-level guarantee. `processPaymentWebhookPayload` layers two
   additional checks in front of it: (a) if the incoming event's
   `eventId` exactly matches the Payment's already-recorded
   `providerEventId`, it returns `{ ok: true, idempotent: true }`
   immediately, no write attempted; (b) the actual status transition is
   performed via `db.payment.updateMany({ where: { id, status:
   "PENDING" }, ... })` — a **status-guarded conditional update**, so
   even two genuinely concurrent deliveries of the same (or a
   conflicting) event can only ever have exactly one of them actually
   flip the row; the other's `updateMany` affects zero rows and is
   treated as idempotent, not an error. This is tested three ways: the
   same event twice (in-process), a different event against an
   already-resolved Payment (in-process), and a duplicate confirmation
   over genuine HTTP against the real `/api/webhooks/payments` Route
   Handler (both the automated test suite and the browser smoke test).

## Financial Clearance Change Is Audited, Not Silently Recomputed

`processPaymentWebhookPayload` computes financial clearance both
*before* (while the Payment is still `PENDING`) and *after* (once
`SUCCEEDED` is committed) a successful confirmation, and records
`FINANCIAL_CLEARANCE_CHANGED` only when the status genuinely differs —
so the Audit Log shows precisely when a Student's clearance state
actually moved from `FAILED` to `PASSED` (or, in principle, back), not
merely that a payment happened.

## Current / Planned / Future

| Element | Status |
|---|---|
| Seven audit actions, single extended `AuditAction` union | **Implemented** |
| Full lifecycle reconstruction from the Audit Log | **Implemented, verified** |
| Duplicate-charge, duplicate-payment-start, duplicate-webhook idempotency | **Implemented, verified three ways** |
| `FINANCIAL_CLEARANCE_CHANGED` emitted only on a genuine transition | **Implemented, verified** |

# ⚠️ Needs Verification

**Status:** Implemented
**Milestone:** 18 — Tuition, Billing & Payments Vertical Slice
**Date:** 2026-08-13

Where policy is not authoritative, this milestone flags rather than
invents. No value below became institutional policy simply because it
exists in test/seed data.

## Financial Policy — Entirely Unresolved

- **Official Pharmacy Technology tuition.** The $5,000.00 amount used in
  this milestone's seed data (`configureTuition`'s call in
  `prisma/seed.ts`) is a generic, round test number — explicitly labeled
  "(demo rate, not official pricing)" in its own `TuitionConfiguration.description`,
  and again on the Admin billing form's own "⚠️ Demo/configurable value
  only" notice. It is not derived from, and does not represent, any real
  MIHS pricing document.
- **Application fee.** Not modeled. `StudentCharge.category` exists as a
  string field that could someday hold `"APPLICATION_FEE"`, but nothing
  in this milestone creates one.
- **Deposit requirement before Enrollment.** This milestone's own Section
  13 explicitly instructs: *"If future policy requires deposits before
  Enrollment, flag ⚠️ Needs Verification. Do not redesign Admissions in
  this milestone."* No deposit gate exists anywhere in the Admissions
  flow — Enrollment proceeds exactly as Milestone 17 built it, and the
  tuition Charge is created *after* Enrollment succeeds, never before or
  as a precondition of it.
- **Refund policy.** Not modeled or automated in any way — see
  [Known Limitations](./14-known-limitations-future-expansion.md).
  `Payment.status` includes `REFUNDED` as a possible value for future
  use, but no rule about when a refund is owed, how much, or under what
  circumstances exists anywhere in this codebase.
- **Payment deadline / late-payment consequences.** No due date is
  modeled on `StudentCharge`; no late fee, interest, or hold-escalation
  policy exists.
- **Installment plans.** Explicitly out of scope per this milestone's
  own Section 24 — a `StudentCharge` is a single, whole amount, paid in
  full or not.
- **Financial hold policy beyond graduation.** This milestone only
  connects an outstanding balance to Graduation Eligibility (per its own
  Section 9). Whether an outstanding balance should also block, say,
  course registration or transcript release is unaddressed — no such
  gate exists.
- **Graduation balance policy nuance.** This milestone's own
  [Financial-Clearance Design](./06-financial-clearance-design.md)
  documents a specific, disclosed choice — `NEEDS_VERIFICATION` (tuition
  never configured/charged) does not block graduation, only a real
  `FAILED` balance does. Whether MIHS policy actually wants tuition
  configuration to be *mandatory* before any Student can graduate
  (making the absence of a Charge itself a blocker) is unconfirmed.
- **Accepted payment methods.** The mock provider simulates a generic
  "hosted checkout" with no method selection (card, ACH, etc. are all
  undifferentiated in this slice) — no real payment-method policy is
  represented.
- **Offline/check payments.** Not implemented — this milestone's own
  brief explicitly permitted leaving manual/offline payment recording
  out "if not necessary for the vertical slice," and it was left out.
- **Program-specific fees** (lab fee, materials fee, etc.). Not modeled
  — `StudentCharge.category` exists for future extension, unused beyond
  `"TUITION"` in this milestone.

## Architecture — Disclosed, Not Policy Questions

These are implementation choices already explained in their own
documents, restated here only for completeness — not open questions:

- Why `NEEDS_VERIFICATION` does not gate graduation eligibility: [Financial-Clearance Design](./06-financial-clearance-design.md).
- Why Charge creation hooks only into the Milestone 17 Admissions flow, not the shared Milestone 10 `createEnrollment`: [Implementation Completion Record](./11-implementation-completion-record.md#architectural-decisions-discovered).
- Why a mock payment provider was selected: [Payment-Provider Architecture](./05-payment-provider-architecture.md).

## Current / Planned / Future

| Item | Status |
|---|---|
| Official tuition/fee amounts | **⚠️ Needs Verification** — demo values only, never treated as policy |
| Deposit-before-Enrollment requirement | **⚠️ Needs Verification** — no gate built, per explicit instruction |
| Refund policy, payment deadlines, installment plans | **⚠️ Needs Verification** — none modeled |
| Whether missing tuition configuration should itself block graduation | **⚠️ Needs Verification** — currently does not |
| Accepted payment methods, offline payments | **⚠️ Needs Verification** — undifferentiated / not built |

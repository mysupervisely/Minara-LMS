# Charge/Payment Domain Design

**Status:** Implemented
**Milestone:** 18 — Tuition, Billing & Payments Vertical Slice
**Date:** 2026-08-13
**Implementation:** `prisma/schema.prisma`'s `StudentCharge`/`Payment`; `src/services/billing/billing.ts`

## Deliberately Not a Ledger

This milestone's brief is explicit: *"Minara-LMS should know what a
student was charged, why, what they paid, what balance remains, whether
their account is cleared. It should NOT pretend to be a general
ledger."* Two models — `StudentCharge` (money owed) and `Payment` (money
applied) — are enough to answer every one of those questions; a full
double-entry ledger, an `Account`/`Transaction`/`JournalEntry` hierarchy,
was never built, per that instruction.

## `StudentCharge`

```prisma
model StudentCharge {
  id           String
  enrollmentId String
  studentId    String   // denormalized
  programId    String   // denormalized
  category     String   @default("TUITION")
  description  String
  amountCents  Int      // frozen at creation — see Tuition Configuration Design
  currency     String   @default("USD")
  @@unique([enrollmentId, category])
}
```

`studentId`/`programId` are denormalized onto `StudentCharge` directly
(alongside `enrollmentId`) — the same single-indexed-query convenience
`Placement.studentId` (Milestone 15) already established, rather than
requiring every read to join through `Enrollment`.

`category` exists (default `"TUITION"`) specifically so a future
milestone could add an application fee or lab fee without a schema
change — but this milestone creates **only** `"TUITION"` charges, per
its own "do not build every future fee type now" instruction.

`@@unique([enrollmentId, category])` is the database-level guarantee
against duplicate tuition charges — the mechanism, not just a
convention, behind "re-running an enrollment action must not create
duplicate tuition charges."

## `Payment`

```prisma
model Payment {
  id                String
  chargeId          String
  studentId         String   // denormalized
  amountCents       Int
  currency          String   @default("USD")
  status            String   @default("PENDING") // PENDING | SUCCEEDED | FAILED | REFUNDED
  provider          String   @default("mock")
  providerSessionId String   @unique
  providerEventId   String?  @unique
  initiatedById     String
  confirmedAt       DateTime?
}
```

One `StudentCharge` can have many `Payment` rows (a failed attempt
followed by a successful retry, for instance) — balance is always
derived by summing every `SUCCEEDED` Payment against a Charge, never by
trusting a single "the" payment. `providerSessionId` and
`providerEventId` are each independently unique — the first is the
lookup key a webhook uses to find the right Payment; the second is the
idempotency guarantee described in [Audit & Idempotency](./10-audit-idempotency.md).

`REFUNDED` exists in the status union for schema completeness (mapping
every state a provider could report), but no code path in this milestone
ever creates one — see [Known Limitations](./14-known-limitations-future-expansion.md).

## No Separate Receipt Model

This milestone's brief explicitly permits this: *"Receipt may be
represented as a derived view of Payment if a separate model is
unnecessary."* A `SUCCEEDED` `Payment` already carries everything a
receipt needs — amount, date, and its own `id` as a unique reference
number, rendered directly on the Student Billing page's Payment History
table. No `Receipt` model, no PDF generation, no separate numbering
scheme.

## Derived, Never Cached, Balance

No `balanceCents` field exists anywhere in this schema. Balance is
computed fresh, every time, in `src/services/billing/billing.ts`'s
`summarizeCharge`:

```
balanceCents = charge.amountCents − Σ(SUCCEEDED Payment.amountCents)
```

The same "derived, never persisted" discipline Milestone 16's
graduation-eligibility computation established for a completely
different domain — applied here to money, where staleness would be an
even more serious defect.

## Money Representation

Every amount in this schema is an integer number of cents
(`amountCents`), currency-tagged (`currency`, default `"USD"`) — never a
floating-point dollar value, avoiding the well-known floating-point
rounding-error class of bug in financial arithmetic. `src/lib/money.ts`'s
`formatCents` is the one shared place that turns cents back into a
human-readable string, via `Intl.NumberFormat`.

## Current / Planned / Future

| Element | Status |
|---|---|
| `StudentCharge`/`Payment`, no ledger | **Implemented** |
| `@@unique([enrollmentId, category])` duplicate-charge guard | **Implemented** |
| Derived balance, integer-cents money | **Implemented** |
| Receipt as a derived Payment view (no separate model) | **Implemented** |
| Additional `category` values (application fee, lab fee, etc.) | **Future** — field exists, unused |
| Refund workflow | **Future** — `REFUNDED` status exists, no code path creates it |

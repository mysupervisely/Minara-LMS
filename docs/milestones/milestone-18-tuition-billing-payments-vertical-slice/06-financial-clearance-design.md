# Financial-Clearance Design

**Status:** Implemented
**Milestone:** 18 — Tuition, Billing & Payments Vertical Slice
**Date:** 2026-08-13
**Implementation:** `src/services/billing/billing.ts`'s `determineFinancialClearance`

## The Narrow Rule

> Financially Cleared = required institutional balance is zero.

Nothing more sophisticated is built. No payment-plan compliance check,
no partial-clearance tiering, no per-fee-type clearance — a single,
derived boolean-equivalent signal computed fresh from real
`StudentCharge`/`Payment` data every time it's asked for, the same
"derived, never persisted" discipline Milestone 16's graduation
eligibility already established for a different domain.

## Fail-Closed by Construction

| Condition | Result |
|---|---|
| No `Enrollment` found for `(studentId, programId)` | `NEEDS_VERIFICATION` — nothing to determine |
| No `StudentCharge` exists for that Enrollment | `NEEDS_VERIFICATION` — tuition was never configured/charged; not an invented pass, not an invented fail |
| A real, positive outstanding balance across all Charges | `FAILED` |
| Balance is zero (or negative — an overpayment) | `PASSED` |

There is no code path that returns `PASSED` by default, by omission, or
by catching an error — every `PASSED` traces to a real, positively
summed `SUCCEEDED` Payment total that meets or exceeds the Charge
amount.

## Why `NEEDS_VERIFICATION` Does Not Block, But `FAILED` Does

This is the one deliberate asymmetry in this design, and it exists for a
specific, disclosed reason: **regression safety**. Every graduation
scenario built in Milestones 13–17 (and every existing automated test
for them) never created a `TuitionConfiguration` or `StudentCharge` at
all — under the strictest possible "fail closed" reading, those Students
would suddenly read `NEEDS_VERIFICATION` and, if that state also blocked
eligibility, every one of those pre-existing scenarios would become
newly ineligible for a reason that has nothing to do with anything they
actually did.

Instead, this milestone treats `NEEDS_VERIFICATION` exactly the way
Milestone 16's own "Other Program Requirements" row already treats an
unconfirmable fact: disclosed, never hidden, but **not** blocking —
because blocking on the mere absence of billing configuration would
itself be inventing an institutional policy ("every Program must have
tuition configured before anyone can graduate") this milestone was never
asked to establish. A real, positively-confirmed outstanding balance
(`FAILED`) is a different kind of fact entirely — it is exactly the
"outstanding required balance" condition Section 9 of this milestone's
own brief names as the one new graduation-blocking rule — and it does
block, per that explicit requirement.

```
eligible = academicComplete
         AND (!externshipRequired OR externshipVerified)
         AND financialClearance.status !== "FAILED"
```

This is the entire integration: one additional `&&` clause, no
restructuring of the surrounding function.

## Read Access — Two Shapes, By Design

`determineFinancialClearance` itself allows the same audience
`determineGraduationEligibility`'s own access check already allows
(Student self, Program-Director-with-oversight, Administrator via that
check's own bypass) — but returns only `{ status, balanceCents, detail
}`, never a Payment history or a Charge description. The **full**
billing detail (`getBillingSummaryForStudent`, with charges/payments/
amounts) is Student-self-or-Administrator only — Program Director never
calls it, and never sees it, because Program Director only ever reaches
Financial Clearance through the Graduation Eligibility breakdown, which
already renders status + human-readable text, nothing more. See
[Security & RBAC](./09-security-rbac.md) for the full authority table.

## Current / Planned / Future

| Element | Status |
|---|---|
| Derived PASSED/FAILED/NEEDS_VERIFICATION rule | **Implemented** |
| Fail-closed construction (no default-pass path) | **Implemented** |
| `NEEDS_VERIFICATION` non-blocking, `FAILED` blocking | **Implemented** — disclosed, regression-safe design |
| Program-level configurable financial-hold policy | **Future** — pending real MIHS policy |

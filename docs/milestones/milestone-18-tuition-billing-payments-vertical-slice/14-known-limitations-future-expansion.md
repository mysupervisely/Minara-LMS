# Known Limitations & Future Expansion

**Status:** Implemented
**Milestone:** 18 — Tuition, Billing & Payments Vertical Slice
**Date:** 2026-08-13

This milestone's brief named an explicit exclusion list. Each item below
restates the exclusion and explains why it stays out of scope for this
narrow vertical slice, consistent with
[ADR-011](../../architecture/adr/ADR-011-vertical-slice-development-strategy.md)'s
incremental strategy.

| Excluded | Rationale |
|---|---|
| **Financial aid, FAFSA, Title IV, scholarships, grants, student loans** | No such program, eligibility rule, or funding-source model exists anywhere in this platform; every dollar tracked by this milestone is a Student's own direct obligation. |
| **Complex payment plans, installment agreements** | A `StudentCharge` is a single, whole amount — `Payment` supports multiple attempts against it (e.g. a retry after a failure), but no scheduled-installment concept exists. |
| **Collections, late fees, interest** | No due date, no escalation policy, no interest-accrual logic anywhere in this schema. |
| **Tax reporting, 1098-T** | No tax-form generation or reporting exists; this milestone tracks institutional charges/payments only. |
| **Enterprise accounting / general ledger** | Explicitly avoided per this milestone's own "do not build unnecessary accounting complexity" instruction — see [Charge/Payment Domain Design](./04-charge-payment-domain-design.md). |
| **Refund-policy automation** | `Payment.status` includes `REFUNDED` as a schema value for future use, but no rule, trigger, or action creates one anywhere in this milestone's code. |
| **Chargebacks/disputes beyond safe recording** | Not modeled at all — the mock provider has no dispute concept. |
| **Financial-aid eligibility** | No aid program exists to be eligible for. |
| **Employer tuition sponsorship** | `EMPLOYER_PARTNER` remains dormant (per Milestone 15's own decision, unchanged here); no sponsor-pays-for-Student flow exists. |
| **Discounts/coupon engine** | A Charge's `amountCents` is exactly what `TuitionConfiguration` said at creation time — no discount code, promotional rate, or adjustment mechanism exists. |
| **Subscription billing for Prepped products / PharmDPrepped billing integration** | Out of this repository's scope entirely — Minara-LMS is the platform repository; Prepped products are a separate concern per this platform's own repository-boundary discipline (see root README's "Relationship to Other Minara Repositories"). |
| **AI** | No AI/ML component was introduced anywhere in this milestone. |
| **Analytics** | The Admin billing dashboard's stat card is a simple count, not an analytics/reporting layer. |
| **Broad website redesign** | The public site's only change is one new "Apply" button destination and the (already-existing, Milestone 17) `/apply/program/[slug]` route — this milestone touches nothing else in the public marketing site. |

## Additional Limitations Not in the Original Exclusion List

- **No offline/manual payment recording.** This milestone's brief
  explicitly permitted omitting this ("if not necessary for the vertical
  slice, leave it out") — it was left out. An Administrator cannot mark
  a Charge paid outside the Payment/webhook-confirmation flow.
- **No real payment provider account.** `MockPaymentProvider` is the
  only adapter implemented — see
  [Payment-Provider Architecture](./05-payment-provider-architecture.md)
  for the full rationale and the clean boundary that makes adding a real
  one later a contained change.
- **No multi-currency support beyond the `currency` field's presence.**
  Every amount defaults to `"USD"`; no currency-conversion logic exists.
- **No deposit-before-Enrollment gate.** Per this milestone's own
  explicit instruction not to redesign Admissions — see
  [⚠️ Needs Verification](./13-needs-verification.md).
- **No due date / payment-deadline tracking.** `StudentCharge` has no
  due-date field.
- **Program-specific fee categories are unused.** `StudentCharge.category`
  exists only as `"TUITION"` in practice; no lab fee, materials fee, or
  application fee is ever created.

## ⚠️ Needs Verification (Carried Forward)

See [⚠️ Needs Verification](./13-needs-verification.md) for the full,
dedicated list — official tuition/fee amounts, deposit requirements,
refund policy, payment deadlines, installment plans, accepted payment
methods, offline payments, and whether missing tuition configuration
should itself block graduation.

## Recommended Direction for Future Milestones

This vertical slice completes the financial leg of the Student
Lifecycle Workflow that Milestone 16 (Graduation) left as a placeholder
— MIHS can now genuinely charge tuition, accept a payment, and gate
graduation on a real, positively-confirmed outstanding balance.
Candidates for a future milestone include: a real payment-provider
integration (swapping `MockPaymentProvider` for a production adapter);
application/lab/materials fee categories; offline/manual payment
recording for Administrator use; a refund workflow; or Program-specific
tuition-and-fee schedules once Minara-Curriculum/Minara-Master-Plan
supplies authoritative pricing. Per this milestone's own explicit
instruction, no such follow-on work begins automatically — this is a
recommendation for the next planning conversation, not a commitment.

## Current / Planned / Future

| Element | Status |
|---|---|
| Everything in the "Excluded" table above | **Deliberately out of scope** for this milestone |
| Offline/manual payment recording | **Future** |
| Real payment-provider integration | **Future** — architecture ready, no account exists |
| Application/lab/materials fee categories | **Future** — schema field exists, unused |
| Refund workflow | **Future** — schema value exists, no code path |
| Program-specific tuition/fee schedules | **Future** — pending Minara-Curriculum/Master-Plan |

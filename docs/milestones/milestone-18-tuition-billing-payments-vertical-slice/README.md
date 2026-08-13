# Milestone 18 — Tuition, Billing & Payments Vertical Slice

**Status:** Implemented
**Phase:** Application code (no separate planning-only phase — directly specified and implemented in one pass, the same shape as Milestones 13/14/16/17)
**Date:** 2026-08-13

## Purpose

Proves the smallest complete financial workflow required for MIHS to
charge tuition and record payment for an enrolled Student: Program
Tuition Configuration → Student Charge → Payment → Balance Update →
Receipt → Financial Clearance → Audit Trail. Per
[ADR-011](../../architecture/adr/ADR-011-vertical-slice-development-strategy.md),
this is the seventh narrow vertical slice built on the Foundation Build
(Milestone 10), reusing — never reinventing — the approval-gate, RBAC,
and audit patterns proven in Milestones 10, 13–17.

This milestone's most important integration point is Milestone 16's
Graduation Eligibility breakdown: its "Financial Clearance" row has read
`NOT_APPLICABLE` since it was introduced, an explicit placeholder for
this milestone to replace. Milestone 18 replaces it with a real,
derived signal — while changing nothing else about how graduation
eligibility is computed or reviewed.

## Documents in This Milestone

| # | Document | Covers |
|---|---|---|
| 1 | [README](./README.md) | This document |
| 2 | [Financial Capability Checkpoint](./02-financial-capability-checkpoint.md) | What Milestones 1–17 already established that this milestone reads/reuses; what was verified absent |
| 3 | [Tuition Configuration Design](./03-tuition-configuration-design.md) | Why tuition is Cohort-scoped, and how a Charge freezes its own historical amount |
| 4 | [Charge/Payment Domain Design](./04-charge-payment-domain-design.md) | `StudentCharge`/`Payment` schema, why there is no separate Receipt or general-ledger model |
| 5 | [Payment-Provider Architecture](./05-payment-provider-architecture.md) | The `PaymentProviderAdapter` boundary, why a mock provider was selected, webhook signing |
| 6 | [Financial-Clearance Design](./06-financial-clearance-design.md) | The derived PASSED/FAILED/NEEDS_VERIFICATION rule and its fail-closed construction |
| 7 | [Graduation Integration](./07-graduation-integration.md) | Exactly what changed (and did not change) in `determineGraduationEligibility` |
| 8 | [Portal Impact](./08-portal-impact.md) | Student Billing & Payments, Administrator Billing & Tuition, the simulated checkout page |
| 9 | [Security & RBAC](./09-security-rbac.md) | Per-role authority table, data-minimization design for Program Director |
| 10 | [Audit & Idempotency](./10-audit-idempotency.md) | Audit actions added, the concrete idempotency mechanisms and where each is enforced |
| 11 | [Implementation Completion Record](./11-implementation-completion-record.md) | Files/services/routes/RBAC/audit changed, architectural decisions discovered |
| 12 | [Testing & Browser Verification](./12-testing-browser-verification.md) | The 25-point test suite, full-suite regression, the 16-step browser smoke test |
| 13 | [⚠️ Needs Verification](./13-needs-verification.md) | Every open financial-policy question this milestone deliberately did not resolve |
| 14 | [Known Limitations & Future Expansion](./14-known-limitations-future-expansion.md) | What was deliberately excluded and why |

## Relationship to Milestones 10–17

| Milestone | Role in This Slice |
|---|---|
| **Milestone 10 (Foundation Build)** | `Enrollment`, `Cohort`, `Program`, and the audit/RBAC foundation this slice reuses without modification. |
| **Milestone 15 (Externship Eligibility & Placement)** | The service-layer-enforced-authorization pattern this milestone's `billing.ts` follows identically. |
| **Milestone 16 (Certificate & Graduation)** | Its `GraduationRequirementBreakdownItem` disclosure design (`PASSED`/`FAILED`/`NOT_APPLICABLE`/`NEEDS_VERIFICATION`) is the direct ancestor of this milestone's `ClearanceStatus`; its previously-hard-coded "Financial Clearance: NOT_APPLICABLE" placeholder is exactly what this milestone replaces. |
| **Milestone 17 (Admissions & Enrollment)** | `createEnrollmentFromApplication` is the one call site this milestone hooks Charge creation into. |

## Scope Boundaries

**In scope:** Cohort-scoped tuition configuration; an Enrollment-scoped,
historically-frozen tuition Charge; a mock-provider-backed Payment flow
(hosted-checkout redirect, signed webhook confirmation, idempotent
processing); derived balance and financial-clearance computation;
Graduation Eligibility integration; Student and Administrator portal
screens; audit extension.

**Explicitly out of scope** (see
[Known Limitations & Future Expansion](./14-known-limitations-future-expansion.md)
for the full list and rationale): financial aid, FAFSA, Title IV,
scholarships, grants, student loans, payment plans/installments,
collections, late fees, interest, 1098-T tax reporting, general
ledger/enterprise accounting, refund-policy automation, chargebacks/
disputes beyond safe recording, employer tuition sponsorship, discount/
coupon engines, and any invented Pharmacy Technology tuition amount.

## ADR Discipline

No new ADR was created for this milestone. See
[Implementation Completion Record §Architectural Decisions Discovered](./11-implementation-completion-record.md#architectural-decisions-discovered)
for the disclosed implementation-level decisions this milestone made and
why none meets the project's ADR threshold (expensive to reverse,
cross-cutting, foundational, or likely to affect future architecture) —
**No new ADR required.**

## Current / Planned / Future

| Element | Status |
|---|---|
| Milestones 10, 13–17 (implemented) | **Current** |
| Tuition, Billing & Payments Vertical Slice | **Implemented** |
| Financial aid, payment plans, general ledger, refund automation | **Future** — see [Known Limitations](./14-known-limitations-future-expansion.md) |

# Financial Capability Checkpoint

**Status:** Implemented
**Milestone:** 18 — Tuition, Billing & Payments Vertical Slice
**Date:** 2026-08-13

Per this milestone's own instruction to inspect the actual repository
rather than trust prior summaries, this document records what was
verified present/absent in the codebase before any billing code was
written.

## Verified Present

| Area | Evidence |
|---|---|
| **No existing payment/financial schema** | `prisma/schema.prisma` had no `Charge`/`Payment`/`Invoice`/`Tuition` model of any kind before this milestone. |
| **Enrollment/Program/Cohort relationships** | `Enrollment` (studentId+programId unique, `cohortId` required) and `Cohort` (Program-scoped) already model exactly the "different Cohorts may charge different tuition" distinction this milestone's brief describes — Cohort is the natural home for a tuition *rate*. |
| **Graduation's Financial Clearance placeholder** | `src/services/graduation/graduation.ts`'s `determineGraduationEligibility` (Milestone 16, extended once by a Milestone 16 follow-up pass) hard-coded `{ label: "Financial Clearance", status: "NOT_APPLICABLE", detail: "Not evaluated by this platform..." }` in its `breakdown` array — the exact placeholder this milestone replaces. |
| **Milestone 5's aspirational Enrollment state** | [Student Domain Model](../milestone-5-domain-model-data-architecture/03-student-domain-model.md) documents an `Enrollment: Pending (Payment/Onboarding) → Active` transition — documentation-only; no service has ever written `"PENDING"` to `Enrollment.status`. This milestone does not implement that gate (see [Known Limitations](./14-known-limitations-future-expansion.md) and this milestone's own Section 13 instruction not to redesign Admissions). |
| **RBAC/audit patterns** | `src/services/identity/rbac.ts` service-layer predicates (Milestone 15/16/17 pattern); the single `AuditAction` union in `src/services/audit/audit.ts`, extended by every milestone since 13. |
| **Service-layer-enforced authorization pattern** | Established by Milestone 15's `externship.ts`, continued by Milestone 16/17's `graduation.ts`/`admissions.ts`: every scoped function accepts a full `SessionUser` and asserts its own Role/Scope, rather than trusting its `actions.ts` caller alone. |
| **Reused disclosure-breakdown shape** | Milestone 16's `GraduationRequirementBreakdownItem` (`PASSED`/`FAILED`/`NOT_APPLICABLE`/`NEEDS_VERIFICATION`) — this milestone's `ClearanceStatus` (`PASSED`/`FAILED`/`NEEDS_VERIFICATION`) is the same design, applied to a real financial computation instead of a permanent placeholder. |
| **The Milestone 17 enrollment-creation call site** | `src/services/admissions/admissions.ts`'s `createEnrollmentFromApplication` — the exact function this milestone's brief names as where Charge creation should be triggered ("through the existing Milestone 17 flow"). |

## Verified Absent (before this milestone)

| Area | Evidence |
|---|---|
| Any billing/tuition/payment model | No table anywhere in `prisma/schema.prisma`. |
| Any payment-provider integration | No SDK, no provider dependency, in `package.json`. |
| Any billing-related audit action | No `TUITION_*`/`STUDENT_CHARGE_*`/`PAYMENT_*`/`FINANCIAL_CLEARANCE_*` action existed in the `AuditAction` union. |
| Real Financial Clearance determination | Always `NOT_APPLICABLE`, never computed from any fact. |
| Any Student- or Administrator-facing billing screen | Neither `/student/billing` nor `/admin/billing` existed. |

## What This Milestone Reuses Without Modification

- `createEnrollment` (Milestone 10) — never modified; the Charge-creation hook lives entirely in Milestone 17's `admissions.ts`, one layer above it.
- The disclosure-breakdown pattern and its `NEEDS_VERIFICATION`-never-blocks / real-`FAILED`-blocks philosophy — proven once already (Milestone 16's "Other Program Requirements" row), applied identically here.
- The audit service itself — extended, never duplicated.
- The service-layer authorization pattern from Milestone 15/16/17 — every function in `src/services/billing/billing.ts` follows the identical shape.

## Current / Planned / Future

| Element | Status |
|---|---|
| Everything listed as "Verified Present" | **Current** — pre-existing, unmodified by this milestone except where explicitly noted in [Implementation Completion Record](./11-implementation-completion-record.md) |
| Everything listed as "Verified Absent" | **Implemented** by this milestone — see the remaining documents in this folder |

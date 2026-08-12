# Milestone 17 — Admissions & Enrollment Vertical Slice

**Status:** Implemented
**Phase:** Application code (no separate planning-only phase — directly specified and implemented in one pass, the same shape as Milestones 13/14/16)
**Date:** 2026-08-12

## Purpose

Proves the first leg of the Student Lifecycle Workflow — the exact span
[Admissions Workflows](../milestone-3-student-journey-core-workflows/03-admissions-workflows.md)
already documents: Inquiry → Application → Document Collection →
Admissions Review → Decision → Acceptance → Enrollment — by taking a
real prospective learner from a public Program page all the way to
Student Portal access. Per
[ADR-011](../../architecture/adr/ADR-011-vertical-slice-development-strategy.md),
this is the sixth narrow vertical slice built on the Foundation Build
(Milestone 10), reusing — never reinventing — the approval-gate, RBAC,
audit, and service-layer-authorization patterns proven in Milestones 10,
13, 14, 15, and 16.

Before this milestone, every User account in Minara-LMS was
Administrator-provisioned (Milestone 10's explicit "no admissions
automation" MVP scope). This milestone adds the one self-service
exception — a prospective learner creating their own account through the
public `/apply` flow — and the narrow Admissions review/decision/
enrollment workflow that connects that account to a real Enrollment,
without touching any of Milestones 10–16's existing functionality.

## Documents in This Milestone

| # | Document | Covers |
|---|---|---|
| 1 | [README](./README.md) | This document |
| 2 | [Architecture Checkpoint](./02-architecture-checkpoint.md) | Current capability inventory before this milestone; what Milestones 1–16 already established that this milestone reuses |
| 3 | [Application Domain & Workflow](./03-application-domain-workflow.md) | The `Application`/`ApplicationRequirement` schema, the state machine, what is and is not invented |
| 4 | [Admissions RBAC Design](./04-admissions-rbac-design.md) | Per-role authority table, ADMISSIONS_STAFF activation, why Program Director stays read-only |
| 5 | [Applicant Experience](./05-applicant-experience.md) | The public `/apply` flow and the authenticated Applicant's own Application view |
| 6 | [Admissions Staff Portal](./06-admissions-staff-portal.md) | The `/admissions/*` screens and their capabilities |
| 7 | [Enrollment Handoff](./07-enrollment-handoff.md) | How an Application becomes a real Enrollment; Alumni-status-style additive schema decision for `sourceApplicationId` |
| 8 | [Implementation Completion Record](./08-implementation-completion-record.md) | Files/services/routes/RBAC/audit changed, architectural decisions discovered |
| 9 | [Testing & Browser Verification](./09-testing-browser-verification.md) | The 26-point test suite, full-suite regression, the 18-step browser smoke test |
| 10 | [⚠️ Needs Verification](./10-needs-verification.md) | Every open question this milestone deliberately did not resolve |
| 11 | [Known Limitations & Future Expansion](./11-known-limitations-future-expansion.md) | What was deliberately excluded and why |

## Relationship to Milestones 10–16

| Milestone | Role in This Slice |
|---|---|
| **Milestone 10 (Foundation Build)** | `createEnrollment` (Enrollment + auto-granted STUDENT Role), the audit service, and the RBAC model this slice's Admissions workflow reuses without modification. |
| **Milestone 15 (Externship Eligibility & Placement)** | The service-layer-enforced-authorization pattern (`src/services/identity/rbac.ts`) this milestone's `admissions.ts` follows identically. |
| **Milestone 16 (Certificate & Graduation)** | The most recently reused approval-gate shape and disclosure-breakdown pattern; this milestone's checklist statuses (`RECEIVED`/`MISSING`/`NEEDS_VERIFICATION`/`NOT_APPLICABLE`) directly extend that milestone's `PASSED`/`FAILED`/`NOT_APPLICABLE`/`NEEDS_VERIFICATION` disclosure design. |
| **Milestone 3 (Student Journey & Core Workflows)** | [Admissions Workflows](../milestone-3-student-journey-core-workflows/03-admissions-workflows.md) is this milestone's authoritative source for terminology and stage sequence — followed, not reinvented. |

## Scope Boundaries

**In scope:** self-service Applicant account creation (the one exception
to Administrator-provisioned accounts); a minimal `Application`/
`ApplicationRequirement` domain; Admissions Staff review/decision
authority; Program Director read-only visibility; Cohort assignment;
Enrollment creation from an Application, reusing the existing
`createEnrollment`; audit extension.

**Explicitly out of scope** (see
[Known Limitations & Future Expansion](./11-known-limitations-future-expansion.md)
for the full list and rationale): payments, financial aid, transcripts,
background checks, immunization tracking, document OCR, external CRM,
email/SMS automation, AI admissions decisions/scoring, automatic
acceptance, full registration/scheduling, advanced Cohort capacity
management, and any invented Pharmacy Technology admission requirement
(GPA, age, prerequisite courses, standardized tests).

## ADR Discipline

No new ADR was created for this milestone. See
[Implementation Completion Record §Architectural Decisions Discovered](./08-implementation-completion-record.md#architectural-decisions-discovered)
for the three implementation-level decisions this milestone made and why
none meets the project's ADR threshold (expensive to reverse,
cross-cutting, foundational, or likely to affect future architecture) —
**No new ADR required.**

## Current / Planned / Future

| Element | Status |
|---|---|
| Milestones 10, 13, 14, 15, 16 (implemented) | **Current** |
| Admissions & Enrollment Vertical Slice | **Implemented** |
| Full admissions/CRM system, transcripts, background checks, financial aid | **Future** — see [Known Limitations](./11-known-limitations-future-expansion.md) |

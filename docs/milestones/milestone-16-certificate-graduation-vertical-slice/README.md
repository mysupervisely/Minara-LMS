# Milestone 16 — Certificate & Graduation Vertical Slice

**Status:** Implemented
**Phase:** Application code (no separate planning-only phase — this milestone was directly specified and implemented in one pass, unlike Milestones 11/12→13's split)
**Date:** 2026-08-11

## Purpose

Proves the final leg of the Student Lifecycle Workflow
([Certificate & Graduation Workflow](../milestone-3-student-journey-core-workflows/05-certificate-graduation-workflow.md)):
academic completion → externship completion (when the Program requires
one) → graduation eligibility → review → approval → certificate
issuance → Alumni status. Per
[ADR-011](../../architecture/adr/ADR-011-vertical-slice-development-strategy.md),
this is the fifth narrow vertical slice built on the Foundation Build
(Milestone 10), reusing — never reinventing — the approval-gate, RBAC,
and audit patterns proven in Milestones 10, 13, 14, and 15.

This milestone was recommended by
[Milestone 15's own planning package](../milestone-15-externship-eligibility-placement-vertical-slice/03-vertical-slice-candidate-ranking.md)
as the highest-priority next slice, precisely because Certificate &
Graduation could not be built honestly against the real launch Program
(Pharmacy Technology, `requiresExternship: true`) until Milestone 15
gave it a real, non-fabricated externship-completion signal to gate on.

## Documents in This Milestone

| # | Document | Covers |
|---|---|---|
| 1 | [README](./README.md) | This document |
| 2 | [Architecture Checkpoint](./02-architecture-checkpoint.md) | Current capability inventory before this milestone; what Milestones 1–15 already established that this milestone reuses |
| 3 | [Graduation Eligibility Design](./03-graduation-eligibility-design.md) | The derived, fail-closed eligibility computation — what it checks, what it deliberately does not invent |
| 4 | [Certificate Model & Design](./04-certificate-model-design.md) | The `Certificate`/`GraduationRequest` schema, credential identifier, Alumni transition |
| 5 | [Workflow & State Transitions](./05-workflow-state-transitions.md) | The state machine, reused approval-gate pattern, remediation loop |
| 6 | [Portal Impact](./06-portal-impact.md) | Student/Program Director/Administrator screen changes |
| 7 | [Implementation Completion Record](./07-implementation-completion-record.md) | Files/services/routes/RBAC/audit changed, architectural decisions discovered |
| 8 | [Testing & Verification Results](./08-testing-verification-results.md) | The 20-point test suite, full-suite regression, browser smoke test |
| 9 | [Known Limitations & Future Expansion](./09-known-limitations-future-expansion.md) | What was deliberately excluded and why |

## Relationship to Milestones 10–15

| Milestone | Role in This Slice |
|---|---|
| **Milestone 10 (Foundation Build)** | Enrollment, Grade, and the approval-gate pattern this slice's Graduation Request reuses a fifth time. |
| **Milestone 13/14 (Curriculum Delivery / Content Versioning)** | Published Lesson/Assessment completion is exactly what "academic completion" reads, unmodified. |
| **Milestone 15 (Externship Eligibility & Placement)** | Its `Placement.completionStatus === "VERIFIED"` signal is read directly by this milestone's eligibility service — no recomputation, no second copy. |

## Scope Boundaries

**In scope:** eligibility determination (derived, fail-closed); a
Graduation Request reusing the existing approval-gate shape; institutional
Certificate issuance; the Student's Enrollment transitioning to Alumni;
Student/Program Director/Administrator portal screens; audit extension.

**Explicitly out of scope** (see
[Known Limitations & Future Expansion](./09-known-limitations-future-expansion.md)
for the full list and rationale): a full graduation audit engine,
transcript management, continuing education, credential-verification
integrations, external accreditation integrations, automated legal/
compliance determinations, payment processing, AI functionality, digital
badge infrastructure, PDF certificate generation, external employer
functionality, any new RBAC role, and any invented Pharmacy Technology
requirement (GPA, hours, course names, dates).

## ADR Discipline

No new ADR was created for this milestone. See
[Implementation Completion Record §Architectural Decisions Discovered](./07-implementation-completion-record.md#architectural-decisions-discovered)
for the two implementation-level decisions this milestone made and why
neither meets the project's ADR threshold (expensive to reverse,
cross-cutting, foundational, or likely to affect future architecture) —
**No new ADR required.**

## Current / Planned / Future

| Element | Status |
|---|---|
| Milestones 10, 13, 14, 15 (implemented) | **Current** |
| Certificate & Graduation Vertical Slice | **Implemented** |
| Employer self-service, itemized Hours Log (Milestone 15 carry-forwards) | **Future**, unaffected by this milestone |
| Full graduation/transcript engine, continuing education, credential verification | **Future** — see [Known Limitations](./09-known-limitations-future-expansion.md) |

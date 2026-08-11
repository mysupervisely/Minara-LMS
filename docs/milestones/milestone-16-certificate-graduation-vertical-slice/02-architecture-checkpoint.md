# Architecture Checkpoint — Current Capability Inventory

**Status:** Implemented
**Milestone:** 16 — Certificate & Graduation Vertical Slice
**Date:** 2026-08-11

Per this milestone's own instruction to inspect the actual repository
rather than trust prior summaries, this document records what was
verified present in the codebase (commit prior to this milestone's own
changes) before any Certificate/Graduation code was written.

## Verified Present

| Area | Evidence |
|---|---|
| **Enrollment** | `prisma/schema.prisma`'s `Enrollment` model — `studentId`, `programId`, `cohortId`, `status: String @default("ACTIVE")`, unique on `[studentId, programId]`. Status values in active use: `"ACTIVE"` (createEnrollment, most reads); the model's own comment already named `PENDING`/`WITHDRAWN`/`COMPLETED` as valid per the Student Domain Model, though only `ACTIVE` was ever written by any service. |
| **Grade approval-gate** | `src/services/gradebook/gradebook.ts` — `Grade.status`: `DRAFT → SUBMITTED → APPROVED`, Faculty enters/submits, Program Director approves/rejects. `listApprovedGradesForStudent(studentId)` — no Enrollment-status filter. |
| **Published content completion** | `LessonCompletion` (unique on `[studentId, lessonVersionId]`) and `Submission` (unique on `[assessmentVersionId, studentId]`) — both keyed to the *currently published* Version via `Lesson.publishedVersionId`/`Assessment.publishedVersionId`, per Milestone 14. |
| **Externship completion signal** | `src/services/externship/externship.ts`'s `Placement.completionStatus`: `NOT_SUBMITTED → SUBMITTED → VERIFIED`, or `RETURNED`. `Placement.status` separately tracks `REQUESTED → APPROVED → ACTIVE → COMPLETED`. `Program.requiresExternship: Boolean` — `true` for the real seeded Pharmacy Technology Program. |
| **RBAC** | `src/domain/roles.ts` — `IMPLEMENTED_ROLES`: `STUDENT`, `FACULTY`, `PROGRAM_DIRECTOR`, `ADMINISTRATOR`, `CLINICAL_COORDINATOR` (activated in Milestone 15). `ADMISSIONS_STAFF`/`EMPLOYER_PARTNER` remain declared but dormant. `src/services/identity/rbac.ts` — the pure, Next.js-independent Role/Scope predicates split out in Milestone 15 specifically so a service module could enforce its own authorization without breaking `prisma/seed.ts`'s plain `tsx` process. |
| **Audit** | `src/services/audit/audit.ts` — a single `AuditAction` string-literal union, extended (never replaced) by every milestone since 13. Append-only `AuditLog`. |
| **Service-layer-enforced authorization pattern** | Established by Milestone 15's `src/services/externship/externship.ts`: every scoped function accepts a full `SessionUser` and asserts its own Role/Scope via `hasRoleForProgram`/`isAdministrator` from `rbac.ts`, rather than trusting its `actions.ts` caller alone. |
| **Return-with-reason approval-gate shape** | `LessonVersion`/`AssessmentVersion.status + returnReason` (Milestone 13/14), `Placement.completionStatus + completionReturnReason` (Milestone 15) — the exact shape this milestone's `GraduationRequest.status + returnReason` reuses a fourth time. |

## Verified Absent (before this milestone)

| Area | Evidence |
|---|---|
| Certificate / credential model | No `Certificate` model anywhere in `prisma/schema.prisma`. |
| Graduation review workflow | No `GraduationRequest` (or equivalent) model, no graduation service, no graduation portal screens. |
| Alumni status | `Enrollment.status` never written as anything but `"ACTIVE"` by any existing service function. |
| Graduation-related audit actions | No `GRADUATION_*`/`CERTIFICATE_*`/`ALUMNI_*` action existed in the `AuditAction` union. |

## What This Milestone Reuses Without Modification

- The approval-gate state-machine shape (status + returnReason, Program-scoped reviewer authority, institution-wide issuer authority for the final act of record) — proven in Milestones 10, 13, 14, 15; reused a fifth time, not reinvented.
- The audit service itself — extended, never duplicated.
- The service-layer authorization pattern from Milestone 15's `externship.ts` and `rbac.ts` — every new function in `src/services/graduation/graduation.ts` follows the identical shape.
- The `Placement.completionStatus === "VERIFIED"` signal — read directly, never recomputed.

## Current / Planned / Future

| Element | Status |
|---|---|
| Everything listed as "Verified Present" | **Current** — pre-existing, unmodified by this milestone except where explicitly noted in [Implementation Completion Record](./07-implementation-completion-record.md) |
| Everything listed as "Verified Absent" | **Implemented** by this milestone — see the remaining documents in this folder |

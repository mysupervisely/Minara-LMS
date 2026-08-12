# Architecture Checkpoint — Current Capability Inventory

**Status:** Implemented
**Milestone:** 17 — Admissions & Enrollment Vertical Slice
**Date:** 2026-08-12

Per this milestone's own instruction to inspect the actual repository
rather than trust prior summaries, this document records what was
verified present in the codebase (commit prior to this milestone's own
changes) before any Admissions code was written.

## Verified Present

| Area | Evidence |
|---|---|
| **Enrollment** | `prisma/schema.prisma`'s `Enrollment` model, `src/services/enrollment/enrollment.ts`'s `createEnrollment` — creates the row, auto-grants STUDENT (if not already held), and emits `ENROLLMENT_CREATED`. Its own module comment explicitly named this "manual/Administrator-driven... there is no Applicant/admissions-decision pipeline in this module" — the exact gap this milestone closes, from the other side. |
| **Account creation** | `src/services/identity/users.ts`'s `createUser`/`assignRole` — Administrator-provisioned only, per Milestone 10's explicit MVP scope. No self-service registration existed. |
| **Roles** | `src/domain/roles.ts` — `IMPLEMENTED_ROLES`: STUDENT, FACULTY, PROGRAM_DIRECTOR, ADMINISTRATOR, CLINICAL_COORDINATOR. `ADMISSIONS_STAFF` declared with `ROLE_SCOPE: "institution"` since Milestone 10, dormant. `EMPLOYER_PARTNER` also dormant. |
| **Admissions Workflows documentation** | [docs/milestones/milestone-3-student-journey-core-workflows/03-admissions-workflows.md](../milestone-3-student-journey-core-workflows/03-admissions-workflows.md) — already defines the full stage sequence, decision branches, and roles involved, including two explicitly flagged open questions (reapplication policy; exact Admissions Staff/Program Director decision-authority split) this milestone respects rather than resolves. |
| **RBAC/audit patterns** | `src/services/identity/rbac.ts` (pure, Next.js-independent predicates, split out in Milestone 15); the single `AuditAction` union in `src/services/audit/audit.ts`, extended by every milestone since 13. |
| **Service-layer-enforced authorization pattern** | Established by Milestone 15's `externship.ts`, continued by Milestone 16's `graduation.ts`: every scoped function accepts a full `SessionUser` and asserts its own Role/Scope, rather than trusting its `actions.ts` caller alone. |
| **Reused approval-gate shape** | `status` + reason + actor + timestamp — `LessonVersion`/`AssessmentVersion` (13/14), `Grade` (10), `Placement.completionStatus` (15), `GraduationRequest` (16) — the exact shape this milestone's `Application.status` reuses a sixth time. |
| **Reused disclosure-breakdown shape** | Milestone 16's `GraduationRequirementBreakdownItem` (`PASSED`/`FAILED`/`NOT_APPLICABLE`/`NEEDS_VERIFICATION`) — this milestone's `ApplicationRequirement.status` (`RECEIVED`/`MISSING`/`NEEDS_VERIFICATION`/`NOT_APPLICABLE`) is the same never-silently-passed design, applied to a checklist instead of an eligibility computation. |

## Verified Absent (before this milestone)

| Area | Evidence |
|---|---|
| Application/admissions domain model | No `Application` (or equivalent) model anywhere in `prisma/schema.prisma`. |
| Admissions review workflow | No admissions service, no Admissions Staff portal screens. |
| Self-service account creation | No public registration route; `src/app/(public)/login/page.tsx`'s own copy stated "Accounts are created by your institution's Administrator." |
| Admissions-related audit actions | No `APPLICATION_*`/`OFFER_*`/`ENROLLMENT_CREATED_FROM_APPLICATION` action existed in the `AuditAction` union. |
| Trace-back from Enrollment to its originating Application | `Enrollment` had no field referencing anything admissions-related — every Enrollment's origin was implicitly "an Administrator created it directly." |

## What This Milestone Reuses Without Modification

- `createEnrollment` (Milestone 10) — called directly, not duplicated; still emits its own `ENROLLMENT_CREATED` and still auto-grants STUDENT.
- The approval-gate state-machine shape — proven five times already, reused a sixth time.
- The audit service itself — extended, never duplicated.
- The service-layer authorization pattern from Milestone 15/16 — every function in `src/services/admissions/admissions.ts` follows the identical shape.
- `ADMISSIONS_STAFF`'s `ROLE_SCOPE: "institution"` — fixed since Milestone 10, honored as-is (see [Admissions RBAC Design](./04-admissions-rbac-design.md) for why this is not redesigned to be Program-scoped).

## Current / Planned / Future

| Element | Status |
|---|---|
| Everything listed as "Verified Present" | **Current** — pre-existing, unmodified by this milestone except where explicitly noted in [Implementation Completion Record](./08-implementation-completion-record.md) |
| Everything listed as "Verified Absent" | **Implemented** by this milestone — see the remaining documents in this folder |

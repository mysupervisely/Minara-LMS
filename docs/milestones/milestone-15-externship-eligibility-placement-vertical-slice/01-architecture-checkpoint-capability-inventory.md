# Architecture Checkpoint — Capability Inventory

**Status:** Draft
**Milestone:** 15 — Planning (Architecture Checkpoint, Question 1 and Question 5)
**Date:** 2026-08-07
**Method:** Direct inspection of this repository at commit `0959f0e`
(post-Milestone-14) — `prisma/schema.prisma`, `src/services/`, `src/app/(portal)/`,
`src/domain/roles.ts`, `tests/`, and every `docs/` document referencing the
areas below. Nothing in this document is inferred from milestone
*intentions* alone; each row cites what actually exists in code, or
states plainly that it does not.

## Classification Key

| Label | Meaning |
|---|---|
| **Implemented** | Working, tested, reachable through a real portal screen or service function. |
| **Partial** | Some real, working piece exists, but materially narrower than the documented full design. |
| **Documentation only** | A Milestone 1–9/11 document describes it; no schema, service, or screen exists. |
| **Not yet implemented** | No document, schema, service, or screen — pure gap. |

## Inventory

| Area | Status | Evidence |
|---|---|---|
| **Authentication** | Implemented | `src/services/identity/{auth,session,password}.ts` — email/password login, server-side revocable Session, logout. Single Role Assignment context per session, per MVP Scope. |
| **RBAC** | Partial | The `(Role, Scope)` mechanism itself is Implemented and enforced at the service layer (`src/services/identity/authorization.ts`). Coverage is Partial: `src/domain/roles.ts` declares all 7 roles from Milestone 2, but `IMPLEMENTED_ROLES` wires up only `STUDENT`, `FACULTY`, `PROGRAM_DIRECTOR`, `ADMINISTRATOR`. `ADMISSIONS_STAFF`, `CLINICAL_COORDINATOR`, `EMPLOYER_PARTNER` are declared, scoped (`ROLE_SCOPE`), and labeled, but have no working UI or service logic — the file's own header comment says so explicitly. |
| **Institution structure** | Implemented | Institution → School → Program → Cohort → Course → CourseOffering, all in `prisma/schema.prisma`, all created through `src/services/academic/institution.ts`, all reachable via `admin/institution`. |
| **Student portal** | Implemented (core) | Dashboard, My Courses, Lesson/Assessment delivery (version-aware, M14), Grades, Competency progress. Not built: Calendar, Resources/Support, Messages (all SHOULD/COULD HAVE, doc-only), Payments, Certificates, Externship status (all Not yet implemented, see below). |
| **Faculty portal** | Implemented (core) | Course roster, content authoring with full versioning (M13/M14), submission grading. Not built: reporting, calendar, messaging (SHOULD HAVE, doc-only). |
| **Program Director portal** | Implemented (core) | Content approval queue (version-scoped), grade approval queue. Not built: cohort/faculty coordination screens, program-level reporting. |
| **Administrator portal** | Implemented (core) | Institution management, user/role assignment, content publishing queue, competency management, audit log, enrollment provisioning. Not built: financial oversight, certificates, reporting/analytics, announcements. |
| **Curriculum authoring** | Partial | Faculty can draft/edit Lesson and Assessment content (`content-workflow.ts`). No Module layer between Course and Lesson, no Question Bank, no full Curriculum Administration Portal — all documented in Milestone 11 but deliberately not built (ADR-011 discipline). |
| **Content approval** | Implemented | 4-state workflow (`DRAFT→SUBMITTED→APPROVED→PUBLISHED`), return-with-reason, version-scoped since M14. |
| **Content publishing** | Implemented | Administrator publish action sets `publishedVersionId` exactly once per version (M13/M14). |
| **Content versioning** | Partial | Implemented for Lesson and Assessment (M14) — immutable published versions, historical activity preserved. **Not implemented** at Course, Program, or Module level (see Question 2 below) — an explicit, documented gap since Milestone 10's schema comment. |
| **Assessments** | Partial | Single free-text submission against a max-score Assessment Version. No Question Bank, rubrics, timed/proctored exams, or randomized/adaptive assessments — all Milestone 11 Future items, correctly deferred. |
| **Gradebook** | Implemented (core) | Grade entry → submit for approval → Program Director approval gate (`DRAFT→SUBMITTED→APPROVED`). No grade analytics/distribution views (Future). |
| **Competencies** | Partial | One Program-scoped `Competency` linked directly to `LessonVersion`; progress derived from approved Grades (`src/services/academic/competency.ts`). Not the full Milestone 11 four-level chain (Course Outcome → Program Competency → Program Learning Outcome → Institution Mission) — documentation only for that fuller model. |
| **Audit logging** | Implemented | Append-only `AuditLog`, covers every M10/M13/M14 action end to end (verified by `tests/e2e-content-lifecycle.test.ts` and `tests/content-versioning.test.ts`). No second audit mechanism anywhere in the codebase. |
| **Admissions** | Partial | The MUST-HAVE "manual" tier is Implemented: `createEnrollment` lets an Administrator provision a Student directly into a Program/Cohort (used in `prisma/seed.ts`). The SHOULD-HAVE self-service Applicant pipeline (Inquiry → Documents → Decision → Waitlist/Deferral, per [M3 Doc 3](../milestone-3-student-journey-core-workflows/03-admissions-workflows.md) and [M4 Doc 5](../milestone-4-information-architecture/05-admissions-portal.md)) is documentation only — no `Applicant` entity, no Admissions Portal, `ADMISSIONS_STAFF` role not wired. |
| **Payments** | Not yet implemented | No `Invoice`/`Payment`/`Receipt` model anywhere in `prisma/schema.prisma`. Named MUST HAVE (basic tier) in [MVP Scope Definition](../milestone-7-mvp-definition-implementation-planning/02-mvp-scope-definition.md) and [Implementation Phases §Phase 1](../milestone-7-mvp-definition-implementation-planning/05-implementation-phases.md), but no dedicated Payments design document exists yet beyond that classification-level mention. |
| **Certificates** | Not yet implemented | No `Certificate` model. Fully described at the workflow level in [Certificate & Graduation Workflow](../milestone-3-student-journey-core-workflows/05-certificate-graduation-workflow.md) (Draft) and named in the Administrator Portal's screen inventory — documentation only, no code. |
| **Externships** | Not yet implemented, with one placeholder | `Program.requiresExternship: Boolean @default(false)` exists in the schema, and is set `true` for the seeded Pharmacy Technology Program — but the schema comment says plainly it "has no behavior wired to it yet." Fully described at the workflow and domain-model level ([M3 Doc 4](../milestone-3-student-journey-core-workflows/04-externship-management-workflow.md), [M5 Doc 5](../milestone-5-domain-model-data-architecture/05-clinical-externship-domain-model.md)) — documentation only otherwise. See [Externship Deep Dive](./04-externship-deep-dive.md). |
| **Employer portal** | Not yet implemented | Documentation only ([M4 Doc 7](../milestone-4-information-architecture/07-employer-portal.md), Draft). `EMPLOYER_PARTNER` role declared but not implemented. |
| **AI Tutor** | Not yet implemented | Documentation only ([M3 Doc 6](../milestone-3-student-journey-core-workflows/06-ai-learning-assistant-workflow.md), [M6 Doc 6](../milestone-6-technical-architecture/06-ai-platform-architecture.md), [ADR-006](../../architecture/adr/ADR-006-human-reviewed-ai-governance.md)). Correctly not built — COULD HAVE, and this checkpoint's own constraints forbid adding AI simply because it's available. |
| **Analytics** | Not yet implemented | Documentation only, explicitly tagged **FUTURE** everywhere it's mentioned ([MVP Scope Definition](../milestone-7-mvp-definition-implementation-planning/02-mvp-scope-definition.md): "not part of MVP... genuinely needs real usage data to be meaningful"). |
| **Notifications** | Not yet implemented | No `Notification` model, service, or delivery mechanism. Documentation only ([M6 Doc 8](../milestone-6-technical-architecture/08-notification-event-architecture.md)). Classified MUST HAVE (critical-event tier only) in MVP Scope — a genuine, acknowledged gap, not a deliberate deferral of something lower priority. |
| **Communications / Messaging** | Not yet implemented | Documentation only. SHOULD HAVE, not MUST HAVE, per MVP Scope. |
| **Reporting** | Not yet implemented (as a dedicated capability) | The Audit Log and Admin screens provide raw underlying data, but no aggregated reporting/dashboard view exists. Documentation only for a dedicated "Reporting Engine Area" ([M6 Doc 3](../milestone-6-technical-architecture/03-service-boundaries.md)). |

## Question 5 — Pharmacy Technology Curriculum Repository Review

The authoritative source of truth for Pharmacy Technology's specific
curriculum requirements is **Minara-Curriculum**, a separate repository
per [README §Relationship to Other Minara Repositories](../../../README.md#relationship-to-other-minara-repositories).
This session's repository access is scoped to `mysupervisely/minara-lms`
only — Minara-Curriculum was not accessible in this session, and no
specific program duration, course list, competency list, assessment
design, experiential/externship hour requirement, or graduation
requirement was fetched from it.

**What this checkpoint does NOT do, on principle:** invent any of the
above. Every number, threshold, or specific requirement that would
normally come from Minara-Curriculum is treated in this planning package
as **⚠️ Needs Verification**, exactly as ADR-008 and the Milestone
3/5 documents already flag it.

**What Minara-LMS's own repository establishes** (illustrative, not
authoritative curriculum content):
- `prisma/seed.ts` creates one demonstration Program ("Pharmacy
  Technology," `requiresExternship: true`), one Course ("Pharmacology
  Fundamentals"), two Lessons, and one Assessment — explicitly
  documented in that file's header as **sample data proving the platform
  mechanism**, not a hard-coded curriculum, per Milestone 10's
  "avoid Pharmacy Technology hard-coding" instruction, carried forward
  unchanged through every milestone since.
- [ADR-008](../../architecture/adr/ADR-008-pharmacy-technology-first-launch.md)
  itself states "the specific hours, competencies, and site requirements
  remain ⚠️ Needs Verification, pending Minara-Curriculum's authoritative
  program design" — this checkpoint changes nothing about that
  conclusion; it confirms it still holds as of this milestone.

**Recommendation for resolving this gap:** before Milestone 15's
Externship slice (see [Recommendation](./05-milestone-15-recommendation.md))
reaches implementation, either (a) a stakeholder/Minara-Curriculum
review resolves the specific eligibility, hours, and evaluation-criteria
questions, or (b) the slice proceeds with those specific numbers
represented as Coordinator/Program-Director-entered judgment fields
rather than platform-enforced constants — see
[Implementation Readiness Review](./06-implementation-readiness-review.md).

## Current / Planned / Future

| Element | Status |
|---|---|
| This inventory | **Current** — snapshot as of commit `0959f0e` |
| Areas marked Implemented/Partial above | **Current** |
| Areas marked Documentation only / Not yet implemented | **Planned** or **Future**, per their respective source documents |

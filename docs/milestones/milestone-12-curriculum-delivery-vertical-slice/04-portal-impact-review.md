# Portal Impact Review

**Status:** Draft
**Milestone:** 12 — Curriculum Delivery Vertical Slice
**Date:** 2026-08-07

## Purpose

This document specifies the required screen-level changes to Milestone
10's four implemented portals (Student, Faculty, Program Director,
Admin) to support this slice's lifecycle — extending existing screens,
per the same discipline
[Milestone 11's portal documents](../milestone-11-curriculum-management-content-engine/README.md)
already established, rather than introducing new portals.

## Student Portal

| Area | Current (Milestone 10) | Required Change (This Slice) |
|---|---|---|
| **Course content access** (`student/courses/[courseOfferingId]`) | Lists every Lesson/Assessment under the Course Offering, unconditionally | List only content with status Published; unpublished content is not rendered, not merely visually de-emphasized |
| **Lesson progress** (`student/courses/[courseOfferingId]/lessons/[lessonId]`) | Renders any Lesson by ID if the Student has Course Offering access | Server-side check adds "AND Lesson status is Published" before rendering — a direct request for a non-Published Lesson ID is denied (fail-closed), not just unlisted, per [PRD S-1](./01-product-requirements-document.md#student) |
| **Assessments** (`student/courses/[courseOfferingId]/assessments/[assessmentId]`) | Same as Lesson progress, for Assessments | Same Published-only gate as above |
| **Competency progress** (new) | Does not exist | A new read-only view — either a new screen or a section on the existing Grades screen (`student/grades`) — showing the derived Competency Progress described in [Domain Impact Review](./03-domain-impact-review.md#new-concept-required-competency-minimal) |

## Faculty Portal

| Area | Current (Milestone 10) | Required Change (This Slice) |
|---|---|---|
| **Content authoring** (extends `faculty/courses/[courseOfferingId]`) | Read-only view of a Course Offering's Lessons/Assessments and its Submission queue; no content creation | New actions to draft a Lesson and draft an Assessment, each requiring a Competency tag on the Lesson before submission (per [PRD F-5](./01-product-requirements-document.md#faculty)) |
| **Review workflow** (new, on the same screen) | Does not exist | A "Submit for Review" action on Draft items owned by the acting Faculty member; a visible "returned — reason" state when Program Director sends something back |
| **Publishing status** (new, on the same screen) | Does not exist | Each Lesson/Assessment shows its current status (Draft / Submitted for Review / Approved / Published) inline in the existing list, per [Content Lifecycle Workflow](./02-content-lifecycle-workflow.md) |

Faculty Notes and Student Notes (full Lesson Framework fields, per
Milestone 11) are **not** part of this slice's Lesson Editor — only
Title, core content, and Competency tag are required to prove the
lifecycle; the rest of the [Lesson Framework](../milestone-11-curriculum-management-content-engine/06-lesson-framework.md)
field set remains Future.

## Program Director Portal

| Area | Current (Milestone 10) | Required Change (This Slice) |
|---|---|---|
| **Approval workflow** (extends `program-director/approvals/[gradeId]`, or a new sibling screen) | Only Grade approvals exist today | A new, parallel queue: content (Lesson/Assessment) Submitted for Review, scoped to Programs the Program Director's Role Assignment covers (`hasRoleForProgram`) — Approve / Return actions, mirroring the existing Grade approval screen's pattern |
| **Curriculum oversight** (new) | Does not exist | A simple list of content currently Approved-but-not-yet-Published (visibility only — Publish itself remains Administrator's action, not Program Director's) plus each Lesson's tagged Competency, per [PRD PD-2](./01-product-requirements-document.md#program-director) |

## Admin Portal

| Area | Current (Milestone 10) | Required Change (This Slice) |
|---|---|---|
| **Program/content configuration** (new, alongside existing `admin/institution`) | Institution/School/Program/Cohort/Course creation exists; no content-level administration | A new Publish action on Approved content, scoped institution-wide like every other Administrator action (`requireAdministrator`); a minimal Competency management screen to create the Competencies Faculty tag Lessons with (per [Domain Impact Review](./03-domain-impact-review.md)) |
| **Audit Log** (`admin/audit`, existing) | Lists all `AuditAction` entries | No structural change — the new `CONTENT_*` actions (per [Content Lifecycle Workflow](./02-content-lifecycle-workflow.md)) appear automatically once added to the existing `AuditAction` union and logged through the existing `recordAuditEvent()` path |

## SSR Continues to Apply Without Exception

Per [ADR-002](../../architecture/adr/ADR-002-ssr-first-web-architecture.md)
and every prior milestone's consistent application of it, every screen
above is a Server Component reading through the existing session/
authorization pattern, with Server Actions for the new mutations (draft,
submit, return, approve, publish) — no client-side data-fetching
framework or new rendering model is introduced. This mirrors exactly how
Milestone 10 built its own approval screens.

## Current / Planned / Future

| Portal Area | Status |
|---|---|
| Student: Course content access, Lesson progress, Assessments (Published-gated) | **Planned** |
| Student: Competency progress view | **Planned** |
| Faculty: Content authoring, Review workflow, Publishing status | **Planned** |
| Program Director: Approval workflow (content), Curriculum oversight | **Planned** |
| Admin: Publish action, minimal Competency management | **Planned** |
| Admin: Audit Log | **Current** — no structural change required, only new action types |
| Faculty Notes, Student Notes, full Lesson Framework fields | **Future** |

## ⚠️ Needs Verification

- Whether the Program Director's content-review queue should be a
  wholly new screen or a tab on the existing Grade approvals screen —
  this document assumes a new sibling screen for clarity, but either is
  consistent with the existing portal's navigation shell.
- Whether the minimal Competency management screen belongs in Admin
  Portal (as modeled here, since Competency is Program-scoped
  configuration analogous to Course creation) or should be delegated to
  Program Director — not decided; Admin is chosen for consistency with
  where Program/Course/Cohort creation already lives in Milestone 10.

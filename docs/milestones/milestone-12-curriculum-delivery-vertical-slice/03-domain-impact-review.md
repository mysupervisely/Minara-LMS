# Domain Impact Review

**Status:** Draft
**Milestone:** 12 — Curriculum Delivery Vertical Slice
**Date:** 2026-08-07

## Purpose

This document reviews Milestone 10's existing models and services against
what this slice requires, and states explicitly what is **reused
unchanged**, what **requires extension**, and — per this milestone's
instructions — what should **not** be added yet, even though Milestone
11 eventually calls for it. No database schema is proposed here; this is
a conceptual review, consistent with this milestone's "no database
schemas" rule.

## Existing Milestone 10 Concepts Reused Unchanged

| Concept (`prisma/schema.prisma` model or service) | Why It Needs No Change |
|---|---|
| `User`, `Session`, `RoleAssignment` (Identity) | Authentication and Role scoping are exactly what this slice's Faculty/Program Director/Administrator/Student actors already use — no new Role, no new scope shape. |
| `Institution`, `School`, `Program`, `Cohort`, `Course`, `CourseOffering` (Academic structure) | This slice's content lives inside the exact same Course/Course Offering structure Milestone 10 already implements — nothing about the hierarchy above Course changes. |
| `Enrollment`, `studentCanAccessCourseOffering` (Enrollment service) | Student access gating in this slice is "enrolled AND content is Published" — the enrollment half is entirely existing logic; only the "AND content is Published" half is new (see below). |
| `Submission`, `submitAssessment`, `getSubmissionForStudent` (Assessments service) | Once an Assessment is Published, Submission behaves exactly as Milestone 10 built it — this slice adds a gate *before* Submission becomes possible, not a change to Submission itself. |
| `Grade`, the full `DRAFT → SUBMITTED → APPROVED` lifecycle, `enterGrade`/`submitGradeForApproval`/`approveGrade`/`rejectGrade` (Gradebook service) | Entirely unchanged. This slice's Competency Progress reads from Approved Grades; it does not alter how a Grade is produced. This lifecycle is also the direct pattern this slice's new content-status field imitates (see below). |
| `AuditLog`, `recordAuditEvent()`, the `AuditAction` union (Audit service) | The single write path is reused as-is; this slice only adds new members to the `AuditAction` union (per [Content Lifecycle Workflow](./02-content-lifecycle-workflow.md)), not a new logging mechanism. |
| `requireSessionUser`, `requireSessionUserWithRole`, `hasRoleForProgram`, `hasRoleForCourseOffering`, `requireAdministrator` (Authorization service) | Every new authorization check this slice needs (Faculty drafting, Program Director approving, Administrator publishing, Student reading only-Published content) is expressible using these existing functions — no new authorization primitive is required. |

## Existing Concepts That Require Extension

| Concept | Current Shape (Milestone 10) | What This Slice Requires | Why This Counts as "Extension," Not "New" |
|---|---|---|---|
| `Lesson` | Flat under `Course`; no status; always visible to any Student with Course Offering access | A status field cycling Draft → Submitted for Review → Approved → Published (per [Content Lifecycle Workflow](./02-content-lifecycle-workflow.md)); Student-facing reads filtered to Published only | `Lesson` keeps its exact meaning and its relationship to `Course` and `LessonCompletion` — this adds a gate in front of existing behavior, the same shape of change Milestone 10 already made when it added Grade's `DRAFT/SUBMITTED/APPROVED` status on top of a simple `Submission` |
| `Assessment` | Flat under `Course`; no status; visible to any Student with Course Offering access as soon as created | Same status field and Student-facing gate as `Lesson` | Same reasoning as `Lesson` — `Assessment`'s relationship to `Submission`/`Grade` is untouched |
| `AuditAction` (type union) | Fixed list of existing actions (`USER_LOGIN`, `GRADE_APPROVED`, etc.) | New members: `CONTENT_DRAFT_CREATED`, `CONTENT_SUBMITTED_FOR_REVIEW`, `CONTENT_RETURNED_TO_DRAFT`, `CONTENT_APPROVED`, `CONTENT_PUBLISHED` | Additive to a type union, not a redesign of the audit mechanism |
| Student-facing Lesson/Assessment read paths (`getCourseOfferingById` and related read helpers in `src/services/academic/institution.ts`) | Return every Lesson/Assessment under a Course, unconditionally | Must filter to Published-status items for Student-role callers (Faculty/Program Director/Administrator callers continue seeing all statuses, for authoring/review purposes) | A filtering condition added to an existing read path, not a new service |
| Faculty-facing Course view (`src/app/(portal)/faculty/courses/[courseOfferingId]/page.tsx`) | Lists Lessons/Assessments with no status distinction | Must show each item's content status and expose the Submit-for-Review action | Extends an existing screen; does not introduce a new portal area |

## New Concept Required: Competency (Minimal)

This is the one genuinely new domain concept this slice needs, since
Milestone 10 has no competency modeling at all. Kept deliberately
minimal:

- A **Competency** is a simple named record (e.g., "Identify drug
  classification systems"), scoped to a Program — not the four-level
  Milestone 11 chain.
- A Lesson links to one or more Competencies directly — standing in for
  Milestone 11's Lesson → Course Outcome link, without yet modeling
  Course Outcome, Program Competency, Program Learning Outcome, or
  Institution Mission above it.
- An Assessment's link to a Competency is implicit, via whichever
  Lesson(s) it's associated with in the Course — this slice does not
  require a direct Assessment-to-Competency link distinct from the
  Lesson link, keeping the new concept to one join, not two.
- A Student's "Competency Progress" is a **derived read**, not a stored
  entity: computed from Approved Grades against Assessments belonging
  to Competency-linked Lessons' Courses. No new write path, no new
  audit surface beyond what already exists for Grade approval (see
  [Content Lifecycle Workflow §Why Competency Progress Has No New Audit Event](./02-content-lifecycle-workflow.md#why-competency-progress-has-no-new-audit-event)).

## Concepts That Should NOT Be Added Yet

Per this milestone's instruction to state this explicitly — these are
named, real parts of the Milestone 11 design that this slice
deliberately does not touch, so the next implementation phase doesn't
accidentally reach for them:

| Concept | Milestone 11 Source | Why Not Yet |
|---|---|---|
| **Module** (between Course and Lesson) | [Curriculum Domain Model](../milestone-11-curriculum-management-content-engine/03-curriculum-domain-model.md) | Adds a structural layer this slice's workflow proof doesn't need — the slice proves lifecycle and delivery, not the full hierarchy depth. |
| **Program Version, Course Version, Lesson Version, Assessment Version** (immutable versioning) | [Versioning Strategy](../milestone-11-curriculum-management-content-engine/04-versioning-strategy.md) | The single biggest scope risk if added now — versioning is a substantial, separable concern from the approval-and-publish *workflow* this slice targets. A mutable status field proves the workflow; version immutability is a distinct future slice. |
| **Curriculum Committee Review as a distinct step from Faculty Review** | [Publishing Workflow](../milestone-11-curriculum-management-content-engine/05-publishing-workflow.md) | Two review steps held by two different scopes of authority is a refinement on top of a proven single-review path — proving the single path first is the narrower, correct-order step. |
| **Course Outcome, Program Competency, Program Learning Outcome, Institution Mission** | [Competency Mapping Framework](../milestone-11-curriculum-management-content-engine/07-competency-mapping-framework.md) | The full four-level chain is an accreditation-reporting concern; this slice only needs to prove that a completed Grade can move a competency signal forward at all. |
| **Question Bank, Rubric, Competency Checklist** | [Assessment Architecture](../milestone-11-curriculum-management-content-engine/08-assessment-architecture.md) | Not required to prove Assessment Completion → Grade → Competency Update; the existing free-text Assessment shape is sufficient for this slice's purpose. |
| **Archive/Restore** | [Publishing Workflow](../milestone-11-curriculum-management-content-engine/05-publishing-workflow.md), [Curriculum Administration Portal](../milestone-11-curriculum-management-content-engine/09-curriculum-administration-portal.md) | Published is a sufficient terminal state to prove delivery; archival is a content-lifecycle-management concern orthogonal to proving the core path works. |
| **Prerequisite entities** | [Curriculum Domain Model](../milestone-11-curriculum-management-content-engine/03-curriculum-domain-model.md) | Not on the critical path this slice proves — Student Access in this slice is gated only by Enrollment + Published status, not by Prerequisites. |
| **Academic Term as a structured entity** | [Curriculum Domain Model](../milestone-11-curriculum-management-content-engine/03-curriculum-domain-model.md) | `CourseOffering.term`'s existing free-text field is untouched by this slice; not on the critical path. |

## Current / Planned / Future

| Element | Status |
|---|---|
| Every "Reused Unchanged" concept above | **Current** — implemented, Milestone 10 |
| Status field on Lesson/Assessment; new `AuditAction` members; filtered read paths | **Planned** — this slice |
| Minimal Competency concept and derived progress view | **Planned** — this slice |
| Module, versioning, two-step review, full Competency chain, Question Bank/Rubric, Archive, Prerequisites, structured Academic Term | **Future** — explicitly deferred by this document |

## ⚠️ Needs Verification

- Whether the minimal Competency concept introduced here should be
  understood, once the full Milestone 11 chain is eventually built, as
  becoming "Course Outcome" directly, or whether it's a separate,
  simpler concept that gets migrated into Course Outcome later — this
  document assumes the former (direct promotion) but does not commit a
  future milestone to that mapping.

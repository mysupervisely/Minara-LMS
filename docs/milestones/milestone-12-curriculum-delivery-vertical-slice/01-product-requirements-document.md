# Product Requirements Document

**Status:** Draft
**Milestone:** 12 — Curriculum Delivery Vertical Slice
**Date:** 2026-08-07

## Purpose

This document defines the user-facing requirements for the slice
described in [README](./README.md): the specific stories, acceptance
criteria, and success criteria that "prove the Milestone 11 architecture
works with the existing Milestone 10 foundation," and states plainly
what is explicitly excluded.

## User Stories

### Faculty

| ID | Story | Acceptance Criteria |
|---|---|---|
| F-1 | As Faculty, I can draft a new Lesson within a Course I'm assigned to teach, so that I can author content instead of only receiving it pre-loaded (as Milestone 10 required). | A Draft Lesson is created, visible only to Faculty/Program Director/Administrator, not to Students; the Course Offering's existing roster/Student access is unaffected until Published. |
| F-2 | As Faculty, I can draft a new Assessment definition (instructions, max score) attached to a Course, so the assessment a Student eventually sees went through the same review as the Lesson content around it. | A Draft Assessment is created with the same visibility rule as F-1. |
| F-3 | As Faculty, I can submit a Draft Lesson or Assessment for review, so that it enters the approval workflow rather than remaining editable indefinitely. | Submitting moves the content's status from Draft to Submitted for Review; the content becomes read-only to its author until returned or approved (mirrors Milestone 10's existing Grade `DRAFT → SUBMITTED` lock, per [Domain Impact Review](./03-domain-impact-review.md)). |
| F-4 | As Faculty, if my submitted content is returned for changes, I can see why, so I know what to fix. | A returned item includes a required reason (per [Content Lifecycle Workflow](./02-content-lifecycle-workflow.md)) and reverts to Draft status, editable again. |
| F-5 | As Faculty, I can tag a Lesson with the Competency it teaches toward, so competency traceability (per Milestone 11) is proven end-to-end, not only documented. | At least one Competency link is required before a Lesson can be submitted for review. |

### Program Director

| ID | Story | Acceptance Criteria |
|---|---|---|
| PD-1 | As Program Director, I can review Submitted content for my Program and either approve it or return it with a reason, so I hold the same approval authority Milestone 11 assigns to Curriculum Committee Review, exercised through my existing Role. | Approving moves status to Approved; returning moves status to Draft with a required reason; both actions are scoped to Programs the Program Director's Role Assignment covers, per the existing `hasRoleForProgram` check. |
| PD-2 | As Program Director, I can see Program Competency coverage for content I've approved, so I can confirm the slice proves competency tracking, not only workflow status. | An approved/published Lesson's Competency tag is visible on the Program Director's review screen. |

### Administrator

| ID | Story | Acceptance Criteria |
|---|---|---|
| A-1 | As Administrator, I can publish Approved content, making it visible to enrolled Students, so Publish remains an institution-wide action distinct from Program-scoped Approval, per Milestone 11's authority split. | Publishing moves status to Published; only then does the content appear on any Student-facing screen. |
| A-2 | As Administrator, I can view the full audit history of a piece of content — who drafted, submitted, reviewed, approved, and published it, and when — so every step in the lifecycle is independently verifiable. | Every transition in [Content Lifecycle Workflow](./02-content-lifecycle-workflow.md) has a corresponding Audit Log entry, viewable on the existing Audit Log screen. |

### Student

| ID | Story | Acceptance Criteria |
|---|---|---|
| S-1 | As a Student, I only ever see Published Lessons and Assessments, never Draft/Submitted/Approved-but-unpublished content, so what I see is always institutionally sanctioned. | A direct request for a non-Published Lesson/Assessment ID is denied server-side (fail-closed, per Milestone 10's existing authorization pattern), not just hidden from navigation. |
| S-2 | As a Student, I can complete a Published Lesson exactly as I could in Milestone 10, so nothing about my existing experience regresses. | `markLessonComplete` continues to work unchanged for Published Lessons. |
| S-3 | As a Student, I can submit a Published Assessment and receive an approved Grade exactly as I could in Milestone 10. | The existing Submission → Grade → Approval flow is unchanged for Published Assessments. |
| S-4 | As a Student, once my Grade for a Competency-linked Assessment is Approved, I see that Competency reflected in my progress, so the competency-tracking half of the lifecycle is visibly proven, not just logged internally. | A simple per-Student "Competencies in progress / achieved" list appears, driven by Approved Grades against Competency-linked Assessments. |

## Success Criteria

This slice is successful if, end to end, in one real (not simulated)
pass through the system:

1. A Faculty member drafts a Lesson and an Assessment, both tagged with
   a Competency.
2. Both are submitted, reviewed, and returned at least once (proving the
   return path, not only the happy path), then resubmitted and approved
   by a Program Director.
3. An Administrator publishes both.
4. A Student — who could not see either item before Step 3 — now sees
   and completes the Lesson, then submits the Assessment.
5. Faculty grades the submission; Program Director approves the Grade
   (Milestone 10's existing gate, unchanged).
6. The Student's Competency progress reflects the newly Approved Grade.
7. An Administrator, using only the Audit Log, can reconstruct every
   step above — who did what, when — without consulting any other
   source.

If all seven hold, the slice has proven that Milestone 11's approval-
gated, competency-aware Content Engine composes correctly with
Milestone 10's implemented Identity, RBAC, Enrollment, Assessments,
Gradebook, and Audit services — the explicit purpose stated in this
milestone's instructions.

## Explicit Exclusions

- No Module, Program Version, Course Version, Lesson Version, or
  Assessment Version — this slice uses a single mutable status field
  per content item, not immutable versioning (see
  [Domain Impact Review](./03-domain-impact-review.md)).
- No two-step Faculty Review / Curriculum Committee Review distinction
  — one Review → Approval path, held by Program Director.
- No Course Outcome, Program Learning Outcome, or Institution Mission
  levels — only a direct Lesson-to-Competency (and, via Assessment,
  Grade-to-Competency) link.
- No Question Bank, Rubric, or Competency Checklist — the existing
  Milestone 10 Assessment shape (`title`, `instructions`, `maxScore`) is
  reused unchanged, with only a status field and Competency link added.
- No Archive/Restore workflow — Published is the terminal state modeled
  in this slice; Archive remains **Future**.
- No new RBAC Role, no scope model changes beyond what
  [ROLE_SCOPE](../../../src/domain/roles.ts) already supports.
- No AI-assisted drafting, suggestion, or review tooling of any kind.
- No production code, schema, or API — this document, like the rest of
  this milestone, is a plan for the next implementation milestone, not
  that milestone itself.

## ⚠️ Needs Verification

- Whether "return with a reason" (F-4, PD-1) should notify Faculty
  through the existing Notifications concept (named in Milestone 6 but
  not implemented in Milestone 10) or simply be visible on next login —
  this document assumes the latter, consistent with Milestone 10 having
  no Notifications implementation yet.
- Whether Program Director's review authority (PD-1) should require the
  content's author to be a different person (peer-review discipline) or
  whether a Program Director may approve content they also drafted —
  not decided here; Milestone 10's Grade approval gate has the same
  open question and resolves it the same way (no enforced separation),
  so this slice follows that precedent for consistency.

# Testing Strategy

**Status:** Draft
**Milestone:** 12 — Curriculum Delivery Vertical Slice
**Date:** 2026-08-07

## Purpose

This document defines the tests the implementation phases in
[Implementation Plan](./05-implementation-plan.md) must pass, extending
Milestone 10's existing Vitest suite
(`tests/{auth,permissions,student-workflow,faculty-workflow,approval-workflow}.test.ts`,
28 tests) with new coverage for this slice's lifecycle — same tooling,
same test-database discipline
([Testing Strategy Implementation](../../milestones/milestone-9-engineering-foundation-development-setup/06-testing-strategy-implementation.md)),
no new testing framework.

## RBAC Permissions

| Test | Expectation |
|---|---|
| Faculty not assigned to a Course Offering cannot draft content for its Course | Denied, per existing `hasRoleForCourseOffering` |
| Faculty can draft content for a Course Offering they are assigned to | Allowed |
| A Program Director can approve/return content only for Programs their Role Assignment covers | Denied for out-of-scope Programs, per existing `hasRoleForProgram`; allowed for in-scope |
| A Faculty member (not Program Director) cannot approve or return submitted content | Denied |
| A Program Director (not Administrator) cannot Publish Approved content | Denied — Publish is Administrator-only, per [Content Lifecycle Workflow](./02-content-lifecycle-workflow.md) |
| An Administrator can Publish Approved content for any Program | Allowed, per existing `requireAdministrator` |
| A Student cannot draft, submit, review, approve, or publish content under any circumstance | Denied at every step |

## Content Visibility Rules

| Test | Expectation |
|---|---|
| A Student's Course Offering page lists only Published Lessons/Assessments | Draft/Submitted/Approved items absent from the list |
| A Student requesting a Draft Lesson's URL directly | Denied server-side (fail-closed), not merely absent from navigation, per [PRD S-1](./01-product-requirements-document.md#student) |
| A Student requesting a Submitted-for-Review or Approved-but-unpublished Assessment's URL directly | Denied, same as above |
| Faculty/Program Director/Administrator viewing a Course Offering see content at every status | All statuses visible, since authoring/review requires seeing Draft and in-review content |
| The instant a status changes to Published, the content appears on the Student-facing list on next read | No caching/staleness gap that would delay visibility (consistent with existing Server Component read-on-request pattern, no client cache to invalidate) |

## Approval Gates

| Test | Expectation |
|---|---|
| Content in Draft status cannot be approved or published directly (skipping Submitted for Review) | Denied — the state machine in [Content Lifecycle Workflow](./02-content-lifecycle-workflow.md#content-status-state-machine) only allows Draft → Submitted, not Draft → Approved |
| Content in Submitted-for-Review status can be Returned (back to Draft, with a reason) or Approved, and nothing else | Any other target status is rejected |
| Returning content without a reason | Rejected — reason is required, per [PRD F-4](./01-product-requirements-document.md#faculty) |
| Content in Approved status can be Published, and cannot be re-submitted or re-reviewed without first being edited | Approved is a stable resting state until Publish |
| Content already Published cannot be re-submitted, re-reviewed, or re-approved (no versioning in this slice, per [Domain Impact Review](./03-domain-impact-review.md)) | Denied — Published is terminal for this slice's state machine |
| A Lesson without at least one Competency tag cannot be submitted for review | Denied, per [PRD F-5](./01-product-requirements-document.md#faculty) |

## Student Completion Tracking

| Test | Expectation |
|---|---|
| A Student can mark a Published Lesson complete | `markLessonComplete` succeeds, identical to Milestone 10's existing behavior |
| A Student cannot mark a non-Published Lesson complete (should be unreachable via UI, but the server action itself must also reject it) | Denied server-side |
| Lesson completion state for Published Lessons matches Milestone 10's existing `LessonCompletion` behavior exactly (no regression) | Existing Milestone 10 tests for this behavior continue to pass unmodified |

## Assessment Completion

| Test | Expectation |
|---|---|
| A Student can submit a Published Assessment | `submitAssessment` succeeds, unchanged from Milestone 10 |
| A Student cannot submit a non-Published Assessment (server-action-level check, not just UI) | Denied server-side |
| Resubmission behavior for a Published Assessment matches Milestone 10's existing upsert behavior exactly | Existing Milestone 10 tests continue to pass unmodified |

## Grade Recording

| Test | Expectation |
|---|---|
| The full `enterGrade → submitGradeForApproval → approveGrade` pipeline works, unmodified, against a Submission for a gated (Published) Assessment | Behaves identically to Milestone 10's existing approval-workflow test suite — this is a regression check, not new behavior, per [Implementation Plan — Phase 4](./05-implementation-plan.md#phase-4-assessment-integration) |
| `rejectGrade` continues to return a Grade to Draft, preserving score, unchanged | Existing Milestone 10 behavior, unmodified |

## Competency Progress

| Test | Expectation |
|---|---|
| Before any Grade is Approved for a Competency-linked Assessment, the Student's Competency Progress does not list that Competency | Absent |
| Immediately after the Grade is Approved, the Competency appears in the Student's Competency Progress | Present, with no separate action required (a derived read, per [Domain Impact Review](./03-domain-impact-review.md#new-concept-required-competency-minimal)) |
| A Grade that is Submitted but not yet Approved does not yet count toward Competency Progress | Absent until Approved specifically, not Submitted |
| A Program Director sees correct Competency coverage for content they've approved | Matches [PRD PD-2](./01-product-requirements-document.md#program-director) |

## Audit Events

| Test | Expectation |
|---|---|
| Every state transition in [Content Lifecycle Workflow](./02-content-lifecycle-workflow.md#step-by-step-detail) produces exactly one matching `AuditLog` entry, with correct `actorId`, `action`, `entityType`, `entityId`, and timestamp | One-to-one correspondence, no missing or duplicate entries |
| A Return action's Audit Log entry includes the required reason in its metadata | Present |
| No audit entry is produced for read-only actions (a Student viewing Published content, viewing Competency Progress) | Absent, consistent with Milestone 10's existing audit-writes-not-reads discipline |
| The full [PRD Success Criteria](./01-product-requirements-document.md#success-criteria) scenario, replayed end to end, is fully reconstructable from `listAuditLog()` alone, in correct chronological order | Reconstructable — this is the milestone's ultimate proof point, tested as a single end-to-end integration test in addition to the unit-level checks above |

## Test Organization

Following Milestone 10's existing convention
(`tests/<area>.test.ts`, `tests/helpers/fixtures.ts`,
`tests/helpers/reset-db.ts`), this slice's tests are expected to add:

- `tests/content-authoring.test.ts` — Phase 1 coverage
- `tests/content-approval-workflow.test.ts` — Phase 2 coverage (state
  machine, RBAC, audit events for content transitions)
- `tests/content-delivery.test.ts` — Phase 3 coverage (visibility rules,
  fail-closed direct access)
- `tests/competency-tracking.test.ts` — Phase 5 coverage
- An extension to the existing `tests/approval-workflow.test.ts` — Phase
  4's regression checks belong alongside Milestone 10's existing Grade
  tests, not in a new file, since nothing about Grade behavior itself
  changes
- An end-to-end scenario test covering the full
  [PRD Success Criteria](./01-product-requirements-document.md#success-criteria) —
  Phase 6 coverage

No new test database, mocking strategy, or CI configuration is required
— this slice reuses
[vitest.config.mts](../../../vitest.config.mts) and
[tests/setup.ts](../../../tests/setup.ts) exactly as they exist today.

## Current / Planned / Future

| Element | Status |
|---|---|
| Existing 28 Milestone 10 tests | **Current** — passing, unmodified |
| RBAC, Visibility, Approval Gate, Completion, Assessment, Competency, and Audit test tables above | **Planned** — written alongside each corresponding [Implementation Plan](./05-implementation-plan.md) phase |
| End-to-end PRD Success Criteria scenario test | **Planned** — Phase 6 |
| Real-browser E2E smoke testing (ad hoc, as done for Milestone 10) | **Planned**, same ad hoc, not-committed-to-repo approach as Milestone 10 |

## ⚠️ Needs Verification

- Whether the end-to-end scenario test should run against the real
  SQLite test database (as all of Milestone 10's tests do) or whether
  its length (a full multi-actor, multi-step scenario) warrants a
  separate, longer-running test tier — not decided; this document
  assumes it fits within the existing `fileParallelism: false` serial
  test run without a new tier.

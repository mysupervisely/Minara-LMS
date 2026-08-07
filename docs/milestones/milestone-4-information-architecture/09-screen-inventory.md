# Screen Inventory

**Status:** Draft
**Milestone:** 4 — Information Architecture & User Experience
**Date:** 2026-08-07

This document is the **master inventory** of every screen identified
across the seven portal documents in this milestone (
[Student](./02-student-portal.md),
[Faculty](./03-faculty-portal.md),
[Program Director](./04-program-director-portal.md),
[Admissions](./05-admissions-portal.md),
[Clinical/Externship Coordinator](./06-clinical-coordinator-portal.md),
[Employer](./07-employer-portal.md),
[Administrator](./08-administrator-portal.md)), organized by portal and
tagged **Required / Planned / Future**.

## A Note on Vocabulary

Every other document in this repository uses **Current / Planned /
Future** to describe *planning horizon* (is this in scope for the
architecture work happening now, near-term build-out, or the long-term
vision). This document deliberately uses a different vocabulary —
**Required / Planned / Future** — because a screen inventory answers a
different question: *build necessity*, not planning horizon.

| Term (this document) | Meaning | Rough equivalent elsewhere |
|---|---|---|
| **Required** | Without this screen, the core operational loop it belongs to (the minimum viable version of that role's responsibilities, per [Role Definitions](../milestone-2-user-roles-permission-architecture/01-role-definitions.md)) cannot function at all. | A subset of "Planned" elsewhere — the part that is load-bearing. |
| **Planned** | Needed for complete, correct support of the role as documented in Milestones 2–3, but the role's core loop can function without it initially. | Corresponds to "Planned" elsewhere. |
| **Future** | Depends on a capability already tagged **Future** in an earlier milestone, or on a product decision not yet made. | Corresponds to "Future" elsewhere. |

**⚠️ Needs Verification:** The specific Required vs. Planned assignment
below is this document's best-effort judgment about which screens are
load-bearing for each role's core loop, consistent with the sequencing
caveat already established in
[Milestone 1's Capability Table](../milestone-1-product-vision-platform-strategy/10-capability-table.md).
It is not a committed build sequence or roadmap — that requires
stakeholder input and belongs to a future roadmap milestone.

## Student Portal

| Screen | Status | Notes |
|---|---|---|
| Dashboard | Required | |
| My Courses | Required | |
| Current Lesson | Required | |
| Assignments | Required | |
| Assessments | Required | |
| Grades | Required | |
| Progress | Required | |
| Externship | Required (conditional) | Only for programs requiring externship |
| Calendar | Planned | |
| Messages | Required | |
| AI Tutor | Planned | High product value; not load-bearing for the bare course-delivery loop |
| Certificates | Required | Terminal step of the core loop |
| Payments | Required | Gates Enrollment and Certificate Issuance |
| Resources | Planned | |
| Notifications | Required | |
| Profile & Settings | Required | |
| Support | Planned | |

## Faculty Portal

| Screen | Status | Notes |
|---|---|---|
| Dashboard | Planned | |
| My Sections | Required | |
| Roster | Required | |
| Content & Preparation | Required | |
| Attendance | Planned | Conditional on course format |
| Assignments & Assessments | Required | |
| Gradebook | Required | |
| Feedback | Required | |
| Final Grade Submission | Required | Originates the grade approval gate |
| Messages | Required | |
| Reporting | Planned | |
| Calendar | Planned | |
| Profile & Settings | Required | |

## Program Director Portal

| Screen | Status | Notes |
|---|---|---|
| Dashboard | Planned | |
| Curriculum Oversight | Planned | |
| Cohort Management | Required | |
| Faculty Coordination | Planned | |
| Grade Approvals | Required | Approval gate in [Faculty Workflows](../milestone-3-student-journey-core-workflows/02-faculty-workflows.md) |
| Externship Eligibility & Completion | Required (conditional) | Only for programs requiring externship |
| Graduation & Certificate Approvals | Required | Approval gate in [Certificate & Graduation Workflow](../milestone-3-student-journey-core-workflows/05-certificate-graduation-workflow.md) |
| Faculty Assignment Proposals | Planned | Depends on the **Planned** propose/approve model itself |
| Program Reporting | Planned | |
| Student Directory | Planned | |
| Messages | Planned | |
| Profile & Settings | Required | |

## Admissions Portal

| Screen | Status | Notes |
|---|---|---|
| Dashboard | Planned | |
| Applications | Required | |
| Application Detail | Required | |
| Documents | Required | |
| Review & Decision | Required | |
| Communication History | Planned | |
| Waitlist | Planned | |
| Communication | Planned | |
| Enrollment | Required | |
| Reporting | Planned | |
| Profile & Settings | Required | |

## Clinical/Externship Coordinator Portal

| Screen | Status | Notes |
|---|---|---|
| Dashboard | Planned | |
| Sites | Required | |
| Site Profile | Required | |
| Capacity & Availability | Planned | |
| Assigned Students | Planned | |
| Eligibility Queue | Required | |
| Placements | Required | |
| Orientation Status | Planned | |
| Hour Log | Required | |
| Midpoint Evaluation | Required | |
| Final Evaluation | Required | |
| Completion Verification | Required | Approval gate feeding Graduation Review |
| Hours & Evaluations | Planned | |
| Employer Communication | Planned | |
| Reporting | Planned | |
| Profile & Settings | Required | |

## Employer Portal

| Screen | Status | Notes |
|---|---|---|
| Dashboard | Planned | |
| Partnership Profile | Required | |
| Placed Students | Required | |
| Evaluations | Required | |
| Hiring Pipeline | Future | Depends on **Planned/Future** certificate-sharing mechanism |
| Messages | Planned | |
| Profile & Settings | Required | |

## Administrator Portal

| Screen | Status | Notes |
|---|---|---|
| Dashboard | Planned | |
| Institution Structure | Required | |
| User Accounts | Required | |
| Role Assignments | Required | |
| Faculty Assignment Approvals | Planned | |
| Enrollment Oversight | Planned | |
| Financial Oversight | Required | |
| Certificates | Required | Issuance gate |
| Audit Log | Required | Compliance-critical, per [Audit and Accountability Framework](../milestone-2-user-roles-permission-architecture/05-audit-accountability-framework.md) |
| Reporting & Analytics | Planned | |
| Announcements | Planned | |
| Profile & Settings | Required | |
| System Configuration | Future | Deliberately unspecified — implementation concern |

## Summary Counts

| Status | Approximate Screen Count |
|---|---|
| Required | 46 |
| Planned | 38 |
| Future | 5 |
| **Total Screens Catalogued** | **89** |

*Counts are approximate and will shift as later milestones refine
individual screens; they are provided to give a sense of scale, not as a
committed number.*

## ⚠️ Needs Verification

- The Required/Planned split above reflects an assumed build priority
  (core loop first, supporting screens after) that has not been
  reviewed by stakeholders and should not be read as a committed
  sequence.
- Several "Required (conditional)" screens depend on whether all
  programs include an externship component — see
  [Student Lifecycle Workflow §Needs Verification](../milestone-3-student-journey-core-workflows/01-student-lifecycle-workflow.md).
- This inventory reflects the seven portals and their screens as
  currently scoped; new screens may surface once Milestone 5+
  (technical architecture) reveals gaps between workflow steps and
  screen coverage.

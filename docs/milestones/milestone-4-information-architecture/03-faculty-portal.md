# Faculty Portal

**Status:** Draft
**Milestone:** 4 — Information Architecture & User Experience
**Date:** 2026-08-07

The Faculty Portal is the primary surface for the role defined in
[Role Definitions §2 (Faculty Instructor)](../milestone-2-user-roles-permission-architecture/01-role-definitions.md).
Its screens directly implement
[Faculty Workflows](../milestone-3-student-journey-core-workflows/02-faculty-workflows.md).

## Navigation Structure

**Primary Navigation:** Dashboard · My Sections · Gradebook · Feedback ·
Messages · Reporting · Calendar

**Secondary Navigation:** Within a selected section under **My
Sections**: Roster · Content & Preparation · Attendance · Assignments &
Assessments · Section Gradebook

## Screens

| Screen | Purpose | Key Information | Relationships | Future Expansion |
|---|---|---|---|---|
| **Dashboard** | Single-glance summary across all assigned sections | Pending grading, unread messages, upcoming deadlines, at-risk students | Aggregates My Sections, Gradebook, Messages | Personalized teaching insights — **Future** |
| **My Sections** | Entry point to every section a Faculty Instructor is assigned to (per role assignment, per the [Multi-School and Multi-Program Access Model](../milestone-2-user-roles-permission-architecture/04-multi-school-multi-program-access-model.md)) | List of assigned sections across programs/schools, each with enrollment and status | Implements "Course Assignment" in [Faculty Workflows](../milestone-3-student-journey-core-workflows/02-faculty-workflows.md) | — |
| **Roster** (secondary, per section) | View of enrolled students in a section | Student list, contact info, enrollment status | Reflects Cohort Assignment from the [Student Lifecycle Workflow](../milestone-3-student-journey-core-workflows/01-student-lifecycle-workflow.md) | — |
| **Content & Preparation** (secondary, per section) | Faculty's view/configuration of curriculum content delivered for the section | Delivered curriculum content (authored in Minara-Curriculum), section-level scheduling | Implements "Course Preparation" in [Faculty Workflows](../milestone-3-student-journey-core-workflows/02-faculty-workflows.md) | Faculty-authored supplemental material — **Future**, boundary with Minara-Curriculum **⚠️ Needs Verification** |
| **Attendance** (secondary, per section) | Recording attendance where applicable | Session dates, attendance status per student | Implements the conditional Attendance step in [Faculty Workflows](../milestone-3-student-journey-core-workflows/02-faculty-workflows.md) | — |
| **Assignments & Assessments** (secondary, per section) | Faculty's queue of submitted work to review | Submissions, due dates, review status | Implements "Assignment Review" in [Faculty Workflows](../milestone-3-student-journey-core-workflows/02-faculty-workflows.md); populates Student's Assignments/Assessments screens | Rubric-assisted grading — **Future** |
| **Gradebook** | Cross-section grade entry and management | Grades per student per section, grade status (draft vs. submitted) | Implements "Grade Entry" in [Faculty Workflows](../milestone-3-student-journey-core-workflows/02-faculty-workflows.md); feeds Student Grades screen | Grade analytics/distribution view — **Future** |
| **Feedback** | Where Faculty compose and review feedback tied to graded work | Feedback history per student/assignment | Implements "Student Feedback" in [Faculty Workflows](../milestone-3-student-journey-core-workflows/02-faculty-workflows.md) | — |
| **Final Grade Submission** (reached from Section Gradebook at course completion) | Submits the section's final grades for approval | Final grade roster, submission status | The originating step of the "Final Grade Approval" gate in [Faculty Workflows](../milestone-3-student-journey-core-workflows/02-faculty-workflows.md), held by Program Director | Configurable multi-step approval — **Future**, see [Faculty Workflows](../milestone-3-student-journey-core-workflows/02-faculty-workflows.md) |
| **Messages** | Communication with students in own sections and with Program Director | Conversation threads scoped to own sections/program | Implements Communication domain of the [Permission Framework](../milestone-2-user-roles-permission-architecture/02-permission-framework.md) | — |
| **Reporting** | Section-level academic reporting | Grade distributions, completion rates, per-section outcomes | Implements "Academic Reporting" in [Faculty Workflows](../milestone-3-student-journey-core-workflows/02-faculty-workflows.md) | Cross-section comparative analytics — **Future** |
| **Calendar** | Teaching schedule across sections | Section dates, deadlines Faculty set, orientation dates | Aggregates dates from My Sections | External calendar sync — **Future** |
| **Profile & Settings** | Personal account management | Contact info, notification preferences | Own record under Platform Administration — User Accounts, per the [Permission Framework](../milestone-2-user-roles-permission-architecture/02-permission-framework.md) | — |

## Current / Planned / Future

| Screen | Status |
|---|---|
| Dashboard, My Sections, Roster | **Planned** |
| Content & Preparation | **Planned** |
| Attendance | **Planned** (conditional) |
| Assignments & Assessments, Gradebook, Feedback | **Planned** |
| Final Grade Submission | **Planned** |
| Messages, Reporting, Calendar | **Planned** |
| Profile & Settings | **Planned** |
| Rubric-assisted grading | **Future** |
| Cross-section comparative analytics | **Future** |
| Faculty-authored supplemental content | **Future** |

## ⚠️ Needs Verification

- Whether Faculty may author any supplemental content directly, or all
  content strictly originates in Minara-Curriculum — see
  [Scope Boundaries](../milestone-1-product-vision-platform-strategy/09-scope-boundaries.md).
- Whether Attendance applies to every course format — carried over as an
  open question from [Faculty Workflows](../milestone-3-student-journey-core-workflows/02-faculty-workflows.md).

# Platform Workflow Catalog

**Status:** Draft
**Milestone:** 3 — Student Journey & Core Platform Workflows
**Date:** 2026-08-07

This document is an **inventory** of every workflow area Minara-LMS is
expected to eventually support. It intentionally does not expand each
workflow in detail — six workflows are fully detailed elsewhere in this
milestone (linked below); everything else is catalogued here as a named,
scoped area for future workflow documentation, so that no capability
area is discovered late in the project.

This catalog is organized by domain grouping for readability. Grouping
is descriptive, not architectural — it does not imply a service or
module boundary (no such boundary is defined at this stage; see
[Scope Boundaries](../milestone-1-product-vision-platform-strategy/09-scope-boundaries.md)).

## Already Detailed in This Milestone

| Workflow | Document |
|---|---|
| Student Lifecycle (end-to-end) | [01-student-lifecycle-workflow.md](./01-student-lifecycle-workflow.md) |
| Faculty / Course Delivery | [02-faculty-workflows.md](./02-faculty-workflows.md) |
| Admissions | [03-admissions-workflows.md](./03-admissions-workflows.md) |
| Externship Management | [04-externship-management-workflow.md](./04-externship-management-workflow.md) |
| Certificate & Graduation | [05-certificate-graduation-workflow.md](./05-certificate-graduation-workflow.md) |
| AI Learning Assistant | [06-ai-learning-assistant-workflow.md](./06-ai-learning-assistant-workflow.md) |

## Full Catalog

| Workflow Area | One-Line Description | Status | Detailed? |
|---|---|---|---|
| **Admissions** | Inquiry through enrollment decision | Planned | ✅ [Doc 03](./03-admissions-workflows.md) |
| **Enrollment** | Confirming an admitted student into an active program relationship | Planned | ✅ [Doc 01](./01-student-lifecycle-workflow.md) |
| **Payments** | Tuition/fee collection, holds, and clearance | Planned | Partially — appears as a gate in [Doc 01](./01-student-lifecycle-workflow.md) and [Doc 05](./05-certificate-graduation-workflow.md); full payment workflow (billing cycles, refunds, payment plans) not yet detailed |
| **Registration** | Section/course selection and scheduling within a cohort | Planned | Not yet detailed — related to Cohort Assignment in [Doc 01](./01-student-lifecycle-workflow.md) |
| **Course Delivery** | Day-to-day teaching and learning loop | Planned | ✅ [Doc 02](./02-faculty-workflows.md) |
| **Learning Objects** | Individual units of curriculum content as delivered | Planned | Not yet detailed — content structure is Minara-Curriculum's domain per [Scope Boundaries](../milestone-1-product-vision-platform-strategy/09-scope-boundaries.md); LMS-side delivery workflow pending |
| **Assignments** | Creation, submission, and review of graded work | Planned | Partially — appears in [Doc 02](./02-faculty-workflows.md); student submission workflow not yet detailed |
| **Quizzes** | Lower-stakes, often auto-gradable assessment | Planned | Not yet detailed — treated as a subtype of Assessments |
| **Exams** | Higher-stakes, formal assessment | Planned | Not yet detailed — treated as a subtype of Assessments; proctoring approach not yet defined |
| **Gradebook** | Aggregation and record of grades | Planned | Partially — appears in [Doc 02](./02-faculty-workflows.md) and [Doc 05](./05-certificate-graduation-workflow.md) |
| **Messaging** | Direct and group communication between roles | Planned | Referenced throughout; standalone workflow not yet detailed |
| **Notifications** | System-generated alerts (deadlines, status changes, escalations) | Planned | Referenced throughout (e.g., applicant communication, AI escalation); standalone workflow not yet detailed |
| **Calendar** | Scheduling of courses, deadlines, orientation, externship milestones | Future | Not yet detailed |
| **Faculty Management** | Assignment, credentialing, and coordination of Faculty | Planned | Partially — Course Assignment in [Doc 02](./02-faculty-workflows.md); broader staffing/credentialing workflow not yet detailed |
| **Program Management** | Curriculum oversight, cohort health, reporting at the Program Director level | Planned | Referenced throughout; standalone workflow not yet detailed |
| **Student Support** | Academic advising, remediation, and general student assistance beyond AI/faculty feedback | Planned | Partially — remediation loops appear in [Doc 01](./01-student-lifecycle-workflow.md); dedicated support workflow not yet detailed |
| **Accessibility** | Accommodation requests and delivery (not a UI feature, a workflow: request → review → accommodation applied) | Future | Not yet detailed — cross-cutting principle established in [Guiding Principles](../milestone-1-product-vision-platform-strategy/03-guiding-principles.md) §3; operational workflow pending |
| **Externships** | Clinical/externship placement and evaluation | Planned | ✅ [Doc 04](./04-externship-management-workflow.md) |
| **Certificates** | Credentialing on program completion | Planned | ✅ [Doc 05](./05-certificate-graduation-workflow.md) |
| **Continuing Education** | Post-graduation/alumni learning engagement | Future | Not yet detailed — related to Alumni Transition in [Doc 01](./01-student-lifecycle-workflow.md) |
| **Employer Partnerships** | Partnership management, evaluation, hiring pipeline | Planned | Partially — Employer role in [Doc 04](./04-externship-management-workflow.md); broader partnership/hiring-pipeline workflow not yet detailed |
| **Analytics** | Insight generation from platform activity | Future | Not yet detailed — capability named in [Milestone 1 Capability Table](../milestone-1-product-vision-platform-strategy/10-capability-table.md) |
| **Reporting** | Structured, often accreditation-facing output | Future | Partially — Academic Reporting appears in [Doc 02](./02-faculty-workflows.md); institution-wide reporting not yet detailed |
| **Audit Logs** | Tracking of actions, changes, approvals, history | Current (framework defined) | ✅ Framework in [Milestone 2, Doc 05](../milestone-2-user-roles-permission-architecture/05-audit-accountability-framework.md); this milestone's workflows generate the events that framework governs |
| **AI Tutor** | AI-assisted learning support | Planned | ✅ [Doc 06](./06-ai-learning-assistant-workflow.md) |
| **Role Management** | Assigning, changing, and approving role assignments | Current (framework defined) | ✅ Framework in [Milestone 2](../milestone-2-user-roles-permission-architecture/README.md); a standalone *workflow* view (e.g., the step-by-step of granting a new Faculty role assignment) is not yet diagrammed |
| **System Administration** | Institution-wide configuration, permissions, finance oversight | Planned | Referenced throughout via the Administrator role; standalone workflow not yet detailed |

## Purpose of "Not Yet Detailed" Entries

An entry marked "Not yet detailed" is a deliberate placeholder: it
confirms the workflow area is in scope for Minara-LMS and assigns it a
Current/Planned/Future status, without committing to its internal steps
yet. This keeps the catalog complete without forcing premature detail
into Milestone 3 for areas that depend on decisions not yet made (e.g.,
Quizzes/Exams depend on assessment-format decisions likely to originate
in Minara-Curriculum; Accessibility workflow detail depends on
accommodation policy from Minara-Master-Plan).

## Current / Planned / Future — Catalog Summary

| Status | Workflow Areas |
|---|---|
| **Current** (framework already defined, workflow generates events into it) | Audit Logs, Role Management |
| **Planned** | Admissions, Enrollment, Payments, Registration, Course Delivery, Learning Objects, Assignments, Quizzes, Exams, Gradebook, Messaging, Notifications, Faculty Management, Program Management, Student Support, Externships, Certificates, Employer Partnerships, AI Tutor, System Administration |
| **Future** | Calendar, Accessibility (as a dedicated workflow), Continuing Education, Analytics, Reporting (institution-wide) |

## ⚠️ Needs Verification

- Whether Quizzes and Exams warrant fully distinct workflows (e.g.,
  different proctoring or integrity requirements) or can share a single
  Assessments workflow is not yet confirmed and depends on
  Minara-Curriculum's assessment model.
- Whether Accessibility should be modeled as its own workflow (request →
  review → accommodation) or as a cross-cutting requirement applied
  within every other workflow is an open design question for a future
  milestone.
- The relative priority/sequencing of "Planned" items above is not a
  commitment to a build order — that belongs to a future roadmap
  milestone, not this catalog.

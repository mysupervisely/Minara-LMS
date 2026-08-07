# MVP Feature Prioritization

**Status:** Draft
**Milestone:** 7 — MVP Definition & Implementation Planning
**Date:** 2026-08-07

This document is a **representative prioritization matrix** — a
sample of features spanning all four priority tiers, each traced through
Milestones 3–6, demonstrating *how* the priority decisions in
[MVP Scope Definition](./02-mvp-scope-definition.md) were reasoned
through. It is not exhaustive; the full feature-to-everything mapping is
[Master Traceability Framework](./08-master-traceability-framework.md)'s
job.

## Must Have

| Feature | M3 Workflow | M4 Screen | M5 Entity | M6 Service | Rationale |
|---|---|---|---|---|---|
| Authentication & RBAC enforcement | — (cross-cutting) | — (cross-cutting) | User, Role Assignment | Identity | Nothing else functions without establishing who's acting and what they may do |
| Institution/School/Program/Cohort setup | [Student Lifecycle §Cohort Assignment](../milestone-3-student-journey-core-workflows/01-student-lifecycle-workflow.md) | [Administrator Portal — Institution Structure](../milestone-4-information-architecture/08-administrator-portal.md) | Institution, School, Program, Cohort | Learning | There is no platform to operate without a structure to operate it in |
| Manual Student Enrollment | [Student Lifecycle §Enrollment](../milestone-3-student-journey-core-workflows/01-student-lifecycle-workflow.md) | [Administrator Portal — User Accounts](../milestone-4-information-architecture/08-administrator-portal.md) | Applicant, Student, Enrollment | Admissions, Identity | The launch cohort must exist as real Enrollments before any teaching can happen |
| Course Offering delivery (Learning Engine) | [Faculty Workflows §Course Preparation](../milestone-3-student-journey-core-workflows/02-faculty-workflows.md) | [Student Portal — My Courses/Current Lesson](../milestone-4-information-architecture/02-student-portal.md) | Course Offering, Course Progress | Learning | This is the platform's core value proposition — content delivery |
| Assignment submission & review | [Faculty Workflows §Assignment Review](../milestone-3-student-journey-core-workflows/02-faculty-workflows.md) | [Faculty Portal — Assignments & Assessments](../milestone-4-information-architecture/03-faculty-portal.md) | Assignment, Grades | Assessments | A course that can't collect and evaluate work isn't a course |
| Final Grade Approval | [Faculty Workflows §Approval Points](../milestone-3-student-journey-core-workflows/02-faculty-workflows.md) | [Program Director Portal — Grade Approvals](../milestone-4-information-architecture/04-program-director-portal.md) | Grades, Approval | Gradebook | Grades without an approval gate aren't official — see the [Business Rules Catalog](../milestone-5-domain-model-data-architecture/08-business-rules-catalog.md) |
| Basic Payments (Invoice/Payment/Receipt) | [Student Lifecycle §Payment](../milestone-3-student-journey-core-workflows/01-student-lifecycle-workflow.md) | [Student Portal — Payments](../milestone-4-information-architecture/02-student-portal.md) | Invoice, Payment, Receipt | Payments | A real program has real financial obligations that must be tracked |
| Certificate issuance | [Certificate & Graduation Workflow](../milestone-3-student-journey-core-workflows/05-certificate-graduation-workflow.md) | [Administrator Portal — Certificates](../milestone-4-information-architecture/08-administrator-portal.md) | Certificate, Certificate Record | Certificates | Per [MVP Philosophy](./01-mvp-philosophy.md), a program that can't confer its credential hasn't finished its job |
| Audit Logging | [Audit and Accountability Framework](../milestone-2-user-roles-permission-architecture/05-audit-accountability-framework.md) | [Administrator Portal — Audit Log](../milestone-4-information-architecture/08-administrator-portal.md) | Audit Log | Audit | Non-negotiable per an already-approved Milestone 2 principle |

## Should Have

| Feature | M3 Workflow | M4 Screen | M5 Entity | M6 Service | Rationale |
|---|---|---|---|---|---|
| Self-service Admissions pipeline | [Admissions Workflows](../milestone-3-student-journey-core-workflows/03-admissions-workflows.md) | [Admissions Portal](../milestone-4-information-architecture/05-admissions-portal.md) | Applicant | Admissions | Not needed to launch cohort one, but needed soon to recruit cohort two without manual data entry |
| Messaging | [Faculty Workflows §Student Communication](../milestone-3-student-journey-core-workflows/02-faculty-workflows.md) | [Student Portal — Messages](../milestone-4-information-architecture/02-student-portal.md) | Message | Messaging | Improves the experience meaningfully but the core loop functions without it (email workaround possible in the interim) |
| Notification preferences | [Notification & Event Architecture](../milestone-6-technical-architecture/08-notification-event-architecture.md) | [Student Portal — Notifications](../milestone-4-information-architecture/02-student-portal.md) | Notification | Notifications | Critical-event notifications are MUST HAVE; per-type preference control is a refinement |
| Faculty/Program reporting | [Faculty Workflows §Academic Reporting](../milestone-3-student-journey-core-workflows/02-faculty-workflows.md) | [Faculty Portal — Reporting](../milestone-4-information-architecture/03-faculty-portal.md) | Reporting | Reporting Engine Area | Useful for oversight, not required for the teaching loop itself to function |

## Could Have

| Feature | M3 Workflow | M4 Screen | M5 Entity | M6 Service | Rationale |
|---|---|---|---|---|---|
| AI Tutor (Learning Support only) | [AI Learning Assistant Workflow](../milestone-3-student-journey-core-workflows/06-ai-learning-assistant-workflow.md) | [Student Portal — AI Tutor](../milestone-4-information-architecture/02-student-portal.md) | AI Conversation | AI | High product value and differentiator, but the platform demonstrably operates a real program without it |
| Resources / Support screens | — | [Student Portal — Resources/Support](../milestone-4-information-architecture/02-student-portal.md) | File | — | Genuinely useful, but substitutable by off-platform support in the near term |
| Announcements | — | [Administrator Portal — Announcements](../milestone-4-information-architecture/08-administrator-portal.md) | Announcement | Notifications | Broadcast communication is a convenience against a small launch cohort where direct communication is still practical |

## Future

| Feature | M3 Workflow | M4 Screen | M5 Entity | M6 Service | Rationale |
|---|---|---|---|---|---|
| Learning Analytics / Analytics service | — | [Administrator Portal — Reporting & Analytics](../milestone-4-information-architecture/08-administrator-portal.md) | Learning Analytics | Analytics | Already tagged **Future** in Milestone 5 — needs real usage data to be meaningful, which the MVP itself is what generates |
| Employer Hiring Pipeline | — | [Employer Portal — Hiring Pipeline](../milestone-4-information-architecture/07-employer-portal.md) | — | Externships | Depends on a certificate-sharing mechanism that is itself Future |
| Multi-school expansion tooling | — | — | — | Learning | The MVP proves the model for one School/Program before this matters |
| External integrations (any) | — | — | — | Integration Layer | Every item in [Integration Architecture](../milestone-6-technical-architecture/07-integration-architecture.md) is Future by that document's own definition |
| Mobile App | — | — | — | — | Named for the first time in [Milestone 6's Implementation Roadmap](../milestone-6-technical-architecture/10-implementation-roadmap.md) as a Future Phase item |

## Current / Planned / Future

| Element | Status |
|---|---|
| Must Have features (as listed) | **Planned** — MVP release |
| Should Have features | **Planned** — near-term follow-on |
| Could Have features | **Planned**, capacity-dependent |
| Future features | **Future** |

## ⚠️ Needs Verification

- This matrix is representative; the complete, exhaustive mapping of
  every screen and entity to a priority tier lives in
  [MVP Scope Definition](./02-mvp-scope-definition.md) (area-level) and
  [Master Traceability Framework](./08-master-traceability-framework.md)
  (full-chain detail) — this document should not be read as the sole
  source of truth for any feature not listed above.
- Every rationale above reflects this milestone's judgment, not a
  stakeholder-confirmed prioritization — see
  [Implementation Readiness Review](./09-implementation-readiness-review.md)
  for the recommendation to validate this against real institutional
  input before implementation begins.

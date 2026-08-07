# MVP Scope Definition

**Status:** Draft
**Milestone:** 7 — MVP Definition & Implementation Planning
**Date:** 2026-08-07

This document classifies every major platform area named in this
milestone's instructions into **MUST HAVE**, **SHOULD HAVE**, **COULD
HAVE**, or **FUTURE**, per the
[MVP Philosophy](./01-mvp-philosophy.md) established above. Where an
area is too broad to classify as a single unit, the table splits it into
what's in scope now versus deferred.

## Classification Definitions

| Tier | Meaning |
|---|---|
| **MUST HAVE** | The MVP cannot honestly claim to operate a real program without it. |
| **SHOULD HAVE** | Important, and expected soon after MVP — but the first real cohort's journey can complete without it. |
| **COULD HAVE** | Valuable and could be included if capacity allows, but its absence changes nothing about whether the platform works. |
| **FUTURE** | Out of scope for MVP and its near follow-on releases; revisit once the platform has real usage behind it. |

## Platform Area Classification

| Area | Classification | MVP Scope | Deferred |
|---|---|---|---|
| **Authentication** | **MUST HAVE** | Login, session establishment, single Role Assignment context per session | Multiple authentication methods per User (**Future**, per [Security Architecture](../milestone-6-technical-architecture/04-security-architecture.md)) |
| **RBAC** | **MUST HAVE** | Full Role Assignment `(Person, Role, Scope)` model, all seven roles enforceable | Delegated/temporary authority (**Future**, per [Role Hierarchy](../milestone-2-user-roles-permission-architecture/03-role-hierarchy.md)) |
| **Public Website** | **MUST HAVE** (minimal) / **SHOULD HAVE** (full) | Home page, the launch Program's page, an "Apply" entry point | Full multi-program catalog, About/institutional content, Prepped product pages (**Should/Future**, until those programs exist to describe) |
| **Admissions** | **MUST HAVE** (manual) / **SHOULD HAVE** (self-service) | Administrator-provisioned Enrollment for the first cohort | Full self-service Applicant pipeline (Inquiry → Documents → Decision → Waitlist/Deferral) — **SHOULD HAVE**, targeted for the next cohort, see [Implementation Phases](./05-implementation-phases.md) |
| **Student Portal** | **MUST HAVE** (core) | Dashboard, My Courses, Current Lesson, Assignments, Assessments, Grades, Progress, Notifications, Profile & Settings | Calendar, Resources, Support, Messages (**SHOULD HAVE**); AI Tutor (**COULD HAVE**); Externship (**Conditional MUST HAVE**, see below) |
| **Faculty Portal** | **MUST HAVE** (core) | Dashboard, My Sections, Roster, Content & Preparation, Assignments & Assessments, Gradebook, Feedback, Final Grade Submission | Reporting, Calendar, Messages (**SHOULD HAVE**) |
| **Courses** (curriculum delivery) | **MUST HAVE** | Course, Module, Lesson, Course Offering delivery | Content versioning (**Future**, per [Future Data Architecture Considerations](../milestone-5-domain-model-data-architecture/09-future-data-architecture-considerations.md)) |
| **Lessons** | **MUST HAVE** | Lesson and Learning Object delivery, completion tracking | Offline/downloadable access (**Future**) |
| **Assessments** | **MUST HAVE** | Assignments and basic Assessments/Quizzes | Distinct proctored Exam handling, reusable Question Bank tooling (**Should/Could**) |
| **Gradebook** | **MUST HAVE** | Grade entry, Final Grade Approval gate | Grade analytics/distribution views (**Future**) |
| **Payments** | **MUST HAVE** (basic) | Invoice, Payment, Receipt; payment status gates Enrollment | Payment plans/installments, refunds (**Future**) |
| **Cohorts** | **MUST HAVE** | Cohort creation and Student assignment within the launch Program | Multiple concurrent cohorts across schools (**Future**, part of [Multi-School Expansion](./05-implementation-phases.md)) |
| **Externships** | **Conditional MUST HAVE** | Full Externship Management Workflow, but *only if* the launch Program requires one | If the launch Program does not require externships, this entire area is **FUTURE** for MVP — see Needs Verification below |
| **Certificates** | **MUST HAVE** | Certificate & Graduation Workflow through Certificate Record issuance | Employer-facing sharing, external verification (**Future**) |
| **AI Tutor** | **COULD HAVE** | If included: minimal Learning Support only, with the full Safety & Scope Gate and Escalation Router from [AI Platform Architecture](../milestone-6-technical-architecture/06-ai-platform-architecture.md) — never a partial safety implementation | Content/Faculty/Administrative AI Assistance (**Future**) |
| **Analytics** | **FUTURE** | Not part of MVP | Entire area — genuinely needs real usage data to be meaningful, per [MVP Philosophy](./01-mvp-philosophy.md) |
| **Notifications** | **MUST HAVE** (critical events only) | Grade posted, deadline approaching, approval completed | Per-event-type preferences, multi-channel delivery, digests (**Should/Future**, per [Notification & Event Architecture](../milestone-6-technical-architecture/08-notification-event-architecture.md)) |
| **Messaging** | **SHOULD HAVE** | Direct Student ↔ Faculty/Staff communication | Group/cohort-wide messaging (**Future**) |
| **Administration** | **MUST HAVE** (core) | Institution Structure, User Accounts, Role Assignments, basic Financial Oversight, Audit Log | Reporting & Analytics, Announcements (**SHOULD HAVE**) |

## Current / Planned / Future

| Element | Status |
|---|---|
| This classification table | **Current** — the MVP scope decision for this milestone |
| MUST HAVE areas | **Planned** — first release target, see [Implementation Phases](./05-implementation-phases.md) |
| SHOULD HAVE areas | **Planned** — near-term follow-on |
| COULD HAVE areas | **Planned**, capacity-dependent |
| FUTURE areas | **Future** |

## ⚠️ Needs Verification

- **Which Program launches first, and whether it requires an
  externship** is the single highest-impact open question shaping this
  document — it determines whether Externships (and, by extension,
  Clinical Coordinator and Employer Portal) belong in the MVP boundary
  at all. This has been an open question since Milestone 3 and must be
  resolved before [Implementation Phases](./05-implementation-phases.md)
  can be treated as final.
- Whether "manual Admissions" is actually acceptable to the institution
  for a real launch, or whether stakeholders consider self-service
  Admissions non-negotiable for MVP — this document's classification is
  a judgment call based on operational necessity, not a confirmed
  institutional decision.
- Whether basic Payments (no plans/refunds) is sufficient for a real
  first cohort, or whether the institution's financial policy requires
  payment plans from day one.

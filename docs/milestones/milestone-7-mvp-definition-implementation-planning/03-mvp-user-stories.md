# MVP User Stories

**Status:** Draft
**Milestone:** 7 — MVP Definition & Implementation Planning
**Date:** 2026-08-07

This document expresses the MVP scope from
[MVP Scope Definition](./02-mvp-scope-definition.md) as user stories,
one set per role. Every story is tagged with its priority tier (MUST /
SHOULD / COULD), and every acceptance criterion is written at a
conceptual level — no field names, no UI detail, no code.

## Student

**MUST — View my courses and current work**
> As a Student, I want to see all my enrolled courses and my current
> lesson in each, so that I always know what to work on next.

*Acceptance criteria (conceptual):* the Dashboard reflects every active
Enrollment; My Courses lists each Enrollment's Program and progress;
Current Lesson reflects the Student's actual Course Progress, per the
[Student Domain Model](../milestone-5-domain-model-data-architecture/03-student-domain-model.md).

**MUST — Submit work and take assessments**
> As a Student, I want to submit assignments and complete assessments,
> so that I can demonstrate what I've learned.

*Acceptance criteria:* a submission before the deadline is accepted and
its status is visible; a Grade appears once Faculty approval completes,
per [Faculty Workflows](../milestone-3-student-journey-core-workflows/02-faculty-workflows.md).

**MUST — See my grades and progress**
> As a Student, I want to see my grades and overall program progress, so
> that I understand how I'm doing.

*Acceptance criteria:* Grades reflects approved Grades only (not Faculty
drafts); Progress reflects completion against the Program's requirements.

**MUST — Manage my tuition payment**
> As a Student, I want to see what I owe and pay it, so that my
> enrollment stays active.

*Acceptance criteria:* Payments shows current balance and history; a
completed Payment clears any Enrollment-blocking hold, per the
[Student Lifecycle Workflow](../milestone-3-student-journey-core-workflows/01-student-lifecycle-workflow.md).

**MUST — Receive my certificate**
> As a Student, I want to receive my certificate once I complete my
> program, so that I have proof of my qualification.

*Acceptance criteria:* Certificates shows an issued Certificate only
after the full
[Certificate & Graduation Workflow](../milestone-3-student-journey-core-workflows/05-certificate-graduation-workflow.md)
completes, including Administrator issuance.

**SHOULD — Message my instructor**
> As a Student, I want to message my Faculty Instructor directly, so
> that I can ask questions without leaving the platform.

*Acceptance criteria:* Messages are scoped to Students and Faculty who
share a Course Offering relationship, per the
[Permission Framework](../milestone-2-user-roles-permission-architecture/02-permission-framework.md).

## Faculty

**MUST — See my sections and rosters**
> As a Faculty Instructor, I want to see the sections I'm assigned to
> and who's enrolled in each, so that I know who I'm teaching.

*Acceptance criteria:* My Sections lists every active Teaching
Assignment; Roster reflects the Cohort actually assigned to that
Course Offering.

**MUST — Review and grade student work**
> As a Faculty Instructor, I want to review submissions and enter
> grades, so that Students get accurate, timely feedback.

*Acceptance criteria:* the review queue shows only submissions for
Course Offerings the Faculty Instructor holds a Teaching Assignment for,
per the [Business Rules Catalog](../milestone-5-domain-model-data-architecture/08-business-rules-catalog.md).

**MUST — Submit final grades for approval**
> As a Faculty Instructor, I want to submit final grades for a section,
> so that the course can be formally closed out.

*Acceptance criteria:* submission moves the section's Grades into a
Program-Director-approval-pending state; the Faculty Instructor cannot
self-approve, per
[Faculty Workflows §Approval Points](../milestone-3-student-journey-core-workflows/02-faculty-workflows.md).

## Admissions Staff

**MUST — Record a manually onboarded student**
> As an Admissions Staff member, I want to record a prospective
> student's information and confirm their enrollment into the launch
> cohort, so that the first real cohort can begin without waiting on a
> full self-service pipeline.

*Acceptance criteria:* recording an Applicant and confirming Enrollment
creates the Student's User identity and initial Role Assignment, per the
[Faculty & Administration Domain Model](../milestone-5-domain-model-data-architecture/04-faculty-administration-domain-model.md);
this story reflects the MVP's manual-Admissions scope from
[MVP Scope Definition](./02-mvp-scope-definition.md).

**SHOULD — Review a self-submitted application** *(Should Have — targeted for the next-cohort release, see [Implementation Phases](./05-implementation-phases.md))*
> As an Admissions Staff member, I want prospective students to submit
> applications themselves, so that I can focus on review rather than
> data entry.

*Acceptance criteria:* the full
[Admissions Workflows](../milestone-3-student-journey-core-workflows/03-admissions-workflows.md)
pipeline (Inquiry → Documents → Review → Decision) is available and
applicant-facing.

## Program Director

**MUST — Approve final grades**
> As a Program Director, I want to approve final grades submitted by
> Faculty, so that grades become official for my program.

*Acceptance criteria:* approval is recorded against the specific Faculty
submission and generates an Audit Log entry, per the
[Audit and Accountability Framework](../milestone-2-user-roles-permission-architecture/05-audit-accountability-framework.md).

**MUST — Approve program completion and certificate issuance**
> As a Program Director, I want to confirm a Student has met all program
> requirements before their certificate is issued, so that certification
> stays academically meaningful.

*Acceptance criteria:* approval requires the Student's Academic Record
to show all required Grades approved (and, if the launch Program
requires it, Completion Verification from the Externship workflow).

**SHOULD — Manage my cohort**
> As a Program Director, I want to see my cohort's roster and status, so
> that I can monitor how the launch cohort is progressing.

*Acceptance criteria:* Cohort Management reflects real-time Enrollment
and Progress data for the launch Cohort.

## Administrator

**MUST — Set up the institution's structure**
> As an Administrator, I want to create the School, Program, and Cohort
> the launch depends on, so that there's a structure for enrollment and
> delivery to happen within.

*Acceptance criteria:* Institution Structure supports creating exactly
the hierarchy defined in the
[Academic Domain Model](../milestone-5-domain-model-data-architecture/02-academic-domain-model.md).

**MUST — Grant role assignments**
> As an Administrator, I want to grant Faculty, Program Director, and
> Admissions Staff their Role Assignments, so that the right people can
> do their jobs from day one.

*Acceptance criteria:* every grant is scoped `(Role, Scope)`, per the
[Multi-School and Multi-Program Access Model](../milestone-2-user-roles-permission-architecture/04-multi-school-multi-program-access-model.md),
and generates an Audit Log entry.

**MUST — Issue certificates**
> As an Administrator, I want to formally issue certificates following
> Program Director approval, so that graduates receive an official,
> system-of-record credential.

*Acceptance criteria:* issuance is blocked until the corresponding
Program Director Approval exists, per the
[Certificate & Graduation Workflow](../milestone-3-student-journey-core-workflows/05-certificate-graduation-workflow.md).

**MUST — Review the audit log**
> As an Administrator, I want to review the platform's audit trail, so
> that I can verify accountability for consequential actions across the
> launch cohort.

*Acceptance criteria:* every Grade approval, Role Assignment change, and
Certificate issuance appears, attributed and timestamped, per the
[Audit and Accountability Framework](../milestone-2-user-roles-permission-architecture/05-audit-accountability-framework.md).

## Clinical Coordinator *(Conditional — applicable only if the launch Program requires an externship; see [MVP Scope Definition §Needs Verification](./02-mvp-scope-definition.md))*

**MUST (if applicable) — Confirm externship eligibility**
> As a Clinical Coordinator, I want to confirm a Student has met the
> academic prerequisites for placement, so that only ready Students
> begin an externship.

*Acceptance criteria:* eligibility confirmation reads real Academic
Record data, per the
[Externship Management Workflow](../milestone-3-student-journey-core-workflows/04-externship-management-workflow.md).

**MUST (if applicable) — Record hours and evaluations**
> As a Clinical Coordinator, I want to record logged hours and
> evaluation outcomes for a placement, so that completion can eventually
> be verified.

*Acceptance criteria:* Hour Logs and Evaluations are tied to a specific
Placement and feed Completion Verification.

## Employer Partner *(Conditional — same dependency as Clinical Coordinator, above)*

**MUST (if applicable) — Submit a student evaluation**
> As an Employer Partner, I want to submit an evaluation for a Student
> placed with my organization, so that their performance is part of
> their record.

*Acceptance criteria:* Evaluations submitted by an Employer Partner are
scoped to Students actually placed with their organization, per the
[Clinical & Externship Domain Model](../milestone-5-domain-model-data-architecture/05-clinical-externship-domain-model.md).

## Current / Planned / Future

| Element | Status |
|---|---|
| Student, Faculty, Program Director, Administrator MUST HAVE stories | **Planned** — MVP release |
| Admissions Staff manual-onboarding story | **Planned** — MVP release |
| Admissions Staff self-service story | **Planned** — next-cohort release, see [Implementation Phases](./05-implementation-phases.md) |
| Clinical Coordinator / Employer Partner stories | **Conditional**, pending launch Program confirmation |

## ⚠️ Needs Verification

- Every "Conditional" story's ultimate priority depends entirely on
  confirming whether the launch Program requires an externship — see
  [MVP Scope Definition](./02-mvp-scope-definition.md).
- This is a representative, not exhaustive, story set — SHOULD HAVE and
  COULD HAVE areas from
  [MVP Scope Definition](./02-mvp-scope-definition.md) (Messaging,
  Calendar, Resources, AI Tutor) have not each been given a full story
  here; they should be expanded once MVP scope is formally approved.

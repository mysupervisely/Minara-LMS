# Program Director Portal

**Status:** Draft
**Milestone:** 4 — Information Architecture & User Experience
**Date:** 2026-08-07

The Program Director Portal is the primary surface for the role defined
in [Role Definitions §3 (Program Director)](../milestone-2-user-roles-permission-architecture/01-role-definitions.md).
Its screens implement the Program Director's approval and oversight
responsibilities across
[Faculty Workflows](../milestone-3-student-journey-core-workflows/02-faculty-workflows.md),
[Admissions Workflows](../milestone-3-student-journey-core-workflows/03-admissions-workflows.md),
[Externship Management Workflow](../milestone-3-student-journey-core-workflows/04-externship-management-workflow.md),
and the
[Certificate & Graduation Workflow](../milestone-3-student-journey-core-workflows/05-certificate-graduation-workflow.md).

## Navigation Structure

**Primary Navigation:** Dashboard · Curriculum Oversight · Cohort
Management · Faculty Coordination · Approvals · Program Reporting ·
Student Directory · Messages

**Secondary Navigation:** Within **Approvals**: Grade Approvals ·
Externship Eligibility & Completion · Graduation & Certificate Approvals
· Faculty Assignment Proposals

## Screens

| Screen | Purpose | Key Information | Relationships | Future Expansion |
|---|---|---|---|---|
| **Dashboard** | Program-level health at a glance | Cohort status, pending approvals, faculty coverage gaps, program risk indicators | Aggregates Cohort Management, Approvals, Program Reporting | Program health scoring — **Future** |
| **Curriculum Oversight** | View of curriculum delivery health across the program | Delivered curriculum content status per section, sourced from Minara-Curriculum | Program-level view of what Faculty configure in [Faculty Portal — Content & Preparation](./03-faculty-portal.md) | — |
| **Cohort Management** | Managing cohort structure within the program | Cohort roster, capacity, cohort-to-section mapping | Implements Cohort Assignment in the [Student Lifecycle Workflow](../milestone-3-student-journey-core-workflows/01-student-lifecycle-workflow.md) | — |
| **Faculty Coordination** | Overview and coordination of Faculty teaching in the program | Faculty roster, section assignments, coverage status | Complements [Faculty Portal — My Sections](./03-faculty-portal.md) from the oversight side | — |
| **Grade Approvals** (secondary, under Approvals) | Queue of section final grades awaiting approval | Submitted grade rosters, section, submitting Faculty | Implements "Final Grade Approval" gate in [Faculty Workflows](../milestone-3-student-journey-core-workflows/02-faculty-workflows.md) | Bulk approval tooling — **Future** |
| **Externship Eligibility & Completion** (secondary, under Approvals) | Reviewing/confirming eligibility and completion determinations | Student eligibility status, Coordinator-submitted completion verifications | Joint approval step in [Externship Management Workflow](../milestone-3-student-journey-core-workflows/04-externship-management-workflow.md) | — |
| **Graduation & Certificate Approvals** (secondary, under Approvals) | Reviewing and approving program completion | Completion verification records, deficiency flags | Implements "Certificate Approval" gate in the [Certificate & Graduation Workflow](../milestone-3-student-journey-core-workflows/05-certificate-graduation-workflow.md) | — |
| **Faculty Assignment Proposals** (secondary, under Approvals) | Proposing Faculty role assignments within the program | Proposed assignment, pending Administrator approval | **Planned** workflow per the [Permission Framework](../milestone-2-user-roles-permission-architecture/02-permission-framework.md) | Direct approval authority (vs. propose-only) — **Future**, pending governance confirmation |
| **Program Reporting** | Program-level analytics and accreditation-facing reporting | Completion rates, grade distributions, externship compliance | Implements "Program Reporting" in [Role Definitions](../milestone-2-user-roles-permission-architecture/01-role-definitions.md) | Accreditation-formatted export — **Future** |
| **Student Directory** | Program-wide student list (beyond any single cohort/section) | Student roster with status across the whole program | Program-scoped view per the [Multi-School and Multi-Program Access Model](../milestone-2-user-roles-permission-architecture/04-multi-school-multi-program-access-model.md) | — |
| **Messages** | Communication with Faculty, Admissions Staff, Coordinators, and students within the program | Conversation threads scoped to the program | Communication domain of the [Permission Framework](../milestone-2-user-roles-permission-architecture/02-permission-framework.md) | — |
| **Profile & Settings** | Personal account management | Contact info, notification preferences | Own record under Platform Administration | — |

## Current / Planned / Future

| Screen | Status |
|---|---|
| Dashboard, Curriculum Oversight, Cohort Management, Faculty Coordination | **Planned** |
| Grade Approvals, Externship Eligibility & Completion, Graduation & Certificate Approvals | **Planned** |
| Faculty Assignment Proposals | **Planned** |
| Program Reporting, Student Directory, Messages | **Planned** |
| Profile & Settings | **Planned** |
| Bulk approval tooling | **Future** |
| Accreditation-formatted report export | **Future** |
| Direct Faculty assignment approval authority | **Future**, pending governance confirmation |

## ⚠️ Needs Verification

- Whether Program Directors need a distinct "Approvals" hub combining
  multiple approval types (as modeled), or these should live inside the
  relevant workflow area (e.g., grade approvals inside Faculty
  Coordination) — an open information-architecture question.
- Whether Program Directors overseeing more than one Program (see
  [Multi-School and Multi-Program Access Model](../milestone-2-user-roles-permission-architecture/04-multi-school-multi-program-access-model.md))
  see a combined dashboard or must switch between per-program portal
  instances via the Portal Switcher.

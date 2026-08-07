# Milestone 3 — Student Journey & Core Platform Workflows

**Status:** Draft
**Phase:** Phase 1 — Product Architecture
**Date:** 2026-08-07
**Scope:** Documentation only. No code, database schemas, APIs, vendors,
or UI mockups are introduced in this milestone.

## Purpose

Milestone 1 established *why* Minara-LMS exists and *who* it serves.
Milestone 2 established *who can do what* — roles, permissions,
hierarchy, and accountability. Milestone 3 establishes **how the
platform operates**: the actual sequences of activity that carry a
learner (and the staff around them) from first contact with Minara
through graduation and beyond, and the operational workflows that
support that journey.

This milestone is the **operational blueprint**. Every future screen,
database table, API, and feature should ultimately trace back to one or
more of the workflows documented here. Where a later milestone designs a
data model or a technical architecture, it should be able to point to a
specific step in one of these workflows and explain what that step
requires.

## Documents in This Milestone

| # | Document | Summary |
|---|---|---|
| 1 | [Student Lifecycle Workflow](./01-student-lifecycle-workflow.md) | The complete end-to-end journey from discovery to alumni status |
| 2 | [Faculty Workflows](./02-faculty-workflows.md) | Course assignment through grading, feedback, and academic reporting |
| 3 | [Admissions Workflows](./03-admissions-workflows.md) | Inquiry through enrollment, including waitlist, deferral, and withdrawal |
| 4 | [Externship Management Workflow](./04-externship-management-workflow.md) | Eligibility through completion verification, with role responsibilities |
| 5 | [Certificate & Graduation Workflow](./05-certificate-graduation-workflow.md) | Completion verification through alumni status |
| 6 | [AI Learning Assistant Workflow](./06-ai-learning-assistant-workflow.md) | How the AI assistant engages students within human-reviewed bounds |
| 7 | [Platform Workflow Catalog](./07-platform-workflow-catalog.md) | A full inventory of workflows the platform will eventually support |

## Relationship to Milestones 1 and 2

This milestone assumes and cross-references, rather than repeats:

- **Roles** — Student, Faculty Instructor, Program Director, Admissions
  Staff, Externship/Clinical Coordinator, Employer Partner, Administrator
  — as defined in
  [Role Definitions](../milestone-2-user-roles-permission-architecture/01-role-definitions.md).
- **Who may approve what** — as defined in the
  [Permission Framework](../milestone-2-user-roles-permission-architecture/02-permission-framework.md)
  and [Role Hierarchy](../milestone-2-user-roles-permission-architecture/03-role-hierarchy.md).
  Workflow documents in this milestone name *which* role holds an
  approval gate; they do not redefine approval authority.
- **Scope across schools/programs/cohorts** — as defined in the
  [Multi-School and Multi-Program Access Model](../milestone-2-user-roles-permission-architecture/04-multi-school-multi-program-access-model.md).
  Workflows here apply uniformly regardless of which school or program a
  student is in, unless a document says otherwise.
- **Audit requirements** — every approval gate and status change
  described in this milestone's workflows is expected to generate an
  audit trail per the
  [Audit and Accountability Framework](../milestone-2-user-roles-permission-architecture/05-audit-accountability-framework.md).
  This milestone does not repeat that framework in each document.
- **AI boundaries** — the AI Learning Assistant workflow operationalizes
  [Guiding Principles §10 (Human-Reviewed AI Workflows)](../milestone-1-product-vision-platform-strategy/03-guiding-principles.md).

## Diagramming Convention

Workflow documents in this milestone use [Mermaid](https://mermaid.js.org/)
flowcharts to illustrate sequence, decision points, and approval gates.
These diagrams describe **business process flow**, not system
architecture, data flow, or UI navigation — they contain no technical
implementation detail.

Diagram legend used throughout:
- **Rectangle** — an activity or system state
- **Diamond** — a decision point
- **Rounded/stadium shape** — an approval gate (a decision point whose
  outcome is a formal Approve/Reject by a specific role, per the
  [Permission Framework](../milestone-2-user-roles-permission-architecture/02-permission-framework.md))
- **Dashed path** — an exception path (e.g., withdrawal, denial, remediation)

## What This Milestone Does Not Do

Per the Phase 1 instructions, this milestone does not:

- Write production or example code
- Design database schemas or data models
- Design APIs or integration contracts
- Select frameworks or vendors
- Produce UI mockups or wireframes
- Define concrete SLAs, timelines, or staffing levels for any workflow
  step (flagged as **⚠️ Needs Verification** where relevant)

## Approval

This milestone is **Draft** pending stakeholder review. Milestone 4 will
not begin until Milestone 3 is reviewed and approved.

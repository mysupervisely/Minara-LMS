# Clinical/Externship Coordinator Portal

**Status:** Draft
**Milestone:** 4 — Information Architecture & User Experience
**Date:** 2026-08-07

The Clinical/Externship Coordinator Portal is the primary surface for the
role defined in
[Role Definitions §5 (Externship/Clinical Coordinator)](../milestone-2-user-roles-permission-architecture/01-role-definitions.md).
Its screens implement the
[Externship Management Workflow](../milestone-3-student-journey-core-workflows/04-externship-management-workflow.md).

## Navigation Structure

**Primary Navigation:** Dashboard · Sites · Eligibility Queue ·
Placements · Hours & Evaluations · Employer Communication · Reporting

**Secondary Navigation:** Within a selected **Site**: Site Profile ·
Capacity & Availability · Assigned Students. Within a selected
**Placement**: Orientation Status · Hour Log · Midpoint Evaluation ·
Final Evaluation · Completion Verification

## Screens

| Screen | Purpose | Key Information | Relationships | Future Expansion |
|---|---|---|---|---|
| **Dashboard** | Overview of placement pipeline health | Students awaiting placement, sites near capacity, evaluations due, compliance flags | Aggregates Eligibility Queue, Placements, Hours & Evaluations | — |
| **Sites** | Directory of externship/clinical sites | Site list, capacity, active partnership status | Implements "Site Availability" in the [Externship Management Workflow](../milestone-3-student-journey-core-workflows/04-externship-management-workflow.md) | Site quality/performance scoring — **Future** |
| **Site Profile** (secondary) | Full record for one site | Site details, requirements, Employer Partner contact | Root screen for site-level detail | — |
| **Capacity & Availability** (secondary) | Managing a site's open slots | Current/upcoming capacity | Feeds the "Site Available?" decision point | — |
| **Assigned Students** (secondary, per site) | Students currently or previously placed at this site | Placement roster per site | Cross-reference of Placements, filtered by site | — |
| **Eligibility Queue** | Students awaiting or nearing externship eligibility determination | Eligibility status, blocking requirements | Implements "Student Eligibility" in the [Externship Management Workflow](../milestone-3-student-journey-core-workflows/04-externship-management-workflow.md), in coordination with Program Director | Automated eligibility computation — **Future** |
| **Placements** | Queue and record of placement requests and assignments | Placement request status, site match, approval state | Implements "Placement Request" through "Student Assignment" | — |
| **Orientation Status** (secondary, per placement) | Tracking site orientation completion | Orientation completion status | Implements "Orientation" step | — |
| **Hour Log** (secondary, per placement) | Reviewing/approving logged hours | Hours logged, approval status | Implements "Hour Tracking" | Employer self-service hour verification — **Future**, per [Permission Framework](../milestone-2-user-roles-permission-architecture/02-permission-framework.md) |
| **Midpoint Evaluation** (secondary, per placement) | Recording midpoint performance review | Evaluation form, concerns/improvement plan | Implements "Midpoint Evaluation" | — |
| **Final Evaluation** (secondary, per placement) | Recording final performance review | Evaluation form, outcome | Implements "Final Evaluation" | — |
| **Completion Verification** (secondary, per placement) | Formal sign-off that placement requirements are met | Verification status, joint Program Director confirmation | Implements the "Completion Verification" approval gate | — |
| **Hours & Evaluations** | Cross-placement view of hour totals and evaluation status | Aggregate hours and evaluation completeness across active placements | Rolls up Hour Log, Midpoint/Final Evaluation across placements | — |
| **Employer Communication** | Messaging with Employer Partners | Conversation threads scoped to placement relationships | Communication domain of the [Permission Framework](../milestone-2-user-roles-permission-architecture/02-permission-framework.md) | — |
| **Reporting** | Placement and compliance reporting | Placement stats, compliance/hours-completion rates | Supports program-level and institutional reporting | Accreditation-formatted export — **Future** |
| **Profile & Settings** | Personal account management | Contact info, notification preferences | Own record under Platform Administration | — |

## Current / Planned / Future

| Screen | Status |
|---|---|
| Dashboard, Sites, Site Profile, Capacity & Availability, Assigned Students | **Planned** |
| Eligibility Queue, Placements | **Planned** |
| Orientation Status, Hour Log, Midpoint/Final Evaluation, Completion Verification | **Planned** |
| Hours & Evaluations, Employer Communication, Reporting | **Planned** |
| Profile & Settings | **Planned** |
| Automated eligibility computation | **Future** |
| Employer self-service hour verification | **Future** |
| Site quality/performance scoring | **Future** |

## ⚠️ Needs Verification

- Whether Site capacity/availability requires real-time coordination
  with Employer Partners (implying an Employer-side capacity update
  screen) or is Coordinator-maintained only — this document assumes the
  latter for now, consistent with the [Employer Portal](./07-employer-portal.md)'s
  narrower scope.

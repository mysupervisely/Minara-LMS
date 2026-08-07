# Admissions Portal

**Status:** Draft
**Milestone:** 4 — Information Architecture & User Experience
**Date:** 2026-08-07

The Admissions Portal is the primary surface for the role defined in
[Role Definitions §4 (Admissions Staff)](../milestone-2-user-roles-permission-architecture/01-role-definitions.md).
Its screens implement
[Admissions Workflows](../milestone-3-student-journey-core-workflows/03-admissions-workflows.md).

## Navigation Structure

**Primary Navigation:** Dashboard · Applications · Waitlist ·
Communication · Enrollment · Reporting

**Secondary Navigation:** Within a selected **Application**: Application
Detail · Documents · Review & Decision · Communication History

## Screens

| Screen | Purpose | Key Information | Relationships | Future Expansion |
|---|---|---|---|---|
| **Dashboard** | Pipeline overview across all open cycles/programs | Inquiries, applications by stage, decisions pending, cycle deadlines | Aggregates Applications, Waitlist, Reporting | — |
| **Applications** | Queue of all applications, filterable by program/status | Application list with stage (Inquiry, Started, Documents, Review, Decision) | Implements the full [Admissions Workflows](../milestone-3-student-journey-core-workflows/03-admissions-workflows.md) pipeline | Saved/custom filters — **Future** |
| **Application Detail** (secondary) | Full record for one applicant | Applicant info, program applied to, status history | Root screen for the sub-navigation below | — |
| **Documents** (secondary) | Tracking required document collection | Document checklist and completeness status | Implements "Document Collection" and the "Documents Complete?" decision point in [Admissions Workflows](../milestone-3-student-journey-core-workflows/03-admissions-workflows.md) | Automated completeness checking — **Future** |
| **Review & Decision** (secondary) | Where Admissions Staff records the review outcome | Decision options (Accept/Waitlist/Deny/Defer), Program Director input where applicable | Implements "Admissions Review" and "Decision" in [Admissions Workflows](../milestone-3-student-journey-core-workflows/03-admissions-workflows.md) | — |
| **Communication History** (secondary) | Full record of applicant communication | Message/notification log for this applicant | Implements "Applicant Communication" in [Admissions Workflows](../milestone-3-student-journey-core-workflows/03-admissions-workflows.md) | — |
| **Waitlist** | Managing applicants in waitlisted status across programs | Waitlist order, capacity signals, aging | Implements the Waitlist branch in [Admissions Workflows](../milestone-3-student-journey-core-workflows/03-admissions-workflows.md) | Automated capacity-triggered offers — **Future** |
| **Communication** | Bulk/templated communication tools (distinct from per-applicant history) | Templates, bulk-send status | Supports "Applicant Communication" across the whole pipeline | — |
| **Enrollment** | Confirming accepted applicants into active enrollment | Accepted applicants pending confirmation, payment status linkage | Bridges into "Enrollment" and "Cohort Assignment" in the [Student Lifecycle Workflow](../milestone-3-student-journey-core-workflows/01-student-lifecycle-workflow.md) | — |
| **Reporting** | Admissions funnel and cycle-level analytics | Conversion rates by stage, program comparisons | Institution/program-level rollups per the [Permission Framework](../milestone-2-user-roles-permission-architecture/02-permission-framework.md) | — |
| **Profile & Settings** | Personal account management | Contact info, notification preferences | Own record under Platform Administration | — |

## Current / Planned / Future

| Screen | Status |
|---|---|
| Dashboard, Applications, Application Detail | **Planned** |
| Documents, Review & Decision, Communication History | **Planned** |
| Waitlist, Communication, Enrollment | **Planned** |
| Reporting | **Planned** |
| Profile & Settings | **Planned** |
| Automated document-completeness checking | **Future** |
| Automated capacity-triggered waitlist offers | **Future** |
| Saved/custom application filters | **Future** |

## ⚠️ Needs Verification

- Whether Deferral (from [Admissions Workflows](../milestone-3-student-journey-core-workflows/03-admissions-workflows.md))
  needs its own dedicated screen or is handled as an Application status
  within the existing Applications queue — this document assumes the
  latter.
- Exact division of Review & Decision authority between Admissions Staff
  and Program Director, carried over from
  [Admissions Workflows](../milestone-3-student-journey-core-workflows/03-admissions-workflows.md).

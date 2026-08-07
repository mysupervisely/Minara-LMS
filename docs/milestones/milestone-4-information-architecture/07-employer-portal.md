# Employer Portal

**Status:** Draft
**Milestone:** 4 — Information Architecture & User Experience
**Date:** 2026-08-07

The Employer Portal is the primary surface for the role defined in
[Role Definitions §6 (Employer Partner)](../milestone-2-user-roles-permission-architecture/01-role-definitions.md).
Its scope is intentionally the narrowest of the seven portals, per the
[Multi-School and Multi-Program Access Model](../milestone-2-user-roles-permission-architecture/04-multi-school-multi-program-access-model.md):
an Employer Partner sees only what relates to their own organization's
placements and hiring activity.

## Navigation Structure

**Primary Navigation:** Dashboard · Partnership Profile · Placed
Students · Evaluations · Hiring Pipeline · Messages

## Screens

| Screen | Purpose | Key Information | Relationships | Future Expansion |
|---|---|---|---|---|
| **Dashboard** | Overview of active placement and hiring activity | Active placements, evaluations due, open hiring interest | Aggregates Placed Students, Evaluations, Hiring Pipeline | — |
| **Partnership Profile** | Managing the organization's relationship with Minara | Organization details, primary Coordinator contact, active partnership status | Implements "Partnership Management" in [Role Definitions](../milestone-2-user-roles-permission-architecture/01-role-definitions.md) | — |
| **Placed Students** | Students currently or previously placed with this Employer | Placement roster, dates, site (if the Employer operates multiple sites) | Employer-side view of [Externship Management Workflow](../milestone-3-student-journey-core-workflows/04-externship-management-workflow.md) placements | — |
| **Evaluations** | Submitting midpoint/final evaluations for placed students | Evaluation forms, submission status | Implements the Employer row of the responsibilities matrix in the [Externship Management Workflow](../milestone-3-student-journey-core-workflows/04-externship-management-workflow.md) | Structured competency-based evaluation forms — **Future** |
| **Hiring Pipeline** | Engaging with students/graduates for hiring purposes | Candidates who have shared eligibility/certificates, hiring status | Depends on student-initiated certificate sharing — **Planned**, per the [Permission Framework](../milestone-2-user-roles-permission-architecture/02-permission-framework.md) | Job posting management — **Future** |
| **Messages** | Communication with the Externship/Clinical Coordinator | Conversation threads scoped to placement relationships | Communication domain of the [Permission Framework](../milestone-2-user-roles-permission-architecture/02-permission-framework.md) | — |
| **Profile & Settings** | Organization account and contact management | Contact info, notification preferences | Own record under Platform Administration | — |

## Current / Planned / Future

| Screen | Status |
|---|---|
| Dashboard, Partnership Profile | **Planned** |
| Placed Students, Evaluations | **Planned** |
| Messages, Profile & Settings | **Planned** |
| Hiring Pipeline | **Future**, depends on certificate-sharing mechanism (see [Certificate & Graduation Workflow](../milestone-3-student-journey-core-workflows/05-certificate-graduation-workflow.md)) |
| Structured competency-based evaluation forms | **Future** |
| Job posting management | **Future** |

## ⚠️ Needs Verification

- Whether Employer Partners with multiple physical sites are modeled as
  one Employer Partner account with multiple sites, or multiple accounts
  — this document assumes the former but it is not yet confirmed.
- The scope and design of Hiring Pipeline functionality is one of the
  least defined areas in this milestone and is intentionally left broad
  (**Future**) pending clearer product direction — see
  [Long-Term Platform Vision](../milestone-1-product-vision-platform-strategy/07-long-term-platform-vision.md).

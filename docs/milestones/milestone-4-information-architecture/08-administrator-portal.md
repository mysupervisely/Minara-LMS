# Administrator Portal

**Status:** Draft
**Milestone:** 4 — Information Architecture & User Experience
**Date:** 2026-08-07

The Administrator Portal is the primary surface for the role defined in
[Role Definitions §7 (Administrator)](../milestone-2-user-roles-permission-architecture/01-role-definitions.md).
It is the only portal with institution-wide scope by default, per the
[Multi-School and Multi-Program Access Model](../milestone-2-user-roles-permission-architecture/04-multi-school-multi-program-access-model.md),
and carries the platform administration responsibilities defined across
the [Permission Framework](../milestone-2-user-roles-permission-architecture/02-permission-framework.md).

## Navigation Structure

**Primary Navigation:** Dashboard · Institution Structure · User &
Role Management · Enrollment Oversight · Financial Oversight ·
Certificates · Audit Log · Reporting & Analytics · Announcements

**Secondary Navigation:** Within **Institution Structure**: Schools ·
Programs · Cohorts. Within **User & Role Management**: User Accounts ·
Role Assignments · Faculty Assignment Approvals

## Screens

| Screen | Purpose | Key Information | Relationships | Future Expansion |
|---|---|---|---|---|
| **Dashboard** | Institution-wide operational summary | Cross-program enrollment, financial status, pending approvals, audit flags | Aggregates every other screen in this portal | Institution health scoring — **Future** |
| **Institution Structure** | Managing the school/program/cohort hierarchy | Schools, programs, and cohorts and their relationships | Configures the structural hierarchy from [Role Hierarchy](../milestone-2-user-roles-permission-architecture/03-role-hierarchy.md) | School-level administrative delegation — **Future**, pending [Multi-School and Multi-Program Access Model §Needs Verification](../milestone-2-user-roles-permission-architecture/04-multi-school-multi-program-access-model.md) |
| **User Accounts** (secondary) | Managing all platform user accounts | Account list across all roles, account status | Implements "User Accounts" in the [Permission Framework](../milestone-2-user-roles-permission-architecture/02-permission-framework.md) | — |
| **Role Assignments** (secondary) | Granting/editing/revoking role assignments and their scope | Role assignment records: (Person, Role, Scope) | Implements the Role Assignment model from the [Multi-School and Multi-Program Access Model](../milestone-2-user-roles-permission-architecture/04-multi-school-multi-program-access-model.md) | Delegated/temporary authority — **Future**, per [Role Hierarchy](../milestone-2-user-roles-permission-architecture/03-role-hierarchy.md) |
| **Faculty Assignment Approvals** (secondary) | Reviewing Program Director-proposed Faculty assignments | Pending proposals awaiting approval | Implements the **Planned** propose/approve workflow in the [Permission Framework](../milestone-2-user-roles-permission-architecture/02-permission-framework.md) | — |
| **Enrollment Oversight** | Institution-wide enrollment visibility across programs | Enrollment counts and status across every school/program | Institution-wide rollup of [Admissions Workflows](../milestone-3-student-journey-core-workflows/03-admissions-workflows.md) | — |
| **Financial Oversight** | Institution-wide financial management | Payment status, holds, institutional financial reporting | Implements "Institutional Financials" in the [Permission Framework](../milestone-2-user-roles-permission-architecture/02-permission-framework.md) | — |
| **Certificates** | Issuing certificates following Program Director approval | Certificates pending issuance, issued certificate record | Implements "Certificate Issuance" in the [Certificate & Graduation Workflow](../milestone-3-student-journey-core-workflows/05-certificate-graduation-workflow.md) | — |
| **Audit Log** | Reviewing the platform's audit trail | Attributable, timestamped action/change/approval history | Implements the [Audit and Accountability Framework](../milestone-2-user-roles-permission-architecture/05-audit-accountability-framework.md); Administrator-only, per that document | Scoped audit visibility for Program Directors — **Future**, open question per that framework |
| **Reporting & Analytics** | Institution-wide reporting across all programs | Cross-program outcomes, accreditation-facing reports | Institution-wide rollup of every program's Program Reporting (see [Program Director Portal](./04-program-director-portal.md)) | — |
| **Announcements** | Broadcast communication across the institution or a scoped audience | Announcement composition and delivery status | Extends the Communication domain of the [Permission Framework](../milestone-2-user-roles-permission-architecture/02-permission-framework.md) to institution-wide broadcast | — |
| **Profile & Settings** | Personal account management | Contact info, notification preferences | Own record under Platform Administration | — |
| **System Configuration** | Institution-wide platform configuration | Configuration values relevant to platform operation | **Future** — deliberately unspecified; no implementation/vendor detail belongs in this milestone | — |

## Current / Planned / Future

| Screen | Status |
|---|---|
| Dashboard, Institution Structure, User Accounts, Role Assignments | **Planned** |
| Faculty Assignment Approvals | **Planned** |
| Enrollment Oversight, Financial Oversight, Certificates | **Planned** |
| Audit Log | **Planned** |
| Reporting & Analytics | **Planned** |
| Announcements, Profile & Settings | **Planned** |
| School-level administrative delegation | **Future** |
| Scoped (non-Administrator) audit visibility | **Future** |
| System Configuration screen | **Future** |

## ⚠️ Needs Verification

- Whether Institution Structure management (creating new schools/
  programs/cohorts) should itself require an approval workflow (e.g.,
  tied to Minara-Master-Plan governance) rather than being a direct
  Administrator action, as modeled here.
- Whether "System Configuration" belongs in this portal at all in a
  future milestone, or is better understood as a separate, more
  technical administrative surface once implementation begins.

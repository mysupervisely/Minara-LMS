# Milestone 4 — Information Architecture & User Experience

**Status:** Draft
**Phase:** Phase 1 — Product Architecture
**Date:** 2026-08-07
**Scope:** Documentation only. No visual design, wireframes, UI mockups,
CSS, frameworks, code, vendors, database schemas, or APIs are introduced
in this milestone.

## Purpose

Milestone 1 defined why Minara-LMS exists and who it serves. Milestone 2
defined who can do what. Milestone 3 defined how the platform operates —
the business workflows every feature must ultimately support. Milestone
4 defines **where those workflows live**: the complete information
architecture (IA) of the platform — every portal, every navigation
section, every major screen, and how a user moves between them.

This is explicitly **not** visual design. It says nothing about layout,
color, typography, component libraries, or specific frameworks. It says:
*this screen exists, this is what it's for, this is what's on it in
concept, and this is where it sits in the navigation.* The goal is that
every future page in the application is already identified — with a
name, a purpose, and a place in the structure — before implementation
begins.

## Documents in This Milestone

| # | Document | Summary |
|---|---|---|
| 1 | [Global Navigation Framework](./01-global-navigation-framework.md) | Public vs. authenticated navigation, primary/secondary nav, breadcrumb/search/notification philosophy |
| 2 | [Student Portal](./02-student-portal.md) | Complete screen inventory for the Student Portal |
| 3 | [Faculty Portal](./03-faculty-portal.md) | Complete screen inventory for the Faculty Portal |
| 4 | [Program Director Portal](./04-program-director-portal.md) | Complete screen inventory for the Program Director Portal |
| 5 | [Admissions Portal](./05-admissions-portal.md) | Complete screen inventory for the Admissions Portal |
| 6 | [Clinical/Externship Coordinator Portal](./06-clinical-coordinator-portal.md) | Complete screen inventory for the Coordinator Portal |
| 7 | [Employer Portal](./07-employer-portal.md) | Complete screen inventory for the Employer Portal |
| 8 | [Administrator Portal](./08-administrator-portal.md) | Complete screen inventory for the Admin Portal |
| 9 | [Screen Inventory](./09-screen-inventory.md) | Master, portal-organized inventory of every screen, each tagged Required / Planned / Future |
| 10 | [Navigation Map](./10-navigation-map.md) | High-level diagram of how users move through the entire system, including cross-portal movement |

## Relationship to Milestones 1–3

This milestone assumes and cross-references, rather than repeats:

- **Portals correspond 1:1 to roles.** The seven portals documented here
  (Student, Faculty, Program Director, Admissions, Clinical/Externship
  Coordinator, Employer, Administrator) are the same seven roles defined
  in [Role Definitions](../milestone-2-user-roles-permission-architecture/01-role-definitions.md),
  consistent with [Platform Philosophy](../milestone-1-product-vision-platform-strategy/04-platform-philosophy.md)'s
  "portals are a lens, not a boundary" framing.
- **What a screen may show or do** is governed by the
  [Permission Framework](../milestone-2-user-roles-permission-architecture/02-permission-framework.md) —
  this milestone does not re-derive View/Create/Edit/Approve rules per
  screen; it names which screen a given permission is exercised through.
- **Screens exist to serve workflows.** Every screen in this milestone
  traces back to a step in one of the Milestone 3 workflows (e.g., the
  Faculty Portal's "Final Grade Approval" screen implements the approval
  gate of the same name in
  [Faculty Workflows](../milestone-3-student-journey-core-workflows/02-faculty-workflows.md)).
  Where a screen doesn't map cleanly to an existing Milestone 3 workflow
  step, that's flagged as **⚠️ Needs Verification**, since it may signal
  a workflow gap rather than a new screen.
- **Multi-school/multi-program scope** applies to navigation the same
  way it applies to permissions: a Program Director's navigation, for
  example, reflects the Program(s) their role assignment(s) are scoped
  to, per the
  [Multi-School and Multi-Program Access Model](../milestone-2-user-roles-permission-architecture/04-multi-school-multi-program-access-model.md).

## Documentation Conventions for This Milestone

- **Screen documentation** generally covers: Purpose, Navigation
  (placement in the nav structure), Key Information (what's shown, in
  concept), Relationships (to other screens/workflows), and Future
  Expansion.
- **Status labels** in portal documents (02–08) use the same
  Current/Planned/Future convention established in
  [docs/README.md](../../README.md).
- **[Screen Inventory](./09-screen-inventory.md)** deliberately uses a
  different vocabulary — **Required / Planned / Future** — per this
  milestone's instructions, describing build necessity rather than
  planning horizon. That document defines the distinction explicitly and
  maps it back to the Current/Planned/Future convention used elsewhere.

## What This Milestone Does Not Do

Per its instructions, this milestone does not:

- Produce UI mockups, wireframes, or visual design of any kind
- Specify CSS, component libraries, or any frontend framework
- Write production or example code
- Select vendors
- Design database schemas or APIs

## Approval

This milestone is **Draft** pending stakeholder review. Milestone 5 will
not begin until Milestone 4 is reviewed and approved.

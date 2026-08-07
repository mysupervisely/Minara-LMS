# Curriculum Administration Portal

**Status:** Draft
**Milestone:** 11 — Curriculum Management & Content Engine
**Date:** 2026-08-07

## Purpose

This document specifies the Administrator-facing screens for this
milestone's required capabilities: create schools, programs, academic
terms, and cohorts; assign faculty; publish and archive curriculum;
view audit history; restore previous versions. It **extends** the
existing [Administrator Portal](../milestone-4-information-architecture/08-administrator-portal.md)
rather than introducing a separate portal — the same Administrator
navigation shell, with a new secondary section.

## Relationship to the Existing Administrator Portal

[Administrator Portal §Navigation Structure](../milestone-4-information-architecture/08-administrator-portal.md#navigation-structure)
already names **Institution Structure** (Schools · Programs · Cohorts)
as primary navigation. This milestone adds one new primary item —
**Curriculum** — alongside it, and extends Institution Structure's
existing scope to include Academic Terms (new, per
[Curriculum Domain Model](./03-curriculum-domain-model.md#new-structural-entities)).

**Updated Primary Navigation:** Dashboard · Institution Structure ·
**Curriculum** (new) · User & Role Management · Enrollment Oversight ·
Financial Oversight · Certificates · Audit Log · Reporting & Analytics ·
Announcements

**Updated Institution Structure Secondary Navigation:** Schools ·
Programs · **Academic Terms** (new) · Cohorts

**Curriculum Secondary Navigation (new):** Publishing Queue · Program
Competency Map · Curriculum Audit History

## Screens

| Screen | Purpose | Key Information | Relationships | Future Expansion |
|---|---|---|---|---|
| **Academic Terms** (secondary, under Institution Structure) | Creating and managing scheduling periods | Term name, start/end, status | Implements [Curriculum Domain Model — Academic Term](./03-curriculum-domain-model.md#new-structural-entities); scoped by Course Offering | — |
| **Faculty Assignment** (extends the existing [Faculty Assignment Approvals](../milestone-4-information-architecture/08-administrator-portal.md#screens) screen) | Assigning Faculty authoring authority to a Course, not only a teaching assignment to a Course Offering | Faculty-to-Course authoring scope, alongside the existing Faculty-to-Course-Offering teaching scope | Resolves [Publishing Workflow §Needs Verification](./05-publishing-workflow.md#-needs-verification) on Faculty authoring scope | — |
| **Publishing Queue** (secondary, under Curriculum) | Administrator's queue of content in Approved status awaiting Publish, and content awaiting Archive | Approved Program/Course/Lesson/Assessment Versions by Program, with Publish / Archive actions | Implements the Published/Archived steps of [Publishing Workflow](./05-publishing-workflow.md); every action Audit Logged per [Curriculum Audit Framework](./12-curriculum-audit-framework.md) | Scheduled/future-dated publishing — **Future** |
| **Version History & Restore** (reached from any Curriculum entity in Publishing Queue or Program Competency Map) | Viewing every version of a piece of curriculum content and restoring an Archived one | Full version list with status, author, and timestamps per version | Implements "Restore previous versions" and [Versioning Strategy](./04-versioning-strategy.md#when-a-new-version-is-created); restore creates a new Draft, never overwrites | — |
| **Program Competency Map** (secondary, under Curriculum) | Institution-wide view of Program Competency coverage | Every Program's Competencies and which Course Outcomes currently serve them | Implements [Competency Mapping Framework — Where This Surfaces](./07-competency-mapping-framework.md#where-this-surfaces-in-the-platform) at institution scope | Accreditation-report export — **Future** |
| **Curriculum Audit History** (secondary, under Curriculum) | Reviewing curriculum-specific audit history | Who created/edited/reviewed/approved/published/archived/restored, timestamped | Curriculum-scoped view of the existing [Audit Log](../milestone-4-information-architecture/08-administrator-portal.md#screens) screen, per [Curriculum Audit Framework](./12-curriculum-audit-framework.md) | — |

Program, School, and Cohort creation continue exactly as the existing
[Administrator Portal](../milestone-4-information-architecture/08-administrator-portal.md)
and Milestone 10's implemented Admin screens already provide — this
document does not restate them, only the additions above.

## Current / Planned / Future

| Screen | Status |
|---|---|
| Schools, Programs, Cohorts (existing) | **Current** — implemented, Milestone 10 |
| Academic Terms | **Planned** |
| Faculty Assignment (authoring scope) | **Planned** |
| Publishing Queue | **Planned** |
| Version History & Restore | **Planned** |
| Program Competency Map | **Planned** |
| Curriculum Audit History | **Planned** — narrows the existing Audit Log screen, no new audit mechanism |
| Scheduled/future-dated publishing | **Future** |
| Accreditation-report export | **Future** |

## ⚠️ Needs Verification

- Whether Publishing Queue should support bulk actions (publishing an
  entire Course Version's Lessons at once) versus one-at-a-time
  publishing, given the cascade question already flagged in
  [Publishing Workflow](./05-publishing-workflow.md#current--planned--future),
  is not decided here.

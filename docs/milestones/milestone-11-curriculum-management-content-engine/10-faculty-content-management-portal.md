# Faculty Content Management Portal

**Status:** Draft
**Milestone:** 11 — Curriculum Management & Content Engine
**Date:** 2026-08-07

## Purpose

This document specifies the Faculty-facing screens for this milestone's
required capabilities: create curriculum, edit drafts, request review,
view version history, duplicate lessons, reuse learning objects, clone
courses, clone programs, view competency mapping, track curriculum
status. It **extends** the existing
[Faculty Portal](../milestone-4-information-architecture/03-faculty-portal.md)'s
**Content & Preparation** screen rather than introducing a separate
portal.

## Resolving the Faculty Portal's Own Open Question

[Faculty Portal §Needs Verification](../milestone-4-information-architecture/03-faculty-portal.md#-needs-verification)
asked: *"Whether Faculty may author any supplemental content directly,
or all content strictly originates in Minara-Curriculum."* This
milestone answers it: **yes** — Faculty author the deliverable Lesson,
Learning Object, and Assessment content natively in Minara-LMS's
Content Engine, per the WHAT vs. HOW division in
[Curriculum Management Vision](./01-curriculum-management-vision.md).
That document's own **Future** tag on "Faculty-authored supplemental
content" is superseded here — this is no longer supplemental to
Minara-Curriculum-sourced content, it is the primary authoring path for
deliverable content, with Minara-Curriculum remaining authoritative for
Program-level design (Competencies, Program Learning Outcomes, required
sequence) only.

## Relationship to the Existing Faculty Portal

**Updated Secondary Navigation (within a selected section under My
Sections):** Roster · **Curriculum Authoring** (replaces "Content &
Preparation") · Attendance · Assignments & Assessments · Section
Gradebook

## Screens

| Screen | Purpose | Key Information | Relationships | Future Expansion |
|---|---|---|---|---|
| **Curriculum Authoring — Course Overview** (secondary, per Course, replaces "Content & Preparation") | Faculty's entry point to a Course's Modules, Lessons, and Assessments, and their curriculum status | Module/Lesson/Assessment list with each item's [Publishing Workflow](./05-publishing-workflow.md) state (Draft/Faculty Review/Committee Review/Approved/Published/Archived) | Implements "Track curriculum status"; replaces the Milestone 4 "delivered curriculum content (authored in Minara-Curriculum)" description now that Faculty author natively | — |
| **Lesson Editor** (reached from Course Overview) | Creating and editing a Lesson Version's full structure | The complete [Lesson Framework](./06-lesson-framework.md) field set; AI-assisted drafting affordances for Learning Objectives and lesson text, per [ADR-006](../../architecture/adr/ADR-006-human-reviewed-ai-governance.md) | Implements "Create curriculum," "Edit drafts" | Real-time co-authoring (multiple Faculty editing simultaneously) — **Future** |
| **Request Review** (action from Lesson Editor / Course Overview) | Submitting a Draft for Faculty Review, and Faculty Review submitting onward to Committee Review | Review request with optional Faculty notes to the reviewer | Implements "Request review"; drives the [Publishing Workflow](./05-publishing-workflow.md) state machine forward | — |
| **Version History** (reached from Lesson Editor / Course Overview) | Viewing every version of a Lesson, Course, or Assessment the Faculty member authored or can access | Version list with status, author, timestamp; read-only for Faculty (Restore is Administrator-only, per [Curriculum Administration Portal](./09-curriculum-administration-portal.md)) | Implements "View version history"; consistent with [Versioning Strategy](./04-versioning-strategy.md) | Version diff/comparison view — **Future**, per [Versioning Strategy](./04-versioning-strategy.md#current--planned--future) |
| **Duplicate Lesson / Reuse Learning Object** (action from Course Overview / Lesson Editor) | Copying an existing Lesson (within or across own Courses) or inserting an existing Learning Object into a new Lesson | Source selection, destination Course/Module | Implements "Duplicate lessons," "Reuse learning objects"; each copy starts its own independent version chain per [Versioning Strategy](./04-versioning-strategy.md#when-a-new-version-is-created) | Cross-Faculty content library/search — **Future** |
| **Clone Course** (action from Course list) | Copying an entire Course's Module/Lesson/Assessment structure into a new Course, e.g. for a new Program Version or a related Prepped product | Source Course selection, destination Program | Implements "Clone courses"; a Faculty-scoped convenience distinct from Administrator-scoped Program-level operations | — |
| **Clone Program** (Program Director / Administrator, not Faculty — see note below) | Copying an entire Program's structure to seed a new one (e.g., launching TherapyPrepped from PharmDPrepped's structure) | Source Program selection, destination School | Implements "Clone programs" | — |
| **Competency Mapping View** (secondary, per Lesson/Course) | Viewing and editing which Course Outcomes a Lesson maps to, and which Program Competencies a Course Version's outcomes collectively serve | Mapping editor plus the rollup view described in [Competency Mapping Framework](./07-competency-mapping-framework.md#where-this-surfaces-in-the-platform) | Implements "View competency mapping" | — |

## A Note on "Clone Programs"

This milestone's Faculty Capabilities list includes "Clone programs"
among a set of otherwise Course/Lesson-scoped actions. Program-level
cloning affects institution-wide structure (a new Program requires a
School assignment, and typically Program Director/Administrator
review before existing) — consistent with
[Curriculum Administration Portal](./09-curriculum-administration-portal.md)'s
Administrator-held Program creation authority, and with
[ROLE_SCOPE](../../../src/domain/roles.ts) where `FACULTY` is scoped to
Course Offering, not Program. This document places the *action* where
this milestone's Faculty Capabilities list puts it, but attributes
actual authority to Program Director/Administrator, the same pattern
[Publishing Workflow](./05-publishing-workflow.md#no-new-role-curriculum-committee-review-uses-existing-authority)
already uses for Curriculum Committee Review — Faculty may propose/
initiate a clone, but Program Director or Administrator authority
completes it.

## Current / Planned / Future

| Screen | Status |
|---|---|
| Curriculum Authoring — Course Overview | **Planned** — replaces Milestone 4's "Content & Preparation" |
| Lesson Editor | **Planned** |
| Request Review | **Planned** |
| Version History | **Planned** |
| Duplicate Lesson / Reuse Learning Object | **Planned** |
| Clone Course | **Planned** |
| Clone Program (Program Director / Administrator authority) | **Planned** |
| Competency Mapping View | **Planned** |
| Version diff/comparison | **Future** |
| Real-time co-authoring | **Future** |
| Cross-Faculty content library/search | **Future** |

## ⚠️ Needs Verification

- Whether Faculty need authoring access to Courses they are not
  currently teaching (an authoring-scope question already flagged in
  [Publishing Workflow](./05-publishing-workflow.md#-needs-verification)
  and in [Curriculum Administration Portal](./09-curriculum-administration-portal.md)'s
  new Faculty Assignment screen) is not fully resolved here.

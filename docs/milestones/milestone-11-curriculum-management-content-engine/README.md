# Milestone 11 — Curriculum Management & Content Engine

**Status:** Draft
**Phase:** Phase 1 — Product Architecture (documentation) / extends Milestone 10's implementation scope
**Date:** 2026-08-07
**Scope:** Documentation only. No production code, database migrations,
or changes to the Milestone 10 codebase are introduced in this
milestone.

## Purpose

Milestone 10 built the first working vertical slice — deliberately
narrow, per ADR-011, with "no full curriculum management yet" (its own
words, in `prisma/schema.prisma`'s comments): Course connected directly
to Lesson with no Module layer, no versioning, no publishing workflow,
no competency mapping. That narrowness was correct for a first proof of
the architecture. Milestone 11 is the documentation for what comes
next: **the complete academic content management engine** — the full
curriculum hierarchy, versioning, publishing workflow, competency
mapping, and assessment architecture needed to support Minara's own
programs and every Prepped product, present and future.

This milestone does not implement that engine. Per its own instructions,
it produces the architecture documentation first, in the same style and
discipline as Milestones 1–10, so that a future Foundation Build phase
extends Milestone 10's schema deliberately, not by improvisation.

## Documents in This Milestone

| # | Document | Summary |
|---|---|---|
| 1 | [Curriculum Management Vision](./01-curriculum-management-vision.md) | Why this engine exists, and how Minara-Curriculum and Minara-LMS's roles relate |
| 2 | [Academic Content Architecture](./02-academic-content-architecture.md) | Where the Content Engine sits within the Modular Monolith and Service Boundaries |
| 3 | [Curriculum Domain Model](./03-curriculum-domain-model.md) | The full entity model: Institution through Learning Object, and its relationship to Milestone 10's schema |
| 4 | [Versioning Strategy](./04-versioning-strategy.md) | How Program, Course, Lesson, and Assessment versions are created, published, and never overwritten |
| 5 | [Publishing Workflow](./05-publishing-workflow.md) | Draft → Faculty Review → Curriculum Committee Review → Approved → Published → Archived |
| 6 | [Lesson Framework](./06-lesson-framework.md) | The full structure of a Lesson and its Learning Objects |
| 7 | [Competency Mapping Framework](./07-competency-mapping-framework.md) | Lesson → Course Outcome → Program Competency → Program Learning Outcome → Institution Mission |
| 8 | [Assessment Architecture](./08-assessment-architecture.md) | Question Banks, rubrics, assessment types, and future-ready (not yet built) randomized/adaptive delivery |
| 9 | [Curriculum Administration Portal](./09-curriculum-administration-portal.md) | Administrator screens for schools, terms, cohorts, faculty assignment, publish/archive/restore |
| 10 | [Faculty Content Management Portal](./10-faculty-content-management-portal.md) | Faculty screens for drafting, reviewing, versioning, cloning, and reusing curriculum |
| 11 | [Student Learning Delivery Model](./11-student-learning-delivery-model.md) | How published content, prerequisites, and progress tracking reach Students |
| 12 | [Curriculum Audit Framework](./12-curriculum-audit-framework.md) | The curriculum-specific extension of the Audit and Accountability Framework |
| 13 | [Future Expansion Considerations](./13-future-expansion-considerations.md) | Adaptive assessments, SCORM/xAPI interoperability, and other explicitly deferred work |

## Constraint: Nothing Here Contradicts Milestones 1–10 or the ADRs

Per this milestone's own instructions, every document below is checked
against, and stays consistent with:

| Constraint | How This Milestone Honors It |
|---|---|
| SSR-first architecture ([ADR-002](../../architecture/adr/ADR-002-ssr-first-web-architecture.md)) | Every public-facing curriculum page (program pages, public course catalogs) remains server-rendered; authoring/review screens live in the authenticated portal, per the existing public/authenticated split. |
| Modular Monolith ([ADR-001](../../architecture/adr/ADR-001-modular-monolith-architecture.md)) | The Content Engine is designed as an expansion of the existing **Learning** service (per [Service Boundaries](../milestone-6-technical-architecture/03-service-boundaries.md)), not a new deployable unit. |
| Domain-driven module boundaries ([ADR-004](../../architecture/adr/ADR-004-domain-driven-module-boundaries.md)) | New entities (Module, Program Version, Competency, etc.) are placed within the existing five bounded contexts — none of this milestone's design introduces a boundary drawn along technical convenience. |
| RBAC and Audit-First Security ([ADR-005](../../architecture/adr/ADR-005-rbac-and-audit-first-security-model.md)) | Every curriculum action (draft, edit, review, approve, publish, archive, restore) is scoped to an existing Role and Audit Logged — see [Curriculum Audit Framework](./12-curriculum-audit-framework.md). No new RBAC Role is introduced (see the Curriculum Committee note in [Publishing Workflow](./05-publishing-workflow.md)). |
| Human-reviewed AI governance ([ADR-006](../../architecture/adr/ADR-006-human-reviewed-ai-governance.md)) | AI assistance in curriculum drafting is bounded exactly as before: it may draft, suggest, and review — it may never publish, approve, or modify an academic record unsupervised. |
| Single Minara-LMS repository, Minara-Curriculum separate ([ADR-003](../../architecture/adr/ADR-003-monorepo-and-ecosystem-architecture.md)) | Unchanged. [Doc 1](./01-curriculum-management-vision.md) clarifies, but does not alter, the division of responsibility between the two repositories. |
| Educational-record privacy model ([ADR-010](../../architecture/adr/ADR-010-educational-record-privacy-model.md)) | Curriculum content remains educational content; nothing in this milestone introduces patient health information. |
| Vertical Slice philosophy ([ADR-011](../../architecture/adr/ADR-011-vertical-slice-development-strategy.md)) | This milestone documents the full engine but does not mandate building it all at once — [Doc 13](./13-future-expansion-considerations.md) and the Current/Planned/Future tables throughout make clear what a next, still-narrow implementation phase would build first. |

## Relationship to Milestone 10's Implemented Schema

Milestone 10 shipped a real, working, deliberately narrow schema. This
milestone's domain model ([Doc 3](./03-curriculum-domain-model.md))
is additive to it — every Milestone 10 entity keeps its meaning; this
milestone adds the layers and versioning Milestone 10 explicitly
deferred. See [Doc 3 §Relationship to the Milestone 10 Schema](./03-curriculum-domain-model.md#relationship-to-the-milestone-10-vertical-slice-schema)
for the precise mapping.

## Approval

This milestone is **Draft** pending stakeholder review. Extending the
Milestone 10 codebase to implement any part of this engine should
happen only after this milestone is reviewed and approved, and should
itself follow the vertical-slice discipline of
[ADR-011](../../architecture/adr/ADR-011-vertical-slice-development-strategy.md) —
building and proving one narrow piece before the next, not the whole
engine at once.

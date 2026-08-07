# Future Expansion Considerations

**Status:** Draft
**Milestone:** 11 — Curriculum Management & Content Engine
**Date:** 2026-08-07

## Purpose

This document consolidates every item this milestone deliberately
deferred — named explicitly in this milestone's instructions
(Randomized/Adaptive Assessments) and surfaced throughout Documents
1–12 as **Future** — into a single reference, so a later milestone
knows exactly what was seen and set aside, and why, rather than
rediscovering these questions from scratch.

## Explicitly Deferred by This Milestone's Own Instructions

| Item | Where Named | Why Deferred |
|---|---|---|
| **Adaptive Assessments** (difficulty adjusts to Student performance) | [Assessment Architecture](./08-assessment-architecture.md#randomized-and-adaptive-assessments-future-ready-only) | Explicit instruction: "Do not build adaptive algorithms yet." Requires a difficulty model and scoring algorithm this milestone does not design. |
| **Randomized Assessments** (per-Student question subsets) | [Assessment Architecture](./08-assessment-architecture.md#randomized-and-adaptive-assessments-future-ready-only) | Named "future-ready," not "build now" — the Question Bank ↔ Assessment Version relationship is shaped to support it later without redesign. |

## Interoperability (Not Named by This Milestone, Flagged for Completeness)

| Item | Consideration |
|---|---|
| **SCORM / xAPI interoperability** | Neither this milestone's instructions nor any prior milestone named external content-packaging standards. If Minara ever needs to import third-party courseware, or export its own Learning Objects for use in another LMS, SCORM/xAPI compliance would be a significant addition to [Learning Object](./03-curriculum-domain-model.md#versioned-curriculum-content-entities)'s design — not assumed or designed against here. |
| **Learning Tools Interoperability (LTI)** | Similarly unnamed; relevant if a future Learning Object subtype needs to embed a third-party interactive tool rather than only the ten named subtypes. |

## Deferred Items Surfaced Within This Milestone's Own Documents

| Item | Source Document |
|---|---|
| The precise Minara-Curriculum ↔ Minara-LMS content hand-off/sync mechanism, and whether Minara-Curriculum will ever hold Lesson-level reference drafts | [Curriculum Management Vision](./01-curriculum-management-vision.md#-needs-verification) |
| Public-facing competency/accreditation pages (no such page exists yet) | [Academic Content Architecture](./02-academic-content-architecture.md#current--planned--future) |
| Nested Modules (Sub-Modules) | [Curriculum Domain Model](./03-curriculum-domain-model.md#-needs-verification) |
| Academic Term as a first-class, Cohort-scoped entity beyond Course-Offering-level scoping | [Curriculum Domain Model](./03-curriculum-domain-model.md#-needs-verification) |
| Prerequisite evaluation granularity (entity-level vs. specific-version-at-enrollment) | [Curriculum Domain Model](./03-curriculum-domain-model.md#-needs-verification) |
| Rollback/urgent-correction path that bypasses full Draft → Review → Publish cycling | [Versioning Strategy](./04-versioning-strategy.md#-needs-verification) |
| Version retention/cold-storage policy | [Versioning Strategy](./04-versioning-strategy.md#-needs-verification) |
| A true, multi-person Curriculum Committee body/Role (vs. this milestone's Program Director/Administrator interim attribution) | [Publishing Workflow](./05-publishing-workflow.md#no-new-role-curriculum-committee-review-uses-existing-authority) |
| Cascade rules between parent/child version publish states | [Publishing Workflow](./05-publishing-workflow.md#current--planned--future) |
| Discussion as a Learning Object subtype vs. a Lesson-level field | [Lesson Framework](./06-lesson-framework.md#-needs-verification) |
| Accreditation-report export format for the Program Competency Map | [Competency Mapping Framework](./07-competency-mapping-framework.md#-needs-verification), [Curriculum Administration Portal](./09-curriculum-administration-portal.md) |
| Enumerated Question type list | [Assessment Architecture](./08-assessment-architecture.md#-needs-verification) |
| Server-enforced Assessment time limits | [Assessment Architecture](./08-assessment-architecture.md#-needs-verification) |
| Bulk-publish actions in the Publishing Queue | [Curriculum Administration Portal](./09-curriculum-administration-portal.md#-needs-verification) |
| Faculty authoring scope beyond current teaching assignments | [Faculty Content Management Portal](./10-faculty-content-management-portal.md#-needs-verification) |
| Version diff/comparison tooling | [Versioning Strategy](./04-versioning-strategy.md#current--planned--future), [Faculty Content Management Portal](./10-faculty-content-management-portal.md) |
| Real-time co-authoring | [Faculty Content Management Portal](./10-faculty-content-management-portal.md#current--planned--future) |
| Cross-Faculty content library/search (for Reuse Learning Object) | [Faculty Content Management Portal](./10-faculty-content-management-portal.md#current--planned--future) |
| Server-action-layer enforcement point for Prerequisite gating | [Student Learning Delivery Model](./11-student-learning-delivery-model.md#-needs-verification) |
| Certificate Eligibility indicator | [Student Learning Delivery Model](./11-student-learning-delivery-model.md#current--planned--future) — depends on Certificates, itself out of scope since Milestone 10 |
| Scoped (Program Director) curriculum audit visibility | [Curriculum Audit Framework](./12-curriculum-audit-framework.md#-needs-verification) |
| Audit trail export for accreditation review | [Curriculum Audit Framework](./12-curriculum-audit-framework.md#current--planned--future) — inherited from Milestone 2, still unresolved |

## Why This List Exists

Per [Curriculum Management Vision — Vision Principle 4](./01-curriculum-management-vision.md#vision-principles)
and [ADR-011](../../architecture/adr/ADR-011-vertical-slice-development-strategy.md),
this milestone deliberately documents a fuller engine than any single
implementation phase should build at once. This list is the explicit
boundary of that documentation — everything on it was considered and
consciously set aside, not overlooked. A future Foundation Build
milestone extending Milestone 10's schema toward this engine should
treat this list as its own starting backlog, prioritized against real
operational need rather than re-derived from scratch.

## Current / Planned / Future

Every item in this document is, by definition, **Future** — this table
exists only to note that none of them are silently assumed to be in
scope for whatever implementation phase follows this milestone's
documentation.

| Category | Status |
|---|---|
| Adaptive Assessments, Randomized Assessments | **Future** |
| SCORM/xAPI/LTI interoperability | **Future** |
| Every item in the consolidated table above | **Future** |

## ⚠️ Needs Verification

- Prioritization among the items above is not attempted in this
  document — that is a product/roadmap decision for whoever scopes the
  next implementation phase, informed by this list but not decided
  within it.

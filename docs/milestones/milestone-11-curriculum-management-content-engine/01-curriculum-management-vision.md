# Curriculum Management Vision

**Status:** Draft
**Milestone:** 11 — Curriculum Management & Content Engine
**Date:** 2026-08-07

## Purpose

This document states why Minara-LMS needs a full curriculum management
engine, and — since this has been an open question since
[Milestone 1](../milestone-1-product-vision-platform-strategy/09-scope-boundaries.md) —
resolves precisely how that engine relates to Minara-Curriculum, the
separate, authoritative repository for academic content.

## The Vision

**One configuration-driven engine, powering every current and future
program, with no program hard-coded into it.** The same Content Engine
that delivers Pharmacy Technology (per
[ADR-008](../../architecture/adr/ADR-008-pharmacy-technology-first-launch.md))
must, without code changes, be able to power a future Health
Information program, a future Behavioral Health program, a future
Medical Assistant program, and every Prepped product
(PharmTechPrepped, PharmDPrepped, TherapyPrepped, MedCodePrepped, and
whatever comes after) — exactly the same "configuration, not fork"
principle already established in
[Prepped Ecosystem Architecture](../milestone-8-technology-stack-development-architecture/10-prepped-ecosystem-architecture.md)
and [ADR-007](../../architecture/adr/ADR-007-minara-as-education-engine.md),
now extended from *who a program serves* to *how its curriculum is
built*.

## Resolving Minara-Curriculum's Relationship to This Engine

Since [Scope Boundaries](../milestone-1-product-vision-platform-strategy/09-scope-boundaries.md),
this documentation set has said Minara-Curriculum authors academic
content and Minara-LMS delivers it — and, since
[Milestone 5](../milestone-5-domain-model-data-architecture/02-academic-domain-model.md),
has left the exact hand-off mechanism as **⚠️ Needs Verification**. This
milestone answers *what* each repository is responsible for (the
mechanism — how content actually moves between them — remains a later,
technical decision, flagged again in
[Future Expansion Considerations](./13-future-expansion-considerations.md)).

**The division is WHAT vs. HOW:**

| | Minara-Curriculum (separate repository) | Minara-LMS Content Engine (this milestone) |
|---|---|---|
| **Owns** | The institution's official academic plan: which Programs exist, their required Competencies, Program Learning Outcomes, and required course sequence | The deliverable content that fulfills that plan: actual Lesson content, Learning Objects, Assessments, drafted and versioned by Faculty |
| **Answers** | *What* should students learn, and *why* it satisfies the institution's mission and accreditation obligations | *How* that learning actually happens — the lived Lesson, video, reading, quiz a Student experiences |
| **Authoritative for** | Program Competencies, Program Learning Outcomes, official program/course requirements (per [Competency Mapping Framework](./07-competency-mapping-framework.md)) | Course/Module/Lesson/Learning Object/Assessment content and its version history (per [Curriculum Domain Model](./03-curriculum-domain-model.md)) |
| **Review checks against** | Institutional mission, accreditation standards (a Minara-Master-Plan-facing concern) | Minara-Curriculum's official plan — this is precisely what Curriculum Committee Review, in the [Publishing Workflow](./05-publishing-workflow.md), verifies |

This is not a new decision reversing
[Scope Boundaries](../milestone-1-product-vision-platform-strategy/09-scope-boundaries.md) —
it is that same boundary, made concrete enough to design against. The
LMS was always going to need somewhere for Faculty to actually draft,
version, and publish the deliverable form of curriculum content; this
document states plainly that "somewhere" is the Content Engine
described in this milestone, while the institution's official
curricular *design* stays sourced from, and authoritative in,
Minara-Curriculum. A real-world analogy: a university's curriculum
committee approves what a course must cover and why, against the
institution's accreditation-facing program design; the actual lecture
slides, readings, and quizzes are drafted and maintained by faculty in
the learning platform. Minara-Curriculum is the former; the Content
Engine is the latter.

## Vision Principles

1. **Configuration over code, always.** Per this milestone's explicit
   instruction, nothing about Pharmacy Technology — or any other
   program — is hard-coded anywhere in the Content Engine. A new School,
   Program, or Prepped product is data, never a code change, exactly as
   [Prepped Ecosystem Architecture](../milestone-8-technology-stack-development-architecture/10-prepped-ecosystem-architecture.md)
   already established for the platform generally.
2. **Published content is a promise that never silently breaks.**
   Once a Student has been assessed against a piece of curriculum, that
   exact version must remain reconstructable — see
   [Versioning Strategy](./04-versioning-strategy.md).
3. **Every academic judgment stays human, and AI assists without ever
   deciding.** Restated, not reinvented, from
   [Guiding Principles §10](../milestone-1-product-vision-platform-strategy/03-guiding-principles.md)
   and [ADR-006](../../architecture/adr/ADR-006-human-reviewed-ai-governance.md);
   see the AI boundary in every relevant document below.
4. **Build narrow, prove it, then expand** — the same discipline
   [ADR-011](../../architecture/adr/ADR-011-vertical-slice-development-strategy.md)
   already established for Milestone 10. This milestone documents the
   full engine; it does not mandate building all of it before any of it
   is useful.

## Current / Planned / Future

| Element | Status |
|---|---|
| WHAT vs. HOW division between Minara-Curriculum and the Content Engine | **Current** — this milestone's clarifying decision |
| Configuration-driven support for Minara's own programs | **Planned**, extending [ADR-008](../../architecture/adr/ADR-008-pharmacy-technology-first-launch.md)'s Pharmacy Technology launch |
| Configuration-driven support for every named Prepped product | **Future**, timed to each product's own launch per [Implementation Phases](../milestone-7-mvp-definition-implementation-planning/05-implementation-phases.md) |
| The specific Minara-Curriculum ↔ Minara-LMS content hand-off mechanism | **Future**, see [Future Expansion Considerations](./13-future-expansion-considerations.md) |

## ⚠️ Needs Verification

- Whether Minara-Curriculum will ever hold anything beyond the
  Program-level design (Competencies, Outcomes, required course
  sequence) — e.g., reference/source drafts of Lesson content that the
  Content Engine imports rather than Faculty drafting natively — is not
  decided here and would change the Content Engine's authoring model if
  confirmed.
- The precise institutional process for keeping Minara-Curriculum's
  official program design and the Content Engine's published courses in
  sync over time (beyond the per-publish Curriculum Committee Review
  check) is not defined.

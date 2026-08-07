# Repository & Code Organization

**Status:** Draft
**Milestone:** 8 — Technology Stack & Development Architecture
**Date:** 2026-08-07

This document defines how Minara-LMS's future codebase should be
organized as repositories, and — since this milestone was explicitly
asked to evaluate it — how that relates to Minara-Master-Plan,
Minara-Curriculum, and the Prepped product family.

## Monorepo vs. Multiple Repositories (Within Minara-LMS)

**Recommendation: a single monorepo for the Minara-LMS application
itself** (Public Website, Authenticated Application, all backend
modules, and shared packages) — **not** one repository per portal, per
module, or per Prepped product.

| Factor | Assessment |
|---|---|
| Fit with the Modular Monolith decision | A monorepo is the natural code-organization counterpart to the modular-monolith deployment decision in [Backend Architecture](./03-backend-architecture.md) — splitting the code into many repositories while deploying it as one unit would fight itself |
| Shared types between frontend and backend | Both recommended as TypeScript (see [Frontend](./02-frontend-architecture.md) and [Backend](./03-backend-architecture.md) Architecture) — a monorepo lets domain types defined once (matching [Milestone 5](../milestone-5-domain-model-data-architecture/README.md)'s entities) be shared directly, rather than duplicated or published as versioned packages across repository boundaries |
| Cross-module refactoring | The Business Rules Catalog ([Milestone 5, Doc 8](../milestone-5-domain-model-data-architecture/08-business-rules-catalog.md)) sometimes spans modules (e.g., a Certificate Issuance rule touching Gradebook, Externships, and Payments) — a monorepo makes this kind of cross-cutting change reviewable in one place |
| Avoiding unnecessary complexity | Per [Technology Selection Principles](./01-technology-selection-principles.md), multiple repositories are a real coordination cost (versioning, cross-repo releases) that nothing in Milestones 1–7 requires paying yet |

## Shared Packages

Within the monorepo, three categories of shared code are recommended:

| Package | Contents | Consumed By |
|---|---|---|
| **Domain Types** | TypeScript representations of [Milestone 5](../milestone-5-domain-model-data-architecture/README.md)'s entities and relationships | Every backend module; the frontend, for type-safe API consumption |
| **UI Component Library** | The shared component layer from [Frontend Architecture §Component Architecture Philosophy](./02-frontend-architecture.md) | Public Website, Authenticated Application (all seven portals) |
| **Shared Utilities** | Cross-cutting helpers (date/time handling, validation logic tied to the [Business Rules Catalog](../milestone-5-domain-model-data-architecture/08-business-rules-catalog.md)) | Frontend and backend alike |

## Application Boundaries Within the Monorepo

Even inside one repository, clear internal boundaries matter:

- **Public Website** and **Authenticated Application** are organized as
  distinct applications within the monorepo (different rendering/SEO
  needs, per [Frontend Architecture](./02-frontend-architecture.md)),
  both consuming the same shared packages.
- **Backend modules** are organized one-per-service, exactly matching
  the 13 services from
  [Service Boundaries](../milestone-6-technical-architecture/03-service-boundaries.md) —
  the monorepo's folder structure should make it obvious, at a glance,
  which module owns which entity.

## Relationship to Minara-Master-Plan and Minara-Curriculum

**These remain separate repositories from Minara-LMS — this document
does not recommend merging them.** This is not a new decision; it
restates and confirms, at the technical-architecture level, the
separation already established at this project's outset and maintained
throughout [Scope Boundaries](../milestone-1-product-vision-platform-strategy/09-scope-boundaries.md):

- **Minara-Master-Plan** — institutional governance, policy, and
  accreditation content. Not code; a content/documentation repository in
  its own right, consumed by Minara-LMS only for the specific,
  still-undefined hand-off mechanism noted throughout Milestones 5–6.
- **Minara-Curriculum** — academic content (courses, lessons,
  assessments, question banks). Also not code in the Minara-LMS sense;
  Minara-LMS's Learning and Assessments modules consume this content
  (per the Academic Domain Model's authored-by/operated-by split) but do
  not own or version it.

Merging either into the Minara-LMS monorepo would blur exactly the
separation of concerns [Milestone 1](../milestone-1-product-vision-platform-strategy/README.md)
was written to protect — institutional and curricular ownership staying
distinct from platform ownership. The monorepo recommendation above
applies **only** to Minara-LMS's own application code.

## Prepped Ecosystem Considerations

**Recommendation: Prepped products (PharmTechPrepped, PharmDPrepped,
TherapyPrepped, MedCodePrepped, and future products) do not get their
own repositories or their own codebases.** They are represented within
the Minara-LMS monorepo as:

- **Program records** in the Academic Domain Model (per
  [Academic Domain Model](../milestone-5-domain-model-data-architecture/02-academic-domain-model.md)),
  not separate applications.
- **Brand/theme configuration** at the Presentation Layer (public-facing
  pages, portal styling) — a configuration concern, not a code-fork
  concern.

This is the direct technical consequence of the recommendation
developed fully in
[Prepped Ecosystem Architecture](./10-prepped-ecosystem-architecture.md);
this document states the repository-level implication, that document
carries the full rationale.

**Why not separate repositories per Prepped brand:** doing so would
fragment RBAC, audit logging, and the domain model itself across
multiple codebases — each Prepped product would need its own copy of
Identity, Gradebook, Certificates, and every other module, directly
contradicting
[Platform Philosophy](../milestone-1-product-vision-platform-strategy/04-platform-philosophy.md)'s
"one platform, many front doors" and reintroducing exactly the
complexity [Technology Selection Principles](./01-technology-selection-principles.md)
warns against.

## Documentation Repository Relationship

This documentation (Milestones 1–8 and beyond) lives in the Minara-LMS
repository itself, under `docs/` — as it already does. This document
recommends that convention continue: architecture and product
documentation for the platform stays versioned alongside the platform's
own code, so that documentation and implementation never drift out of
sync silently.

## Current / Planned / Future

| Element | Status |
|---|---|
| Single Minara-LMS monorepo | **Current** — this milestone's recommendation |
| Domain Types, UI Component Library, Shared Utilities packages | **Planned** |
| Minara-Master-Plan and Minara-Curriculum as separate repositories | **Current** — confirms an existing decision, does not change it |
| Prepped products as configuration, not separate repositories/codebases | **Current** — this milestone's recommendation, detailed further in [Doc 10](./10-prepped-ecosystem-architecture.md) |
| Documentation living in `docs/` within the Minara-LMS repository | **Current** — confirms existing practice |

## ⚠️ Needs Verification

- The specific mechanism by which Minara-Curriculum content and
  Minara-Master-Plan content reach the Minara-LMS monorepo at build or
  runtime remains undefined — carried forward from every prior milestone
  that has touched this boundary.
- Whether any Prepped product will ever need genuinely distinct
  technical behavior (not just branding) that the "configuration, not
  code-fork" model can't accommodate is not yet known — see
  [Prepped Ecosystem Architecture](./10-prepped-ecosystem-architecture.md)
  for the full analysis.

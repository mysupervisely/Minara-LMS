# ADR-003: Monorepo and Ecosystem Architecture

**Status:** Draft (Proposed)
**Date:** 2026-08-07
**Source:** [Repository & Code Organization](../../milestones/milestone-8-technology-stack-development-architecture/06-repository-and-code-organization.md),
[Prepped Ecosystem Architecture](../../milestones/milestone-8-technology-stack-development-architecture/10-prepped-ecosystem-architecture.md),
[Repository Structure](../../milestones/milestone-9-engineering-foundation-development-setup/02-repository-structure.md)

## Context / Problem

Minara-LMS's codebase needs to support one institution's own schools and
programs *and* a growing family of Prepped products (PharmTechPrepped,
PharmDPrepped, TherapyPrepped, MedCodePrepped, and future products) —
while remaining clearly separate, at the repository level, from
Minara-Master-Plan (institutional governance) and Minara-Curriculum
(academic content), whose ownership and update cadence are entirely
different from platform code. The question this ADR resolves: how many
repositories, and which products or systems belong in which.

## Decision

**Minara-LMS is built as a single monorepo**, containing the Public
Website, the Authenticated Application, all thirteen backend modules,
and shared packages. **Minara-Master-Plan and Minara-Curriculum remain
separate repositories.** **Prepped products do not receive their own
repositories or codebases** — they are represented within the
Minara-LMS monorepo as Program records and brand/theme configuration.

## Relationship Between Repositories

| Repository | Relationship |
|---|---|
| **Minara-LMS** (this repository) | The platform: all application and service code for Minara's own schools *and* every Prepped product, in one monorepo. |
| **Minara-Master-Plan** | Separate. Institutional governance, policy, and accreditation content — consumed by, never merged into, Minara-LMS. |
| **Minara-Curriculum** | Separate. Academic content (courses, lessons, assessments, question banks) — authored there, delivered by Minara-LMS's Learning and Assessments modules, never owned by Minara-LMS. |
| **PharmTechPrepped, PharmDPrepped, TherapyPrepped, MedCodePrepped** | Not repositories. Program records + brand configuration inside the Minara-LMS monorepo. |
| **Future Prepped products** | Same pattern as above — a new Program record and configuration, never a new repository. |

## Why Prepped Products Share Platform Capabilities Rather Than Becoming Independent Platforms

- **Identity would fragment.** [Platform Philosophy](../../milestones/milestone-1-product-vision-platform-strategy/04-platform-philosophy.md)'s
  "one account, one profile, multiple programs" promise breaks the
  moment a learner touches more than one Prepped product or a Minara
  school program if each runs on separate infrastructure with its own
  identity system.
- **RBAC and Audit would duplicate.** Every Prepped product as an
  independent platform would need its own copy of the Identity,
  Gradebook, Certificates, and Audit modules — multiplying both
  engineering effort and the surface area for a security or compliance
  gap, directly contradicting
  [Technology Selection Principles](../../milestones/milestone-8-technology-stack-development-architecture/01-technology-selection-principles.md)'s
  "avoid unnecessary complexity" rule.
- **New products should be cheap to launch.** Under this decision,
  launching a new Prepped product means creating a Program record and
  configuration — under the alternative, it would mean standing up a
  new platform. The former supports
  [Long-Term Platform Vision](../../milestones/milestone-1-product-vision-platform-strategy/07-long-term-platform-vision.md)'s
  "growing family of learning experiences" ambition; the latter works
  against it.
- **Certification stays institutionally consistent.** A Certificate
  issued through PharmTechPrepped goes through the exact same
  [Certificate & Graduation Workflow](../../milestones/milestone-3-student-journey-core-workflows/05-certificate-graduation-workflow.md)
  as a Minara school program's certificate — its legitimacy comes from
  one consistent institutional process, which independent platforms
  would make much harder to guarantee.

## Options Considered

| Option | Description | Why Not Chosen |
|---|---|---|
| **One repository per Prepped product** | Each product gets its own codebase and deployment. | Fragments Identity, RBAC, Audit, and every shared module — see rationale above. |
| **Multiple repositories within Minara-LMS itself (per module or per portal)** | Minara-LMS's own code split across several repositories. | Fights the Modular Monolith deployment decision (see [ADR-001](./ADR-001-modular-monolith-architecture.md)); adds cross-repo coordination cost for no benefit at this stage. |
| **Single Minara-LMS monorepo; Master-Plan and Curriculum separate; Prepped as configuration** *(chosen)* | As decided above. | Matches the Modular Monolith's deployment shape, preserves institutional/curricular ownership separation established since [Milestone 1](../../milestones/milestone-1-product-vision-platform-strategy/09-scope-boundaries.md), and keeps Prepped products cheap to launch. |

## Consequences

**Benefits:**
- One Identity, RBAC, Audit, and domain model serving Minara's own
  schools and every Prepped product — no duplicated compliance surface.
- New Prepped products launch as configuration work, not new platform
  builds.
- Institutional and curricular content ownership stays cleanly separate
  from platform code, preserving the separation established at this
  project's outset.

**Tradeoffs:**
- If a future Prepped product needs business rules that configuration
  genuinely can't express, this model's cleanliness erodes — flagged
  directly in
  [Prepped Ecosystem Architecture §Needs Verification](../../milestones/milestone-8-technology-stack-development-architecture/10-prepped-ecosystem-architecture.md)
  as the single biggest risk to this decision holding up.
- The monorepo grows large over time as more Prepped products and
  Minara programs are added — a real long-term maintenance
  consideration, though not one expected to matter at MVP scale.

## Future Review Considerations

This decision should be revisited if:
- A specific Prepped product's requirements genuinely cannot be
  expressed as Program-level configuration.
- The monorepo's size becomes an operational burden significant enough
  to outweigh the shared-services benefits above.

## Current / Planned / Future

| Element | Status |
|---|---|
| Single Minara-LMS monorepo | **Current** |
| Minara-Master-Plan and Minara-Curriculum as separate repositories | **Current** — confirms an existing, pre-established decision |
| Prepped products as configuration, not repositories | **Current** |

## ⚠️ Needs Verification

- Whether any named Prepped product will eventually need business rules
  configuration can't express — carried forward from
  [Prepped Ecosystem Architecture](../../milestones/milestone-8-technology-stack-development-architecture/10-prepped-ecosystem-architecture.md).

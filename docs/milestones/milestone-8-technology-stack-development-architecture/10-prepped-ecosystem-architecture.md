# Prepped Ecosystem Architecture

**Status:** Draft
**Milestone:** 8 — Technology Stack & Development Architecture
**Date:** 2026-08-07

This document evaluates how Minara-LMS should technically relate to the
Prepped™ product family (PharmTechPrepped, PharmDPrepped, TherapyPrepped,
MedCodePrepped, and future products), and makes a recommendation.

## The Three Options

| Option | Description |
|---|---|
| **A — Standalone LMS** | Minara-LMS serves only Minara's own schools/programs directly; Prepped products are separate systems entirely, sharing nothing technical with Minara-LMS. |
| **B — Education Engine Powering Prepped** | Minara-LMS exists primarily as infrastructure behind the Prepped brand(s); Minara's own schools are, functionally, just another consumer of that engine. |
| **C — Hybrid Platform** | Minara-LMS is a full LMS serving Minara's own schools directly *and* simultaneously the shared engine powering Prepped products, as two categories of "front door" onto one platform. |

## Evaluation

**Option A (Standalone LMS) is rejected.** It directly contradicts
[Product Vision](../milestone-1-product-vision-platform-strategy/01-product-vision.md),
which explicitly states Prepped products are "learning experiences
powered by the LMS, not completely separate systems." Building Prepped
as fully separate systems would mean duplicating Identity, Gradebook,
Certificates, and every other module from
[Service Boundaries](../milestone-6-technical-architecture/03-service-boundaries.md)
per product — the exact "one account, one profile, multiple programs"
promise from
[Platform Philosophy](../milestone-1-product-vision-platform-strategy/04-platform-philosophy.md)
would break the moment a learner touched more than one Prepped product
or a Minara school program, since each would hold its own, disconnected
identity.

**Option B (Education Engine Powering Prepped) is close, but
incomplete.** It correctly captures that Prepped products don't get
their own systems — but it undersells Minara-LMS's primary purpose.
Per [Product Vision](../milestone-1-product-vision-platform-strategy/01-product-vision.md)
and [Product Mission](../milestone-1-product-vision-platform-strategy/02-product-mission.md),
Minara-LMS exists first and foremost to operate Minara's own schools and
programs directly — it isn't merely infrastructure sitting behind
someone else's brand. Option B, taken literally, misses that Minara-LMS
*is* the Student, Faculty, Program Director, Admissions, Clinical
Coordinator, Employer, and Administrator experience for Minara's own
institutional programs too, not just a backend for Prepped.

**Recommendation: Option C — Hybrid Platform**, defined precisely (to
avoid "hybrid" becoming a vague, non-committal answer):

> Minara-LMS is **one platform, technically identical underneath**,
> that presents itself through multiple branded "front doors" — Minara's
> own schools and programs on one hand, and each Prepped product on the
> other. Every front door shares the same Identity, RBAC, domain model,
> and thirteen services from
> [Service Boundaries](../milestone-6-technical-architecture/03-service-boundaries.md).
> What differs between a Minara school program and a Prepped product is
> **data and configuration** — which Program record a learner is
> enrolled in, and which brand/theme configuration the Presentation
> Layer applies — never which codebase or which underlying services run
> it.

This is the same "one platform, many portals" reasoning
[System Architecture](../milestone-6-technical-architecture/01-system-architecture.md)
already applied to the seven role-based portals, extended here to
brand-based "front doors" instead of role-based ones — a natural
extension of an already-established pattern, not a new architectural
idea.

## Per-Product Technical Treatment

| Product | Program Record | Front Door | Shared Services |
|---|---|---|---|
| **PharmTechPrepped** | A Program in the [Academic Domain Model](../milestone-5-domain-model-data-architecture/02-academic-domain-model.md), scoped to its own School | Its own Public Website pages and branded portal theme (per [Frontend Architecture](./02-frontend-architecture.md)) | All 13 services — Identity, Learning, Assessments, Gradebook, Certificates, etc. |
| **PharmDPrepped** | Same pattern | Same pattern | Same pattern |
| **TherapyPrepped** | Same pattern | Same pattern | Same pattern |
| **MedCodePrepped** | Same pattern | Same pattern | Same pattern |
| **Future products** | Same pattern — a new Program record and brand configuration, not a new codebase | Same pattern | Same pattern |

**⚠️ Needs Verification:** whether any named Prepped product will
eventually need genuinely distinct *business rules* (not just branding)
— e.g., a different certification standard, a different externship
requirement structure — that the shared-services model can't
accommodate through configuration alone. Nothing in Milestones 1–7
indicates this, but it hasn't been explicitly ruled out either, and this
document doesn't assume the answer.

## What "Configuration, Not Fork" Means Technically

- A learner enrolling in PharmTechPrepped gets a new **Enrollment**
  record against a **Program** configured for that brand — the same
  Enrollment entity every Minara school Student gets, per the
  [Student Domain Model](../milestone-5-domain-model-data-architecture/03-student-domain-model.md).
- The **Presentation Layer** resolves which brand's theme, copy, and
  Public Website content to render based on the Program/School context
  — a data-driven decision, not a compiled-in one, so adding a new
  Prepped brand doesn't require a new deployment.
- **Certificates** issued through a Prepped product go through the exact
  same [Certificate & Graduation Workflow](../milestone-3-student-journey-core-workflows/05-certificate-graduation-workflow.md)
  and [Certificates service](../milestone-6-technical-architecture/03-service-boundaries.md)
  as any Minara school program's certificate — the credential's
  legitimacy comes from the same institutional process either way.

## Repository Implication

Already stated in
[Repository & Code Organization](./06-repository-and-code-organization.md):
Prepped products live inside the Minara-LMS monorepo as configuration,
not as separate repositories or codebases. This document is where that
recommendation's full rationale lives; that document states the
consequence.

## Current / Planned / Future

| Element | Status |
|---|---|
| Option C (Hybrid Platform), precisely defined as above | **Current** — this milestone's recommendation |
| Shared Identity/RBAC/domain model/services across Minara schools and Prepped products | **Current** |
| Data-driven brand/theme configuration at the Presentation Layer | **Planned** |
| PharmTechPrepped, PharmDPrepped, TherapyPrepped, MedCodePrepped as configured Programs | **Future** — timed to whichever launches after the MVP's initial Minara school Program, per [Implementation Phases](../milestone-7-mvp-definition-implementation-planning/05-implementation-phases.md) |
| Additional future Prepped products | **Future** |

## ⚠️ Needs Verification

- Whether any Prepped product needs business rules distinct enough that
  configuration alone can't express them (see above) — the single
  biggest risk to this recommendation holding up as the ecosystem grows.
- The order in which Prepped products join the platform relative to
  Minara's own school programs is not decided here — that is a
  [Release Roadmap](../milestone-7-mvp-definition-implementation-planning/07-release-roadmap.md)
  and business-planning question, not a technology-architecture one.

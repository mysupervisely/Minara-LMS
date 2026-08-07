# ADR-007: Minara as Education Engine (Hybrid Ecosystem Model)

**Status:** Draft (Proposed)
**Date:** 2026-08-07
**Source:** [Product Vision](../../milestones/milestone-1-product-vision-platform-strategy/01-product-vision.md),
[Prepped Ecosystem Architecture](../../milestones/milestone-8-technology-stack-development-architecture/10-prepped-ecosystem-architecture.md)

## Context / Problem

Minara-LMS must serve two roles at once: it is the direct operating
platform for Minara Institute of Health Sciences' own schools and
programs, *and* it is the underlying infrastructure the Prepped™ product
family runs on. How those two roles relate — whether Minara-LMS is
fundamentally one thing with the other as a secondary use, or something
else — determines almost every downstream architecture decision about
identity, repository structure, and configuration.

## Options Considered

| Option | Description |
|---|---|
| **A — Standalone LMS** | Minara-LMS serves only Minara's own schools; Prepped products are entirely separate systems. |
| **B — Content/Education Engine Only** | Minara-LMS exists primarily as infrastructure behind the Prepped brand(s); Minara's own schools are just another consumer. |
| **C — Hybrid Platform** | One platform, technically identical underneath, presenting itself through multiple branded front doors — Minara's own schools on one hand, each Prepped product on the other. |

## Decision

**Minara-LMS follows the Hybrid Platform model (Option C).** Minara
functions as the institutional learning engine — the shared Identity,
RBAC, domain model, and services from
[Service Boundaries](../../milestones/milestone-6-technical-architecture/03-service-boundaries.md) —
while simultaneously being the direct, full LMS experience for Minara's
own schools and programs. Prepped products are specialized education
experiences and configurations riding on that same engine, not separate
products bolted on beside it.

## Evaluation

- **Option A (Standalone LMS) rejected.** Directly contradicts
  [Product Vision](../../milestones/milestone-1-product-vision-platform-strategy/01-product-vision.md),
  which states Prepped products are "learning experiences powered by
  the LMS, not completely separate systems." Would also break the "one
  account, one profile, multiple programs" promise the moment a learner
  touched more than one product.
- **Option B (Engine Only) rejected as incomplete.** Correctly captures
  that Prepped products share infrastructure, but understates Minara-LMS's
  primary purpose — per
  [Product Vision](../../milestones/milestone-1-product-vision-platform-strategy/01-product-vision.md)
  and
  [Product Mission](../../milestones/milestone-1-product-vision-platform-strategy/02-product-mission.md),
  the platform exists first to operate Minara's own institutional
  programs directly, not merely to power someone else's brand.
- **Option C (Hybrid Platform) accepted**, defined precisely: every
  front door — Minara's own schools and each Prepped product — shares
  the same Identity, RBAC, domain model, and thirteen services. What
  differs is data and configuration (which Program record, which
  brand/theme), never codebase or underlying services.

## Rationale

This is the direct extension of
[System Architecture](../../milestones/milestone-6-technical-architecture/01-system-architecture.md)'s
"one platform, many portals" reasoning to brand-based front doors
instead of role-based ones — not a new architectural idea, but a
consistent application of one already established and proven sound
across the seven role-based portals.

## Consequences

**Benefits:**
- Minara's own schools and every Prepped product benefit from the same
  ongoing platform investment — a fix or improvement to Gradebook, for
  instance, benefits every front door simultaneously.
- New Prepped products launch as configuration, not new engineering
  effort, per [ADR-003](./ADR-003-monorepo-and-ecosystem-architecture.md).
- One consistent institutional process governs certification regardless
  of which front door a learner used to earn it.

**Tradeoffs:**
- Requires every Prepped product's actual needs to fit within
  "configuration," not custom business logic — the central risk this
  decision carries, tracked explicitly below.
- Minara's own institutional identity and each Prepped brand's identity
  must be kept clearly distinguishable to users, even though they share
  one underlying platform — a presentation-layer discipline that must
  be actively maintained.

## Future Review Considerations

This decision should be revisited if a specific Prepped product (or a
future Minara program) needs business rules — not just branding —
distinct enough that the shared-services model can't express them. See
[Prepped Ecosystem Architecture §Needs Verification](../../milestones/milestone-8-technology-stack-development-architecture/10-prepped-ecosystem-architecture.md)
for the full, still-open discussion of this risk.

## Current / Planned / Future

| Element | Status |
|---|---|
| Hybrid Platform (Option C) as the ecosystem model | **Current** |
| Minara's own schools as a direct, full LMS consumer | **Current** |
| Prepped products as shared-services, configuration-driven front doors | **Current**; specific products **Future**, per [ADR-008](./ADR-008-pharmacy-technology-first-launch.md) |

## ⚠️ Needs Verification

- Whether any Prepped product will need business-rule distinctiveness
  configuration can't express — carried forward from
  [Prepped Ecosystem Architecture](../../milestones/milestone-8-technology-stack-development-architecture/10-prepped-ecosystem-architecture.md).

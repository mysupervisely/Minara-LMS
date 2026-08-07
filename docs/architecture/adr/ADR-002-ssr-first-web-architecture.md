# ADR-002: SSR-First Web Architecture

**Status:** Draft (Proposed)
**Date:** 2026-08-07
**Source:** [Guiding Principles §5](../../milestones/milestone-1-product-vision-platform-strategy/03-guiding-principles.md),
[Frontend Architecture](../../milestones/milestone-8-technology-stack-development-architecture/02-frontend-architecture.md)

## Context / Problem

Prospective students discover Minara — and each Prepped product —
primarily through the public web: search engines, shared links, direct
navigation. That first encounter needs to load fast and be indexable by
search engines, both of which a client-heavy rendering approach
struggles with unless specifically engineered around. At the same time,
the platform's authenticated application (seven role-based portals) is
a highly interactive, form-heavy experience where SEO is irrelevant —
those two facts point toward different rendering priorities for
different parts of the platform, which is why this decision needs to be
explicit rather than assumed uniform.

## Options Considered

| Option | Description |
|---|---|
| **SSR-First** | Public-facing pages render on the server by default; content is present in the initial response without requiring JavaScript execution. |
| **Client-Heavy SPA** | Pages render entirely in the browser after an initial, largely empty page load. |
| **Hybrid Approach (SSR for public, client-optimized for authenticated)** | Different rendering strategies for public vs. authenticated surfaces. |

## Decision

**Public-facing experiences follow an SSR-first philosophy — with the
authenticated application optimizing for logged-in-session performance
instead, per the split already reasoned through in
[Frontend Architecture](../../milestones/milestone-8-technology-stack-development-architecture/02-frontend-architecture.md).**
This is, in effect, the Hybrid Approach option above — chosen explicitly,
not as a compromise, because the two halves of the platform genuinely
have different requirements.

**Enforcement rule:** any public-facing page's primary content must
appear in server-rendered output, verifiable by the simple test of
loading it with JavaScript disabled. A page that fails this test is not
part of the Public Website.

## Rationale

- **SEO is a real, stated requirement.** [Guiding Principles §5](../../milestones/milestone-1-product-vision-platform-strategy/03-guiding-principles.md)
  names server-side rendering for public-facing pages as a non-negotiable
  principle, not an optimization to consider later.
- **First-load performance matters most for prospective students** who
  have made no commitment to wait for the platform to load — this is
  exactly the population an SSR-first approach protects.
- **The authenticated application has no SEO requirement** (it's behind
  login, not indexed) and a real interactivity requirement (grading,
  scheduling, evaluations) — applying the same SSR-first constraint
  there would trade real interactivity benefits for an SEO benefit that
  doesn't apply.

## Relationship to Minara Website, Program Websites, and Prepped Products

Per
[Prepped Ecosystem Architecture](../../milestones/milestone-8-technology-stack-development-architecture/10-prepped-ecosystem-architecture.md)
and
[ADR-007](./ADR-007-minara-as-education-engine.md), the Minara
institutional website, individual Program pages, and every Prepped
product's public pages are **one Public Website application**,
data-driven by brand/theme configuration — not separate codebases. This
means the SSR-first rule applies uniformly across all of them by
construction: adding a new Prepped product's public pages means adding
configuration to the same SSR-first application, never standing up a
separately-architected site that could fall outside this rule.

## Consequences

**Benefits:**
- Search engines can index program and institutional content properly,
  supporting the admissions funnel from
  [Admissions Workflows](../../milestones/milestone-3-student-journey-core-workflows/03-admissions-workflows.md).
- Fast first-load for prospective students on any connection quality,
  supporting the mobile-first commitment in
  [Guiding Principles §4](../../milestones/milestone-1-product-vision-platform-strategy/03-guiding-principles.md).
- Pages remain functional with JavaScript disabled or failing to load —
  a resilience benefit, not just a performance one.

**Tradeoffs:**
- Requires a frontend framework/architecture capable of genuine SSR
  (already addressed by the recommendation in
  [Frontend Architecture](../../milestones/milestone-8-technology-stack-development-architecture/02-frontend-architecture.md)) —
  more architectural complexity than a pure client-rendered SPA.
- The public/authenticated rendering split must be actively maintained
  as a review-time discipline (per the enforcement rule above) — it is
  not automatically guaranteed by the chosen framework alone.

## Future Review Considerations

This decision should be revisited if:
- A future Prepped product or Minara program needs a public presentation
  model genuinely incompatible with the shared Public Website
  application (not currently anticipated, per
  [Prepped Ecosystem Architecture](../../milestones/milestone-8-technology-stack-development-architecture/10-prepped-ecosystem-architecture.md)).
- SEO ceases to be a meaningful acquisition channel for Minara/Prepped
  (not currently anticipated).

## Current / Planned / Future

| Element | Status |
|---|---|
| SSR-first rule for the Public Website | **Current** |
| Client-optimized rendering for the Authenticated Application | **Current** |
| Uniform application across all Prepped products via shared configuration | **Current** |

## ⚠️ Needs Verification

- None beyond what's already carried forward in
  [Frontend Architecture §Needs Verification](../../milestones/milestone-8-technology-stack-development-architecture/02-frontend-architecture.md)
  (the specific SSR framework product).

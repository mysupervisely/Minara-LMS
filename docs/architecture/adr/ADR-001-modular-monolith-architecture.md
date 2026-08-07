# ADR-001: Modular Monolith Architecture

**Status:** Draft (Proposed)
**Date:** 2026-08-07
**Source:** [System Architecture](../../milestones/milestone-6-technical-architecture/01-system-architecture.md),
[Backend Architecture](../../milestones/milestone-8-technology-stack-development-architecture/03-backend-architecture.md)

## Context / Problem

[System Architecture](../../milestones/milestone-6-technical-architecture/01-system-architecture.md)
established that Minara-LMS's internal module boundaries would mirror
the bounded contexts from
[Milestone 5](../../milestones/milestone-5-domain-model-data-architecture/README.md),
but deliberately deferred whether those modules would be **deployed** as
one unit or as independently deployable services. Microservices were a
real consideration because Minara-LMS's stated ambition — thousands of
concurrent students, multiple schools, multiple programs, AI-assisted
learning at scale (per this milestone's own objective and
[Long-Term Platform Vision](../../milestones/milestone-1-product-vision-platform-strategy/07-long-term-platform-vision.md)) —
is exactly the kind of long-term scale microservices are built to serve.

## Options Considered

| Option | Description |
|---|---|
| **Undifferentiated Monolith** | One deployable unit with no enforced internal module boundaries. |
| **Modular Monolith** | One deployable unit, internally organized into strictly separated modules aligned to business boundaries. |
| **Microservices** | Each module (or group of modules) deployed and scaled independently. |

## Decision

**Minara-LMS begins as a modular monolith** — one deployable unit,
internally organized into the thirteen modules defined in
[Service Boundaries](../../milestones/milestone-6-technical-architecture/03-service-boundaries.md)
(Identity, Admissions, Learning, Assessments, Gradebook, Payments,
Messaging, Notifications, Certificates, Externships, Analytics, AI,
Audit), with those module boundaries enforced as a hard engineering
rule from day one.

## Rationale

- **Small-to-moderate team.** Every recommendation in
  [Technology Selection Principles](../../milestones/milestone-8-technology-stack-development-architecture/01-technology-selection-principles.md)
  assumes a small-to-moderate initial engineering team; microservices'
  operational overhead (independent deployment pipelines, inter-service
  networking, distributed monitoring) is a cost that team size can't
  absorb yet without slowing delivery of the actual product.
- **Faster development.** A single deployable unit means one local
  development setup, one test suite to run, one release pipeline — the
  entire [Application Foundation Plan](../../milestones/milestone-9-engineering-foundation-development-setup/04-application-foundation-plan.md)
  and
  [First Implementation Roadmap](../../milestones/milestone-9-engineering-foundation-development-setup/10-first-implementation-roadmap.md)
  assume this.
- **Clear domain boundaries already exist.** This decision is only safe
  *because* [Milestone 5](../../milestones/milestone-5-domain-model-data-architecture/README.md)
  and
  [Service Boundaries](../../milestones/milestone-6-technical-architecture/03-service-boundaries.md)
  already drew module lines along real business meaning, not
  implementation convenience — a modular monolith without well-drawn
  boundaries just becomes an undifferentiated monolith with extra steps.
- **Future extraction remains possible.** Because those boundaries are
  real, any module — most plausibly Learning or AI, given their likely
  load profile — can be extracted into an independent service later,
  once real load or team growth justifies the operational cost.
  Microservices from day one would pay that cost before it's earned.

## Consequences

**Benefits:**
- Lower operational complexity and faster initial delivery.
- Easier local development and debugging (one thing to run, not
  thirteen).
- Cross-cutting changes (a business rule spanning modules) are
  reviewable in one pull request, per
  [Repository & Code Organization](../../milestones/milestone-8-technology-stack-development-architecture/06-repository-and-code-organization.md).
- A clear, low-cost path to independent-service extraction later,
  because module boundaries were never compromised for convenience.

**Tradeoffs:**
- All modules currently share fate for deployment and availability —
  a severe issue in one module (until extracted) can affect the whole
  platform's uptime.
- Independent scaling of a high-load module isn't available until it's
  extracted — if one module's load grows disproportionately before
  extraction happens, the whole deployable unit must scale together.
- Module boundary discipline must be actively maintained through code
  review (per
  [Version Control & Development Workflow](../../milestones/milestone-9-engineering-foundation-development-setup/07-version-control-development-workflow.md)) —
  a modular monolith degrades into an undifferentiated one if boundaries
  aren't enforced.

## Future Review Considerations

This decision should be revisited if:
- The engineering team grows substantially beyond the small-to-moderate
  assumption this decision rests on.
- One module (most plausibly Learning or AI) develops a load profile
  clearly disproportionate to the rest of the platform.
- Multi-school scale (per
  [Implementation Phases](../../milestones/milestone-7-mvp-definition-implementation-planning/05-implementation-phases.md)
  Phase 6) becomes real and independent release cadence per module
  becomes operationally necessary, not just theoretically desirable.

## Current / Planned / Future

| Element | Status |
|---|---|
| Modular Monolith as the deployment shape | **Current** |
| Thirteen enforced module boundaries | **Current** |
| Independent-service extraction | **Future**, conditional on the triggers above |

## ⚠️ Needs Verification

- This decision's soundness depends on the team-size assumption it
  rests on being confirmed accurate before implementation begins — see
  [Engineering Readiness Review](../../milestones/milestone-9-engineering-foundation-development-setup/11-engineering-readiness-review.md).

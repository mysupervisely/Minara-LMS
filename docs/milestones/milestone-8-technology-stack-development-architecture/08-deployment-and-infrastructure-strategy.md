# Deployment & Infrastructure Strategy

**Status:** Draft
**Milestone:** 8 — Technology Stack & Development Architecture
**Date:** 2026-08-07

This document defines deployment philosophy and compares infrastructure
**categories** — it does not select a specific hosting vendor, per this
milestone's instruction to compare categories rather than commit to a
provider.

## Deployment Philosophy

- **Deploy the modular monolith as one unit** (per
  [Backend Architecture](./03-backend-architecture.md)), released
  frequently in small increments rather than large, infrequent
  releases — smaller releases are easier to verify against the testing
  priorities in
  [Testing & Quality Assurance Architecture](./07-testing-quality-assurance-architecture.md)
  and easier to roll back if something's wrong.
- **Every deployment is reversible.** Given the stakes described in
  [Security Architecture](../milestone-6-technical-architecture/04-security-architecture.md),
  the ability to roll back a bad release quickly is treated as a
  requirement, not a nice-to-have.
- **Database migrations deploy separately from and before application
  code that depends on them** (per
  [Database Architecture Strategy §Data Migrations](./04-database-architecture-strategy.md)),
  so a rollback of application code never leaves the database in a state
  the previous version can't operate against.

## Environment Separation

| Environment | Purpose |
|---|---|
| **Development** | Where engineers build and test changes locally or in short-lived, isolated environments — not connected to real Student data. |
| **Testing** | Where automated tests from [Testing & Quality Assurance Architecture](./07-testing-quality-assurance-architecture.md) run against a realistic but non-production dataset. |
| **Staging** | A production-like environment used to verify a release before it reaches real users — **⚠️ Needs Verification** whether a distinct Staging environment is warranted at MVP scale or whether Testing and Staging should be combined initially, given the small-team assumption in [Technology Selection Principles](./01-technology-selection-principles.md). |
| **Production** | Where real Students, Faculty, and staff operate — the only environment holding real academic, financial, and clinical-adjacent data. |

Environments are strictly separated at the data level — no real Student
data ever flows into Development or Testing, consistent with
[Security Architecture](../milestone-6-technical-architecture/04-security-architecture.md).

## Infrastructure Category Comparison

| Category | Strengths | Weaknesses | Fit for Minara-LMS at MVP Stage |
|---|---|---|---|
| **Managed Platform-as-a-Service** (e.g., Render, Railway, Fly.io as illustrative examples of the category) | Low operational overhead; fast to get a modular monolith running; scales adequately for launch-narrow load per [MVP Philosophy](../milestone-7-mvp-definition-implementation-planning/01-mvp-philosophy.md) | Less control over infrastructure-level detail; potential migration effort if outgrown | **Strong fit** — matches the small-team, launch-narrow assumptions this milestone has used throughout |
| **Hyperscale cloud, managed compute** (e.g., AWS, GCP, Azure managed container/app services) | Extensive service ecosystem; scales to the platform's full long-term ambition without a later migration | Meaningfully more operational complexity and configuration surface than a PaaS, for a benefit the MVP doesn't need yet | **Reasonable fit**, better suited once multi-school scale (per [Implementation Phases](../milestone-7-mvp-definition-implementation-planning/05-implementation-phases.md) Phase 6) is real |
| **Self-managed Kubernetes** | Maximum control and portability | Highest operational overhead of the three categories; a poor match for a small assumed team, per [Technology Selection Principles](./01-technology-selection-principles.md) | **Weak fit at MVP stage** — the operational cost isn't justified until scale demands the control it buys |
| **Fully serverless (function-per-request)** | Scales to zero, pay-per-use | Awkward fit for a modular monolith's "one deployable unit" model (see [Backend Architecture](./03-backend-architecture.md)); would push the architecture back toward a services-first shape this milestone deliberately avoided at this stage | **Weak fit** — conflicts with the Modular Monolith recommendation |

**Recommendation: Managed Platform-as-a-Service for MVP-stage hosting**,
with the modular monolith's clean module boundaries (per
[Backend Architecture](./03-backend-architecture.md)) preserving the
option to move to hyperscale-cloud managed compute later, when
multi-school scale (Phase 6, per
[Implementation Phases](../milestone-7-mvp-definition-implementation-planning/05-implementation-phases.md))
makes that migration worth its cost. This is not a vendor selection —
it names a category and defers the specific provider to implementation
planning, consistent with this milestone's anti-lock-in stance.

## Monitoring

Per
[Scalability & Reliability Framework §Monitoring & Observability](../milestone-6-technical-architecture/09-scalability-reliability-framework.md),
every layer should be diagnosable after the fact. This document adds:
monitoring should distinguish **system health** (is the platform up and
responsive) from **business health** (are grades being approved on
schedule, are payments processing) — the latter drawing directly on the
Event-Driven interactions from
[Service Boundaries](../milestone-6-technical-architecture/03-service-boundaries.md),
since every consequential business event is already published as an
event that monitoring can observe.

## Backups

- Backups follow the same category-comparison discipline: a managed
  database service's built-in backup capability is preferred at MVP
  stage over a custom-built backup pipeline, consistent with the
  "managed services for operational concerns" rule from
  [Technology Selection Principles](./01-technology-selection-principles.md).
- Backup frequency and retention should be set once concrete disaster-
  recovery objectives are confirmed — still **⚠️ Needs Verification**,
  carried forward from
  [Scalability & Reliability Framework](../milestone-6-technical-architecture/09-scalability-reliability-framework.md).

## Disaster Recovery

This document does not resolve the open disaster-recovery objectives
question from Milestone 6 — it restates that the infrastructure category
recommended above (Managed PaaS) should be evaluated, once selected,
against whatever concrete recovery time/data-loss objectives the
institution ultimately sets, rather than assuming any category
automatically satisfies them.

## Current / Planned / Future

| Element | Status |
|---|---|
| Frequent, small, reversible deployments | **Current** — this milestone's philosophy |
| Development / Testing / (possible) Staging / Production separation | **Planned** |
| Managed PaaS as the MVP-stage infrastructure category | **Current** — this milestone's recommendation |
| Migration path to hyperscale-cloud managed compute | **Future** — tied to [Implementation Phases](../milestone-7-mvp-definition-implementation-planning/05-implementation-phases.md) Phase 6 |
| Managed database backup capability | **Planned** |
| Concrete disaster recovery objectives and testing | **Future**, pending institutional risk decisions |

## ⚠️ Needs Verification

- Whether a distinct Staging environment is warranted at MVP scale.
- Concrete disaster recovery objectives (recovery time, acceptable data
  loss) — unresolved since Milestone 6.
- The specific PaaS provider (this document names examples only as
  illustrations of the category) is not selected here and should be
  chosen during implementation planning based on real cost and
  capability comparison.

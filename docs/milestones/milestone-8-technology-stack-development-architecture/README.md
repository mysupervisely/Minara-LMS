# Milestone 8 — Technology Stack & Development Architecture

**Status:** Draft
**Phase:** Phase 1 — Product Architecture
**Date:** 2026-08-07
**Scope:** Technology architecture and engineering planning. No
production code, application files, database migrations, APIs, or
deployed infrastructure are introduced in this milestone.

## Purpose

Milestones 1–7 deliberately avoided naming any technology, framework, or
vendor — that restraint was the point: it let the *what* and *why* get
fully worked out before the *how*. Milestone 8 is where that restraint
lifts. This milestone **names real technology categories and, where
justified, specific recommended technologies**, with tradeoffs explained
and every recommendation traced back to a requirement established in
Milestones 1–7 — not chosen because it's popular, and not chosen in a
way that locks the platform into one provider it can't leave.

This remains planning, not implementation: nothing in this milestone
gets installed, configured, or deployed. It produces a **recommended
direction** for whoever begins real engineering work next.

## Documents in This Milestone

| # | Document | Summary |
|---|---|---|
| 1 | [Technology Selection Principles](./01-technology-selection-principles.md) | How technology decisions are evaluated in this milestone, and the philosophy behind them |
| 2 | [Frontend Architecture](./02-frontend-architecture.md) | Framework recommendation, SSR strategy, and the public/authenticated split |
| 3 | [Backend Architecture](./03-backend-architecture.md) | Backend approach, modular monolith vs. microservices decision, and service organization |
| 4 | [Database Architecture Strategy](./04-database-architecture-strategy.md) | Relational vs. non-relational reasoning, and how the domain model shapes data strategy |
| 5 | [Authentication & Authorization Architecture](./05-authentication-authorization-architecture.md) | Identity, session, and RBAC enforcement strategy |
| 6 | [Repository & Code Organization](./06-repository-and-code-organization.md) | Monorepo vs. multi-repo, and the Minara-LMS/Master-Plan/Curriculum/Prepped relationship |
| 7 | [Testing & Quality Assurance Architecture](./07-testing-quality-assurance-architecture.md) | Testing philosophy across unit, integration, E2E, content, security, accessibility, and AI validation |
| 8 | [Deployment & Infrastructure Strategy](./08-deployment-and-infrastructure-strategy.md) | Environment separation, deployment philosophy, and infrastructure category comparison |
| 9 | [AI Technology Architecture](./09-ai-technology-architecture.md) | Technical detail behind the AI service layer: model abstraction, grounding, safety, and cost |
| 10 | [Prepped Ecosystem Architecture](./10-prepped-ecosystem-architecture.md) | Standalone vs. engine vs. hybrid analysis, with a recommendation |
| 11 | [Technology Recommendation Summary](./11-technology-recommendation-summary.md) | The consolidated recommendation, major and deferred decisions, and risks |

## How Technology Recommendations Are Made Here

Every recommendation in this milestone follows the same discipline:

- **It traces to a requirement**, not a preference — see
  [Technology Selection Principles](./01-technology-selection-principles.md).
- **It names categories first, specific technologies second**, and
  explains tradeoffs against real alternatives rather than presenting
  one option as though it were the only one.
- **It avoids vendor lock-in** by favoring open standards, portable data
  formats, and architecture that could be re-hosted or re-platformed
  without a rewrite — consistent with the Integration Layer pattern
  already established in
  [Milestone 6](../milestone-6-technical-architecture/07-integration-architecture.md).
- **It stays a recommendation, not an implementation.** Naming a
  technology here does not install it, configure it, or commit budget to
  it — that remains for actual implementation planning.

## Relationship to Milestones 1–7

This milestone assumes and cross-references, rather than repeats:

- **Milestone 6's technical architecture** (layers, services, security,
  AI, integration, scalability principles) is what this milestone
  selects technology *for* — it does not redesign any of it.
- **Milestone 6's deferred decisions** (single-deployment vs.
  independently-deployed services, in
  [System Architecture](../milestone-6-technical-architecture/01-system-architecture.md);
  which follows from this milestone's modular-monolith-vs-microservices
  evaluation in [Backend Architecture](./03-backend-architecture.md)) are
  resolved here, now that resolving them is this milestone's actual job.
- **Milestone 7's MVP scope** determines what needs to be technically
  supportable first — this milestone's recommendations are sized to that
  reality, not to the platform's full long-term ambition.

## Approval

This milestone is **Draft** pending stakeholder review. Milestone 9 will
not begin until Milestone 8 is reviewed and approved.

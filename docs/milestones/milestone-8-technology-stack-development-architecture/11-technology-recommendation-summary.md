# Technology Recommendation Summary

**Status:** Draft
**Milestone:** 8 — Technology Stack & Development Architecture
**Date:** 2026-08-07

This document consolidates every recommendation from
[01](./01-technology-selection-principles.md)–[10](./10-prepped-ecosystem-architecture.md)
into one final reference.

## Recommended Architecture

- **Deployment shape:** Modular Monolith, module boundaries aligned to
  the 13 services in
  [Service Boundaries](../milestone-6-technical-architecture/03-service-boundaries.md) —
  [Backend Architecture](./03-backend-architecture.md).
- **Codebase shape:** a single Minara-LMS monorepo, with
  Minara-Master-Plan and Minara-Curriculum remaining separate
  repositories — [Repository & Code Organization](./06-repository-and-code-organization.md).
- **Ecosystem shape:** Hybrid Platform (Option C) — one platform serving
  Minara's own schools directly and powering Prepped products through
  shared services and Program-level configuration —
  [Prepped Ecosystem Architecture](./10-prepped-ecosystem-architecture.md).

## Recommended Technology Categories

| Layer | Recommendation | Category Alternatives Considered |
|---|---|---|
| Frontend framework | React, via an SSR meta-framework (e.g., Next.js) | SvelteKit/Nuxt, Astro, client-only SPA |
| Backend runtime/language | Node.js + TypeScript | Python, Java/Kotlin/.NET, Ruby on Rails |
| Primary database | Relational (PostgreSQL as the category's leading example) | Document/NoSQL store as primary |
| Caching | In-memory key-value store (e.g., Redis) | — |
| File/content storage | S3-compatible object storage | — |
| Authentication | Server-side sessions, OIDC-compatible identity approach | Stateless JWTs |
| Hosting (MVP stage) | Managed Platform-as-a-Service | Hyperscale cloud managed compute, self-managed Kubernetes, fully serverless |
| AI integration | Abstracted model layer behind the Safety & Scope Gate | Direct, unabstracted provider integration |

Every recommendation above names a **category first**; specific vendors
within each category are explicitly deferred (see Deferred Decisions,
below).

## Major Decisions Made in This Milestone

1. **Modular Monolith over microservices**, resolving
   [System Architecture](../milestone-6-technical-architecture/01-system-architecture.md)'s
   deferred decision — see
   [Backend Architecture](./03-backend-architecture.md).
2. **React/SSR-meta-framework + Node.js/TypeScript**, chosen together for
   language-sharing and developer-productivity benefits — see
   [Frontend](./02-frontend-architecture.md) and
   [Backend](./03-backend-architecture.md) Architecture.
3. **Relational database as the sole primary store**, with
   complementary (not competing) caching and object-storage layers —
   see [Database Architecture Strategy](./04-database-architecture-strategy.md).
4. **Server-side sessions over stateless tokens**, prioritizing
   revocability given the platform's sensitive-data categories — see
   [Authentication & Authorization Architecture](./05-authentication-authorization-architecture.md).
5. **Single monorepo for Minara-LMS**, with Master-Plan and Curriculum
   confirmed as separate, and Prepped products confirmed as
   configuration rather than separate codebases — see
   [Repository & Code Organization](./06-repository-and-code-organization.md).
6. **Managed PaaS for MVP-stage hosting**, with a defined migration path
   to hyperscale cloud once multi-school scale is real — see
   [Deployment & Infrastructure Strategy](./08-deployment-and-infrastructure-strategy.md).
7. **A model-abstraction layer for AI**, decoupling the Safety & Scope
   Gate and every human-oversight guarantee from any specific AI
   provider — see
   [AI Technology Architecture](./09-ai-technology-architecture.md).
8. **Option C (Hybrid Platform) for the Prepped ecosystem**, precisely
   defined as shared services with Program-level, data-driven brand
   configuration — see
   [Prepped Ecosystem Architecture](./10-prepped-ecosystem-architecture.md).

## Deferred Decisions

Deliberately **not** decided in this milestone, and flagged for
implementation planning:

- The specific SSR meta-framework product (Next.js named only as the
  category's leading example).
- The specific database product (PostgreSQL named only as the category's
  leading example).
- The specific caching, object-storage, PaaS-hosting, and AI model/
  provider products.
- Concrete session lifetime, idle-timeout, and high-risk-action
  re-authentication policy values.
- Concrete disaster-recovery objectives (recovery time, acceptable data
  loss).
- Whether a distinct Staging environment is warranted at MVP scale.
- The specific content-grounding mechanism for AI Learning Support.

## Risks

1. **Team-size assumption risk.** Every recommendation in this milestone
   assumes a small-to-moderate initial engineering team, per
   [Technology Selection Principles](./01-technology-selection-principles.md).
   If the actual team is substantially different in size or skill
   composition, several recommendations (especially Modular Monolith vs.
   microservices, and Managed PaaS vs. other hosting categories) should
   be revisited before implementation.
2. **AI model dependency risk**, mitigated but not eliminated by the
   model-abstraction layer — switching providers is architecturally
   possible but not free, and cost/quality volatility in the AI
   provider market remains a real operating risk.
3. **Prepped configurability risk** — if a future Prepped product needs
   business rules configuration can't express, the Hybrid Platform
   recommendation's cleanliness erodes; this is flagged, not resolved,
   in [Prepped Ecosystem Architecture](./10-prepped-ecosystem-architecture.md).
4. **Carried-forward risks from Milestone 7** remain fully in effect —
   this milestone's technology recommendations do not resolve the
   launch-Program question, the regulatory/compliance question, or the
   SIS-of-record boundary; if anything, those questions now also
   constrain *which* specific vendors within each recommended category
   are viable (e.g., a confirmed health-information-adjacent obligation
   would narrow acceptable hosting/database vendor choices considerably).

## Implementation Readiness

**The technology *direction* is ready to hand to an engineering team.**
Every layer of the stack has a recommended category, a rationale tracing
to real requirements from Milestones 1–7, and an explicit list of what's
still deferred. This is meaningfully further along than
[Milestone 7's Implementation Readiness Review](../milestone-7-mvp-definition-implementation-planning/09-implementation-readiness-review.md)
assessed the project to be — several of its "next steps" (technology
direction specifically) are now addressed.

**What still stands between this milestone and writing code:** the same
two blocking questions [Milestone 7](../milestone-7-mvp-definition-implementation-planning/09-implementation-readiness-review.md)
identified — the launch Program's identity/externship requirement, and
the regulatory/compliance framework — remain unresolved and remain the
highest-priority items before implementation begins, now joined by the
need to confirm the team-size assumption this milestone's recommendations
depend on.

## Current / Planned / Future

| Element | Status |
|---|---|
| All "Major Decisions" above | **Current** — this milestone's settled recommendations |
| Category-level technology direction | **Current** |
| Specific vendor/product selection within each category | **Future** — explicit implementation-planning work |
| Concrete policy values (session timeouts, DR objectives, etc.) | **Future** |

## ⚠️ Needs Verification

- All items under "Deferred Decisions" and "Risks" above — this summary
  intentionally surfaces them together so they can be tracked as one
  list going into implementation planning, rather than rediscovered
  piecemeal across eleven separate documents.

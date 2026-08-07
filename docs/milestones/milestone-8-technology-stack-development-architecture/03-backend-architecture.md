# Backend Architecture

**Status:** Draft
**Milestone:** 8 — Technology Stack & Development Architecture
**Date:** 2026-08-07

This document defines the backend architecture approach for
Minara-LMS and resolves the modular-monolith-vs-microservices decision
that [System Architecture](../milestone-6-technical-architecture/01-system-architecture.md)
deliberately deferred.

## Modular Monolith vs. Microservices — Evaluation

| Factor | Modular Monolith | Microservices |
|---|---|---|
| Fit for team size assumed in [Technology Selection Principles](./01-technology-selection-principles.md) | Strong — one deployable unit is operable by a small team | Weak at this stage — independent services multiply operational overhead (deployment, monitoring, inter-service networking) before there's a team sized to carry it |
| Fit for [MVP Scope Definition](../milestone-7-mvp-definition-implementation-planning/02-mvp-scope-definition.md)'s launch-narrow posture | Strong — matches "launch narrow, build for scale" directly | Weak — microservices' main payoff (independent scaling, independent deployment) isn't needed until real multi-school load exists |
| Preserves [Service Boundaries](../milestone-6-technical-architecture/03-service-boundaries.md)'s clean module lines | Yes, if enforced deliberately (see below) | Yes, by construction — but at a cost this stage doesn't need to pay yet |
| Ability to extract a service later if load demands it | High, **if** module boundaries are enforced from day one | N/A — already extracted |
| Operational complexity | Low | High |

**Recommendation: Modular Monolith, with module boundaries enforced
from day one along exactly the 13 services defined in
[Service Boundaries](../milestone-6-technical-architecture/03-service-boundaries.md).**

**Rationale:** every factor in the table above favors the modular
monolith for Minara-LMS's actual current situation — a platform
launching narrow (per Milestone 7) with an assumed small engineering
team (per [Technology Selection Principles](./01-technology-selection-principles.md)).
Microservices' benefits (independent scaling and deployment) are real,
but they answer a problem — operating at large, uneven multi-school load
— that doesn't exist yet and, per
[MVP Philosophy](../milestone-7-mvp-definition-implementation-planning/01-mvp-philosophy.md),
shouldn't be solved before it's real. The deciding safeguard is that
Milestone 6 already drew the thirteen service boundaries along real
business meaning, not along implementation convenience — so this
recommendation is only sound **because** those boundaries can be trusted
to hold up if one module (most plausibly Learning or AI, per
[System Architecture §Needs Verification](../milestone-6-technical-architecture/01-system-architecture.md))
eventually needs to be extracted into its own service.

## Enforcing Module Boundaries Inside a Monolith

A modular monolith only delivers on its promise if the modules stay
genuinely separated at the code level, not just conceptually. This
milestone recommends:

- Each of the 13 services from
  [Service Boundaries](../milestone-6-technical-architecture/03-service-boundaries.md)
  (Identity, Admissions, Learning, Assessments, Gradebook, Payments,
  Messaging, Notifications, Certificates, Externships, Analytics, AI,
  Audit) is organized as its own internally-cohesive module.
- Modules interact only through the Direct and Event-Driven interaction
  styles already defined in
  [Service Boundaries](../milestone-6-technical-architecture/03-service-boundaries.md) —
  no module reaches directly into another's internal data structures.
- This is a **discipline**, not a technology — it must be reinforced
  through code review and, ideally, tooling that flags cross-module
  boundary violations, addressed further in
  [Testing & Quality Assurance Architecture](./07-testing-quality-assurance-architecture.md).

## Recommended Runtime & Language

**Recommendation: Node.js with TypeScript.**

| Option | Strengths | Weaknesses |
|---|---|---|
| **Node.js + TypeScript** | Shares a language with the recommended frontend ([Frontend Architecture](./02-frontend-architecture.md)) — one hiring pool, shared type definitions between frontend and backend, single toolchain to maintain, directly serving the developer-productivity goal named in this milestone's objective | Not the strongest choice for CPU-bound workloads — mitigated by keeping such work (if any emerges) in background processing, not the request path |
| **Python** | Strong ecosystem for AI/data work, which is relevant given [AI Technology Architecture](./09-ai-technology-architecture.md) | Splits the team/toolchain from the frontend language, a real maintainability cost per [Technology Selection Principles](./01-technology-selection-principles.md) |
| **Java/Kotlin or .NET** | Strong for large, long-lived enterprise systems | Heavier operational and onboarding overhead than this stage's team-size assumption supports; no clear requirement in Milestones 1–7 that specifically calls for this category |
| **Ruby on Rails / similar** | Fast to build CRUD-heavy applications | Smaller long-term ecosystem and talent pool than Node.js/TypeScript; no unique fit to this project's specific AI/SSR requirements |

**Rationale:** the language-sharing benefit with the recommended
frontend is decisive given this milestone's explicit developer-
productivity goal, and TypeScript's static typing directly supports the
long-term-maintainability principle from
[Technology Selection Principles](./01-technology-selection-principles.md) —
important for a domain model as relationally rich as
[Milestone 5](../milestone-5-domain-model-data-architecture/README.md)'s.

## Business Logic Organization

Business logic lives inside each module, organized around the
[Business Rules Catalog](../milestone-5-domain-model-data-architecture/08-business-rules-catalog.md) —
a rule like "Final Grades require Program Director approval" is
enforced inside the Gradebook module, not scattered across the
Application/Orchestration Layer or duplicated in the frontend. The
Application/Orchestration Layer (per
[System Architecture](../milestone-6-technical-architecture/01-system-architecture.md))
coordinates *across* modules; it does not own business rules that belong
to one module.

## Background Processing

Per
[Scalability & Reliability Framework §Background Processing](../milestone-6-technical-architecture/09-scalability-reliability-framework.md),
non-time-critical work (report generation, bulk notification delivery,
AI conversation flagging for Human Review) runs through a background
job mechanism distinct from the request/response path. Within a modular
monolith, this is recommended as a **job queue** pattern — work is
enqueued by the module that triggers it and processed by workers within
the same deployable unit, avoiding the operational overhead of a
separate message-broker service until real load justifies it.

## Notifications

The Notifications module (per
[Service Boundaries](../milestone-6-technical-architecture/03-service-boundaries.md))
subscribes to the same in-process event mechanism used for all
Event-Driven interactions within the monolith — an internal event bus,
not a distributed messaging system, consistent with the "modular
monolith first" recommendation above.

## AI Services Integration

The AI module is included as one of the thirteen modules in the
modular monolith at this stage, **not** carved out as an independently
deployed service from day one — despite its distinct safety/escalation
requirements (per
[AI Platform Architecture](../milestone-6-technical-architecture/06-ai-platform-architecture.md)),
those requirements are about the module's *internal* design (the Safety
& Scope Gate, Escalation Router), not about needing independent
deployment. If AI usage load or cost management (see
[AI Technology Architecture](./09-ai-technology-architecture.md))
eventually demands independent scaling, its boundary is already clean
enough to extract — the same safeguard reasoning as the general
monolith-vs-microservices decision above.

## Current / Planned / Future

| Element | Status |
|---|---|
| Modular Monolith architecture, resolving Milestone 6's deferral | **Current** — this milestone's decision |
| Node.js + TypeScript as the backend runtime/language | **Current** — this milestone's recommendation |
| 13 modules aligned to [Service Boundaries](../milestone-6-technical-architecture/03-service-boundaries.md) | **Current** |
| In-process job queue for background processing | **Planned** |
| In-process event bus for Notifications/Audit/Analytics subscriptions | **Planned** |
| Extraction of any module into an independently deployed service | **Future** — deferred until real load or team growth justifies it |

## ⚠️ Needs Verification

- This recommendation assumes the team-size and MVP-scope assumptions
  from [Technology Selection Principles](./01-technology-selection-principles.md)
  and [Milestone 7](../milestone-7-mvp-definition-implementation-planning/README.md)
  hold. A significantly larger initial team or a launch scope broader
  than [MVP Scope Definition](../milestone-7-mvp-definition-implementation-planning/02-mvp-scope-definition.md)
  would be reason to revisit this decision before committing to it.
- Node.js/TypeScript is this milestone's recommendation, not a
  constraint from any prior milestone — it should be confirmed against
  actual available engineering talent before implementation begins.

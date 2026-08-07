# Milestone 6 — Technical Architecture & System Design

**Status:** Draft
**Phase:** Phase 1 — Product Architecture
**Date:** 2026-08-07
**Scope:** Documentation only. No production code, frameworks (no
Next.js, React, TypeScript, Prisma), SQL, database migrations, APIs,
infrastructure-as-code, CI/CD configuration, or cloud vendors are
introduced in this milestone.

## Purpose

Milestones 1–5 defined why Minara-LMS exists, who uses it, how it
operates, where each interaction lives on screen, and the conceptual
language of its data. Milestone 6 defines **how the platform will
eventually be built**: the technical architecture that turns
Milestone 5's bounded contexts into a system, Milestone 3's workflows
into services that can execute them, and Milestone 4's screens into
applications with somewhere real to run.

This is still architecture, not implementation. It makes real technical
decisions — a layered, modular structure; logical service boundaries; a
security model; an event-driven notification approach — but it makes
them at the level of **pattern and responsibility**, never at the level
of a specific product, framework, or vendor. Every decision here should
still hold regardless of which specific technologies a later milestone
selects to realize it.

## Documents in This Milestone

| # | Document | Summary |
|---|---|---|
| 1 | [System Architecture](./01-system-architecture.md) | Overall platform architecture, layers, and modular architecture philosophy |
| 2 | [Application Architecture](./02-application-architecture.md) | Conceptual application areas and their responsibilities |
| 3 | [Service Boundaries](./03-service-boundaries.md) | Logical service ownership and interaction map |
| 4 | [Security Architecture](./04-security-architecture.md) | Authentication, authorization, RBAC, audit, and data-handling principles |
| 5 | [File Storage & Content Architecture](./05-file-storage-content-architecture.md) | Conceptual handling of learning content, documents, and generated assets |
| 6 | [AI Platform Architecture](./06-ai-platform-architecture.md) | The AI Services layer: safety, escalation, human review, and future capabilities |
| 7 | [Integration Architecture](./07-integration-architecture.md) | Future external integration points, vendor-independent |
| 8 | [Notification & Event Architecture](./08-notification-event-architecture.md) | Conceptual event catalog and notification delivery philosophy |
| 9 | [Scalability & Reliability Framework](./09-scalability-reliability-framework.md) | Performance, availability, and observability principles |
| 10 | [Implementation Roadmap](./10-implementation-roadmap.md) | Phased build sequence from Foundation through Future Phases |

## Relationship to Milestones 1–5

This milestone assumes and cross-references, rather than repeats:

- **Bounded contexts** ([Milestone 5, Doc 1](../milestone-5-domain-model-data-architecture/01-domain-driven-design-principles.md))
  become the basis for this milestone's logical
  [Service Boundaries](./03-service-boundaries.md) — the technical
  architecture's modules are the domain model's contexts, not a
  reinvention of them.
- **Roles and permissions** ([Milestone 2](../milestone-2-user-roles-permission-architecture/README.md))
  become [Security Architecture](./04-security-architecture.md)'s RBAC
  implementation posture.
- **Workflows** ([Milestone 3](../milestone-3-student-journey-core-workflows/README.md))
  become the trigger points cataloged in
  [Notification & Event Architecture](./08-notification-event-architecture.md).
- **Screens** ([Milestone 4](../milestone-4-information-architecture/README.md))
  are what [Application Architecture](./02-application-architecture.md)'s
  experience areas ultimately serve.
- **Entities** ([Milestone 5](../milestone-5-domain-model-data-architecture/README.md))
  are what each service in
  [Service Boundaries](./03-service-boundaries.md) owns.
- **The Screen Inventory's Required/Planned/Future tagging**
  ([Milestone 4, Doc 9](../milestone-4-information-architecture/09-screen-inventory.md))
  directly informs the phase sequencing in the
  [Implementation Roadmap](./10-implementation-roadmap.md).

## How This Milestone Stays Implementation-Agnostic

Every document in this milestone follows the same discipline:

- Architecture is described in terms of **layers, responsibilities, and
  relationships** — never specific products.
- Where a pattern is named (e.g., "a modular, service-boundary-aligned
  structure"), it is named as a *pattern*, not tied to any framework
  that implements that pattern.
- Diagrams show **conceptual components and data/event flow**, not
  deployment topology, infrastructure, or code structure.
- Anywhere a real technology decision would normally follow a pattern
  choice (e.g., "which database," "which message queue," "which cloud
  provider"), this milestone stops and flags it as a decision for a
  later, explicitly technology-selection-focused milestone.

## What This Milestone Does Not Do

Per its instructions, this milestone does not:

- Write production code in any language or framework
- Create React components, Next.js applications, or any frontend code
- Write database migrations, SQL, or Prisma models
- Implement APIs or define API contracts (endpoints, payloads, protocols)
- Generate infrastructure-as-code or CI/CD configuration
- Select cloud vendors, databases, or any other product

## Approval

This milestone is **Draft** pending stakeholder review. Milestone 7 will
not begin until Milestone 6 is reviewed and approved.

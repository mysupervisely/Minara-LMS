# AI Technology Architecture

**Status:** Draft
**Milestone:** 8 — Technology Stack & Development Architecture
**Date:** 2026-08-07

This document expands
[AI Platform Architecture](../milestone-6-technical-architecture/06-ai-platform-architecture.md)'s
conceptual components (Safety & Scope Gate, Escalation Router, Response
Generation, Human Review Queue) into technical strategy — still without
selecting a specific AI model or provider, consistent with this
milestone's anti-lock-in principle.

**Governing principle, restated once more:** AI assists education but
does not replace institutional judgment — every recommendation below
exists to make that true in the actual running system, not just in
documentation.

## AI Service Layer

The AI module (per
[Service Boundaries](../milestone-6-technical-architecture/03-service-boundaries.md))
is implemented as its own boundary within the modular monolith (per
[Backend Architecture §AI Services Integration](./03-backend-architecture.md)),
with the Safety & Scope Gate as a mandatory entry point that every
request — regardless of which capability area from
[AI Platform Architecture](../milestone-6-technical-architecture/06-ai-platform-architecture.md)
it targets — passes through before reaching Response Generation. This is
a **structural** guarantee: Response Generation has no code path that
bypasses the Gate.

## Model Abstraction

**Recommendation: an abstraction layer between the AI module's internal
logic and whichever underlying AI model/provider generates responses.**

- The Safety & Scope Gate, Escalation Router, and Human Review Queue
  are written against an internal interface ("classify this request,"
  "generate an educational response to this request"), not against any
  specific AI provider's API directly.
- **Rationale:** this is the single most important anti-lock-in decision
  in this milestone specifically for AI — model quality and pricing
  change quickly, and Minara-LMS should be able to change which model
  or provider sits behind the abstraction without touching the Safety
  Gate, Escalation Router, or any of the human-review guarantees the
  platform depends on.
- The specific model/provider is deliberately **not** selected in this
  document — it is the one component of this milestone most explicitly
  left open, since it is also the fastest-moving part of the technology
  landscape this platform touches.

## Prompt Management

- Prompts (system instructions, safety criteria, escalation triggers)
  are managed as versioned, centrally-reviewed configuration — not
  hardcoded ad hoc inside application logic.
- Every change to the Safety & Scope Gate's classification criteria is
  itself a reviewable, auditable change, consistent with the
  seriousness [AI Platform Architecture](../milestone-6-technical-architecture/06-ai-platform-architecture.md)
  already assigns to that component.

## Content Grounding

- AI responses in the Learning Support capability area (per
  [AI Platform Architecture](../milestone-6-technical-architecture/06-ai-platform-architecture.md))
  should be **grounded** in actual delivered curriculum content — the
  Lessons, Learning Objects, and Assessments a Student is actually
  enrolled against (per the
  [Academic Domain Model](../milestone-5-domain-model-data-architecture/02-academic-domain-model.md)) —
  rather than generated from the model's general knowledge alone.
- **Rationale:** this directly respects
  [Scope Boundaries](../milestone-1-product-vision-platform-strategy/09-scope-boundaries.md) —
  the AI module delivers and supports understanding of Minara-Curriculum's
  authored content, it does not invent competing content of its own.
  Grounding is also a safety measure: a response tied to real curriculum
  material is far less likely to drift into unsupported or incorrect
  territory than an ungrounded one, which matters given the health
  sciences context.
- The specific grounding mechanism (e.g., retrieval against delivered
  content) is a technical implementation detail deferred to actual
  engineering, but the **requirement** that grounding exist at all is
  decided here.

## Human Review Workflow

Technical detail behind the Human Review Queue (per
[AI Platform Architecture](../milestone-6-technical-architecture/06-ai-platform-architecture.md)):

- Flagged conversations are queued as Tasks (per the
  [Platform Services Domain Model](../milestone-5-domain-model-data-architecture/06-platform-services-domain-model.md)),
  reaching the assigned Faculty Instructor or Program Director through
  the same Notifications mechanism as any other actionable item — not a
  separate, AI-specific notification path.
- Review outcomes are themselves Audit Logged, per the
  [Audit and Accountability Framework](../milestone-2-user-roles-permission-architecture/05-audit-accountability-framework.md).

## Safety Controls

- **Input filtering** happens at the Safety & Scope Gate, before any
  request reaches Response Generation, per
  [AI Platform Architecture](../milestone-6-technical-architecture/06-ai-platform-architecture.md).
- **Output validation** is a second control point — even a grounded,
  gate-approved request's response is checked against the hard boundary
  from the
  [Business Rules Catalog](../milestone-5-domain-model-data-architecture/08-business-rules-catalog.md)
  (never approves grades or graduation, never finalizes an academic or
  clinical outcome) before being shown to the Student.
- **Rate limiting and abuse prevention** protect both platform stability
  and cost (see below) — a technical control this document introduces
  that Milestone 6 did not need to specify at the conceptual level.

## Cost Management

A legitimate technical architecture concern, not an afterthought: AI
model usage typically carries real, usage-based cost.

- **Usage is monitored per interaction**, feeding the monitoring
  strategy from
  [Deployment & Infrastructure Strategy §Monitoring](./08-deployment-and-infrastructure-strategy.md) —
  distinguishing normal tutoring usage from abnormal patterns that might
  indicate misuse.
- **Budgets and alerting** are recommended as a standard operating
  practice once AI Tutor ships (per
  [Implementation Phases](../milestone-7-mvp-definition-implementation-planning/05-implementation-phases.md)
  Phase 5) — this document does not set specific budget figures, which
  depend on the eventual model/provider selection and real usage
  patterns.
- The model-abstraction layer above also serves cost management: it
  makes it possible to route different request types to different
  models of different cost/capability tradeoffs, without restructuring
  the AI module itself.

## Future AI Agents

Explicitly **Future**, and explicitly still bounded by the governing
principle: any future move toward more autonomous, multi-step AI
behavior ("agents" that take a sequence of actions rather than
responding to one request) remains subject to the same Safety & Scope
Gate, the same output-validation boundary, and the same absolute
exclusion from grading, admissions, placement, and certification
decisions defined in the
[Business Rules Catalog](../milestone-5-domain-model-data-architecture/08-business-rules-catalog.md).
Increased AI autonomy is never a path to reduced human oversight in this
architecture — the two are decided independently, and this document
holds the line on the second regardless of how the first evolves.

## Current / Planned / Future

| Element | Status |
|---|---|
| Safety & Scope Gate as a structurally mandatory entry point | **Current** |
| Model abstraction layer | **Current** — this milestone's key anti-lock-in decision for AI |
| Versioned, reviewable prompt management | **Planned** |
| Content grounding requirement | **Current** (requirement); mechanism **Future** (implementation detail) |
| Human Review Queue technical integration (Tasks + Notifications) | **Planned** |
| Output validation against the hard AI boundary | **Current** — non-negotiable |
| Rate limiting / abuse prevention | **Planned** |
| Usage monitoring and cost budgeting | **Planned**, ahead of Phase 5 |
| Future AI agents | **Future**, permanently bounded by the same governing principle |

## ⚠️ Needs Verification

- The specific AI model/provider remains unselected, deliberately, and
  should be evaluated later against real cost, quality, and grounding
  capability — not assumed here.
- The exact content-grounding mechanism is a technical implementation
  decision for actual engineering work, not this milestone.
- Concrete cost budgets depend on both the model selection above and
  real Phase 5 usage data that doesn't exist yet.

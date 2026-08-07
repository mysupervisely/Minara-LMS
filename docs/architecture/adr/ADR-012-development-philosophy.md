# ADR-012: Development Philosophy

**Status:** Draft (Proposed)
**Date:** 2026-08-07
**Source:** [Engineering Philosophy](../../milestones/milestone-9-engineering-foundation-development-setup/01-engineering-philosophy.md),
[Technology Selection Principles](../../milestones/milestone-8-technology-stack-development-architecture/01-technology-selection-principles.md)

## Context / Problem

Nine milestones of architecture and planning establish *what* to build
and, largely, *how*. What they don't fix in one place is the small set
of engineering values that should hold constant regardless of which
feature, module, or sprint is in front of an engineer on a given day.
Without recording these explicitly and durably, they risk being
understood differently by different engineers over time, or eroding
under ordinary schedule pressure.

## Decision

**Minara-LMS engineering is governed by seven standing principles**,
distilled from
[Engineering Philosophy](../../milestones/milestone-9-engineering-foundation-development-setup/01-engineering-philosophy.md)
and
[Technology Selection Principles](../../milestones/milestone-8-technology-stack-development-architecture/01-technology-selection-principles.md),
and recorded here as a permanent reference:

### 1. Security First

Authorization and audit logging are designed into a feature from the
start, never retrofitted — per
[ADR-005](./ADR-005-rbac-and-audit-first-security-model.md). Security is
part of what "done" means, not a separate phase.

### 2. Domain-Driven Design

Code speaks the same language as
[Milestone 5](../../milestones/milestone-5-domain-model-data-architecture/README.md)'s
domain model, and module boundaries follow business meaning, per
[ADR-004](./ADR-004-domain-driven-module-boundaries.md) — never
technical convenience or team structure.

### 3. Documentation Before Complexity

A feature that can't be traced to a Workflow, Screen, or Entity from
Milestones 3–5 is a signal to update the architecture first, not to
build ahead of it, per
[Engineering Philosophy §1](../../milestones/milestone-9-engineering-foundation-development-setup/01-engineering-philosophy.md).
No abstraction is built for a hypothetical second use case that doesn't
exist yet.

### 4. Quality Gates

No release ships without passing the gates defined in
[Testing Strategy Implementation](../../milestones/milestone-9-engineering-foundation-development-setup/06-testing-strategy-implementation.md) —
Security and AI Validation gates are treated as non-waivable,
regardless of schedule pressure.

### 5. Accessibility

Every screen is built accessible from the start, through the shared
component library, per
[Coding Standards Framework](../../milestones/milestone-9-engineering-foundation-development-setup/05-coding-standards-framework.md) —
not audited and retrofitted after launch.

### 6. Maintainability

Boring, well-understood patterns are preferred over clever ones. Every
module should be understandable in isolation, without needing to hold
the whole platform in mind at once, per
[Engineering Philosophy §Maintainability](../../milestones/milestone-9-engineering-foundation-development-setup/01-engineering-philosophy.md).

### 7. AI-Assisted but Human-Controlled Development

This principle is distinct from
[ADR-006](./ADR-006-human-reviewed-ai-governance.md), which governs
**Minara-LMS's own AI Tutor product feature**. This principle instead
governs **how the engineering team itself may use AI tools while
building the platform**: AI-assisted coding tools may be used to
accelerate development, but every AI-generated contribution is reviewed
by a human before merge, exactly like human-written code, per
[Version Control & Development Workflow](../../milestones/milestone-9-engineering-foundation-development-setup/07-version-control-development-workflow.md) —
and code touching RBAC, the AI Safety & Scope Gate, or an approval gate
receives the same independent-review scrutiny regardless of whether a
human or an AI tool drafted it first. The same "human retains
accountability" ethic this project applies to its *product* is applied
reflexively to how the product itself gets *built*.

## Options Considered

| Option | Description | Why Not Chosen |
|---|---|---|
| **Leave engineering values implicit, trusting team culture** | No formal record; rely on informal transmission of values. | Values transmitted informally erode under schedule pressure and don't survive team turnover — exactly the risk this entire ADR directory exists to prevent. |
| **Record principles as this document's own invention, disconnected from prior milestones** | Write a fresh set of engineering values without grounding them in Milestones 1–9. | Would introduce values not actually derived from this project's own decisions, risking inconsistency with everything already established. |
| **Distill and formally record principles already established in Milestones 8–9** *(chosen)* | As decided above. | Every principle here already exists in the source documents; this ADR's only job is to make them permanent and impossible to quietly drop. |

## Consequences

**Benefits:**
- A stable, short reference for engineering values that doesn't require
  re-reading nine milestones to rediscover.
- Explicit separation between AI-in-the-product ([ADR-006](./ADR-006-human-reviewed-ai-governance.md))
  and AI-in-development-process (principle 7 above) prevents these two
  genuinely different concerns from being conflated.

**Tradeoffs:**
- A written set of principles is only as effective as the review
  process (per
  [Version Control & Development Workflow](../../milestones/milestone-9-engineering-foundation-development-setup/07-version-control-development-workflow.md))
  that enforces it — this ADR records the values but does not, by
  itself, guarantee adherence.

## Future Review Considerations

This decision should be revisited if the underlying source documents
(Engineering Philosophy, Technology Selection Principles) are
substantially revised — this ADR should stay a faithful distillation of
them, not diverge into its own independent set of values.

## Current / Planned / Future

| Element | Status |
|---|---|
| All seven principles | **Current** |
| Principle 7's distinction from [ADR-006](./ADR-006-human-reviewed-ai-governance.md) | **Current** |

## ⚠️ Needs Verification

- None beyond what is already carried forward in
  [Engineering Readiness Review](../../milestones/milestone-9-engineering-foundation-development-setup/11-engineering-readiness-review.md)
  regarding whether the actual engineering team shares this risk
  tolerance and these values in practice.

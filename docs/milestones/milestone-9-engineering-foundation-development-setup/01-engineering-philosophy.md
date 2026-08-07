# Engineering Philosophy

**Status:** Draft
**Milestone:** 9 — Engineering Foundation & Development Setup
**Date:** 2026-08-07

This document states the principles that should govern how the
Minara-LMS engineering team actually works, day to day. Every principle
here traces back to a decision already made in Milestones 1–8 — this
document translates architecture and technology decisions into working
habits.

## Engineering Principles

1. **Code should be traceable to the architecture, not invented ad
   hoc.** Per the
   [Development Backlog Framework](../milestone-7-mvp-definition-implementation-planning/06-development-backlog-framework.md)
   and
   [Master Traceability Framework](../milestone-7-mvp-definition-implementation-planning/08-master-traceability-framework.md),
   any Feature or Task that can't be traced upward to a Workflow, Screen,
   or Entity from Milestones 3–5 is a signal to update the architecture
   first, not to build ahead of it.
2. **The domain model's language is the code's language.** Names in code
   should match the
   [Domain-Driven Design Principles](../milestone-5-domain-model-data-architecture/01-domain-driven-design-principles.md)'
   ubiquitous language — an `Enrollment` in code is the same `Enrollment`
   defined in the Student Domain Model, not a renamed or reshaped
   variant.
3. **Module boundaries are enforced, not suggested.** The Modular
   Monolith's value (per
   [Backend Architecture](../milestone-8-technology-stack-development-architecture/03-backend-architecture.md))
   depends entirely on the thirteen modules staying genuinely separated
   at the code level — this is treated as a hard engineering rule, not a
   loose convention, and is checked in code review (see
   [Version Control & Development Workflow](./07-version-control-development-workflow.md)).

## Quality Over Speed Balance

Consistent with
[Technology Selection Principles §Tradeoffs Between Speed and
Scalability](../milestone-8-technology-stack-development-architecture/01-technology-selection-principles.md),
speed and quality are not weighed equally everywhere:

- **Favor speed** in areas the architecture already isolates well
  (a single module's internal implementation, UI-layer work within the
  shared component library) — mistakes here are cheap to fix because
  they're contained.
- **Favor quality and caution** in anything touching RBAC/permission
  enforcement, the AI Safety & Scope Gate, the Audit Log, or the
  Business Rules Catalog's approval gates — per
  [Testing Strategy Implementation](./06-testing-strategy-implementation.md)'s
  priority ordering, mistakes here are expensive, sometimes
  irreversibly so, given the academic and financial stakes described in
  [Security Architecture](../milestone-6-technical-architecture/04-security-architecture.md).

## Maintainability

- **Boring and well-understood beats clever.** Per
  [Technology Selection Principles §Long-Term Maintainability](../milestone-8-technology-stack-development-architecture/01-technology-selection-principles.md),
  this applies to code patterns too, not just technology choices — a
  straightforward implementation a new engineer can understand quickly
  is preferred over a clever one that saves a few lines.
- **Every module should be understandable in isolation.** A developer
  should be able to reason about the Gradebook module's correctness
  without needing to simultaneously hold the Externships module in their
  head — the direct payoff of the Modular Monolith's enforced
  boundaries.

## Security-First Development

Security is not a phase that happens after a feature works — it is
part of what "working" means. Every feature that touches a Role
Assignment, a sensitive data category (per
[Security Architecture](../milestone-6-technical-architecture/04-security-architecture.md)),
or an approval gate is built with its authorization checks and audit
logging from the start, not added afterward. Full detail in
[Security Development Practices](./08-security-development-practices.md).

## Documentation Expectations

- **Documentation and code move together.** A change to behavior
  described in Milestones 1–8 requires a corresponding documentation
  update in the same change — restated as an engineering habit, not
  just a repository convention (see
  [Repository & Code Organization §Documentation Repository Relationship](../milestone-8-technology-stack-development-architecture/06-repository-and-code-organization.md)).
- **Code comments explain "why," not "what."** The "what" should be
  clear from well-named code following the domain language; comments
  earn their place by explaining a non-obvious business rule (with a
  reference to the
  [Business Rules Catalog](../milestone-5-domain-model-data-architecture/08-business-rules-catalog.md)
  entry it implements) or a deliberate tradeoff.

## Avoiding Premature Complexity

Directly inherited from
[Technology Selection Principles §Avoiding Unnecessary Complexity](../milestone-8-technology-stack-development-architecture/01-technology-selection-principles.md):

- No module is extracted from the Modular Monolith into an independent
  service until real load or team growth justifies it — the temptation
  to "future-proof" early is treated as a cost, not a virtue.
- No abstraction is built for a second use case that doesn't exist yet —
  the AI model-abstraction layer (per
  [AI Technology Architecture](../milestone-8-technology-stack-development-architecture/09-ai-technology-architecture.md))
  is an example of an abstraction that *is* justified, because a second,
  real need (provider portability) already exists; most abstractions
  should meet that same bar before being built.
- The [MVP Scope Definition](../milestone-7-mvp-definition-implementation-planning/02-mvp-scope-definition.md)
  is the yardstick for what's in scope right now — building SHOULD/
  COULD/FUTURE-tier functionality ahead of schedule is scope creep, even
  when it's well-intentioned.

## Current / Planned / Future

| Element | Status |
|---|---|
| All principles above | **Current** — governs engineering work from the start of implementation |
| Enforcement mechanisms (code review checklists, CI checks) | **Planned**, detailed in [Version Control & Development Workflow](./07-version-control-development-workflow.md) and [Testing Strategy Implementation](./06-testing-strategy-implementation.md) |

## ⚠️ Needs Verification

- These principles assume the team broadly agrees with the
  quality/speed balance described above; if the actual engineering team
  has a different risk tolerance, this document should be revisited
  with them directly before development begins.

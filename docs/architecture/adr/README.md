# Architecture Decision Records (ADRs)

**Status:** Draft
**Date:** 2026-08-07
**Scope:** Documentation only. No production code, application files,
database schemas, APIs, or infrastructure are introduced by this
directory.

## Purpose of ADRs

Milestones 1–9 produced a large, detailed body of architecture and
planning documentation. Buried inside that volume are a small number of
decisions that matter more than the rest — decisions that are expensive
to reverse, that shape everything built on top of them, and that a
future developer could easily undo by accident simply because they
never encountered the reasoning behind them.

An **Architecture Decision Record (ADR)** exists to pull one such
decision out of its milestone document and give it a permanent, stable,
easy-to-find home — stating not just *what* was decided, but *why*, what
else was considered, and what it costs. The goal is narrow and
practical: **prevent future development from unintentionally reversing
a foundational decision** by making sure the reasoning behind it is
never more than one file away.

ADRs do not replace Milestones 1–9. They are a distillation layer on
top of them — every ADR in this directory cross-references the
milestone document(s) where its full context and supporting detail
live, rather than repeating that detail here.

## When ADRs Are Created

Not every decision earns an ADR. A decision is recorded here when it
meets at least one of these criteria, consistent with the evaluation
discipline already established in
[Technology Selection Principles](../../milestones/milestone-8-technology-stack-development-architecture/01-technology-selection-principles.md):

- **It is expensive to reverse** — changing it later means rewriting
  significant parts of the platform, not adjusting a configuration
  value.
- **It shapes multiple other decisions** — later architecture,
  technology, or engineering choices were made *because* this decision
  was already settled.
- **It resolves a question this project has debated openly** — several
  of this repository's most-repeated **⚠️ Needs Verification** items are
  exactly the kind of decision this directory exists to capture once
  they're actually resolved.

A decision that's easily reversible, narrowly scoped, or purely a matter
of implementation convenience does not need an ADR — it belongs in the
relevant milestone document or, eventually, in code and its own inline
documentation.

## How Decisions Are Reviewed

Each ADR carries its own status, following standard ADR practice:

- **Proposed** *(recorded here as the document's `Status: Draft`, per
  this project's existing convention)* — the decision has been made and
  documented, but not yet formally ratified by stakeholders.
- **Accepted** — reviewed and ratified; the decision is binding on
  future development unless and until superseded.
- **Superseded** — replaced by a later ADR, which is referenced
  directly; the original ADR is never edited to pretend the reversal
  didn't happen — history stays visible.

**An Accepted ADR is never silently edited.** If circumstances change
enough to warrant revisiting a decision, that revisiting happens through
a **new** ADR that explicitly supersedes the old one, stating what
changed and why — the same discipline that keeps the
[Audit and Accountability Framework](../../milestones/milestone-2-user-roles-permission-architecture/05-audit-accountability-framework.md)'s
history-preservation principle intact, applied here to the project's own
decision history.

## Relationship to Milestones 1–9

Every ADR in this directory distills a decision already made somewhere
in Milestones 1–9 — this directory does no new architecture work of its
own except where explicitly noted (see ADR-008, ADR-009, and ADR-010,
which formally ratify decisions that were previously open **⚠️ Needs
Verification** questions across multiple milestones). Each ADR states
its source milestone(s) directly, so a reader can go from "what was
decided" (here) to "why, in full detail" (the milestone) in one link.

## Index

| ADR | Title | Status |
|---|---|---|
| [ADR-001](./ADR-001-modular-monolith-architecture.md) | Modular Monolith Architecture | Draft |
| [ADR-002](./ADR-002-ssr-first-web-architecture.md) | SSR-First Web Architecture | Draft |
| [ADR-003](./ADR-003-monorepo-and-ecosystem-architecture.md) | Monorepo and Ecosystem Architecture | Draft |
| [ADR-004](./ADR-004-domain-driven-module-boundaries.md) | Domain-Driven Module Boundaries | Draft |
| [ADR-005](./ADR-005-rbac-and-audit-first-security-model.md) | RBAC and Audit-First Security Model | Draft |
| [ADR-006](./ADR-006-human-reviewed-ai-governance.md) | Human-Reviewed AI Governance | Draft |
| [ADR-007](./ADR-007-minara-as-education-engine.md) | Minara as Education Engine (Hybrid Ecosystem Model) | Draft |
| [ADR-008](./ADR-008-pharmacy-technology-first-launch.md) | Pharmacy Technology First Launch | Draft |
| [ADR-009](./ADR-009-system-of-record-strategy.md) | System of Record Strategy | Draft |
| [ADR-010](./ADR-010-educational-record-privacy-model.md) | Educational Record Privacy Model | Draft |
| [ADR-011](./ADR-011-vertical-slice-development-strategy.md) | Vertical Slice Development Strategy | Draft |
| [ADR-012](./ADR-012-development-philosophy.md) | Development Philosophy | Draft |

## ADR Format

Every ADR in this directory follows the same structure:

- **Context / Problem** — what situation made a decision necessary.
- **Options Considered** — the real alternatives, not a strawman list.
- **Decision** — stated plainly, one sentence if possible.
- **Rationale** — why this option, specifically, given the context.
- **Consequences** — benefits and tradeoffs, both, honestly stated.
- **Future Review Considerations** — what would make this decision worth
  revisiting.

## Current / Planned / Future

| Element | Status |
|---|---|
| ADR-001 through ADR-007, ADR-011, ADR-012 (distillations of Milestones 1–9) | **Current** |
| ADR-008, ADR-009, ADR-010 (new ratifications of previously open questions) | **Current** — see each ADR's own status note |
| Future ADRs, as new foundational decisions are made | **Future** |

## ⚠️ Needs Verification

- Every ADR remains **Proposed** (Draft) until formally reviewed and
  Accepted by project stakeholders — nothing in this directory is
  binding yet.

# Milestone 9 — Engineering Foundation & Development Setup

**Status:** Draft
**Phase:** Phase 1 — Product Architecture
**Date:** 2026-08-07
**Scope:** Engineering setup and process documentation. No production
application code, UI components, database schemas, migrations, or
deployed infrastructure are introduced in this milestone.

## Purpose

Milestone 8 decided *what* Minara-LMS will be built with. Milestone 9
decides **how the engineering team will actually work** once that
decision is approved: how the repository is organized in practice, how
environments are structured, what standards code is held to, how work
moves from a branch to production, and — critically — what the very
first thing built should be.

This milestone is the last one before real engineering work can begin.
Its output is meant to let a developer open the (not-yet-created)
repository and know exactly how to start, without having to invent
process decisions on the fly.

## Documents in This Milestone

| # | Document | Summary |
|---|---|---|
| 1 | [Engineering Philosophy](./01-engineering-philosophy.md) | Principles governing how the team builds, connecting back to Milestones 1–8 |
| 2 | [Repository Structure](./02-repository-structure.md) | The recommended monorepo layout, conceptually, and its relationship to Master-Plan, Curriculum, and Prepped |
| 3 | [Development Environment Strategy](./03-development-environment-strategy.md) | Local, Development/Test, Staging, and Production — purpose, data handling, access, and promotion |
| 4 | [Application Foundation Plan](./04-application-foundation-plan.md) | The first six build phases: shell, authentication, RBAC, institution structure, and the first two experience foundations |
| 5 | [Coding Standards Framework](./05-coding-standards-framework.md) | Naming, organization, documentation, error handling, security, review, accessibility, and performance standards |
| 6 | [Testing Strategy Implementation](./06-testing-strategy-implementation.md) | Milestone 8's testing philosophy, expanded into concrete layers and release quality gates |
| 7 | [Version Control & Development Workflow](./07-version-control-development-workflow.md) | Branching, commits, pull requests, review, release tagging, and change tracking |
| 8 | [Security Development Practices](./08-security-development-practices.md) | Secure coding, secrets, dependencies, authentication/authorization testing, and vulnerability management |
| 9 | [Deployment Workflow Foundation](./09-deployment-workflow-foundation.md) | The conceptual path from a change to production, and rollback philosophy |
| 10 | [First Implementation Roadmap](./10-first-implementation-roadmap.md) | The recommended first vertical slice, and why it validates the whole platform |
| 11 | [Engineering Readiness Review](./11-engineering-readiness-review.md) | A direct review of Milestones 1–9 and a recommendation on whether to begin development |

## Relationship to Milestones 1–8

This milestone assumes and cross-references, rather than repeats:

- **Milestone 8's technology direction** (Modular Monolith, Node.js/
  TypeScript, React/SSR meta-framework, PostgreSQL-category relational
  store, monorepo) is the foundation every document here organizes work
  around — this milestone does not re-select technology.
- **Milestone 7's MVP scope and Development Backlog Framework** shape
  what the [Application Foundation Plan](./04-application-foundation-plan.md)
  and [First Implementation Roadmap](./10-first-implementation-roadmap.md)
  build first, and how that work should be tracked as Epics, Features,
  and User Stories.
- **Milestone 6's testing and security architecture** are expanded, not
  redefined, in
  [Testing Strategy Implementation](./06-testing-strategy-implementation.md)
  and
  [Security Development Practices](./08-security-development-practices.md).
- **Milestone 5's domain model and business rules** are what
  [Coding Standards Framework](./05-coding-standards-framework.md)'s
  naming and organization principles stay anchored to — code should
  speak the same ubiquitous language Milestone 5 established.

## Approval

This milestone is **Draft** pending stakeholder review. Actual
implementation planning and development will not begin until Milestone
9 is reviewed and approved.

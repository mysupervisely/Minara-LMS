# Milestone 7 — MVP Definition & Implementation Planning

**Status:** Draft
**Phase:** Phase 1 — Product Architecture
**Date:** 2026-08-07
**Scope:** Planning and product management. No production code,
application files, database schemas, APIs, final vendors, or
infrastructure are introduced in this milestone.

## Purpose

Milestones 1–6 built a complete architecture: vision, roles, workflows,
screens, domain model, and technical blueprint. Milestone 7 answers the
question none of them were designed to answer on their own: **what is
the smallest version of Minara-LMS that can successfully operate a real
educational program?**

This milestone transforms the architecture into an **executable
implementation roadmap** — not by inventing new scope, but by deciding,
feature by feature, what belongs in the first release and what waits.
Every decision here is a narrowing of Milestones 1–6, never a departure
from them: the MVP is architecturally identical to the long-term vision,
just functionally smaller.

## Documents in This Milestone

| # | Document | Summary |
|---|---|---|
| 1 | [MVP Philosophy](./01-mvp-philosophy.md) | What MVP means for an educational platform, and what stays out |
| 2 | [MVP Scope Definition](./02-mvp-scope-definition.md) | Must/Should/Could/Future classification across 19 platform areas |
| 3 | [MVP User Stories](./03-mvp-user-stories.md) | User stories for all seven roles, tagged by priority |
| 4 | [MVP Feature Prioritization](./04-mvp-feature-prioritization.md) | A representative prioritization matrix, traced through Milestones 3–6 |
| 5 | [Implementation Phases](./05-implementation-phases.md) | Phase 0–6 product roadmap: purpose, features, users, dependencies, success criteria |
| 6 | [Development Backlog Framework](./06-development-backlog-framework.md) | How future work should be organized: Epic → Feature → User Story → Task |
| 7 | [Release Roadmap](./07-release-roadmap.md) | MVP Release through Version 2.0 and beyond |
| 8 | [Master Traceability Framework](./08-master-traceability-framework.md) | Vision → Business Goals → Workflows → Screens → Domain Entities → Platform Modules → Development Features |
| 9 | [Implementation Readiness Review](./09-implementation-readiness-review.md) | An honest review of Milestones 1–6: completeness, risk, and what's left before coding starts |

## Relationship to Milestones 1–6

This milestone assumes and cross-references, rather than repeats:

- **What exists to build** — every feature discussed here already has a
  home in [Milestone 3](../milestone-3-student-journey-core-workflows/README.md)'s
  workflows, [Milestone 4](../milestone-4-information-architecture/README.md)'s
  screens, [Milestone 5](../milestone-5-domain-model-data-architecture/README.md)'s
  entities, and [Milestone 6](../milestone-6-technical-architecture/README.md)'s
  services. This milestone does not define new functionality; it
  sequences and prioritizes what's already defined.
- **The Screen Inventory's Required/Planned/Future tagging**
  ([Milestone 4, Doc 9](../milestone-4-information-architecture/09-screen-inventory.md))
  and the **Implementation Roadmap**
  ([Milestone 6, Doc 10](../milestone-6-technical-architecture/10-implementation-roadmap.md))
  are this milestone's direct predecessors — Milestone 7 refines both
  into an MVP-first, business-outcome-framed plan rather than superseding
  them.
- **Open Needs Verification items** carried from every prior milestone
  (which program launches first, whether it requires an externship, the
  compliance/regulatory framework, the SIS-of-record boundary) directly
  shape this milestone's MVP scope decisions and are not re-litigated
  here — they are named where they matter and tracked to a head in
  [Implementation Readiness Review](./09-implementation-readiness-review.md).

## Approval

This milestone is **Draft** pending stakeholder review. Milestone 8 will
not begin until Milestone 7 is reviewed and approved.

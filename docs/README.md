# Minara-LMS Documentation

This directory is the documentation framework for Minara-LMS, organized by
milestone. Each milestone represents a discrete phase of architectural and
product work, delivered and reviewed before the next milestone begins.

## Documentation Conventions

All documents in this repository follow a shared discipline, consistent with
the documentation standards used across the Minara ecosystem (see
Minara-Master-Plan):

- **Status labels.** Every document declares a status at the top:
  - `Draft` — actively being written or reviewed; not yet approved as a
    basis for downstream decisions.
  - `Approved` — reviewed and accepted as the current basis for planning
    and subsequent milestones.
  - `Superseded` — replaced by a later document; kept for historical
    reference.
- **Needs Verification markers.** Any claim, assumption, or inference not
  explicitly confirmed by a stakeholder is flagged inline as
  **⚠️ Needs Verification**, with a short note on what would confirm or
  correct it. These are not blockers to drafting — they are tracked open
  questions.
- **No implementation decisions in architecture documents.** Documents in
  the architecture milestones do not name specific frameworks, vendors,
  hosting providers, or database schemas. Where a technical concept is
  necessary to describe (e.g., "role-based access control"), it is
  described in terms of capability and principle, not implementation.
- **Traceability.** Each document references the milestone and date it was
  authored under, so later milestones can be understood as building on
  (or revising) earlier ones rather than replacing them silently.

## Milestones

| Milestone | Title | Status |
|---|---|---|
| 1 | [Product Vision & Platform Strategy](./milestones/milestone-1-product-vision-platform-strategy/README.md) | Draft |
| 2 | [User Roles & Permission Architecture](./milestones/milestone-2-user-roles-permission-architecture/README.md) | Draft |
| 3 | [Student Journey & Core Platform Workflows](./milestones/milestone-3-student-journey-core-workflows/README.md) | Draft |
| 4 | [Information Architecture & User Experience](./milestones/milestone-4-information-architecture/README.md) | Draft |
| 5 | [Domain Model & Data Architecture](./milestones/milestone-5-domain-model-data-architecture/README.md) | Draft |
| 6 | [Technical Architecture & System Design](./milestones/milestone-6-technical-architecture/README.md) | Draft |
| 7 | [MVP Definition & Implementation Planning](./milestones/milestone-7-mvp-definition-implementation-planning/README.md) | Draft |
| 8 | [Technology Stack & Development Architecture](./milestones/milestone-8-technology-stack-development-architecture/README.md) | Draft |
| 9 | [Engineering Foundation & Development Setup](./milestones/milestone-9-engineering-foundation-development-setup/README.md) | Draft |
| 10 | Foundation Build — *implementation milestone, no documentation directory; see [repository root README](../README.md) and [ADR README](./architecture/adr/README.md)* | Implemented |
| 11 | [Curriculum Management & Content Engine](./milestones/milestone-11-curriculum-management-content-engine/README.md) | Draft |
| 12 | [Curriculum Delivery Vertical Slice — Planning](./milestones/milestone-12-curriculum-delivery-vertical-slice/README.md) | Draft |
| 13 | Curriculum Delivery Vertical Slice — Implementation — *implementation milestone, no documentation directory; see [repository root README](../README.md) and [Milestone 12's plan](./milestones/milestone-12-curriculum-delivery-vertical-slice/README.md)* | Implemented |
| 14 | Content Versioning Vertical Slice — Implementation — *implementation milestone, no documentation directory; see [repository root README](../README.md)* | Implemented |
| 15 | [Planning & Architecture Checkpoint](./milestones/milestone-15-externship-eligibility-placement-vertical-slice/README.md) | Draft |

Milestones 1–9 and the ADR foundation are documentation-only. Milestone 10
is this repository's first implementation milestone — a working, tested
vertical slice (see the repository root [README](../README.md)) — and,
being application code rather than architecture documentation, has no
`docs/milestones/` directory of its own. Milestone 11 returns to
documentation-only work, documenting the full Curriculum Management &
Content Engine. Milestone 12 is also documentation-only: per
[ADR-011](./architecture/adr/ADR-011-vertical-slice-development-strategy.md),
it plans a single, narrow, end-to-end slice through Milestone 11's design
— proving the architecture against Milestone 10's implemented foundation
before any broader engine build begins. Milestone 13 implements that
plan (again application code, no `docs/milestones/` directory of its
own). Milestone 14 is a further narrow implementation slice on top of
Milestone 13 — immutable content versioning for Lessons and Assessments,
per ADR-011's incremental strategy — again application code with no
`docs/milestones/` directory of its own. Implementation against the
remainder of Milestone 11's full engine begins only after it, too, is
reviewed and approved.

## Architecture Decision Records

Alongside the milestone sequence, [`architecture/adr/`](./architecture/adr/README.md)
holds the project's **Architecture Decision Records** — a small set of
permanent, individually-citable records distilling the highest-impact,
hardest-to-reverse decisions made across Milestones 1–9 (module
architecture, SSR strategy, repository/ecosystem structure, domain-driven
boundaries, RBAC/audit posture, AI governance, and more), including
three decisions — the first launch Program, the system-of-record
strategy, and the educational-record privacy scope — that formally
resolve questions the milestones above had left open. See the
[ADR README](./architecture/adr/README.md) for the full index and how
ADRs relate to the milestone documentation.

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

Actual implementation planning and development will begin only after
Milestone 9 is reviewed and approved.

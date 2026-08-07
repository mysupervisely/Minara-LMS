# Repository Structure

**Status:** Draft
**Milestone:** 9 — Engineering Foundation & Development Setup
**Date:** 2026-08-07

This document gives the Minara-LMS monorepo recommendation from
[Repository & Code Organization](../milestone-8-technology-stack-development-architecture/06-repository-and-code-organization.md)
a concrete conceptual folder layout — still no actual repository,
code, or configuration files, but specific enough that a developer
would know where new work belongs.

## Conceptual Top-Level Layout

```
minara-lms/
├── apps/
│   ├── public-website/        # SSR-first public site — see Frontend Architecture
│   └── platform/               # Authenticated application — all 7 portals, one shell
├── services/
│   ├── identity/
│   ├── admissions/
│   ├── learning/
│   ├── assessments/
│   ├── gradebook/
│   ├── payments/
│   ├── messaging/
│   ├── notifications/
│   ├── certificates/
│   ├── externships/
│   ├── analytics/
│   ├── ai/
│   └── audit/
├── packages/
│   ├── domain-types/            # Shared TypeScript types mirroring Milestone 5 entities
│   ├── ui-components/           # Shared, accessible component library
│   └── shared-utilities/
├── docs/                        # This documentation set — Milestones 1-9 and beyond
├── config/                      # Environment and application configuration (no secrets)
├── tests/
│   ├── integration/
│   └── e2e/
├── content/                     # Local fixtures/sample content for development — never real Student data
└── scripts/                     # Developer tooling (setup, local environment bootstrap)
```

*This is illustrative structure, not a literal specification — actual
folder names and tooling are an implementation-time decision. What's
fixed is the **shape**: apps separated from services, services aligned
1:1 to [Service Boundaries](../milestone-6-technical-architecture/03-service-boundaries.md),
and shared code isolated into packages.*

## Applications (`apps/`)

Two applications, matching
[Frontend Architecture](../milestone-8-technology-stack-development-architecture/02-frontend-architecture.md):
`public-website` (SSR-first, unauthenticated) and `platform` (the
authenticated shell serving all seven portals from
[Milestone 4](../milestone-4-information-architecture/README.md)).
Both consume `services/` and `packages/`, never the reverse.

## Services (`services/`)

Thirteen folders, one per service from
[Service Boundaries](../milestone-6-technical-architecture/03-service-boundaries.md),
each internally organized around the entities it owns (per
[Milestone 5](../milestone-5-domain-model-data-architecture/README.md))
and the business rules it enforces (per the
[Business Rules Catalog](../milestone-5-domain-model-data-architecture/08-business-rules-catalog.md)).
A service folder never imports directly from another service folder's
internals — only through the Direct/Event-Driven interaction patterns
already defined there.

## Shared Packages (`packages/`)

| Package | Contents |
|---|---|
| `domain-types` | TypeScript types for every Milestone 5 entity — the single source of truth both `apps/` and `services/` import from |
| `ui-components` | The shared, accessibility-tested component library from [Frontend Architecture](../milestone-8-technology-stack-development-architecture/02-frontend-architecture.md) |
| `shared-utilities` | Cross-cutting helpers not specific to any one service |

## Documentation (`docs/`)

This documentation set continues to live here, versioned alongside the
code it describes — the practice already established across Milestones
1–8 and confirmed as an engineering habit in
[Repository & Code Organization](../milestone-8-technology-stack-development-architecture/06-repository-and-code-organization.md).

## Configuration (`config/`)

Environment-specific, non-secret configuration (feature flags,
environment names, non-sensitive service settings). **Secrets never
live here** — see
[Security Development Practices §Secrets Management](./08-security-development-practices.md).

## Testing (`tests/`)

Cross-cutting test suites that span multiple services or applications
(integration and end-to-end, per
[Testing Strategy Implementation](./06-testing-strategy-implementation.md)).
Unit tests live alongside the code they test, within each service or
package.

## Content (`content/`)

Local, non-real sample data used for development and testing — course
content fixtures, sample Applicants, sample Cohorts. **Never contains
real Student data**, per the environment-separation principle in
[Development Environment Strategy](./03-development-environment-strategy.md).

## Scripts (`scripts/`)

Developer-facing tooling: local environment setup, seeding sample data
from `content/`, running the full test suite locally. No deployment or
infrastructure scripts — those are explicitly out of scope for this
milestone, per its instructions.

## Future Products

New Prepped products (per
[Prepped Ecosystem Architecture](../milestone-8-technology-stack-development-architecture/10-prepped-ecosystem-architecture.md))
do not add new top-level folders — they add configuration (brand/theme
entries consumed by `apps/platform` and `apps/public-website`) and new
Program records, per that document's "configuration, not fork"
recommendation. A genuinely new *product line* the platform hasn't
anticipated would be the one case warranting a new `apps/` entry, and
even then would still share every `services/` folder.

## Relationship Between Repositories

| Repository | Relationship to Minara-LMS |
|---|---|
| **Minara-Master-Plan** | Separate repository. Institutional governance and policy content. Minara-LMS consumes specific content from it (institutional pages, policy references) through a still-undefined hand-off mechanism — see [Repository & Code Organization §Needs Verification](../milestone-8-technology-stack-development-architecture/06-repository-and-code-organization.md). |
| **Minara-Curriculum** | Separate repository. Academic content (courses, lessons, assessments, question banks). Minara-LMS's `learning` and `assessments` services consume this content per the authored-by/operated-by split in the [Academic Domain Model](../milestone-5-domain-model-data-architecture/02-academic-domain-model.md), but do not own or version it. |
| **PharmDPrepped, PharmTechPrepped, TherapyPrepped, MedCodePrepped, future products** | Not separate repositories. Represented within Minara-LMS as Program records and brand configuration, per [Prepped Ecosystem Architecture](../milestone-8-technology-stack-development-architecture/10-prepped-ecosystem-architecture.md). |

## Current / Planned / Future

| Element | Status |
|---|---|
| The `apps/`, `services/`, `packages/`, `docs/`, `config/`, `tests/`, `content/`, `scripts/` shape | **Current** — this milestone's recommendation |
| 13 service folders aligned to [Service Boundaries](../milestone-6-technical-architecture/03-service-boundaries.md) | **Current** |
| Prepped products as configuration within existing folders | **Current** |
| Actual repository creation and tooling setup | **Future** — belongs to the start of real implementation |

## ⚠️ Needs Verification

- This layout is illustrative; actual naming conventions and build
  tooling (e.g., which monorepo build system) are implementation-time
  decisions not made here.
- The content/curriculum hand-off mechanism (still undefined since
  Milestone 5) will likely influence whether `content/` needs a more
  developed structure than shown here once it's resolved.

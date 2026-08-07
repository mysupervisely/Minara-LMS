# Frontend Architecture

**Status:** Draft
**Milestone:** 8 — Technology Stack & Development Architecture
**Date:** 2026-08-07

This document evaluates and recommends the frontend technology
architecture for Minara-LMS, covering both the SSR-first Public Website
and the authenticated, seven-portal application defined in
[Milestone 4](../milestone-4-information-architecture/README.md).

## Framework Considerations

**Requirement recap:** SSR-first public pages
([Guiding Principles §5](../milestone-1-product-vision-platform-strategy/03-guiding-principles.md)),
mobile-first responsive design
([Guiding Principles §4](../milestone-1-product-vision-platform-strategy/03-guiding-principles.md)),
one authenticated shell serving seven portals
([Global Navigation Framework](../milestone-4-information-architecture/01-global-navigation-framework.md)),
and a component-rich, form-heavy application (grading, evaluations,
scheduling) that needs to feel responsive to use.

**Recommendation: React, via a meta-framework that supports
server-side rendering out of the box (e.g., Next.js).**

| Option | Strengths for Minara-LMS | Weaknesses for Minara-LMS |
|---|---|---|
| **React + SSR meta-framework (e.g., Next.js)** | Mature SSR support; one framework serves both the Public Website and the Authenticated App, satisfying both halves of the requirement without a second toolchain; the largest available talent pool and component ecosystem, which matters for long-term maintainability (see [Technology Selection Principles](./01-technology-selection-principles.md)) | React's flexibility means architectural discipline has to be enforced by the team, not the framework — mitigated by the Component Architecture Philosophy below |
| **Other SSR-capable frameworks (e.g., SvelteKit, Nuxt)** | Often lighter-weight, strong SSR stories of their own | Smaller ecosystems and talent pools than React's — a real long-term maintainability cost per [Technology Selection Principles](./01-technology-selection-principles.md), even though technically capable |
| **Static-site-first frameworks (e.g., Astro)** | Excellent for content-heavy, mostly-static sites | Well-suited to the Public Website alone, but not to the highly interactive Authenticated App — would require a second framework for the portals, violating the "one well-chosen tool" principle in [Technology Selection Principles](./01-technology-selection-principles.md) |
| **Traditional client-only SPA (React without SSR)** | Simple mental model, one rendering mode everywhere | Fails the explicit SSR-first Public Website requirement outright |

**Rationale:** the requirement to serve both an SSR-first public site
and a complex authenticated application from one coherent codebase is
the deciding factor — it rules out static-only and SPA-only approaches
and favors a framework built to do both well. React's ecosystem
maturity then wins the comparison among SSR-capable frameworks, per the
long-term-maintainability principle in
[Technology Selection Principles](./01-technology-selection-principles.md).

## SSR Strategy — "How should Minara ensure all public-facing websites
are server-side rendered?"

This is answered architecturally, not just by framework choice:

1. **Default to server rendering; opt into client rendering, not the
   reverse.** Every route under the Public Website (see
   [Global Navigation Framework §1](../milestone-4-information-architecture/01-global-navigation-framework.md))
   is rendered on the server by default. Client-side interactivity is
   layered on top of server-rendered markup ("progressive enhancement"),
   not used to replace it.
2. **Enforce this as a build-time/review-time rule, not a hope.** Any
   new Public Website page should be reviewable against a simple test:
   "does this page's primary content appear in server-rendered output,
   with JavaScript disabled?" A page that fails this test does not ship
   as part of the Public Website.
3. **The Authenticated Application does not need the same rule.**
   Server rendering matters for the Public Website because of SEO and
   first-load performance for prospective students; the Authenticated
   Application (behind login, not indexed by search engines) can favor
   whichever rendering mode the meta-framework makes fastest for a
   logged-in, already-loaded session — this distinction is deliberate,
   not an inconsistency.
4. **Prepped product pages inherit the same rule.** Per
   [Prepped Ecosystem Architecture](./10-prepped-ecosystem-architecture.md),
   each Prepped product's public-facing pages are part of the same
   Public Website application and follow the same SSR-by-default rule.

## Public Website Architecture

- One application, serving Home, School/Program pages, Prepped product
  pages, and the Admissions entry point — matching the structure already
  defined in
  [Global Navigation Framework §1](../milestone-4-information-architecture/01-global-navigation-framework.md).
- Content sourced from Minara-Curriculum (program descriptions) and
  Minara-Master-Plan (institutional content) is rendered by this
  application but not authored by it, per
  [Scope Boundaries](../milestone-1-product-vision-platform-strategy/09-scope-boundaries.md) —
  the specific hand-off mechanism remains **⚠️ Needs Verification**,
  carried forward from Milestone 5.

## Authenticated Application Architecture

- One application shell (Portal Switcher, Primary/Secondary Navigation,
  per the
  [Global Navigation Framework §2–4](../milestone-4-information-architecture/01-global-navigation-framework.md))
  serving all seven portals, rather than seven separate applications —
  this mirrors [System Architecture](../milestone-6-technical-architecture/01-system-architecture.md)'s
  "one platform, many portals" decision at the frontend layer.
- Role-scoped navigation (which Primary Navigation items appear) is
  resolved from the active Role Assignment, per
  [Security Architecture](../milestone-6-technical-architecture/04-security-architecture.md) —
  the frontend reflects authorization decisions made by the Application/
  Orchestration Layer; it does not independently decide what a user may
  see.

## Component Architecture Philosophy

- **Shared, role-agnostic components** (form inputs, tables, navigation
  shell) live in one shared component layer, consumed by every portal —
  avoiding sixteen slightly-different button implementations across
  seven portals.
- **Portal-specific components** stay local to their portal's part of
  the codebase — a Gradebook grid used only by Faculty doesn't need to
  be "shared" just because the codebase is one application.
- This mirrors, at the frontend layer, the same Experience-Area-vs-
  Engine-Area split from
  [Application Architecture](../milestone-6-technical-architecture/02-application-architecture.md):
  shared engines, portal-specific experiences.

## Accessibility Considerations

- Accessibility (per
  [Guiding Principles §3](../milestone-1-product-vision-platform-strategy/03-guiding-principles.md))
  is enforced through the shared component layer described above —
  building accessible primitives once, in one place, is what makes it
  realistic to hold every portal to the same standard, rather than
  auditing each portal's bespoke components separately.
- Automated accessibility checks are part of the testing strategy — see
  [Testing & Quality Assurance Architecture](./07-testing-quality-assurance-architecture.md).

## Mobile-Responsive Strategy

- Every screen in [Milestone 4](../milestone-4-information-architecture/README.md)
  is designed mobile-first at the information-architecture level; this
  document's job is only to confirm the frontend technology doesn't
  undermine that — React with a component layer built mobile-first from
  the start (rather than desktop-first with mobile "adapted" later)
  satisfies this without requiring a separate mobile-specific frontend
  at this stage. A native mobile app remains **Future**, per
  [Milestone 6's Implementation Roadmap](../milestone-6-technical-architecture/10-implementation-roadmap.md).

## Performance Considerations

- SSR for the Public Website directly serves first-load performance for
  prospective students, per
  [Scalability & Reliability Framework §Performance](../milestone-6-technical-architecture/09-scalability-reliability-framework.md).
- The Authenticated Application's performance target is
  responsiveness during common actions (per that same document) —
  addressed through the caching philosophy already established there,
  not re-litigated here.

## Current / Planned / Future

| Element | Status |
|---|---|
| React + SSR meta-framework as the frontend technology direction | **Current** — this milestone's recommendation |
| SSR-by-default rule for the Public Website | **Current** |
| One authenticated shell serving all seven portals | **Current** |
| Shared component layer | **Planned** |
| Native mobile app | **Future** |

## ⚠️ Needs Verification

- The specific SSR meta-framework (this document names Next.js only as
  the most established example of the category) is a recommendation,
  not a final commitment — it should be confirmed once real engineering
  planning begins, particularly against whatever backend technology
  [Backend Architecture](./03-backend-architecture.md) settles on, since
  a Node.js-based frontend and backend share language and tooling
  benefits worth weighing concretely.
- The curriculum/institutional content hand-off mechanism (Minara-
  Curriculum/Minara-Master-Plan → Public Website) remains undefined,
  carried forward from Milestone 5.

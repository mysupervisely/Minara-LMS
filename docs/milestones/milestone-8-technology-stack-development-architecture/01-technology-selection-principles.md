# Technology Selection Principles

**Status:** Draft
**Milestone:** 8 — Technology Stack & Development Architecture
**Date:** 2026-08-07

This document establishes how every technology recommendation in this
milestone gets made — the criteria applied, and the philosophy behind
them — before any specific recommendation is offered.

## How Technology Decisions Are Evaluated

Every recommendation in this milestone is run through the same four
questions, in order:

1. **Does it satisfy a real requirement from Milestones 1–7?** If a
   technology is attractive but nothing in this project's own
   requirements calls for it, it doesn't belong here — see
   [MVP Philosophy §1](../milestone-7-mvp-definition-implementation-planning/01-mvp-philosophy.md)'s
   "every MUST HAVE answers a real necessity" principle, applied here to
   technology instead of features.
2. **What does choosing it cost later if it turns out wrong?** A
   reversible choice (e.g., a caching layer) is evaluated more loosely
   than an irreversible one (e.g., a primary data store, or a language
   the whole team commits to).
3. **Does it fit the team and problem size that actually exists?**
   Technology chosen for a scale Minara-LMS doesn't have yet (per
   [MVP Philosophy](../milestone-7-mvp-definition-implementation-planning/01-mvp-philosophy.md)'s
   "launch narrow, build for scale") is over-engineering; technology
   that can't grow into the scale [Milestone 6](../milestone-6-technical-architecture/README.md)
   already designed for is under-engineering. Both are rejected.
4. **Can it be left without rewriting the platform?** See "Avoiding
   Vendor Lock-In," below.

## Tradeoffs Between Speed and Scalability

Every technology choice in this milestone sits somewhere on a line
between "gets a small team shipping quickly" and "holds up as
Minara-LMS grows toward the thousands-of-concurrent-students,
multi-school future described in
[Long-Term Platform Vision](../milestone-1-product-vision-platform-strategy/07-long-term-platform-vision.md)."
This milestone's position: **favor speed for anything Milestone 6
already drew a clean boundary around** (because a clean boundary means
it can be re-platformed for scale later without a rewrite), and
**favor scalability for anything foundational and hard to change** (the
primary datastore, the authentication approach, the core domain
language). This is the same logic
[System Architecture](../milestone-6-technical-architecture/01-system-architecture.md)
already used to defer the single-deployment-vs-services decision — this
milestone resolves that specific deferral in
[Backend Architecture](./03-backend-architecture.md), now that resolving
it is in scope.

## Avoiding Unnecessary Complexity

- **One well-chosen tool beats three specialized ones**, unless a
  specific, real requirement demands the specialization. A second
  database, a second language, a second frontend framework — each is a
  cost (operational, cognitive, hiring) that must be justified by
  something Milestones 1–7 actually require, not by "it might be useful
  someday."
- **The MVP's actual shape** (per
  [MVP Scope Definition](../milestone-7-mvp-definition-implementation-planning/02-mvp-scope-definition.md))
  is the yardstick for "how much technology is enough" — not the
  platform's eventual, multi-school, AI-assisted, analytics-rich future
  state.
- **Every piece of infrastructure this milestone recommends should be
  removable** without taking the rest of the platform down with it —
  the direct technology-layer expression of
  [Guiding Principles §7 (Modular Architecture)](../milestone-1-product-vision-platform-strategy/03-guiding-principles.md).

## Open-Source vs. Managed Services Philosophy

Neither is preferred categorically — the decision is made per
technology, weighing:

- **Managed services** reduce operational burden (valuable for a small
  team, per the team-size uncertainty already flagged in
  [System Architecture §Needs Verification](../milestone-6-technical-architecture/01-system-architecture.md))
  at the cost of provider dependency.
- **Open-source, self-hostable technology** costs more operational
  effort up front but preserves the ability to move providers — or move
  to self-hosting entirely — without a rewrite.
- **This milestone's working rule:** prefer managed services for
  **operational** concerns (hosting, monitoring, email delivery) where
  switching later mainly means reconfiguration, and prefer open-source,
  widely-portable technology for **foundational** concerns (the
  database engine, the backend language/runtime, the frontend framework)
  where switching later would mean rewriting application code.

## Long-Term Maintainability

- **Boring, well-established technology is preferred over novel
  technology**, all else equal — a platform serving real students'
  academic and (in places) health-adjacent records is not the place to
  bet on something unproven, per
  [Guiding Principles §2 (Security)](../milestone-1-product-vision-platform-strategy/03-guiding-principles.md).
- **Consistency across the stack is a maintainability feature, not just
  a convenience** — a smaller set of languages and patterns is easier
  for a growing team to reason about, hire for, and keep secure than a
  larger, more "best tool for every job" set would be.
- **Every recommendation in this milestone should still make sense five
  years from now**, not just for the MVP — because the domain model and
  service boundaries from Milestones 5–6 are built to last, the
  technology realizing them should be chosen with the same time horizon.

## Current / Planned / Future

| Element | Status |
|---|---|
| The four evaluation questions above | **Current** — governs every recommendation in this milestone |
| Speed-vs-scalability positioning | **Current** |
| Open-source-for-foundational / managed-for-operational rule | **Current** |
| Actual technology selections following these principles | See [02](./02-frontend-architecture.md)–[10](./10-prepped-ecosystem-architecture.md) |

## ⚠️ Needs Verification

- These principles assume a small-to-moderate initial engineering team,
  consistent with the team-size uncertainty already flagged in
  [Milestone 6](../milestone-6-technical-architecture/01-system-architecture.md).
  If the actual team is significantly larger or smaller than assumed,
  several downstream recommendations in this milestone should be
  revisited.

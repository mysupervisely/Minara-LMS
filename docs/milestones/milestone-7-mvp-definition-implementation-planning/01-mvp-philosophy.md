# MVP Philosophy

**Status:** Draft
**Milestone:** 7 — MVP Definition & Implementation Planning
**Date:** 2026-08-07

This document establishes how "MVP" is meant to be understood for
Minara-LMS specifically — not as a generic startup concept, but as it
applies to a platform whose job is to responsibly operate real
students' education.

## MVP Principles

1. **The MVP narrows scope, never architecture.** Every decision in this
   milestone selects *which* Milestone 3 workflows, Milestone 4 screens,
   and Milestone 6 services ship first — none of them invent a shortcut
   that would require Milestones 1–6 to be redesigned later. If a
   proposed simplification would compromise the domain model
   ([Milestone 5](../milestone-5-domain-model-data-architecture/README.md))
   or the RBAC/audit principles
   ([Milestone 2](../milestone-2-user-roles-permission-architecture/README.md)),
   it is not an MVP simplification — it is scope creep in the wrong
   direction, and this milestone rejects it.
2. **Every MUST HAVE answers a real operational necessity, not a
   convenience.** A feature earns MUST HAVE status only if its absence
   means the platform cannot honestly claim to operate a real program —
   not because it would be nice to have on day one.
3. **The MVP must be end-to-end complete for at least one real cohort's
   full lifecycle** — see "What MVP Means for an Educational Platform"
   below.
4. **Launch narrow, build for scale.** The MVP targets a single School,
   a single Program, and a small number of Cohorts — but every service
   boundary, permission model, and domain entity behind that single
   launch is the same one designed in Milestones 1–6 to support many
   schools and programs. Nothing about the MVP is single-tenant in
   spirit; it is single-tenant only in the sense that only one tenant
   exists yet.

## What MVP Means for an Educational Platform

A typical SaaS MVP can succeed by doing one thing well and leaving
everything else unbuilt. An educational platform's MVP cannot work that
way, because education isn't one feature — it's a **lifecycle** a real
person moves through, and a platform that supports only *part* of that
lifecycle doesn't partially succeed, it fails the students in it.

Concretely: a version of Minara-LMS that can enroll students and deliver
courses, but cannot grade them, has not shipped 80% of an MVP — it has
shipped an unusable product, because a course that can't produce a
grade doesn't function as a course. The same is true of a version that
can teach and grade but cannot eventually certify completion: a program
that can't confer its credential hasn't done its job, no matter how
polished the courses were along the way.

**This milestone therefore defines MVP as: full support for one complete
student journey, from enrollment to a meaningful outcome (a passed
course, and where the launch program requires it, a certificate) —
narrower in breadth than the long-term vision, but not shallower in
depth.** See [MVP Scope Definition](./02-mvp-scope-definition.md) for
exactly where that line is drawn.

## What Is Intentionally Excluded

Consistent with the principle above, exclusions are chosen because they
are **outside** the one complete journey the MVP must support, not
because they're unimportant:

- **AI Tutor** (beyond, at most, a minimal Learning Support capability) —
  valuable, but a program can operate without it.
- **Analytics** — genuinely useful only once real usage data exists;
  building it before the MVP has users to analyze is premature.
- **Multi-school expansion** — the MVP proves the platform works for
  one School/Program; expansion is the next milestone's problem, not
  this one's.
- **Self-service Admissions at full maturity** — the first real cohort
  can be onboarded through Administrator-provisioned enrollment (see
  [MVP Scope Definition](./02-mvp-scope-definition.md)); a full
  self-service pipeline matters most once the platform is recruiting a
  *second* cohort.
- **External integrations of any kind** (payment providers, SIS,
  credential verification, etc.) — every one of these was already
  documented as **Future** in
  [Integration Architecture](../milestone-6-technical-architecture/07-integration-architecture.md)
  and stays that way here.
- **Employer Portal and full externship self-service**, unless the
  specific launch program requires an externship component — see the
  conditional treatment in
  [MVP Scope Definition](./02-mvp-scope-definition.md).

## How MVP Balances Speed and Scalability

The tension between "ship something real, soon" and "don't build
something that has to be thrown away" is resolved the same way
[System Architecture](../milestone-6-technical-architecture/01-system-architecture.md)
already resolved it: by drawing module and service boundaries around
business meaning, not around what's convenient to build first. Because
those boundaries were already drawn correctly in Milestone 6, this
milestone can narrow *which* boundaries get built first without
weakening any of them. Speed comes from sequencing, not from cutting
corners in any one module that ships.

## Relationship to Long-Term Minara Vision

The MVP is not a smaller, different vision — it is the first rung of the
same ladder described in
[Long-Term Platform Vision](../milestone-1-product-vision-platform-strategy/07-long-term-platform-vision.md):
one platform, one learner identity, growing into many schools and
programs over time. Every entity, role, and service the MVP uses is
exactly the one Milestones 1–6 designed for that long-term picture —
this milestone's only job is to decide the order in which that picture
gets filled in.

## Current / Planned / Future

| Element | Status |
|---|---|
| MVP principles (this document) | **Current** — the governing philosophy for the rest of this milestone |
| Full end-to-end single-cohort journey as the MVP bar | **Current** |
| Launch-narrow, architect-wide posture | **Current** — inherited directly from Milestones 1–6 |
| Exclusions listed above | **Future**, per their respective timing in [Implementation Phases](./05-implementation-phases.md) |

## ⚠️ Needs Verification

- This document assumes the MVP targets exactly one School and one
  Program at launch — this has not been confirmed with stakeholders and
  should be validated as part of approving this milestone.
- Whether the launch Program requires an externship component is still
  unconfirmed (carried forward from every prior milestone) and directly
  affects whether Clinical Operations belongs inside or outside the MVP
  boundary — see [MVP Scope Definition](./02-mvp-scope-definition.md).

# Architecture Review

**Status:** Draft
**Milestone:** 12 — Curriculum Delivery Vertical Slice
**Date:** 2026-08-07

## Purpose

This document confirms this milestone's plan aligns with every ADR its
instructions name, addressed one at a time — the same discipline
Milestone 11's README applied to the full Content Engine, narrowed here
to what this specific slice touches.

## ADR-001: Modular Monolith Architecture

**Alignment:** This slice adds no deployable unit. Every new concept
(content status, Competency) lives inside the existing **Learning**
service, exactly where
[Milestone 11's Academic Content Architecture](../milestone-11-curriculum-management-content-engine/02-academic-content-architecture.md)
already placed the Content Engine. The new Program Director review
queue and Administrator publish action are new *screens* over existing
service boundaries, not new services. Nothing in this plan requires
Minara-LMS to stop being deployed as a single application.

## ADR-003: Monorepo and Ecosystem Architecture

**Alignment:** This slice touches only Minara-LMS. It does not read
from, write to, or assume any specific integration with Minara-
Curriculum or Minara-Master-Plan — the WHAT vs. HOW division from
[Curriculum Management Vision](../milestone-11-curriculum-management-content-engine/01-curriculum-management-vision.md)
continues to apply unchanged: this slice proves Faculty authoring
deliverable content natively in Minara-LMS, which was already the
resolved position, not a new cross-repository dependency.

## ADR-004: Domain-Driven Module Boundaries

**Alignment:** The one new domain concept this slice introduces
(Competency) is placed within the Learning service's existing scope,
consistent with
[Milestone 11's Curriculum Domain Model](../milestone-11-curriculum-management-content-engine/03-curriculum-domain-model.md)
having already named Competency as Learning-service territory. No
boundary is drawn along technical convenience — the status field
extension to `Lesson`/`Assessment` stays inside the same bounded context
those entities already belong to, per
[Domain Impact Review](./03-domain-impact-review.md).

## ADR-005: RBAC and Audit-First Security Model

**Alignment:** This is the ADR this slice most directly exercises.
Every new action (draft, submit, return, approve, publish) is
authorized through an existing RBAC primitive
(`hasRoleForCourseOffering`, `hasRoleForProgram`, `requireAdministrator`)
— no new authorization mechanism, per
[Domain Impact Review §Existing Concepts Reused Unchanged](./03-domain-impact-review.md#existing-concepts-reused-unchanged).
Every transition is audit-logged through the existing single write path,
per [Content Lifecycle Workflow](./02-content-lifecycle-workflow.md).
This slice's [Testing Strategy](./06-testing-strategy.md) treats RBAC
and Audit coverage as first-class, not incidental, test categories —
directly reflecting this ADR's "security is part of what 'done' means"
position (restated in
[ADR-012 §1](../../architecture/adr/ADR-012-development-philosophy.md)).

## ADR-006: Human-Reviewed AI Governance

**Alignment:** This slice contains **no AI implementation whatsoever**
— not even the bounded suggestion-only behaviors
[Milestone 11 named as permitted](../milestone-11-curriculum-management-content-engine/01-curriculum-management-vision.md#vision-principles)
(AI-drafted Learning Objectives, Question suggestions). This is a
deliberate exclusion (per [README §Scope Boundaries](./README.md#scope-boundaries)
and [PRD §Explicit Exclusions](./01-product-requirements-document.md#explicit-exclusions)),
not an oversight — proving the human-authored, human-approved workflow
first, with AI assistance layered on in a later slice, keeps this
slice's proof of "the architecture works" free of a second variable.
Every decision point in this slice's lifecycle (submit, return, approve,
publish, grade) remains exclusively human, consistent with this ADR
regardless.

## ADR-008: Pharmacy Technology First Launch

**Alignment:** Nothing in this slice's design names Pharmacy Technology,
or any Program, by name — the Competency concept, content status field,
and every screen change are configuration-driven exactly as
[Milestone 11 required throughout](../milestone-11-curriculum-management-content-engine/01-curriculum-management-vision.md#vision-principles).
This slice is, however, expected to be *exercised* against Milestone
10's existing seeded Pharmacy Technology data
(`prisma/seed.ts`) during implementation and testing — consistent with
this ADR's decision that Pharmacy Technology is the first real Program
the platform proves itself against, without any code branching on it by
name.

## ADR-011: Vertical Slice Development Strategy

**Alignment:** This is the ADR this entire milestone exists to apply.
Every scoping decision in this plan — collapsing Milestone 11's
six-state workflow to four, deferring Module/versioning/the full
Competency chain/Question Banks (per
[Domain Impact Review §Concepts That Should NOT Be Added Yet](./03-domain-impact-review.md#concepts-that-should-not-be-added-yet)),
sequencing six small phases rather than one large build (per
[Implementation Plan](./05-implementation-plan.md)) — is a direct
application of this ADR's core instruction: build the first working
slice, prove the architecture, before expanding. This milestone is, in
effect, ADR-011 applied a second time, one layer deeper than Milestone
10 applied it — proving Milestone 11's *design* the same way Milestone
10 proved the original architecture documentation.

## Alignment Summary

| ADR | This Slice's Relationship |
|---|---|
| ADR-001 (Modular Monolith) | No new deployable unit; extends the existing Learning service |
| ADR-003 (Monorepo/Ecosystem) | No cross-repository dependency introduced or assumed |
| ADR-004 (Domain-Driven Boundaries) | New Competency concept placed within Learning's existing scope |
| ADR-005 (RBAC/Audit-First) | Every new action reuses existing authorization/audit primitives; central to this plan's testing strategy |
| ADR-006 (Human-Reviewed AI) | No AI implementation in this slice at all — a deliberate, stronger-than-required exclusion |
| ADR-008 (Pharmacy Technology First Launch) | No Program named in design; exercised against existing seeded data during implementation |
| ADR-011 (Vertical Slice Strategy) | This milestone's organizing principle, applied to Milestone 11's design the way Milestone 10 applied it to the original architecture |

## Current / Planned / Future

| Element | Status |
|---|---|
| Alignment confirmation against all seven named ADRs | **Current** — confirmed in this document |
| No new ADR required by this slice | **Current** — every design choice traces to an existing ADR; see individual sections above |
| A future ADR for the two-step Review process, if/when it's built | **Future** — not required by this slice, since this slice deliberately doesn't build that distinction; would only become relevant if a future slice's design changed rather than extended existing RBAC/workflow assumptions |

## ⚠️ Needs Verification

- Whether a future slice that *does* introduce true content versioning
  (immutable Lesson/Assessment Versions, per
  [Versioning Strategy](../milestone-11-curriculum-management-content-engine/04-versioning-strategy.md))
  would itself require a new ADR, or whether it's sufficiently covered
  by ADR-011's existing vertical-slice framing — not decided here; left
  for whoever scopes that future slice to assess against the actual
  design at that time.

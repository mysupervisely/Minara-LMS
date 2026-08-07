# Implementation Readiness Review

**Status:** Draft
**Milestone:** 15 — Planning (Architecture Checkpoint, Question 7)
**Date:** 2026-08-07

## Readiness: **CONDITIONAL GO**

Not a NO-GO: the architecture is genuinely ready. Not an unconditional
GO: three specific, resolvable items should be confirmed or explicitly
accepted as interim design before coding starts — consistent with this
task's own instruction that a materially architecture-significant
decision should be surfaced for review rather than decided unilaterally.

### Why the architecture is ready

- The approval-gate pattern (Coordinator + Program Director joint sign-off)
  has been proven three times already (Grade Approval — M10, Content
  Approval — M13/M14). A fourth application is low-risk repetition, not
  fresh discovery, exactly the position ADR-011 says the platform should
  be in by now.
- The audit pattern (append-only `AuditLog`, `AuditAction` union
  extension only) has been proven identically in M13 and M14.
- The fail-closed, server-side visibility pattern (a role can only ever
  reach what its own scope permits, never by direct route/action
  invocation) was hardened specifically in M14 and generalizes directly.
- `CLINICAL_COORDINATOR`'s RBAC scope (`"program"`) is **already defined**
  in `src/domain/roles.ts` — there is no new RBAC design to do, only
  activation.
- The additive-migration discipline (new tables/columns only, no
  destructive changes to M10–M14's schema) is proven and repeatable.

### What must be resolved or explicitly accepted first

1. **Curriculum specifics.** Eligibility prerequisites, required hours,
   and evaluation criteria are genuinely unknown pending
   Minara-Curriculum (see [Capability Inventory — Question 5](./01-architecture-checkpoint-capability-inventory.md#question-5--pharmacy-technology-curriculum-repository-review)).
   Accept either: (a) a stakeholder/Minara-Curriculum review resolves
   them before coding, or (b) the slice proceeds with these represented
   as Coordinator/Program-Director-entered judgment fields, not
   platform-enforced constants — this document recommends (b) as the
   pragmatic default, since it does not block implementation and commits
   to nothing false.
2. **The narrowing decisions themselves.** Deferring Employer as a
   platform actor, itemized Hours Log, and Site Agreement tracking (see
   [Externship Deep Dive](./04-externship-deep-dive.md)) are product
   tradeoffs, not purely technical ones. This document believes they are
   the right narrow-slice calls, but flags them for explicit sign-off
   rather than assuming silent agreement.
3. **Service module placement.** Confirm `src/services/externship/` as
   the new module name/location before implementation, so it is chosen
   deliberately against [ADR-004](../../architecture/adr/ADR-004-domain-driven-module-boundaries.md)'s
   boundary conventions rather than drifting during implementation.

None of these are blocking in the sense of "the architecture doesn't
work" — they are blocking only in the sense that coding ahead of them
risks inventing the exact kind of unverified requirement this task's
constraints forbid.

## Exact Implementation Sequence (if confirmed)

Mirrors the phase breakdown already proven in Milestones 13 and 14:

1. **Prisma schema** — `ClinicalSite`, `Placement`, `Evaluation` models;
   purely additive migration, no changes to existing M10–M14 tables.
2. **Audit service** — new `EXTERNSHIP_*`/`PLACEMENT_*`/`EVALUATION_*`
   actions on the existing `AuditAction` union.
3. **`src/services/externship/externship.ts`** — eligibility, site,
   placement, evaluation, and completion-verification functions;
   fail-closed visibility patterns copied directly from M14.
4. **`src/domain/roles.ts`** — move `CLINICAL_COORDINATOR` into
   `IMPLEMENTED_ROLES`; set its `ROLE_HOME_ROUTE`.
5. **Coordinator Portal** — new `/coordinator` route group (Dashboard,
   Sites, Eligibility Queue, Placements, Evaluations, Completion
   Verification).
6. **Program Director Portal** — Completion Verification approval queue.
7. **Student Portal** — read-only "My Externship" status view, gated on
   `program.requiresExternship`.
8. **Admin Portal** — `CLINICAL_COORDINATOR` added to the role-assignment
   selector; Audit Log filter coverage.
9. **Fixtures/seed** — extend (not replace) `tests/helpers/fixtures.ts`,
   `reset-db.ts`, and `prisma/seed.ts` with an Externship-requiring
   demonstration scenario, following the same "prove it in the seed
   data, not only under test" discipline M14 used.
10. **New test suite** — `tests/externship-management.test.ts`, plus a
    full regression run of the existing 62-test suite.
11. **Verify** — TypeScript, ESLint, production build, full test suite,
    real-browser smoke test — same discipline as every milestone since
    M10.
12. **Commit, push, deliverables report.**

## Consolidated ⚠️ Needs Verification

Every open item surfaced across this planning package, in one place:

- Specific Pharmacy Technology eligibility prerequisites, required
  hours, site/preceptor requirements, and evaluation criteria — pending
  Minara-Curriculum (ADR-008, this package's Question 5).
- Whether Coordinator-recorded-on-Employer's-behalf evaluation is an
  acceptable interim substitute for real Employer self-service, or
  whether Employer Portal access should be pulled forward instead
  (Externship Deep Dive #12, #20).
- What happens after a failed remediation/improvement plan
  (re-placement vs. program dismissal) — depends on Minara-Master-Plan
  academic policy (Externship Deep Dive #16, carried forward unresolved
  from Milestone 3).
- Whether any institutional policy anticipates mid-Cohort Course
  restructuring, relevant only if the Course-versioning deferral
  (Question 2) is ever revisited.
- Whether Site capacity/availability will ever need real-time Employer
  coordination — assumed Coordinator-maintained-only for this slice,
  consistent with the Coordinator Portal's own source document.

None of these block starting implementation of the narrowed slice
recommended in [Milestone 15 Recommendation](./05-milestone-15-recommendation.md);
they are the specific, named things to keep provisional rather than
treat as settled while building it.

## Current / Planned / Future

| Element | Status |
|---|---|
| This readiness review | **Current** |
| Confirmation of the three conditions above | **Planned** — precedes implementation |
| The 12-phase implementation sequence | **Planned**, pending confirmation |

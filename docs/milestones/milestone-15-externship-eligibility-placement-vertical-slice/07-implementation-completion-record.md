# Implementation Completion Record

**Status:** Implemented
**Milestone:** 15 — Externship Eligibility & Placement Vertical Slice
**Date:** 2026-08-10

This document records what the planning package (documents 01–06 in this
folder) recommended, versus what was actually built. Per this milestone's
own instruction, it does **not** rewrite the planning documents to make
the implementation look pre-decided — 01–06 remain exactly as drafted;
this document is the after-the-fact record of the real build.

## Summary

The narrow slice recommended in [05-milestone-15-recommendation.md](./05-milestone-15-recommendation.md)
was implemented essentially as planned: eligibility → site → placement →
evaluations → Coordinator + Program Director joint Completion
Verification, activating the already-declared `CLINICAL_COORDINATOR`
role, with every explicit exclusion from the
[Externship Deep Dive](./04-externship-deep-dive.md) (Employer
self-service, itemized Hours Log, Site Agreements, invented numeric
requirements) honored exactly.

## Implemented

| Item | Detail |
|---|---|
| Domain models | `ClinicalSite`, `Placement`, `Evaluation`, and `ExternshipEligibility` (additive migration, see below) |
| Service | `src/services/externship/externship.ts` — every operation is scoped and authorization-checked at the service layer itself, not only by its caller |
| Roles | `CLINICAL_COORDINATOR` moved from declared-only to `IMPLEMENTED_ROLES` in `src/domain/roles.ts` — zero shape change, exactly as that file's own header comment anticipated since Milestone 10 |
| Coordinator Portal | `/coordinator`, `/coordinator/sites`, `/coordinator/eligibility`, `/coordinator/placements` (+ detail), `/coordinator/evaluations`, `/coordinator/completion` |
| Program Director integration | `/program-director/externship` (queue) and `/program-director/externship/[placementId]` (review/verify/return) |
| Student integration | `/student/externship` — read-only, gated on `program.requiresExternship`, no self-approval path |
| Admin integration | Role assignment already generic (no code change needed beyond the `IMPLEMENTED_ROLES` update); Overview page gained two stat cards linking into the Coordinator Portal for oversight, reusing that portal rather than building a separate admin workflow |
| Audit | 9 new `AuditAction` values on the existing `AuditAction` union/service — no second audit mechanism |
| Fixtures/Seed | `tests/helpers/fixtures.ts`'s `buildExternshipScenario`, `tests/helpers/reset-db.ts` extended, `prisma/seed.ts`'s Section 7 walks one Placement through the full lifecycle to a verified Completion |
| Tests | `tests/externship-management.test.ts` — 25 new tests (RBAC, eligibility, placement, evaluation, completion verification, security/isolation, audit reconstruction) |
| Browser verification | A real 14-step multi-role Playwright run — see [06-implementation-readiness-review.md](./06-implementation-readiness-review.md)'s sequence and the final chat report for the full step list |

## Planned (recommended, not built this milestone)

Everything the [Externship Deep Dive](./04-externship-deep-dive.md) and
[Recommendation](./05-milestone-15-recommendation.md) named as explicitly
out of scope remains out of scope, unchanged by implementation:
Employer/Preceptor self-service login, itemized Hours Log, Site
Agreements, a structured multi-criteria evaluation rubric, an automated
eligibility rule engine, and Certificate/Graduation itself (the next
candidate, per the planning package's own ranking).

## Architectural Decisions Discovered During Implementation

Two decisions emerged during the build that were not anticipated by the
planning package. Neither meets this project's ADR threshold (a
genuinely new, hard-to-reverse decision) — both are disclosed here rather
than folded silently into the diff, per this milestone's explicit
instruction to stop and explain rather than silently change architecture.

**1. `src/services/identity/rbac.ts` — a narrow split of `authorization.ts`.**
`externship.ts` is the first service module in this codebase to enforce
Role/Scope checks itself (per this milestone's "enforce authorization at
the service layer, never rely exclusively on page-level protection"
instruction) rather than leaving that entirely to its caller's
`actions.ts`, which every prior milestone's service module did. Importing
`hasRoleForProgram` from `authorization.ts` worked correctly inside the
real Next.js runtime, but broke `prisma/seed.ts`'s plain `tsx` process —
outside Next's own module resolution, `authorization.ts`'s top-level
`import { redirect } from "next/navigation"` (needed only by its
page-guard functions) fails to load. The fix: the four pure,
Next.js-independent predicates (`isAdministrator`, `hasRoleForProgram`,
`hasRoleForCourseOffering`, `hasAnyRole`) moved to a new
`src/services/identity/rbac.ts`; `authorization.ts` re-exports them
unchanged. **Every existing import site in the codebase is unaffected** —
`import { hasRoleForProgram } from "@/services/identity/authorization"`
still resolves, still is the same function, still enforces exactly the
same check. This is a physical reorganization of already-shared
infrastructure, not a new decision about what RBAC means — ADR-005 holds
exactly as before.

**2. A fourth domain model, `ExternshipEligibility`, beyond the three
named in the implementation brief (`ClinicalSite`, `Placement`,
`Evaluation`).** The brief's Phase 4 names an "Eligibility Queue" screen
and Phase 3 asks for a structured, multi-state eligibility mechanism
(Eligible / Not Yet Eligible / Requirements Pending Verification /
Blocked) that a Coordinator determination must persist and later
re-display — this isn't representable as a field on `Placement` (a
Student can have an eligibility status before any Placement exists) or
as a computed value (the whole point is that a Coordinator's specific
judgment call, and who made it and when, is retained). One small,
additive table, following the exact same shape discipline as the other
three, was the narrowest way to satisfy that requirement. Flagged here as
a disclosed, not-silent scope decision, consistent with the planning
package's own "minimum necessary" framing rather than the specific
three-name list being read as a hard ceiling.

## ⚠️ Needs Verification (carried forward, unchanged by implementation)

Nothing below was resolved by building the slice — implementation
deliberately did not attempt to resolve any of these, per the "do not
invent" constraint:

- Specific Pharmacy Technology eligibility prerequisites, required hours,
  site/preceptor requirements, and evaluation criteria — still pending
  Minara-Curriculum, per ADR-008. `ExternshipEligibility.status` and
  `Placement.hoursAttestedAt` remain Coordinator/Program-Director
  judgment fields, never platform-enforced numbers.
- Whether Coordinator-recorded-on-Employer's-behalf evaluation is an
  acceptable long-term substitute for real Employer self-service, or
  Employer Portal access should be pulled forward — unchanged open
  product question.
- Post-remediation consequences (re-placement vs. program dismissal) —
  depends on Minara-Master-Plan academic policy, not decided by this
  implementation. `returnCompletion`'s remediation loop is structural
  only; it does not encode a consequence.
- Whether any institutional policy anticipates mid-Cohort Course
  restructuring — relevant only if Course-level versioning (deferred per
  [02-course-level-versioning-evaluation.md](./02-course-level-versioning-evaluation.md))
  is ever revisited; untouched by this milestone.

## Current / Planned / Future

| Element | Status |
|---|---|
| Externship Eligibility & Placement Vertical Slice | **Implemented** |
| `src/services/identity/rbac.ts` split | **Implemented** — disclosed above |
| `ExternshipEligibility` model | **Implemented** — disclosed above |
| Employer self-service, itemized Hours Log, Site Agreements, structured rubric, automated eligibility rules | **Future** — unchanged from the planning package |
| Certificate & Graduation (this slice's own stated follow-on) | **Planned** — Milestone 16 candidate |

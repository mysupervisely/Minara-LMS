# Milestone 12 — Curriculum Delivery Vertical Slice

**Status:** Draft
**Phase:** Phase 1 — Product Architecture (documentation) / plans the next extension of Milestone 10's implementation
**Date:** 2026-08-07
**Scope:** Documentation only. No production code, database schemas,
APIs, or vendor selections are introduced in this milestone.

## Purpose

Milestone 11 documented the **complete** Curriculum Management & Content
Engine — the full hierarchy, versioning, publishing workflow, competency
mapping, and assessment architecture needed to eventually power every
current and future Minara program. Per
[ADR-011](../../architecture/adr/ADR-011-vertical-slice-development-strategy.md),
that full engine is not what gets built next. Milestone 12 designs the
**next narrow, end-to-end slice**: a single, focused path through the
Content Engine's core lifecycle, proven against the same discipline that
made Milestone 10 successful — build the smallest thing that proves the
architecture works, before expanding it.

**This milestone is planning, not code.** It defines *what* the next
implementation phase builds and *why*, so that phase can begin from an
approved, deliberately scoped plan rather than starting to write Prisma
models against the full Milestone 11 domain model directly.

## The Slice This Milestone Designs

```
Faculty/Admin drafts content (Lesson + Assessment)
    ↓
Faculty Review
    ↓
Program Director Approval
    ↓
Administrator Publish
    ↓
Student sees Published content
    ↓
Lesson Completion
    ↓
Assessment Completion → Grade Recording (Milestone 10's existing gate)
    ↓
Competency Progress Update
    ↓
Audit Trail — every step verifiable
```

This is deliberately **narrower** than the full Milestone 11 model: one
new content status lifecycle (not the full six-state Draft → Faculty
Review → Curriculum Committee Review → Approved → Published → Archived
workflow), one minimal Competency link (not the four-level Course
Outcome → Program Competency → Program Learning Outcome → Institution
Mission chain), and no Module, Program Version, Course Version, or
Question Bank. See
[Domain Impact Review](./03-domain-impact-review.md) for the complete,
explicit list of what is reused, what is extended, and what is
deliberately **not** added yet.

## Relationship to Milestones 10–11

| Milestone | Role in This Slice |
|---|---|
| **Milestone 10 (Foundation Build)** | The implemented foundation this slice extends: existing `Course`/`Lesson`/`Assessment` models, the Grade approval-gate pattern (`DRAFT → SUBMITTED → APPROVED`), `recordAuditEvent()`, and the Student/Faculty/Program Director/Admin portals. This slice reuses all of it rather than starting over. |
| **Milestone 11 (Curriculum Management & Content Engine)** | The full target architecture this slice proves a narrow path through. Every design choice below traces to a specific Milestone 11 document, scoped down rather than reinterpreted — see the per-document mapping in [Domain Impact Review](./03-domain-impact-review.md) and [Architecture Review](./07-architecture-review.md). |
| **Milestone 12 (this milestone)** | Plans the next *implementation* milestone. Per [ADR-011](../../architecture/adr/ADR-011-vertical-slice-development-strategy.md), that implementation happens only after this plan is reviewed and approved — the same gate Milestone 10's own planning went through. |

## Documents in This Milestone

| # | Document | Summary |
|---|---|---|
| 1 | [README](./README.md) | This document |
| 2 | [Product Requirements Document](./01-product-requirements-document.md) | User stories, acceptance criteria, success criteria, explicit exclusions |
| 3 | [Content Lifecycle Workflow](./02-content-lifecycle-workflow.md) | Draft → Faculty Review → Approval → Publish → Student Access → Completion → Assessment → Grade → Competency Update, with Mermaid diagrams |
| 4 | [Domain Impact Review](./03-domain-impact-review.md) | What Milestone 10 concepts are reused, extended, or deliberately not added yet |
| 5 | [Portal Impact Review](./04-portal-impact-review.md) | Required screen changes across Student, Faculty, Program Director, and Admin portals |
| 6 | [Implementation Plan](./05-implementation-plan.md) | Six build phases: Content Authoring Foundation → Approval Workflow → Student Delivery → Assessment Integration → Competency Tracking → Audit Validation |
| 7 | [Testing Strategy](./06-testing-strategy.md) | Tests for RBAC, content visibility, approval gates, completion tracking, assessment completion, grade recording, audit events |
| 8 | [Architecture Review](./07-architecture-review.md) | Explicit alignment check against ADR-001, 003, 004, 005, 006, 008, and 011 |

## Scope Boundaries

**In scope:** planning a vertical slice that proves Faculty/Admin content
authoring, a single-track approval workflow, publishing, Student
consumption, Lesson completion, Assessment completion, Grade recording,
one minimal Competency progress signal, and full audit coverage of every
step above — as *documentation*, per the rules below.

**Out of scope (this milestone, and consequently deferred from the next
implementation phase this milestone plans):**

- Any production code, database schema, migration, or API — this is a
  planning milestone, exactly as Milestone 11 was.
- The full Milestone 11 six-state Publishing Workflow (Faculty Review
  and Curriculum Committee Review as two distinct steps) — collapsed to
  a single-track Review → Approval path for this slice; the two-step
  distinction remains **Future**.
- Module, Program Version, Course Version, Lesson Version, Assessment
  Version as separate versioned entities — this slice proves the
  *workflow*, not full version immutability; see
  [Domain Impact Review](./03-domain-impact-review.md).
- The four-level Competency Mapping chain (Course Outcome → Program
  Competency → Program Learning Outcome → Institution Mission) — this
  slice proves a single, direct Lesson-to-Competency signal only.
- Question Banks, Rubrics, Competency Checklists, Randomized/Adaptive
  Assessments.
- Any new RBAC Role — every actor in this slice acts under one of the
  four already-implemented Roles (`STUDENT`, `FACULTY`,
  `PROGRAM_DIRECTOR`, `ADMINISTRATOR`), consistent with the instruction
  not to introduce new roles without ADR review.
- Any AI implementation — AI assistance remains conceptually bounded per
  [ADR-006](../../architecture/adr/ADR-006-human-reviewed-ai-governance.md)
  but nothing AI-related is built or specified for build in this slice.
- Vendor selections of any kind.

## Current / Planned / Future

| Element | Status |
|---|---|
| Milestone 10 vertical slice (Auth → RBAC → Student Learning → Faculty Grading → PD Approval → Audit) | **Current** — implemented |
| Milestone 11 full Curriculum Management & Content Engine documentation | **Current** — documented, Draft, pending approval |
| This milestone's narrow Curriculum Delivery Vertical Slice plan | **Draft** — this milestone |
| Implementation of this slice (Phases 1–6, per [Implementation Plan](./05-implementation-plan.md)) | **Planned** — begins only after this milestone is reviewed and approved |
| The remainder of the Milestone 11 engine not covered by this slice | **Future** — a subsequent slice, scoped once this one is proven, per [ADR-011](../../architecture/adr/ADR-011-vertical-slice-development-strategy.md) |

## Approval

This milestone is **Draft** pending stakeholder review. Per
[ADR-011](../../architecture/adr/ADR-011-vertical-slice-development-strategy.md),
implementation should not begin until this plan is approved — and, once
built and proven, should itself inform the scoping of the next slice
rather than triggering a jump to the full Milestone 11 engine at once.

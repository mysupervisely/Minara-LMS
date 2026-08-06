# Current / Planned / Future Capability Table

**Status:** Draft
**Milestone:** 1 — Product Vision & Platform Strategy
**Date:** 2026-08-06

## How to Read This Table

This table maps each capability described in the Phase 1 project overview
to a status bucket. These buckets describe **planning horizon**, not
implementation state — as of this document's date, **no capability has
been built**; Minara-LMS is in architecture-only Phase 1.

| Status | Meaning |
|---|---|
| **Current** | In active architectural scope for the phase underway now (Phase 1: documentation and architecture) |
| **Planned** | Expected to be in scope for near-term build-out, once architecture milestones are complete, but not yet detailed |
| **Future** | Part of the long-term platform vision; not yet scoped for near-term build-out |

**⚠️ Needs Verification:** The specific assignment of each capability to
Planned vs. Future below is this document's best-effort read of the
project overview's emphasis and dependencies (e.g., core delivery
capabilities read as nearer-term than AI-assisted or employer-marketplace
capabilities). None of these sequencing calls have been confirmed by
stakeholders or translated into an actual roadmap with dates. A dedicated
roadmap milestone should confirm or revise this table.

## Portals

| Capability | Status | Notes |
|---|---|---|
| Student Portal | Planned | Core to the platform's primary value; expected to be an early build priority |
| Faculty Portal | Planned | Required alongside Student Portal for any program to run |
| Program Director Portal | Planned | Oversight layer; depends on Student/Faculty portals existing first |
| Admissions Portal | Planned | Required to populate the platform with enrolled students |
| Clinical/Externship Coordinator Portal | Future | High-value but program-specific; depends on which programs require externships |
| Employer Portal | Future | Depends on a functioning student pipeline and evaluation history existing first |
| Admin Portal | Planned | Institution-wide oversight; needed early for permissions/finance visibility |

## Core Platform Features

| Capability | Status | Notes |
|---|---|---|
| Admissions | Planned | Entry point to the student lifecycle |
| Student Information Management | Planned | Foundational; scope relative to a possible separate SIS needs verification (see [Scope Boundaries](./09-scope-boundaries.md)) |
| Cohort Management | Planned | Needed to operate any program |
| Curriculum Delivery | Planned | Core value proposition; depends on Minara-Curriculum content structure |
| Learning Objects | Planned | Underlying unit of curriculum delivery |
| Video/Content Delivery | Planned | Needed for most modern course delivery |
| Assignments | Planned | Core teaching/learning loop |
| Assessments | Planned | Core teaching/learning loop |
| Gradebook | Planned | Core teaching/learning loop |
| Externship Tracking | Future | Program-dependent; high compliance stakes, needs dedicated design |
| Certificates | Future | Depends on completion/assessment pipeline being mature |
| Payments | Planned | Needed to operate enrollment commercially |
| Notifications | Planned | Cross-cutting; supports most other capabilities |
| Messaging | Planned | Core communication need across roles |
| AI-Assisted Learning | Future | High-value but requires human-reviewed workflow design first (see [Guiding Principles](./03-guiding-principles.md)) |
| Analytics | Future | Depends on sufficient operational data existing first |
| Reporting | Future | Depends on sufficient operational data existing first; accreditation-driven reporting needs may accelerate this |

## Current (Phase 1)

| Capability | Status | Notes |
|---|---|---|
| Product Vision & Platform Strategy documentation | Current | This milestone |
| Information Architecture / Data Model | Current (next milestone) | Anticipated as Milestone 2 |
| Technical Architecture | Future (later milestone) | Not yet started; no frameworks/vendors selected |

## ⚠️ Needs Verification (Summary)
- No dates, phases, or sequencing beyond "Current / Planned / Future" are
  confirmed.
- Whether Externship Tracking and AI-Assisted Learning should be
  reclassified as Planned (rather than Future) depends on which specific
  program launches first — not yet known.

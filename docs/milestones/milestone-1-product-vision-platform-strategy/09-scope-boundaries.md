# Scope Boundaries

**Status:** Draft
**Milestone:** 1 — Product Vision & Platform Strategy
**Date:** 2026-08-06

Minara-LMS's scope is deliberately bounded relative to the other two
repositories in the Minara ecosystem. This document exists to keep that
boundary explicit as the platform is designed, so that architecture
decisions do not accidentally absorb responsibilities that belong
elsewhere — and so that gaps between repositories are visible rather than
assumed to be "someone else's problem."

## What Minara-LMS Owns

- **Delivery** of curriculum content to learners (not authoring it)
- **Tracking** of learner progress, completion, and assessment results
- **Management** of the enrollment-to-completion workflow, including
  admissions status tracking, cohort management, and certification
  status
- **Gradebook** functionality and grading workflows
- **Externship/clinical placement tracking**: sites, placements, hours,
  evaluations
- **Payments** related to enrollment and program participation
- **Communication and messaging** between platform users
- **AI-assisted learning support**, bounded by human-reviewed workflows
- **Analytics and reporting** on platform activity, progress, and
  outcomes
- **Access control, authentication, and audit logging** for all of the
  above
- **The technical platform** that all seven portals run on

## What Minara-LMS Does NOT Own

- **Institutional vision, governance, and business planning** — owned by
  Minara-Master-Plan
- **Legal and accreditation planning/policy** (the *strategy* of
  accreditation, as opposed to the platform's *readiness* to support it)
  — owned by Minara-Master-Plan
- **Institutional policy** (e.g., academic policy, conduct policy) —
  owned by Minara-Master-Plan; the LMS *enforces and records against*
  policy, it does not *set* policy
- **Academic program design, courses, lessons, assessments, and question
  banks** — owned by Minara-Curriculum; the LMS *delivers* this content,
  it does not *author* it
- **Curricular sequencing and pedagogical design decisions** — owned by
  Minara-Curriculum

## The Interface Between Repositories

Minara-LMS is expected to **consume** structured curricular content from
Minara-Curriculum (in a form to be defined in a later, more technical
milestone) and to **operate within** the governance and policy framework
set by Minara-Master-Plan. Neither of those repositories' internal
documents are duplicated here; where LMS documentation needs to reference
a concept from either (e.g., "accreditation readiness," "a program"), it
treats that concept as an external input, not something this repository
defines authoritatively.

## What Is Explicitly Out of Scope for Phase 1

Consistent with the Phase 1 instructions, this milestone (and this
document) does not:

- Select a technology stack, frameworks, or vendors
- Define a database schema
- Write production or example code
- Finalize the definitive list of schools/programs (see
  [Supported Schools and Programs](./06-supported-schools-and-programs.md))

## ⚠️ Needs Verification
- The exact form in which Minara-Curriculum content will be
  "consumed" by Minara-LMS (e.g., structured export, API, shared format)
  is not yet defined and is expected to be addressed in a later,
  more technical milestone.
- Whether Minara-LMS is expected to also serve as the institution's
  Student Information System (SIS) of record, or whether an SIS is a
  separate system the LMS integrates with, is not yet confirmed.

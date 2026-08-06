# Platform Philosophy

**Status:** Draft
**Milestone:** 1 — Product Vision & Platform Strategy
**Date:** 2026-08-06

This document describes how Minara-LMS is meant to think of itself — the
posture it takes toward its own architecture, its relationship to the
programs and products it serves, and the way it should evolve over time.
It is a philosophy statement, not a technical design: it does not name
frameworks, services, or data structures.

## One Platform, Many Front Doors

Minara-LMS is philosophically a **single platform expressed through
multiple portals**. The Student Portal, Faculty Portal, Program Director
Portal, Admissions Portal, Clinical/Externship Coordinator Portal,
Employer Portal, and Admin Portal are different *views and permission
sets* over one underlying system — not separate applications with
separate data. This is what makes "one account, one student profile,
multiple programs, multiple schools" possible in practice: a portal is a
lens, not a boundary.

## Programs and Schools Are Configuration, Not Forks

The platform's philosophy treats a new school or a new program as
something the platform is *configured* to support, not something that
requires a new codebase or a duplicated system. This is what allows the
Prepped family (PharmTechPrepped, PharmDPrepped, MedCodePrepped,
TherapyPrepped) to be understood as **learning experiences powered by the
LMS**, rather than as separate products that happen to share a name.

## The Learner Is the Center of Gravity

Architecturally and philosophically, the student profile is the anchor
entity the platform organizes around. Enrollment, progress, grades,
externship hours, payments, and communications all relate back to one
learner identity, even when that learner participates in multiple
programs over time. The platform does not treat "a course" or "a school"
as the primary organizing unit — it treats the learner's journey as
primary, and programs/schools as the structures the learner moves
through.

## Modularity Enables Trust

Because health sciences education carries real compliance and
accreditation weight, the platform's modular boundaries are also trust
boundaries: a capability like gradebook or externship-hours tracking
should be independently auditable and independently correct, not
entangled with unrelated capabilities in ways that make its correctness
hard to verify.

## Build for the Portal That Doesn't Exist Yet

The platform is meant to anticipate that new roles, new portals, or new
program types will emerge as the institution grows (e.g., new
accreditation-driven reporting needs, new categories of partner). The
philosophy is to design extensibility points deliberately, rather than
to treat today's seven portals as a closed and final list.

## AI as an Assistant Embedded in the Platform, Not Bolted On

The AI learning assistant and any future AI-assisted features are
understood as a capability of the platform, subject to the same RBAC,
audit logging, and human-review principles as every other capability —
not as an external tool integrated at the edge.

## ⚠️ Needs Verification
- The degree to which schools/programs will require genuinely distinct
  business rules (vs. pure configuration) is not yet known and will need
  validation once specific programs (beyond the Prepped family and any
  named Minara schools) are defined in Minara-Master-Plan or
  Minara-Curriculum.

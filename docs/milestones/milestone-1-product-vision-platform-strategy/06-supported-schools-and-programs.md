# Supported Schools and Programs

**Status:** Draft
**Milestone:** 1 — Product Vision & Platform Strategy
**Date:** 2026-08-06

Minara-LMS must be architected to support multiple schools and multiple
healthcare programs under one platform. This document describes the
categories of institutional and product scope the platform must
accommodate. It does not attempt to finalize an authoritative list of
schools/programs — that list is owned by Minara-Master-Plan (institutional
scope) and Minara-Curriculum (program/course content), and this document
should be kept in sync with those sources as they mature.

## Category 1: Minara Institute of Health Sciences Schools

The core institutional schools operating under Minara Institute of Health
Sciences. The platform must support multiple such schools, each
potentially with its own programs, cohorts, faculty, and administrative
structure, while sharing the same underlying platform.

**⚠️ Needs Verification:** The specific named schools under the Minara
Institute of Health Sciences umbrella are not enumerated in this
repository as of this document's date. This should be sourced from
Minara-Master-Plan.

## Category 2: Prepped Learning Experiences

A family of focused learning products, understood architecturally as
**learning experiences powered by the LMS**, not as independent systems:

- **PharmTechPrepped**
- **PharmDPrepped**
- **MedCodePrepped**
- **TherapyPrepped**

These are treated as programs/products within the same platform, sharing
the same account and profile model as Minara's core schools, so that a
single learner identity can span, for example, enrollment in a Minara
school program and participation in a Prepped product.

**⚠️ Needs Verification:** The precise relationship between "Prepped"
products and formally accredited Minara school programs (e.g., whether
Prepped products are exam-prep/supplemental offerings distinct from
degree/certificate programs, or a delivery channel for the same
curriculum) is not yet confirmed and should be clarified in
Minara-Curriculum or Minara-Master-Plan.

## Category 3: Future Schools and Programs (Unspecified)

The platform must be architected so that schools and programs beyond
those named above can be added without structural rework. This is a
scope statement about platform capability, not a commitment to any
specific future school or program.

## Architectural Implication

Because schools and programs are expected to grow over time, and because
a learner may participate in more than one, "supported schools and
programs" is treated in this document as an **open, extensible list**,
not a fixed enumeration to be hard-coded into the platform's design
assumptions. Later architecture milestones (e.g., data model) should
reflect multi-school, multi-program membership as a core relationship,
not an edge case.

## ⚠️ Needs Verification (Summary)
- Authoritative list of Minara-chartered schools: pending
  Minara-Master-Plan.
- Authoritative list of programs per school: pending Minara-Curriculum.
- Relationship between Prepped products and accredited programs: pending
  clarification.

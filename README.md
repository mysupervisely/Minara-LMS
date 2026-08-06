# Minara-LMS

**Status:** Draft — Phase 1 (Architecture)
**Last Updated:** 2026-08-06

## What This Repository Is

Minara-LMS is the Learning Management System (LMS) that will power the Minara
Institute of Health Sciences ecosystem — the software platform responsible
for delivering and managing the educational experience across Minara's
schools, programs, and student populations.

This repository is dedicated to the **LMS platform** specifically: its
architecture, product strategy, and (in later phases) its implementation. It
does not contain institutional, curricular, or academic content.

## Relationship to Other Minara Repositories

Minara-LMS is one of three deliberately separate repositories in the Minara
ecosystem:

| Repository | Scope | Contains |
|---|---|---|
| **Minara-Master-Plan** | Institutional | Vision, governance, business planning, legal framework, accreditation planning, policies |
| **Minara-Curriculum** | Academic | Programs, courses, lessons, assessments, question banks, learning content |
| **Minara-LMS** (this repo) | Platform / Software | The system that delivers, manages, and operates the educational experience |

Minara-LMS treats institutional strategy (Master-Plan) and academic content
(Curriculum) as **inputs and consumers of the platform**, not as content this
repository owns or duplicates. Where LMS documentation references
institutional or curricular concepts, it does so only to the extent needed to
inform platform architecture, and defers to the source-of-truth repository
for the substance.

## Current Phase

**Phase 1 — Product Architecture.** This phase is documentation-only:
product vision, platform strategy, and architectural principles. No
production code, frameworks, vendors, or database schemas are being
selected yet.

## Documentation

All Phase 1 documentation lives under [`docs/`](./docs). Start with the
[documentation index](./docs/README.md).

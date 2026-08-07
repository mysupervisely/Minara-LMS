# Minara-LMS

**Status:** Milestone 10 (Foundation Build) implemented · Milestone 11 (Curriculum Management & Content Engine) documentation drafted, pending approval
**Last Updated:** 2026-08-07

## What This Repository Is

Minara-LMS is the Learning Management System (LMS) that will power the Minara
Institute of Health Sciences ecosystem — the software platform responsible
for delivering and managing the educational experience across Minara's
schools, programs, and student populations.

This repository is dedicated to the **LMS platform** specifically: its
architecture, product strategy, and implementation. It does not contain
institutional, curricular, or academic content.

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

**Milestone 10 — Foundation Build — implemented.** Milestones 1–9 and
the Architecture Decision Record (ADR) foundation (documentation-only)
are complete — see [`docs/`](./docs). This repository is a
[Next.js](https://nextjs.org) (TypeScript, App Router) application
implementing the first working vertical slice of the platform
(Authentication → RBAC → Student Learning → Faculty Grading → Program
Director Approval → Audit Trail), per
[docs/architecture/adr/README.md](./docs/architecture/adr/README.md) and
[docs/milestones/milestone-9-engineering-foundation-development-setup/](./docs/milestones/milestone-9-engineering-foundation-development-setup/).

**Milestone 11 — Curriculum Management & Content Engine — documentation
drafted, pending approval.** A documentation-only milestone specifying
the full curriculum authoring, versioning, publishing, competency
mapping, and assessment engine that extends Milestone 10's deliberately
narrow schema — see
[docs/milestones/milestone-11-curriculum-management-content-engine/](./docs/milestones/milestone-11-curriculum-management-content-engine/README.md).
No application code changes were made for Milestone 11; implementation
against it begins only after review and approval.

## Documentation

All architecture and product documentation lives under [`docs/`](./docs).
Start with the [documentation index](./docs/README.md), or the
[ADR index](./docs/architecture/adr/README.md) for the governing
architectural decisions.

## Local Development

```bash
npm install
npx prisma migrate dev   # applies the schema and creates the local SQLite database
npm run db:seed          # seeds a demo Institution/School/Program and one user per role
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). See
`docs/milestones/milestone-9-engineering-foundation-development-setup/03-development-environment-strategy.md`
for the full environment strategy this local setup implements.

```bash
npm test                 # runs the Vitest suite (auth, RBAC, and workflow tests)
npm run build             # production build
```

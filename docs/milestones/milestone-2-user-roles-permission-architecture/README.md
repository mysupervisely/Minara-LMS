# Milestone 2 — User Roles & Permission Architecture

**Status:** Draft
**Phase:** Phase 1 — Product Architecture
**Date:** 2026-08-06
**Scope:** Documentation only. No code, database schemas, or vendors are
introduced in this milestone.

## Purpose

Milestone 1 established *who* uses Minara-LMS ([Primary User Groups](../milestone-1-product-vision-platform-strategy/05-primary-user-groups.md))
and named RBAC, audit logging, and multi-school/multi-program access as
non-negotiable [Guiding Principles](../milestone-1-product-vision-platform-strategy/03-guiding-principles.md).
Milestone 2 turns those principles into a conceptual **role and access
framework**: what each role is responsible for, what each role may view,
create, edit, and approve, how roles relate to one another
institutionally, how access scopes across schools/programs/cohorts, and
what must be audited.

This remains conceptual architecture. It defines the *model* of roles and
permissions — not a database schema, not an authorization engine, and not
a specific technology (e.g., no claims/tokens format, no IAM vendor).
Those belong to a later, more technical milestone.

## Documents in This Milestone

| # | Document | Summary |
|---|---|---|
| 1 | [Role Definitions](./01-role-definitions.md) | Responsibilities and platform interactions for each of the seven roles |
| 2 | [Permission Framework](./02-permission-framework.md) | Conceptual View / Create / Edit / Approve model across platform data domains |
| 3 | [Role Hierarchy](./03-role-hierarchy.md) | Institutional and program-level reporting and approval relationships |
| 4 | [Multi-School and Multi-Program Access Model](./04-multi-school-multi-program-access-model.md) | How access scopes across schools, programs, and cohorts |
| 5 | [Audit and Accountability Framework](./05-audit-accountability-framework.md) | Requirements for tracking actions, changes, approvals, and history |

## Relationship to Milestone 1

This milestone builds directly on:

- [Primary User Groups](../milestone-1-product-vision-platform-strategy/05-primary-user-groups.md) —
  the seven roles are the same roles defined there, now elaborated.
- [Guiding Principles §6 (RBAC)](../milestone-1-product-vision-platform-strategy/03-guiding-principles.md) and
  [§9 (Audit Logging)](../milestone-1-product-vision-platform-strategy/03-guiding-principles.md) —
  this milestone is the conceptual design that fulfills those principles.
- [Supported Schools and Programs](../milestone-1-product-vision-platform-strategy/06-supported-schools-and-programs.md)
  and [Platform Philosophy](../milestone-1-product-vision-platform-strategy/04-platform-philosophy.md)'s
  "one account, one profile, multiple programs" framing — the basis for
  the multi-school/multi-program access model here.

## Alignment with Minara-Master-Plan Governance

This milestone assumes the LMS's role and permission model must reflect —
not define — Minara's institutional governance structure (who has
authority over what, and what requires escalation or approval). Because
Minara-Master-Plan's governance documents are not available within this
session, specific governance claims below (approval chains, delegation of
authority, committee-level oversight, etc.) are marked
**⚠️ Needs Verification** and should be reconciled against
Minara-Master-Plan directly before being treated as final.

## What This Milestone Does Not Do

Per the Phase 1 instructions, this milestone does not:

- Select an authorization technology, IAM vendor, or token/claims format
- Define database tables, schemas, or field-level data structures
- Write production or example code
- Finalize concrete approval-chain policy (that is Minara-Master-Plan's
  domain; this milestone documents the *shape* the LMS must be able to
  support)

## Approval

This milestone is **Draft** pending stakeholder review. Milestone 3 will
not begin until Milestone 2 is reviewed and approved.

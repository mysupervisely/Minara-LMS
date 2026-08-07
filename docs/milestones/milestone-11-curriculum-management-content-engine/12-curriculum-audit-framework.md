# Curriculum Audit Framework

**Status:** Draft
**Milestone:** 11 — Curriculum Management & Content Engine
**Date:** 2026-08-07

## Purpose

This document is the curriculum-specific extension of the
[Audit and Accountability Framework](../milestone-2-user-roles-permission-architecture/05-audit-accountability-framework.md),
answering this milestone's explicit requirement: track who created,
edited, approved, published, and archived content, with every action
timestamped. It defines requirements and their mapping onto Milestone
10's already-implemented audit mechanism — not a new logging system.

## One Audit Mechanism, Not Two

Milestone 10 built a single, append-only write path:
`recordAuditEvent()` in `src/services/audit/audit.ts`, writing to the
`AuditLog` model, viewable only by Administrator (per
[ADR-005](../../architecture/adr/ADR-005-rbac-and-audit-first-security-model.md)
and the existing [Audit Log](../milestone-4-information-architecture/08-administrator-portal.md#screens)
screen). Per
[Audit and Accountability Framework §Properties the Audit Record Must Have](../milestone-2-user-roles-permission-architecture/05-audit-accountability-framework.md#properties-the-audit-record-must-have)
("immutable / append-only... attributable... timestamped"), this
milestone's curriculum actions use that exact same mechanism — the
`CURRICULUM_*` actions named in
[Publishing Workflow](./05-publishing-workflow.md#every-transition-is-audited)
are additions to the existing `AuditAction` union, not a parallel
system. [Curriculum Audit History](./09-curriculum-administration-portal.md#screens)
is a *filtered view* of the one Audit Log, not a second log.

## What Is Tracked, Mapped to This Milestone's Required List

| Requirement | How It's Captured |
|---|---|
| **Who created content** | `CURRICULUM_DRAFT_CREATED`, actor = the Faculty (or Administrator, for a new Course/Program) who created it |
| **Who edited content** | Every edit to a Draft either updates the Draft row in place (pre-Publish) or creates a new version (post-Publish, per [Versioning Strategy](./04-versioning-strategy.md)); both paths are actor-attributed. A pre-Publish Draft edit is not separately logged per keystroke — consistent with Milestone 10's existing pattern of logging consequential actions, not every field change — but every *state transition* is |
| **Who approved content** | `CURRICULUM_APPROVED`, actor = the Program Director or Administrator who completed Curriculum Committee Review, per [Publishing Workflow](./05-publishing-workflow.md#no-new-role-curriculum-committee-review-uses-existing-authority) |
| **Who published content** | `CURRICULUM_PUBLISHED`, actor = Administrator |
| **Who archived content** | `CURRICULUM_ARCHIVED`, actor = Administrator |
| **Timestamp every action** | `AuditLog.createdAt`, set automatically on every write, exactly as Milestone 10 already does for every other action |

## Version-Level Attribution

Because [Versioning Strategy](./04-versioning-strategy.md) guarantees a
Published version's content never changes, and every transition is
individually audit-logged with the specific version's ID in
`AuditLog.entityId`, the audit trail and version history are two views
of the same underlying fact: **Version History** (per
[Faculty Content Management Portal](./10-faculty-content-management-portal.md#screens))
answers "what did this content look like at version N," and **Curriculum
Audit History** answers "who moved version N through the workflow, and
when" — together they fully reconstruct a piece of content's history,
satisfying
[Audit and Accountability Framework §4 (History Tracking)](../milestone-2-user-roles-permission-architecture/05-audit-accountability-framework.md#4-history-tracking)
for curriculum specifically.

## AI-Assisted Drafts Are Logged as Such

Per [Human-Reviewed AI Workflows](../milestone-2-user-roles-permission-architecture/05-audit-accountability-framework.md#relationship-to-human-reviewed-ai-workflows)
(already established in Milestone 2) and this milestone's AI boundary,
any content originating from an AI suggestion (a drafted Learning
Objective, a suggested Question, a Rubric suggestion) is flagged in the
audit metadata as AI-assisted, with the accepting Faculty member as the
attributed actor of record — AI itself is never the `actorId` on an
Audit Log entry, consistent with `AuditLog.actorId` being a nullable
reference to a `User`, not to an AI system.

## Current / Planned / Future

| Element | Status |
|---|---|
| Single append-only `AuditLog` mechanism, Administrator-only visibility | **Current** — implemented, Milestone 10 |
| `CURRICULUM_*` audit actions (create/review/approve/publish/archive/restore) | **Planned** — designed in [Publishing Workflow](./05-publishing-workflow.md#every-transition-is-audited) |
| Curriculum-filtered Audit History view | **Planned** |
| AI-assisted content flagged in audit metadata | **Planned** |
| Audit export for accreditation review | **Future** — inherited, unresolved, from [Audit and Accountability Framework](../milestone-2-user-roles-permission-architecture/05-audit-accountability-framework.md#properties-the-audit-record-must-have) |

## ⚠️ Needs Verification

- Whether Program Director should gain scoped (Program-only) visibility
  into curriculum-specific audit history, versus the current
  Administrator-only Audit Log visibility — this is the same open
  question [Administrator Portal](../milestone-4-information-architecture/08-administrator-portal.md#-needs-verification)
  already flagged generally ("scoped audit visibility for Program
  Directors — Future"), not newly resolved here.

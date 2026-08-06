# Audit and Accountability Framework

**Status:** Draft
**Milestone:** 2 — User Roles & Permission Architecture
**Date:** 2026-08-06

This document extends the [Guiding Principles §9 (Audit Logging)](../milestone-1-product-vision-platform-strategy/03-guiding-principles.md)
principle into a conceptual framework for what must be tracked, why, and
who can rely on that record. It defines requirements, not a technical
logging implementation, storage format, or retention system.

## Why This Matters

Every role defined in this milestone can create, edit, or approve records
that carry academic, financial, or clinical/compliance weight. Because
health sciences programs answer to accreditation bodies, licensure
requirements, and institutional governance, the platform's credibility
depends on being able to answer, for any consequential record: **who did
what, when, and under what authority.**

## What Must Be Tracked

### 1. User Actions
Every authenticated action that reads or affects a record of consequence
should be attributable to the specific person and role assignment that
performed it — not just "a Faculty Instructor," but *which* Faculty
Instructor, acting under *which* role assignment and scope (see
[Multi-School and Multi-Program Access Model](./04-multi-school-multi-program-access-model.md)).

At minimum, this includes:
- Authentication events (login, logout, failed login attempts)
- Access to sensitive records (e.g., viewing another person's grades,
  payment information, or externship evaluation)
- Any Create, Edit, or Approve action defined in the
  [Permission Framework](./02-permission-framework.md)

### 2. Changes
For any record that is edited (not just created), the platform must be
able to answer:
- What was the value **before** the change?
- What was the value **after** the change?
- Who made the change, and when?
- Under what role assignment/scope was the change made?

This applies with particular weight to: grades, enrollment status,
externship hours, evaluations, payments, certificates, and role/permission
assignments.

### 3. Approvals
Every approval action defined in the [Permission Framework](./02-permission-framework.md)
and [Role Hierarchy](./03-role-hierarchy.md) (e.g., grade change
approval, externship placement approval, certificate issuance, role
assignment approval) must record:
- Who approved it
- What was approved (the specific record/version)
- When it was approved
- What, if anything, was requested/originated by someone else prior to
  approval (to preserve the originator-approver relationship)

### 4. History Tracking
The platform must preserve **full history**, not just current state, for
records of consequence. A record's current value is not sufficient for
accreditation or dispute-resolution purposes — the platform must be able
to reconstruct what a record looked like, and who was responsible for it,
at any prior point in time.

## Properties the Audit Record Must Have

- **Immutable / append-only.** Audit entries are never edited or deleted
  by any role, including Administrator. Correcting a mistake creates a
  new record; it does not erase the old one.
- **Attributable.** Every entry ties to a specific person and role
  assignment — never an anonymous or purely systemic action, except for
  clearly-labeled automated system events (e.g., a scheduled process),
  which are themselves logged as such.
- **Timestamped.** Every entry has a reliable timestamp.
- **Independently viewable.** Administrators (and, per the
  [Permission Framework](./02-permission-framework.md), only
  Administrators in the current conceptual model) can view the audit log
  itself — the audit trail is not something any operational role can
  inspect, edit, or suppress for their own actions.
- **Exportable for review.** The audit trail must be producible in a form
  suitable for accreditation review, institutional audit, or dispute
  resolution. **⚠️ Needs Verification:** specific export formats and
  review workflows are not yet defined.

## Relationship to Human-Reviewed AI Workflows

Per [Guiding Principles §10](../milestone-1-product-vision-platform-strategy/03-guiding-principles.md),
any AI-assisted action that influences a record of academic or clinical
consequence must be logged with the same accountability properties as a
human action — including which human reviewed or approved the
AI-influenced outcome. The AI system itself is never the accountable
party of record; the reviewing human is.

## Retention

**⚠️ Needs Verification:** How long audit records must be retained
(e.g., for the life of a student's relationship with the institution,
for a fixed period after program completion, or indefinitely) depends on
accreditation and legal requirements not yet documented in this
repository. This framework assumes retention will need to be at least as
long as the underlying academic/clinical record it documents, pending
confirmation from Minara-Master-Plan.

## Current / Planned / Future

| Element | Status |
|---|---|
| Principle: all consequential actions are attributable and immutable | **Current** |
| Conceptual scope of what's tracked (actions, changes, approvals, history) as defined above | **Current** |
| Administrator-only audit log visibility | **Current** (per [Permission Framework](./02-permission-framework.md)) |
| Concrete retention policy | **Planned**, pending Minara-Master-Plan / accreditation input |
| Exportable audit reports for accreditation review | **Planned** |
| Field-level (not just record-level) change history | **Planned** |
| Real-time anomaly detection / suspicious-activity alerting | **Future** |
| Self-service audit trail access for Program Directors within their own program scope | **Future** — would need to be weighed against the "Administrator-only" principle above |

## ⚠️ Needs Verification (Summary)

- Retention duration and disposal policy: pending Minara-Master-Plan /
  accreditation and legal input.
- Whether any role besides Administrator should have scoped audit
  visibility (e.g., a Program Director seeing audit history within their
  own program) is an open question, not yet resolved in favor of either
  answer.
- Specific accreditation bodies' evidentiary requirements for audit
  records are not yet known (see also
  [Guiding Principles](../milestone-1-product-vision-platform-strategy/03-guiding-principles.md)
  §11).

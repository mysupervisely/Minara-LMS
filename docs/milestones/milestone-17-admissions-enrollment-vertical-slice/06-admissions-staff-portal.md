# Admissions Staff Portal

**Status:** Implemented
**Milestone:** 17 — Admissions & Enrollment Vertical Slice
**Date:** 2026-08-12

All screens below live under `src/app/(portal)/admissions/`, gated by
`requireSessionUserWithRole("ADMISSIONS_STAFF")` (Administrator passes
via that check's own bypass, per every other portal in this codebase).

## `/admissions` — Dashboard

Stat cards (mirroring `admin/page.tsx`'s shape): Awaiting Review
(`SUBMITTED`), Under Review, Awaiting Applicant Response (`ACCEPTED`),
and Requirements Needing Attention (`MISSING`/`NEEDS_VERIFICATION`
checklist rows across every Application) — each linking into the
relevant queue below.

## `/admissions/applications` — Applications Queue

Two sections: **Active** (`SUBMITTED`, `UNDER_REVIEW`, `ACCEPTED`,
`ACCEPTANCE_CONFIRMED`, `WAITLISTED`, `DEFERRED`) and **History**
(`ENROLLED`, `DENIED`, `ACCEPTANCE_DECLINED`). Institution-wide, per
`ADMISSIONS_STAFF`'s established scope (see
[Admissions RBAC Design](./04-admissions-rbac-design.md)) — every
Program's Applications appear in one queue, each row showing a
requirements-needing-attention count.

## `/admissions/applications/[applicationId]` — Application Detail

- Applicant Notes (if any), read-only.
- **Checklist**: every `ApplicationRequirement`, each with an inline
  status-update form (`RECEIVED`/`MISSING`/`NEEDS_VERIFICATION`/
  `NOT_APPLICABLE` — a `<select>`, never freeform, matching the
  service's own fixed-union validation) and a note field. An "Add
  Checklist Item" form for ad hoc requirements beyond the two starter
  rows.
- **"Move Into Review"** (when `SUBMITTED`) / **"Reopen for Review"**
  (when `WAITLISTED`/`DEFERRED`).
- **Decision** (when `UNDER_REVIEW`): four forms — Accept, Waitlist,
  Defer, Deny — each with an optional reason field, calling
  `recordDecisionAction` bound to its own `Decision` value.
- **Cohort Assignment** (when `ACCEPTED`/`ACCEPTANCE_CONFIRMED`): a
  `<select>` populated from `listCohortsForProgram`.
- **"Complete Enrollment"** (when `ACCEPTANCE_CONFIRMED` and a Cohort is
  assigned) — calls `createEnrollmentFromApplication`.

## `/admissions/requirements` — Requirements Needing Attention

The brief's suggested `/admissions/requirements` route: a flat,
cross-Application list of every checklist row currently `MISSING` or
`NEEDS_VERIFICATION`, each linking back into its Application's detail
page. Exists precisely so nothing needing attention is only discoverable
by opening every Application one at a time.

## Administrator Access

No separate Administrator-only admissions screen was built — an
Administrator reaches every `/admissions/*` route directly and passes
every check there via that check's own `isAdministrator` bypass, the
same "Administrator reuses another role's portal" pattern Milestone 15's
Coordinator Portal and Milestone 16's Program Director portal already
established. The Administrator dashboard (`/admin`) gained one new stat
card ("Applications Awaiting Admissions") linking into
`/admissions/applications` for discoverability.

## Current / Planned / Future

| Element | Status |
|---|---|
| Dashboard, Applications queue, Application detail, Requirements queue | **Implemented** |
| Checklist update, ad hoc requirement addition | **Implemented** |
| Decision recording (Accept/Deny/Waitlist/Defer) | **Implemented** |
| Cohort assignment, Enrollment completion | **Implemented** |
| Administrator oversight (reuses this same portal) | **Implemented** |
| Bulk actions, saved filters, search | **Future** |

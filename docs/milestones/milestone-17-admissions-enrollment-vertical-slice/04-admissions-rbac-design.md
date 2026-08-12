# Admissions RBAC Design

**Status:** Implemented
**Milestone:** 17 — Admissions & Enrollment Vertical Slice
**Date:** 2026-08-12

## No New Role

Per this milestone's explicit instruction, `ADMISSIONS_STAFF` — already
declared in `src/domain/roles.ts` since Milestone 10 but dormant — is
*activated*, the same treatment `CLINICAL_COORDINATOR` received in
Milestone 15. Its shape (`ROLES`, `ROLE_LABELS`, `ROLE_SCOPE`) required
zero changes; only `IMPLEMENTED_ROLES` gained one entry and
`ROLE_HOME_ROUTE.ADMISSIONS_STAFF` was pointed at the new `/admissions`
portal instead of its previous placeholder (`/admin`).

"Applicant" is explicitly **not** a Role. A User can hold an Application
with zero Role Assignments — the same framing
[Admissions Workflows](../milestone-3-student-journey-core-workflows/03-admissions-workflows.md)
itself uses: *"Prospective Student / Applicant — not yet a 'Student' role
in the platform sense until Enrollment."* Ownership of an Application is
enforced by `actor.id === applicantId`, the identical "self" pattern
`ROLE_SCOPE.STUDENT` already uses for a Student's own records.

## Per-Role Authority Table

| Role | Authority |
|---|---|
| **Applicant** (any User, no Role required) | Start/save/submit their own Application; view their own Application, checklist, and Decision; confirm/decline their own offer. Cannot view another Applicant's Application. Cannot record a Decision, even on their own Application. Cannot create their own Enrollment, even after confirming. |
| **Admissions Staff** | View every Application institution-wide (see below); move an Application into review; update checklist items; record a Decision (Accept/Deny/Waitlist/Defer); assign a Cohort; create the Enrollment. |
| **Program Director** | Read-only: view Applications for their own Program(s) only. No Decision authority, no checklist edits, no Cohort assignment, no Enrollment action — see "Why Program Director Stays Read-Only" below. |
| **Administrator** | Everything Admissions Staff can do, institution-wide, via the same functions' Administrator bypass (`isAdministrator` check) — no separate Administrator-only admissions code path. |
| **Clinical Coordinator** | No admissions authority. Untouched by this milestone. |
| **Faculty** | No admissions authority. Untouched by this milestone. |
| **Student** (post-Enrollment) | No special admissions authority beyond what any User already has for their own historical Applications (`/apply`), if they choose to look. |

## Why Admissions Staff Is Institution-Wide, Not Program-Scoped

`ADMISSIONS_STAFF`'s `ROLE_SCOPE` has been `"institution"` — the same
class as `ADMINISTRATOR` — since Milestone 10, confirmed unchanged by
[Multi-School and Multi-Program Access Model §Institution-wide](../milestone-2-user-roles-permission-architecture/04-multi-school-multi-program-access-model.md)
("Institution-wide | Administrator (default); potentially Admissions
Staff"). This milestone's brief asked for "authorized Programs/Schools"
scoping and a "cross-program admissions access denied" test — but
`ADMISSIONS_STAFF`'s scope was already fixed by earlier, foundational
architecture this milestone is instructed not to redesign. Rather than
introducing a new per-Program Admissions Staff scope (which would be a
genuine, disclosed architectural change, not an implementation detail),
this milestone honors the existing scope and interprets the brief's
isolation requirement as applying to the role that is genuinely
Program-scoped in this architecture: **Program Director**.
`listApplicationsForProgram` denies a Program Director access to another
Program's Applications; `listApplicationsForAdmissions` correctly grants
an Admissions Staff User visibility across every Program, by design —
both behaviors are tested explicitly (see
[Testing & Browser Verification](./09-testing-browser-verification.md)).

## Why Program Director Stays Read-Only

[Admissions Workflows](../milestone-3-student-journey-core-workflows/03-admissions-workflows.md)
itself flags the exact division of Decision authority between Admissions
Staff and Program Director as **⚠️ Needs Verification** — "the final
approval line is not yet confirmed against Minara-Master-Plan." Per this
milestone's own Phase 6 instruction — *"If [the documentation] does not
[establish Program Director approval], keep Program Director admissions
involvement read-only... and document ⚠️ Needs Verification"** — Program
Director gets a dedicated read-only screen
(`/program-director/admissions`) and zero write authority anywhere in
`admissions.ts`. No Decision function, checklist-update function, or
Cohort/Enrollment function accepts a Program-Director-only authorization
path.

## Service-Layer Enforcement

Every function in `src/services/admissions/admissions.ts` asserts its
own authorization via `hasAnyRole`/`isAdministrator`/`hasRoleForProgram`
from `src/services/identity/rbac.ts` — the same Next.js-independent
module Milestone 15 split out and Milestone 16 continued to use. No
function in this module relies solely on its `actions.ts` caller's
`requireSessionUserWithRole` check; a direct, unauthorized service call
fails closed with `ApplicationAuthorizationError`, verified explicitly in
tests.

## Current / Planned / Future

| Element | Status |
|---|---|
| `ADMISSIONS_STAFF` activated, `ROLE_SCOPE` unchanged | **Implemented** |
| Applicant ownership via User identity, not a new Role | **Implemented** |
| Program Director read-only admissions visibility | **Implemented** |
| Service-layer-enforced authorization throughout | **Implemented** |
| Exact Admissions-Staff/Program-Director Decision-authority split | **⚠️ Needs Verification** — see [doc 10](./10-needs-verification.md) |

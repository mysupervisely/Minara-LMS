# Portal Impact

**Status:** Implemented
**Milestone:** 16 — Certificate & Graduation Vertical Slice
**Date:** 2026-08-11

Every screen below extends an existing portal rather than introducing a
new one — the same "extend, don't replace" discipline used in every
milestone since 10.

## Student Portal

**New:** `/student/graduation` — "Graduation & Certificate," linked from
the shared portal nav (`src/app/(portal)/layout.tsx`).

Per-enrollment, read-only:
- ALUMNI badge, when `Enrollment.status === "ALUMNI"`.
- Eligibility breakdown (academic completion; externship completion, only
  shown when the Program requires one) and, when not yet eligible, the
  full `missingRequirements` list.
- Graduation Request status badge, including the return reason when
  `RETURNED`.
- Certificate details (credential number, issue date) once issued.

No form, button, or Server Action on this page — a Student cannot
self-submit for review, self-approve, or self-issue their own
Certificate, per this milestone's explicit instruction. Every value is
resolved server-side from the authenticated Student's own `user.id`
(never a client-supplied `studentId`), and the underlying service
functions (`determineGraduationEligibility`,
`getGraduationRequestForStudent`) independently re-assert that the
caller is either that Student or has Program oversight — the same
fail-closed, service-layer-enforced authorization introduced in
Milestone 15.

## Program Director Portal

**New:** `/program-director/graduation` — "Graduation Candidates," linked
from the shared nav.

- Every actively-enrolled (`Enrollment.status === "ACTIVE"`) Student
  across every Program this Program Director oversees (or, for an
  Administrator viewing this screen, every Program institution-wide —
  the same Administrator-fallback pattern used on
  `program-director/page.tsx` since Milestone 13).
- Live eligibility badge and missing-requirements text per Student —
  never a stored value.
- Existing Graduation Request status, when one exists.
- A "Submit for Review" button, shown only when the Student is currently
  eligible and has no active (non-`RETURNED`) request — a one-click
  action (`submitForGraduationReviewAction`), matching the same
  plain-`<form action={...}>` convention as `approvePlacementAction`
  (Milestone 15) rather than a multi-field form.
- A "Review" link for any `SUBMITTED`/`APPROVED` request, leading to:

**New:** `/program-director/graduation/[requestId]` — candidate detail.

- The requirements breakdown that supports the decision, re-computed
  live (not read from the audited snapshot taken at submission time), so
  the Program Director always reviews the Student's current standing.
- "Approve Graduation" (one-click) and "Return for Further Work"
  (`ReturnGraduationForm`, a required-reason `useActionState` form
  identical in shape to `return-completion-form.tsx` from Milestone 15),
  shown only while `status === "SUBMITTED"`.
- A read-only status summary (approved/awaiting issuance,
  certificate-already-issued, or the return reason) once the request has
  moved past `SUBMITTED`.

## Administrator Portal

**New:** `/admin/graduation` — "Certificate Issuance," linked from the
shared nav.

- "Awaiting Issuance": every `APPROVED` Graduation Request,
  institution-wide (mirrors `admin/content/page.tsx`'s Publishing Queue —
  the same institution-wide-Administrator-authority pattern applied to a
  fifth approval gate).
- "Issued Certificates": full issuance history (Student, Program,
  credential number, issue date, issuing Administrator).

**New:** `/admin/graduation/[requestId]` — issuance detail. "Issue
Certificate" (one-click `issueCertificateAction`) when `APPROVED`; the
issued Certificate's details once `CERTIFICATE_ISSUED`.

**Modified:** `/admin` (dashboard) — two new `StatCard`s added to the
existing parallel-query array in `src/app/(portal)/admin/page.tsx`:
Graduation Requests awaiting issuance (count where
`status === "APPROVED"`), and Certificates issued (total count).

## Clinical Coordinator Portal

**No changes.** Per this milestone's explicit instruction, the
Coordinator's existing Milestone 15 workflow (submit/verify externship
completion) is unmodified — its `Placement.completionStatus ===
"VERIFIED"` output simply becomes one of the facts
`determineGraduationEligibility` reads. The Coordinator has no
graduation- or certificate-specific screen, action, or authority.

## Faculty Portal

**No changes.** Faculty's existing role (author/grade content) is
unmodified; Faculty has no graduation-review or certificate-issuance
authority per the brief's authority table.

## Shared Navigation

`src/app/(portal)/layout.tsx` — one new nav link per role that gained a
screen:

| Role | Link |
|---|---|
| Student | `/student/graduation` — "Graduation & Certificate" |
| Program Director | `/program-director/graduation` — "Graduation Candidates" |
| Administrator | `/admin/graduation` — "Certificate Issuance" |

## Current / Planned / Future

| Element | Status |
|---|---|
| Student Graduation & Certificate view | **Implemented** |
| Program Director Graduation Candidates + review detail | **Implemented** |
| Administrator Certificate Issuance queue + detail + dashboard stats | **Implemented** |
| Coordinator/Faculty portal changes | **Not built** — none required by this slice |
| Certificate download/print view | **Future** — see [Known Limitations](./09-known-limitations-future-expansion.md) |

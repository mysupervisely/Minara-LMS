# Known Limitations & Future Expansion

**Status:** Implemented
**Milestone:** 16 — Certificate & Graduation Vertical Slice
**Date:** 2026-08-11

This milestone's brief named an explicit exclusion list. Each item below
restates the exclusion and explains why it stays out of scope for this
narrow vertical slice, consistent with
[ADR-011](../../architecture/adr/ADR-011-vertical-slice-development-strategy.md)'s
incremental strategy.

| Excluded | Rationale |
|---|---|
| **Full graduation audit engine** (rules engine, requirement types, per-Program configurable requirement sets) | The eligibility computation ([03](./03-graduation-eligibility-design.md)) is deliberately a fixed function, not a rules engine, because no real Program-specific requirement set (GPA, hours, competencies) is yet known — inventing a rules engine to hold requirements this repository has no authority to define would be worse than not building one. The function's `missingRequirements: string[]` shape is an explicit extension point for when real requirements arrive. |
| **Transcript management** | A transcript is a distinct academic record (course-by-course history, credit hours, grade point values) this milestone does not model or expose. Nothing here claims to be a transcript. |
| **Continuing education** | No post-graduation education tracking exists or is implied by Alumni status — Alumni here means only "this Enrollment reached its terminal, successfully-completed state." |
| **Credential verification integrations** | No third-party verification network, public verification API, or public verification URL — see [Certificate Model & Design](./04-certificate-model-design.md). |
| **External accreditation integrations** | No accreditation body's system is modeled, called, or assumed compatible with. |
| **Automated legal/compliance determinations** | Nothing in `determineGraduationEligibility` claims legal or regulatory sufficiency for licensure, certification, or accreditation purposes — it only reflects what this platform's own records show was completed and approved. |
| **Payment processing** | No tuition, fee, or balance check gates graduation or certificate issuance in this slice. |
| **AI functionality** | No AI/ML component was introduced anywhere in this milestone — eligibility is a deterministic, auditable function. |
| **Digital badge infrastructure** | No Open Badges/verifiable-credential issuance; the `Certificate` model is deliberately the smallest useful representation, not a badge platform. |
| **PDF certificate generation** | Not "minimal and necessary" to prove the vertical slice — the Student's portal renders the Certificate's fields directly; no document-rendering dependency was introduced. |
| **External employer functionality** | `EMPLOYER_PARTNER` remains dormant, per the brief's explicit instruction; no employer-facing verification, portal, or notification exists. |
| **New RBAC roles** | None created. All authority reuses the five already-implemented roles — see [Implementation Completion Record](./07-implementation-completion-record.md#rbac-changes). |
| **Automated interpretation of unspecified Pharmacy Technology requirements** | No GPA threshold, specific course list, specific competency, specific evaluation score, or specific hour count is checked or invented anywhere — see [Graduation Eligibility Design](./03-graduation-eligibility-design.md)'s "Fail-Closed by Construction" section and its ⚠️ Needs Verification list. |

## Additional Limitations Not in the Original Exclusion List

- **No Certificate revocation or re-issuance workflow.** `Certificate.status`
  exists as a field (currently only ever `"ISSUED"`) specifically so this
  can be added later without a schema change, but no revocation authority,
  reason-tracking, or re-issuance path is built here.
- **No downloadable/printable Certificate view.** The Student sees the
  Certificate's fields on `/student/graduation`; there is no distinct
  print-formatted or downloadable representation.
- **No notification (email, in-app) on status changes.** Submission,
  approval, return, and issuance are all visible on-demand in each role's
  portal, but no push/email notification fires — consistent with no prior
  milestone having built a notification system either.
- **Graduation submission authority collapsed onto Program Director /
  Administrator** rather than a distinct role, since the brief's
  authority table did not assign it elsewhere — see
  [Implementation Completion Record §Architectural Decisions Discovered](./07-implementation-completion-record.md#architectural-decisions-discovered)
  for the full reasoning on why this is a disclosed implementation choice,
  not an ADR-level commitment.

## ⚠️ Needs Verification (Carried Forward)

- Specific Pharmacy Technology graduation requirements (minimum GPA,
  course list, specific competencies, specific evaluation scores),
  pending Minara-Curriculum, per ADR-008.
- Whether a Program-level "minimum requirements" configuration should
  eventually become real data, once such requirements are known.
- Whether Minara's eventual registrar/credentialing process expects a
  different credential-number scheme than this slice's internal
  placeholder.
- Whether, and under what governance, a Certificate should ever be
  revoked or reissued.

## Recommended Direction for Future Milestones

This vertical slice completes the Student Lifecycle Workflow's full arc
(Enrollment → Learning → Grading → Externship → Graduation → Alumni) for
the first time end-to-end. Candidates for a future milestone include:
Certificate revocation/re-issuance governance; a downloadable Certificate
view; Program-level configurable graduation requirements once
Minara-Curriculum supplies real Pharmacy Technology data; or a return to
Milestone 11's broader Curriculum Management & Content Engine, now that
every vertical slice recommended by Milestone 15's ranking has been
built. Per this milestone's own explicit instruction, no such follow-on
work begins automatically — this is a recommendation for the next
planning conversation, not a commitment.

## Current / Planned / Future

| Element | Status |
|---|---|
| Everything in the "Excluded" table above | **Deliberately out of scope** for this milestone |
| Certificate revocation/re-issuance | **Future** |
| Downloadable/printable Certificate view | **Future** |
| Notifications on status change | **Future** |
| Program-level configurable requirements | **Future** — pending Minara-Curriculum |

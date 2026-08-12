# Known Limitations & Future Expansion

**Status:** Implemented
**Milestone:** 17 — Admissions & Enrollment Vertical Slice
**Date:** 2026-08-12

This milestone's brief named an explicit exclusion list. Each item below
restates the exclusion and explains why it stays out of scope for this
narrow vertical slice, consistent with
[ADR-011](../../architecture/adr/ADR-011-vertical-slice-development-strategy.md)'s
incremental strategy.

| Excluded | Rationale |
|---|---|
| **Tuition payments, payment plans, refunds, scholarships, financial aid, Title IV** | No billing/financial system exists anywhere in this platform; nothing about admission or enrollment is gated on payment in this slice. |
| **Transcript collection / official transcript generation** | A transcript is a distinct academic record this milestone does not model, request, or verify. The `applicantNotes` field is a free-text note, not a transcript substitute. |
| **Background checks, immunization tracking, criminal-history records** | No such data is collected, stored, or referenced — consistent with this milestone's explicit Phase 12 instruction not to introduce sensitive data unnecessarily. |
| **Student interviews (unless already required)** | None were established as required by any authoritative source, so none are modeled. |
| **Automated document OCR** | No document upload/storage mechanism exists in this slice at all — the checklist tracks status, never a file. |
| **External CRM integration** | No third-party admissions/CRM system is called or assumed compatible with. |
| **Email/SMS automation beyond existing capability** | No notification system exists anywhere in this platform pre- or post-Milestone-17; none was introduced here either. |
| **AI admissions decisions, AI applicant scoring, automatic acceptance decisions** | Every Decision (`ACCEPTED`/`DENIED`/`WAITLISTED`/`DEFERRED`) requires an explicit Admissions Staff/Administrator action — `recordDecision` has no rule engine, no scoring, no automation of any kind. |
| **Full registration / advanced Cohort capacity management** | Cohort assignment is a single manual `<select>` — no capacity limits, no scheduling, no conflict detection. |
| **Certificate/graduation changes, externship redesign** | Neither `graduation.ts` nor `externship.ts` was modified — verified by the untouched regression test (point 26) and by this milestone's own file-change list. |
| **Employer Portal** | `EMPLOYER_PARTNER` remains dormant; no employer-facing functionality was added. |
| **Analytics dashboards** | The Admissions dashboard's stat cards are simple counts, not analytics — no trend, funnel, or reporting layer. |
| **Broad public website redesign** | The public layout/nav is unchanged except for one new "Apply" button on the Program detail page and the new `/apply/program/[slug]` route. |

## Additional Limitations Not in the Original Exclusion List

- **No document upload of any kind.** The checklist tracks a status and
  a free-text note per requirement — it never receives, stores, or links
  to an actual file. Marking a requirement `RECEIVED` is a staff
  assertion, not a verified artifact.
- **No notification on status change.** Submission, Decision, offer
  confirmation, and Enrollment are all visible on-demand in each
  audience's own portal, but nothing pushes a notification (email,
  in-app, or otherwise).
- **No Cohort-capacity enforcement.** Multiple Applications can be
  assigned to (and enrolled into) the same Cohort with no limit —
  matching this milestone's explicit "no advanced Cohort capacity
  management" exclusion.
- **No Application withdrawal action.** [Admissions Workflows](../milestone-3-student-journey-core-workflows/03-admissions-workflows.md)'s
  diagram includes an Applicant-initiated withdrawal exit path (before
  or after being Waitlisted); this slice does not implement a distinct
  "Withdraw" action — an Applicant who wants to stop can simply not
  proceed (there is no forcing function requiring further action from
  them).
- **No cross-Application uniqueness constraint.** An Applicant can, in
  principle, start Applications to multiple Programs, or (once one
  reaches a terminal state) start a new one for the same Program —
  neither is exercised by this milestone's tests or seed data, so
  neither is claimed to be fully verified.

## ⚠️ Needs Verification (Carried Forward)

See [⚠️ Needs Verification](./10-needs-verification.md) for the full,
dedicated list — reapplication policy, exact Decision-authority split,
deferral re-entry mechanics, multi-Program application, real Pharmacy
Technology requirements, Cohort capacity rules, and account-retention
policy.

## Recommended Direction for Future Milestones

This vertical slice completes the *first* leg of the Student Lifecycle
Workflow — the platform can now genuinely admit a real Student, closing
the loop with Milestone 16's Certificate & Graduation slice at the other
end. The full Student Lifecycle Workflow (Admissions → Enrollment →
Learning → Assessment → Grade → Externship → Graduation → Alumni) is now
demonstrable end-to-end for the first time. Candidates for a future
milestone include: document upload/verification for the Admissions
checklist; a real Program-specific requirement set once
Minara-Curriculum supplies authoritative data; Cohort capacity
management; or a return to Milestone 11's broader Curriculum Management
& Content Engine. Per this milestone's own explicit instruction, no
such follow-on work begins automatically — this is a recommendation for
the next planning conversation, not a commitment.

## Current / Planned / Future

| Element | Status |
|---|---|
| Everything in the "Excluded" table above | **Deliberately out of scope** for this milestone |
| Document upload/verification | **Future** |
| Notifications on status change | **Future** |
| Cohort capacity enforcement | **Future** |
| Explicit Application withdrawal action | **Future** |
| Real Pharmacy Technology requirement set | **Future** — pending Minara-Curriculum |

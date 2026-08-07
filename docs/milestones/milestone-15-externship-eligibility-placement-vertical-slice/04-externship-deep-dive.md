# Externship Management — Deep Dive

**Status:** Draft
**Milestone:** 15 — Planning (Architecture Checkpoint, Question 4)
**Date:** 2026-08-07
**Source:** [Externship Management Workflow](../milestone-3-student-journey-core-workflows/04-externship-management-workflow.md),
[Clinical & Externship Domain Model](../milestone-5-domain-model-data-architecture/05-clinical-externship-domain-model.md),
[Clinical/Externship Coordinator Portal](../milestone-4-information-architecture/06-clinical-coordinator-portal.md),
[Employer Portal](../milestone-4-information-architecture/07-employer-portal.md),
[ADR-008](../../architecture/adr/ADR-008-pharmacy-technology-first-launch.md)

Every item below is evaluated against three questions: what exists
today, what a deliberately narrow first slice should include, and what
must not be invented. No hour figure, competency threshold, site
requirement, or qualification standard below is a real number — none
exists anywhere in this repository's documentation, and none is
fabricated here, per this milestone's explicit instruction.

## Item-by-Item Evaluation

| # | Item | Current State | Narrow-Slice Scope | ⚠️ Needs Verification |
|---|---|---|---|---|
| 1 | **Eligibility** | Not implemented. Docs: Coordinator confirms eligibility from academic record; automated computation is Future. | **IN**, minimal — Coordinator marks a Student eligible, referencing existing Grade/Enrollment data manually; no rule engine. | Specific prerequisite courses/competencies required for eligibility — pending Minara-Curriculum. |
| 2 | **Site approval** | Not implemented. Docs: Coordinator approves; Employer confirms willingness to host. | **IN**, narrowed to Coordinator-only approval — no Employer-side confirmation step (Employer login deferred, see #20). | Whether Employer confirmation is a hard requirement or can be Coordinator-attested in the interim. |
| 3 | **Site availability** | Not implemented. Docs: Coordinator-maintained capacity. | **IN**, minimal — a capacity count on Clinical Site, Coordinator-maintained. Real-time Employer-side updates already tagged Future by the source doc. | None beyond what the source doc already flags. |
| 4 | **Student placement** | Not implemented. | **IN** — the core record of this slice (Student ↔ Clinical Site, status lifecycle). | None. |
| 5 | **Placement conflicts** | Not defined in any source document (no double-booking or scheduling-conflict rule exists anywhere in Milestones 1–14). | **IN**, minimal only — enforce at most one Active Placement per Student per Externship requirement (a structural guard, mirroring M14's "one version in flight" rule), not a scheduling engine. | Full scheduling-conflict detection is undocumented anywhere — explicitly not invented here. |
| 6 | **Coordinator assignment** | Partial — `CLINICAL_COORDINATOR` already declared and scoped (`"program"`) in `src/domain/roles.ts`, just not in `IMPLEMENTED_ROLES`. | **IN** — activate the existing declared role via the existing Admin role-assignment screen; no new RBAC mechanism. | None — this is activating dormant architecture, not a new decision. |
| 7 | **Preceptor information** | Not implemented. Domain model itself flags Preceptor as *possibly* not a platform User at all — a named data attribute of Placement, not an independent actor, per that document's own Needs Verification. | **IN**, narrow — plain contact fields (name, contact info) on Placement. No Preceptor entity, login, or role. | Whether Preceptor should ever be a logged-in platform User — the source document itself has not resolved this. |
| 8 | **Required hours** | Not implemented. Explicitly ⚠️ Needs Verification in ADR-008 itself. | **IN**, structural only — a numeric target field, Coordinator/Program-Director-entered per Program, never a platform-hardcoded constant. | The actual hour figure(s) — pending Minara-Curriculum. **Not invented in this document.** |
| 9 | **Hour logging** | Not implemented. Docs: Student logs, Coordinator reviews/approves; Employer self-service verification is Future. | **OUT** of the narrow slice — itemized, per-shift logging is exactly the kind of richness M13 deliberately deferred for content review. Slice instead carries one Coordinator-attested "hours complete" flag. | Itemized Hours Log is a documented but deferred future capability, not abandoned. |
| 10 | **Attendance** | Not named as a distinct concept anywhere in Milestones 1–14 — only "Orientation" and "Hour Tracking" stages exist. | **OUT** — undocumented concept, not built. | Whether Attendance is meant to be tracked separately from Hours, or is the same concept — unresolved in the source material. |
| 11 | **Student evaluations** | Ambiguous term in the task brief — interpreted here as "evaluations *of* the Student" (see #13/#14), since no document describes Students evaluating sites. | **N/A** — covered by #13/#14. | Whether Students formally evaluate sites/Employers is undocumented — likely out of scope regardless. |
| 12 | **Employer/preceptor evaluations** | Not implemented. Docs: Employer Portal models Evaluations as an Employer-Partner self-service action; structured competency-based forms are Future. | **IN**, narrowed — Coordinator records a free-text evaluation on the Employer's behalf (consistent with #7's "Preceptor as data attribute" framing), explicitly as an interim substitute, not the real design. Employer self-service submission is **OUT**. | Whether Coordinator-recorded-on-behalf-of is an acceptable interim substitute for real Employer self-service — a product decision this document flags rather than makes unilaterally. |
| 13 | **Midpoint evaluation** | Not implemented. Docs: Planned. | **IN**, narrow — one free-text evaluation record at a Coordinator-recorded checkpoint (mirrors `Grade.feedback`'s shape), not a structured multi-criteria form. | None beyond what's already Future-tagged (structured forms). |
| 14 | **Final evaluation** | Same as #13. | **IN**, same narrow treatment. | Same as #13. |
| 15 | **Completion verification** | Not implemented. Docs: joint Coordinator + Program Director sign-off, an instance of the generic Approval pattern. | **IN** — the core approval gate of this slice; reuses the exact two-step approval pattern already proven (Content Approval M13/M14, Grade Approval M10) for the fourth time. | None — this is the most architecturally de-risked item in the entire slice. |
| 16 | **Remediation** | Not implemented. Docs: "Improvement Plan" loop on unsatisfactory outcomes; escalation beyond that is ⚠️ Needs Verification in the source document itself. | **IN**, minimal — a "Not Verified" outcome routes back to an Active placement state (mirrors the already-proven return-with-reason loop from Content Approval), but the actual consequence (re-placement vs. dismissal) is a Program Director judgment call, never a hardcoded platform rule. | What happens after a failed improvement plan (re-placement vs. dismissal) — unresolved in the source document, depends on Minara-Master-Plan academic policy. |
| 17 | **Audit trail** | Not implemented (nothing to audit yet). | **IN**, mandatory — extends the existing `AuditAction` union only (`PLACEMENT_*`, `EVALUATION_*`, `EXTERNSHIP_COMPLETION_*`), same pattern as M14's `VERSION_*` additions. No second audit mechanism. | None. |
| 18 | **Program Director approval** | N/A — PD's existing authority already covers this per Role Hierarchy. | **IN** — PD is the second signer on Completion Verification; existing role, existing authority, zero new RBAC surface. | None. |
| 19 | **Student visibility** | N/A. | **IN** — Student sees their own Placement status, evaluation summaries, and completion state, read-only, using the same Self-scoped RBAC pattern already used everywhere else in the Student Portal. | None. |
| 20 | **Employer/preceptor access boundaries** | N/A — no Employer login exists. | **OUT** for real login access. Employer remains a Coordinator-mediated data subject in this slice, not a platform actor — the single biggest scope-narrowing decision in this whole evaluation. | Whether Employer self-service is acceptable to defer to a later milestone (M16+) once Site Agreement/legal tracking and real hiring-pipeline direction — both independently tagged Future in the source documents — are clearer. |

## Summary: What This Narrows Away, and Why That's Legitimate

Comparing the full [Clinical & Externship Domain Model](../milestone-5-domain-model-data-architecture/05-clinical-externship-domain-model.md)
(nine entities: Employer, Clinical Site, Preceptor, Site Agreement,
Externship, Placement, Hours Log, Midpoint Evaluation, Final Evaluation,
Completion Verification) against the narrow slice above, three
categories are deliberately deferred:

1. **Employer as a platform actor** (login, self-service evaluation
   submission, Employer Portal) — the single largest surface reduction.
2. **Itemized Hours Log** — collapsed to one attested "complete" flag.
3. **Site Agreement** (legal/contractual tracking) — the domain model's
   own Needs Verification already questions whether this belongs in
   Minara-LMS at all, versus Minara-Master-Plan.

This mirrors exactly how Milestone 13 narrowed Milestone 11's full
Content Engine down to a single-track review workflow and one minimal
Competency link — the same discipline, applied to a different bounded
context.

## Current / Planned / Future

| Element | Status |
|---|---|
| Items marked **IN** above | **Planned** — this milestone's proposed scope, see [Recommendation](./05-milestone-15-recommendation.md) |
| Items marked **OUT** above | **Future** — explicitly deferred, not abandoned |
| Specific hour/eligibility/evaluation-criteria figures | **⚠️ Needs Verification** — pending Minara-Curriculum, never to be invented by this platform |

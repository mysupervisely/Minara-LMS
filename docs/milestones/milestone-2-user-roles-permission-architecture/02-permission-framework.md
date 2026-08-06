# Permission Framework

**Status:** Draft
**Milestone:** 2 — User Roles & Permission Architecture
**Date:** 2026-08-06

This document defines a **conceptual** permissions model: what each role
can View, Create, Edit, and Approve, organized by platform data domain.
It is a product/architecture-level model, not a technical authorization
design — it does not specify a permissions schema, claims format, or
policy engine. Those are later, more technical milestones.

## Model Concepts

- **Action types:**
  - **View (V)** — may see the data.
  - **Create (C)** — may originate a new record.
  - **Edit (E)** — may modify an existing record.
  - **Approve (A)** — may formally accept/finalize a record or transition
    it to an authoritative state (e.g., approve a grade change, approve
    an externship placement).
- **Scope qualifiers** apply to most cells (see footnotes below each
  table): a role's action is rarely "all records everywhere" — it is
  typically bounded to records the role has a legitimate relationship to
  (own records, own section, own program, own school, or
  institution-wide). Precise scope resolution is addressed in the
  [Multi-School and Multi-Program Access Model](./04-multi-school-multi-program-access-model.md).
- **"—"** means no access under the conceptual model described here.
- This model describes **Current** conceptual scope (Phase 1
  architecture). Where a cell reflects an anticipated but unconfirmed
  future capability, it is marked **(Planned)** or **(Future)** instead
  of a plain action letter, per the legend below each table.

Roles are abbreviated in table headers: **St** = Student, **Fac** =
Faculty Instructor, **PD** = Program Director, **Adm** = Admissions
Staff, **Ext** = Externship/Clinical Coordinator, **Emp** = Employer
Partner, **Sys** = Administrator.

---

## Domain: Admissions & Enrollment

| Data Domain | St | Fac | PD | Adm | Ext | Emp | Sys |
|---|---|---|---|---|---|---|---|
| Own Application | V,C,E¹ | — | — | V | — | — | V,E |
| Applications (others') | — | — | V² | V,C,E,A | — | — | V,E,A |
| Enrollment Status | V¹ | — | V² | V,C,E,A | — | — | V,E,A |
| Cohort Assignment | V¹ | V³ | V,E,A² | V,C,E | V² | — | V,E,A |

¹ Own record only. ² Own program only. ³ Own section's students only.

---

## Domain: Academic Delivery

| Data Domain | St | Fac | PD | Adm | Ext | Emp | Sys |
|---|---|---|---|---|---|---|---|
| Curriculum Content (delivered)⁴ | V¹ | V,E³ | V,A² | — | — | — | V |
| Course Section Setup | V¹ | V,C,E³ | V,E,A² | — | — | — | V,E |
| Assignments (instances) | V,C¹ | V,C,E³ | V² | — | — | — | V |
| Assessments (instances) | V,C¹ | V,C,E³ | V² | — | — | — | V |
| Gradebook / Grades | V¹ | V,C,E³ | V,A² | — | — | — | V,A |
| Grade Change / Appeal | C¹ | C,E³ | V,A² | — | — | — | V,A |

⁴ Curriculum content itself is authored in Minara-Curriculum; the LMS
delivers it. "Edit" here refers to delivery-level configuration (e.g.,
section scheduling), not authoring underlying content — see
[Scope Boundaries](../milestone-1-product-vision-platform-strategy/09-scope-boundaries.md).

¹ Own record only. ² Own program only. ³ Own section's students only.

---

## Domain: Externship / Clinical

| Data Domain | St | Fac | PD | Adm | Ext | Emp | Sys |
|---|---|---|---|---|---|---|---|
| Externship Sites | V¹ | — | V² | — | V,C,E,A | V(own site)⁵ | V |
| Student Placements | V¹ | — | V,A² | — | V,C,E,A | V(own placements)⁵ | V |
| Hours Logs | V,C¹ | — | V² | — | V,E,A | V(own placements)⁵ | V |
| Evaluations | V¹ | — | V,A² | — | V,C,E | V,C(own placements)⁵ | V |

⁵ Employer Partners see and act only on data tied to placements at their
own organization.
¹ Own record only. ² Own program only.

---

## Domain: Certificates & Credentials

| Data Domain | St | Fac | PD | Adm | Ext | Emp | Sys |
|---|---|---|---|---|---|---|---|
| Certificates | V¹ | — | V,A² | — | — | V(shared by student)⁶ | V,C,A |

¹ Own record only. ² Own program only. ⁶ Only if the student explicitly
shares it, e.g., during a hiring process — this sharing mechanism is
**Planned**, not yet designed in detail.

---

## Domain: Financial

| Data Domain | St | Fac | PD | Adm | Ext | Emp | Sys |
|---|---|---|---|---|---|---|---|
| Own Payments | V¹ | — | — | V(status only)² | — | — | V,E |
| Institutional Financials | — | — | — | — | — | — | V,A |

¹ Own record only. ² Enrollment-relevant status only, not full financial
detail — this boundary is **Planned** and needs confirmation.

---

## Domain: Communication

| Data Domain | St | Fac | PD | Adm | Ext | Emp | Sys |
|---|---|---|---|---|---|---|---|
| Messaging | V,C¹ | V,C³ | V,C² | V,C² | V,C² | V,C⁵ | V |
| AI Learning Assistant | V,C¹ | — | — | — | — | — | V(audit only) |

¹ Own conversations only. ² Within own program scope. ³ Within own
section scope. ⁵ Within own placement relationships.

---

## Domain: Analytics & Reporting

| Data Domain | St | Fac | PD | Adm | Ext | Emp | Sys |
|---|---|---|---|---|---|---|---|
| Own Progress/Analytics | V¹ | — | — | — | — | — | V |
| Section/Course Analytics | — | V³ | V² | — | — | — | V |
| Program-Level Reporting | — | — | V,C² | V² | V² | — | V |
| Institution-Wide Reporting | — | — | — | — | — | — | V,C |

¹ Own record only. ² Own program only. ³ Own section only.

---

## Domain: Platform Administration

| Data Domain | St | Fac | PD | Adm | Ext | Emp | Sys |
|---|---|---|---|---|---|---|---|
| User Accounts | V¹ | — | — | — | — | — | V,C,E |
| Role Assignments | — | — | V(propose)²⁽Planned⁾ | — | — | — | V,C,E,A |
| Audit Logs | — | — | — | — | — | — | V |

¹ Own account only. ² A Program Director *proposing* a Faculty role
assignment within their program, subject to Administrator approval, is a
**Planned** workflow, not yet finalized.

See the [Audit and Accountability Framework](./05-audit-accountability-framework.md)
for what generates audit log entries and who may view them.

---

## Current / Planned / Future

| Element | Status |
|---|---|
| Core View/Create/Edit/Approve model above, for existing domains | **Current** |
| Program Director proposing (not approving) Faculty role assignments | **Planned** |
| Employer-facing certificate sharing mechanism | **Planned** |
| Administrator sub-roles with narrower permission slices (e.g., Finance Administrator, School-Level Administrator) | **Future** |
| Field-level (rather than record-level) permission granularity | **Future** |
| Student-initiated permission delegation (e.g., a student granting a parent/guardian limited view access) | **Future** |
| Employer self-service account provisioning without Externship Coordinator involvement | **Future** |

## ⚠️ Needs Verification

- Whether Program Directors should hold **Approve** authority over
  grades independent of Faculty (as modeled above), or only an escalation
  view, depends on Minara-Master-Plan's academic governance policy.
- The financial data boundary between Admissions Staff and Administrator
  (status-only vs. full detail) is an assumption pending confirmation.
- Whether Employer Partners should ever have **Create** authority on
  Evaluations (as modeled) or only **View/Comment** is not yet confirmed.

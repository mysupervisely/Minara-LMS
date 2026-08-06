# Role Hierarchy

**Status:** Draft
**Milestone:** 2 — User Roles & Permission Architecture
**Date:** 2026-08-06

This document describes how the seven platform roles relate to one
another institutionally and at the program level: who reports to whom,
who escalates to whom, and where approval authority sits. It is a
conceptual governance map for the platform to reflect — it does not
create institutional policy, which remains the domain of
Minara-Master-Plan.

## Institutional Hierarchy (Staff Roles)

```
                        Administrator
                     (institution-wide)
                             │
        ┌───────────────────┼───────────────────┐
        │                   │                    │
  Program Director    Admissions Staff   Externship/Clinical
  (per program)      (institution/school     Coordinator
        │                  level)             (per program)
        │                                       │
  Faculty Instructor                    Employer Partner
   (per section)                          (external)
```

**Reading this diagram:** Administrator sits at the top of the internal
staff hierarchy, with institution-wide scope. Program Director,
Admissions Staff, and Externship/Clinical Coordinator report into
Administrator oversight but operate somewhat independently of one
another day-to-day — they coordinate laterally rather than one reporting
to another. Faculty Instructors report into the Program Director(s) for
the program(s) they teach in. Employer Partners are external and
relate to the institution primarily through the Externship/Clinical
Coordinator, not through the internal staff hierarchy.

**Student** is deliberately not part of this staff hierarchy diagram —
students are served by it, not positioned within it. A student's
relationships to Faculty, Program Director, Admissions Staff,
Externship/Clinical Coordinator, and Employer Partner are functional
(instruction, oversight, enrollment, placement, evaluation), not
supervisory.

## Program-Level Structural Hierarchy

Distinct from the *staff* hierarchy above, the platform must also
represent the *structural* hierarchy that schools, programs, cohorts, and
courses sit in:

```
Institution (Minara Institute of Health Sciences)
  └─ School
       └─ Program
            └─ Cohort
                 └─ Section / Course
                      └─ Enrolled Students
```

Role scopes attach to nodes in this structure (see
[Multi-School and Multi-Program Access Model](./04-multi-school-multi-program-access-model.md)
for how that scoping works in practice). For example, a Program Director's
authority is scoped to a **Program** node and everything beneath it; a
Faculty Instructor's authority is typically scoped to a **Section**
node.

## Escalation Relationships

| From | Escalates To | Typical Trigger |
|---|---|---|
| Student | Faculty Instructor | Course-level question, assignment/grade concern |
| Faculty Instructor | Program Director | Section-level concern beyond individual authority (e.g., grade dispute, curriculum delivery issue) |
| Program Director | Administrator | Program-level concern requiring institutional decision (e.g., policy exception, cross-program conflict) |
| Admissions Staff | Administrator (or Program Director, jointly) | Enrollment decision requiring policy interpretation |
| Externship/Clinical Coordinator | Program Director | Placement issue affecting program compliance |
| Employer Partner | Externship/Clinical Coordinator | Partnership or placement issue |

## Approval Relationships (Conceptual)

Approval authority generally sits with the role that owns accountability
for the outcome, consistent with the [Permission Framework](./02-permission-framework.md):

- **Grade changes/appeals:** Faculty Instructor originates; Program
  Director approves. **⚠️ Needs Verification** — Minara-Master-Plan may
  define a different or more formal academic appeals process.
- **Enrollment decisions:** Admissions Staff originates/recommends;
  approval authority may sit with Admissions Staff, Program Director, or
  Administrator depending on program-specific admission criteria.
  **⚠️ Needs Verification.**
- **Externship placements:** Externship/Clinical Coordinator originates
  and approves, in coordination with the Program Director for
  program-specific placement requirements.
- **Role assignments (who gets what role/scope):** Administrator holds
  final approval authority institution-wide; Program Directors may
  propose (not finalize) Faculty assignments within their own program
  (**Planned**, see [Permission Framework](./02-permission-framework.md)).
- **Certificates:** Program Director approves program completion;
  Administrator issues the certificate of record.

## Current / Planned / Future

| Element | Status |
|---|---|
| Institutional staff hierarchy (Administrator → Program Director / Admissions / Externship Coordinator → Faculty) | **Current** |
| Structural hierarchy (Institution → School → Program → Cohort → Section) | **Current** |
| Escalation table above | **Current** (conceptual; not yet a workflow engine) |
| Formal, configurable approval-chain workflows (e.g., multi-step sign-off with notifications) | **Planned** |
| Delegated/temporary authority (e.g., a Program Director delegating approval authority while on leave) | **Future** |
| Committee-based approvals (e.g., an academic standards committee rather than a single approver) | **Future**, pending Minara-Master-Plan governance model |

## ⚠️ Needs Verification

- This hierarchy assumes a fairly flat, direct-report structure. If
  Minara-Master-Plan defines committee-based governance (e.g., an
  Academic Standards Committee, an Admissions Committee) rather than
  single-approver authority for certain decisions, this document's
  approval relationships should be revised accordingly.
- Whether Admissions Staff and Externship/Clinical Coordinators are
  institution-wide roles or school-scoped roles is not yet confirmed
  (see [Multi-School and Multi-Program Access Model](./04-multi-school-multi-program-access-model.md)).
- Whether a School-level administrative layer exists between
  Administrator and Program Director (e.g., a Dean or School Director)
  is not yet confirmed and is not represented in the diagram above.

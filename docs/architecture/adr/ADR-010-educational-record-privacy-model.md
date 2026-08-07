# ADR-010: Educational Record Privacy Model

**Status:** Draft (Proposed) — **new decision, ratified in this ADR**
**Date:** 2026-08-07
**Source:** This ADR substantially resolves the regulatory/compliance
question flagged repeatedly since
[Guiding Principles](../../milestones/milestone-1-product-vision-platform-strategy/03-guiding-principles.md),
[Security Architecture](../../milestones/milestone-6-technical-architecture/04-security-architecture.md),
[Security Development Practices](../../milestones/milestone-9-engineering-foundation-development-setup/08-security-development-practices.md),
and
[Engineering Readiness Review](../../milestones/milestone-9-engineering-foundation-development-setup/11-engineering-readiness-review.md).

## Context / Problem

Since Milestone 1, this documentation set has flagged an unresolved
question: does Minara-LMS's data fall under educational-record
protections only, or does it also carry health-information-adjacent
obligations, given the platform's health sciences context and (per
[ADR-008](./ADR-008-pharmacy-technology-first-launch.md)) its first
launch Program's clinical/externship component? That distinction
matters enormously — the two regulatory postures require very different
architecture, and building without deciding between them risks either
under-protecting real health data or over-building compliance machinery
the platform doesn't actually need.

## Decision

**The initial platform is designed around educational records, not
clinical health records.** Minara-LMS's data model, at launch, is
explicitly scoped to information *about a student's education* — not
information *about patients* a student may encounter during real-world
training.

## Scope

**In scope (educational records):**

| Category | Milestone 5 Entities |
|---|---|
| Student information | Applicant, Student, Enrollment |
| Grades | Grades, Academic Record, Transcript |
| Assessments | Assignment, Assessment, Quiz submissions |
| Certificates | Certificate, Certificate Record |
| Externship documentation | Placement, Hours Log, Midpoint/Final Evaluation, Completion Verification — **about the student's own performance and hours, never about any patient** |

**Explicitly out of scope:**

**Patient health information is explicitly excluded from Minara-LMS's
initial scope.** Where a Student (per
[ADR-008](./ADR-008-pharmacy-technology-first-launch.md), likely in a
pharmacy technology practicum setting) encounters real patients during
an externship, any information about those patients remains the sole
responsibility of the host Employer/Clinical Site's own systems and
processes — it is never entered into, stored by, or processed through
Minara-LMS. The
[Clinical & Externship Domain Model](../../milestones/milestone-5-domain-model-data-architecture/05-clinical-externship-domain-model.md)'s
Evaluation and Hours Log entities concern the Student being evaluated,
not any patient the Student may have interacted with.

## Rationale

- **A dramatically simpler, more defensible compliance posture for
  MVP.** Educational-record protection frameworks (illustrative example
  in a U.S. context: FERPA-type protections — named here only as an
  illustrative category, not a confirmed legal determination) are a
  well-understood, tractable compliance target. Health-information
  regulation is a substantially heavier obligation that the platform
  does not need to take on if it never actually handles patient data.
- **Avoids becoming a health-information-covered system prematurely.**
  Per
  [Security Architecture §Future Compliance Considerations](../../milestones/milestone-6-technical-architecture/04-security-architecture.md),
  this question has been open since Milestone 1 specifically because
  guessing wrong is expensive; explicitly excluding patient data
  resolves it in the direction that keeps the MVP's compliance scope
  achievable.
- **Consistent with what the platform actually needs to do.** Nothing in
  [Milestone 3](../../milestones/milestone-3-student-journey-core-workflows/README.md)'s
  workflows or
  [Milestone 5](../../milestones/milestone-5-domain-model-data-architecture/README.md)'s
  domain model requires Minara-LMS to hold patient information — the
  Externship workflow evaluates a *student's* competency and
  performance, which is achievable without ever recording details about
  the patients involved in that training.

## Options Considered

| Option | Description | Why Not Chosen |
|---|---|---|
| **Design for health-information compliance from day one** | Build Minara-LMS as if it will eventually hold patient health data. | Substantially heavier compliance and architecture burden than the current, confirmed scope requires — premature given nothing in Milestones 1–9 calls for it. |
| **Leave the question open** | Continue flagging this as unresolved indefinitely. | The cost this ADR exists to end — every downstream security and data-handling decision has been stalled on this question since Milestone 1. |
| **Scope to educational records only, explicitly excluding patient health information** *(chosen)* | As decided above. | Matches actual platform requirements, resolves a long-open blocking question, and keeps compliance scope achievable for the MVP. |

## Consequences

**Benefits:**
- Unblocks concrete decisions in
  [Security Development Practices](../../milestones/milestone-9-engineering-foundation-development-setup/08-security-development-practices.md)
  and
  [File Storage & Content Architecture](../../milestones/milestone-6-technical-architecture/05-file-storage-content-architecture.md)
  that were previously waiting on this question.
- A clear, defensible line institutional stakeholders, Employer
  Partners, and accreditation reviewers can all understand: Minara-LMS
  is about the student's education, not about any patient's care.
- Meaningfully reduces the MVP's compliance and security engineering
  burden.

**Tradeoffs:**
- If a future program (e.g., a PharmD or TherapyPrepped component, per
  [Supported Schools and Programs](../../milestones/milestone-1-product-vision-platform-strategy/06-supported-schools-and-programs.md))
  genuinely requires the platform to handle any patient-related data
  directly, that would require a **dedicated compliance and
  architecture review before being built** — this is a real, deferred
  cost, not a solved problem.
- Requires ongoing operational discipline: Employer Partners and Clinical
  Coordinators (per the
  [Externship Management Workflow](../../milestones/milestone-3-student-journey-core-workflows/04-externship-management-workflow.md))
  must be clearly instructed never to enter patient-identifying
  information into Evaluation or Hours Log fields — a process control,
  not just a technical one.

## Flagged Future Health-Data Scenarios for Review

The following are **explicitly Future**, not designed against here, and
should each trigger a dedicated compliance review before being built:

- A future program requiring the platform to record clinical case data
  involving real patients.
- Any Employer Partner integration that could transmit patient-adjacent
  data into Minara-LMS.
- Expansion into telehealth-adjacent or clinical-simulation features
  that blur the line between "about the student" and "about a patient."

## Future Review Considerations

This decision should be revisited the moment any future program's
requirements would require patient health information to be recorded in
Minara-LMS — at that point, this ADR should be superseded by a new one
reflecting a deliberate, reviewed decision to take on health-information
compliance obligations, not silently expanded.

## Current / Planned / Future

| Element | Status |
|---|---|
| Educational-records-only scope | **Current** — ratified by this ADR |
| Explicit exclusion of patient health information | **Current** |
| Process controls preventing patient data entry by Employer/Coordinator roles | **Planned** |
| Any future health-data handling | **Future**, requiring a dedicated compliance review and a superseding ADR |

## ⚠️ Needs Verification

- Final confirmation of which specific legal/regulatory framework
  applies to Minara-LMS's educational records (this ADR names FERPA-type
  protection only as an illustrative example of the category, not a
  confirmed determination) should come from Minara-Master-Plan and legal
  counsel, not from this technical documentation set.
- Whether Pharmacy Technology practicum sites could ever transmit
  patient-adjacent information back into Minara-LMS through an
  unanticipated channel (e.g., a document upload) should be reviewed as
  part of the [Externship Management Workflow](../../milestones/milestone-3-student-journey-core-workflows/04-externship-management-workflow.md)'s
  eventual implementation.

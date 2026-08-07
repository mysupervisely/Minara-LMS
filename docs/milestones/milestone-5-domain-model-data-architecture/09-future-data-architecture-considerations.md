# Future Data Architecture Considerations

**Status:** Draft
**Milestone:** 5 — Domain Model & Data Architecture
**Date:** 2026-08-07

Every consideration in this document is **explicitly Future** —
directional awareness for whoever eventually designs the technical data
architecture, not a current requirement, a commitment, or a decision.
Nothing here should be read as scoping work for Milestone 6 or any
near-term milestone. It exists so that long-term needs are visible now,
rather than discovered as surprises once implementation is underway.

## Scalability

The domain model in this milestone (
[02](./02-academic-domain-model.md)–[06](./06-platform-services-domain-model.md))
is written to accommodate growth in Schools, Programs, Cohorts, and
Students without conceptual rework, consistent with
[Guiding Principles §1](../milestone-1-product-vision-platform-strategy/03-guiding-principles.md).
What remains a **Future** consideration is how that conceptual
scalability is realized technically (data partitioning, read/write
patterns at scale, etc.) — deliberately not addressed here.

## Versioning

Curriculum content (Course, Module, Lesson, Learning Object, Assignment,
Assessment, Question Bank — see the
[Academic Domain Model](./02-academic-domain-model.md)) is authored
upstream in Minara-Curriculum and may change over time. A **Future**
consideration is how the platform represents *which version* of a piece
of content a given Student experienced or was assessed against —
important for academic integrity and accreditation defensibility, but
not designed in this milestone.

## Historical Records

Related to Versioning: as Programs, Courses, and requirements change
over time, a Student's Academic Record and Transcript (see
[Student Domain Model](./03-student-domain-model.md)) must remain
accurate to the requirements that applied *when they were enrolled*, not
silently reinterpreted against later versions. How the domain model
represents "the rules as they stood at the time" is a **Future**
consideration.

## Content Revisions

A specific case of Versioning: when Minara-Curriculum revises a Lesson
or Assessment after Students have already engaged with the prior
version, the platform will eventually need a considered position on
whether in-progress Course Progress and Grades are affected. **Future**
— not addressed by this milestone's Lifecycle definitions, which
describe states, not version transitions.

## Multi-Campus Support

This milestone's Institution → School → Program → Cohort hierarchy (see
[Academic Domain Model](./02-academic-domain-model.md)) does not
explicitly model physical campus location. If Minara schools operate
across multiple physical campuses with campus-specific scheduling,
resources, or reporting needs, that would be a **Future** extension —
potentially an additional structural layer, or an attribute of School/
Cohort, depending on how the actual need materializes.

## Future Continuing Education

The [Platform Workflow Catalog](../milestone-3-student-journey-core-workflows/07-platform-workflow-catalog.md)
already tags Continuing Education as **Future**, related to Alumni
Transition. From a data architecture standpoint, this would mean an
Alumnus (a Student whose Enrollment reached Completed status) re-entering
an Enrollment relationship — the domain model's Student/Enrollment
separation (see [Student Domain Model](./03-student-domain-model.md))
is intended to make that possible without redesign, but the specific
continuing-education Program structures themselves are **Future**.

## Future Degree Programs

[Supported Schools and Programs](../milestone-1-product-vision-platform-strategy/06-supported-schools-and-programs.md)
treats the list of Programs as open-ended. Should Minara offer
multi-year degree programs (as opposed to shorter certificate-style
programs), the Program/Cohort/Course structure in this milestone is
intended to accommodate that conceptually, but degree-specific concerns
(e.g., majors/minors, credit-hour systems, multi-year cohort tracking)
are **Future** and undesigned.

## Future Licensing

[Long-Term Platform Vision §Needs Verification](../milestone-1-product-vision-platform-strategy/07-long-term-platform-vision.md)
flags, without confirming, whether Minara-LMS might ever be licensed to
institutions outside the Minara ecosystem. If that direction is ever
pursued, it would have significant data architecture implications
(multi-institution data isolation, an Institution entity that is no
longer effectively a singleton — see the
[Academic Domain Model](./02-academic-domain-model.md)). This is
**Future** and explicitly unconfirmed as a goal.

## Future Analytics

Learning Analytics and AI Recommendation (see the
[Student](./03-student-domain-model.md) and
[Platform Services](./06-platform-services-domain-model.md) domain
models) are already tagged **Future** at the entity level. The deeper
data architecture question — how much historical, granular activity
data needs to be retained to power meaningful analytics, and for how
long — is a **Future** consideration this milestone does not resolve.

## Future Interoperability

Minara-LMS's relationship to Minara-Curriculum (content authoring) and
potential future external systems (e.g., a dedicated Student Information
System, per
[Scope Boundaries §Needs Verification](../milestone-1-product-vision-platform-strategy/09-scope-boundaries.md))
will eventually require some data interoperability approach. This
milestone deliberately does not design that mechanism — no data
exchange format, sync pattern, or integration approach is specified
anywhere in this document set. It is named here only as a known,
**Future** area of work.

## Current / Planned / Future

| Consideration | Status |
|---|---|
| All items in this document | **Future**, by design — see [Long-Term Platform Vision](../milestone-1-product-vision-platform-strategy/07-long-term-platform-vision.md) |

*This document intentionally contains no Current or Planned items — that
would contradict its purpose.*

## ⚠️ Needs Verification

- None of the items in this document are meant to be "verified" at this
  stage — they are explicitly speculative, forward-looking notes. Any
  future milestone that begins to design against one of these
  considerations should treat it as a fresh scoping exercise, not as a
  decision already made here.

# Scalability & Reliability Framework

**Status:** Draft
**Milestone:** 6 — Technical Architecture & System Design
**Date:** 2026-08-07

This document states the platform's scalability and reliability
**goals and principles** — the qualities the architecture should exhibit
as Minara-LMS grows toward supporting thousands of concurrent students
across multiple schools and programs, per this milestone's objective. It
does not select infrastructure, hosting, or any specific technology to
achieve these goals.

## Performance

- Read-heavy interactions (browsing course content, viewing grades,
  checking a dashboard) and write-heavy interactions (submitting an
  assignment, entering grades, logging externship hours) have different
  performance characteristics and should be architected with that
  difference in mind, rather than treated uniformly.
- Performance goals are expressed as user-experienced responsiveness
  (a User should not perceive the platform as slow for common actions),
  not as specific latency numbers — concrete targets are a **Future**,
  implementation-adjacent decision.

## Availability

- The platform's availability expectations should reflect its role in
  time-sensitive academic activity (e.g., a Student submitting an
  Assignment before a deadline, per the
  [Faculty Workflows](../milestone-3-student-journey-core-workflows/02-faculty-workflows.md)) —
  downtime during high-stakes windows (deadlines, enrollment periods) is
  more costly than downtime during low-activity periods.
- **⚠️ Needs Verification:** concrete availability targets (e.g., an
  uptime percentage) are not defined in this milestone and depend on
  institutional expectations not yet gathered.

## Caching Philosophy

- Content that changes infrequently and is read frequently (delivered
  curriculum content, program information on the Public Website) is a
  strong candidate for caching close to where it's consumed.
- Content that reflects a specific User's current state (grades,
  notifications, in-progress submissions) should not be cached in ways
  that risk showing stale or incorrect state for actions with academic
  consequence.
- Caching is a **performance optimization layered on top of** the
  architecture defined in [System Architecture](./01-system-architecture.md),
  not a substitute for correct data ownership within the Domain / Service
  Layer.

## Horizontal Scaling

- The Presentation and Application/Orchestration Layers (see
  [System Architecture](./01-system-architecture.md)) are architected to
  be stateless where possible, so that supporting more concurrent Users
  is a matter of running more instances of those layers, rather than a
  structural change.
- Domain Services that see disproportionate load (most plausibly
  Learning and Assessments, given their role in the core teaching loop)
  are the ones most likely to benefit from independent scaling — this is
  part of why [System Architecture](./01-system-architecture.md) keeps
  service boundaries clean enough to support that, even while deferring
  the single-deployment-vs-independent-services decision itself.

## Background Processing

- Operations that don't need to complete within the timeframe of a
  single user-facing request — generating a Report, issuing a batch of
  Notifications, processing a bulk Enrollment action — are architected
  to run asynchronously, so they don't make a User wait on work that
  doesn't concern them directly.
- This principle directly supports the event-driven interactions defined
  in [Notification & Event Architecture](./08-notification-event-architecture.md):
  publishing an event and reacting to it are not required to happen
  within the same request/response cycle.

## Monitoring & Observability

- Every layer of the architecture (see
  [System Architecture](./01-system-architecture.md)) should be able to
  answer, after the fact, "what happened and why" for any given request
  or background operation — without needing to reproduce the issue
  live.
- This is distinct from, but complementary to, the
  [Audit and Accountability Framework](../milestone-2-user-roles-permission-architecture/05-audit-accountability-framework.md):
  Audit Logging answers "who did what to which business record";
  Observability answers "how is the system itself behaving." Both matter,
  for different audiences (Administrators/accreditation reviewers vs.
  whoever operates the platform).
- No specific monitoring/observability tooling is selected here — that
  is a **Future**, technology-selection decision.

## Disaster Recovery & Business Continuity

- The platform's data — particularly Academic Records, Grades,
  Certificates, and Audit Logs — represents records the institution has
  real obligations around (accreditation, legal, and simply "a Student's
  credential must remain valid"). Disaster recovery planning should be
  sized to that responsibility, not treated as a generic technical
  concern.
- **⚠️ Needs Verification:** concrete recovery objectives (how much data
  loss is acceptable, how long recovery should take) are institutional
  risk decisions this milestone does not have the standing to set on its
  own — they belong with Minara-Master-Plan and institutional
  leadership.

## Future Internationalization

Explicitly **Future**: Minara-LMS's current scope (see
[Supported Schools and Programs](../milestone-1-product-vision-platform-strategy/06-supported-schools-and-programs.md))
does not establish a requirement for multi-language content or interface
support. If Minara's programs ever expand to serve non-English-speaking
populations or operate in additional jurisdictions, the platform would
need: multi-language UI strings, potentially multi-language curriculum
content delivery (a Minara-Curriculum authoring concern more than an LMS
one), and locale-aware formatting (dates, currency). None of this is
designed here; it is named so a future decision to pursue it isn't
starting from zero awareness.

## Current / Planned / Future

| Element | Status |
|---|---|
| Read/write performance differentiation as a principle | **Current** |
| Availability tied to time-sensitive academic activity | **Current** as a principle; concrete targets **Future** |
| Caching philosophy (cache stable content, protect academically-consequential state) | **Current** |
| Stateless Presentation/Application layers for horizontal scaling | **Current** |
| Background processing for non-time-critical operations | **Current** |
| Observability as a distinct concern from Audit Logging | **Current** |
| Concrete performance/availability/recovery targets | **Future**, pending institutional risk input |
| Internationalization | **Future** |

## ⚠️ Needs Verification

- Concrete availability targets (uptime expectations).
- Concrete disaster recovery objectives (acceptable data loss window,
  acceptable recovery time).
- Whether any Minara program has a near-term internationalization need,
  or this remains purely theoretical for the foreseeable future.

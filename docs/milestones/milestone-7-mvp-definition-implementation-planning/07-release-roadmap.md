# Release Roadmap

**Status:** Draft
**Milestone:** 7 — MVP Definition & Implementation Planning
**Date:** 2026-08-07

This document translates
[Implementation Phases](./05-implementation-phases.md) into named
**releases** — a customer/stakeholder-facing view of what ships when.
No dates or durations are specified, consistent with this milestone
remaining planning, not scheduling.

## MVP Release

- **Goals:** Prove that Minara-LMS can operate one real cohort's
  complete academic journey — enroll, teach, grade, and certify — for
  a single School and Program.
- **Capabilities:** Everything classified MUST HAVE in
  [MVP Scope Definition](./02-mvp-scope-definition.md); corresponds to
  [Implementation Phases](./05-implementation-phases.md) 0–2 plus the
  Certificate-issuance portion of Phase 3.
- **Target Audience:** The launch cohort's Students and Faculty, the
  Program Director overseeing them, and the Administrator(s) operating
  the platform.
- **Dependencies:** Confirmation of the launch School/Program (see
  [MVP Philosophy §Needs Verification](./01-mvp-philosophy.md)) and the
  externship-requirement question (see
  [MVP Scope Definition §Needs Verification](./02-mvp-scope-definition.md)).

## Version 1.1

- **Goals:** Round out the first cohort's experience and open
  recruitment for the next one.
- **Capabilities:** The remainder of Phase 3 — Messaging, Calendar,
  Student Support, self-service Admissions.
- **Target Audience:** The completing first cohort; prospective
  applicants to the second cohort; Admissions Staff.
- **Dependencies:** MVP Release.

## Version 1.2

- **Goals:** Support real-world clinical training, if the launch or a
  near-term Program requires it.
- **Capabilities:** Phase 4 — full Externship Management, Clinical
  Coordinator Portal, Employer Portal.
- **Target Audience:** Students in a Program requiring externships,
  Clinical Coordinators, Employer Partners.
- **Dependencies:** Version 1.1; a confirmed Program requiring
  externships. **⚠️ Needs Verification:** if the launch Program itself
  requires an externship, this capability moves earlier — potentially
  into the MVP Release itself — per the conditional treatment in
  [Implementation Phases](./05-implementation-phases.md).

## Version 2.0

- **Goals:** Introduce AI-assisted learning support and data-driven
  insight, and prove the platform can support more than one School or
  Program.
- **Capabilities:** Phase 5 (AI Tutor, Analytics/Reporting) and Phase 6
  (Multi-School Expansion).
- **Target Audience:** All roles, across an expanded institutional
  footprint.
- **Dependencies:** Versions 1.1–1.2; real usage data from at least one
  complete cohort cycle.

## Future Platform Releases

Explicitly **Future**, named but not scoped:

| Release Theme | Source |
|---|---|
| Continuing Education | [Future Data Architecture Considerations](../milestone-5-domain-model-data-architecture/09-future-data-architecture-considerations.md) |
| Mobile App | [Implementation Roadmap — Future Phases](../milestone-6-technical-architecture/10-implementation-roadmap.md) |
| API Platform (external-facing APIs) | [Integration Architecture](../milestone-6-technical-architecture/07-integration-architecture.md) |
| Full external integrations (payments, SIS, credential verification, etc.) | [Integration Architecture](../milestone-6-technical-architecture/07-integration-architecture.md) |
| Content/Faculty/Administrative AI Assistance | [AI Platform Architecture](../milestone-6-technical-architecture/06-ai-platform-architecture.md) |
| Future Licensing (platform offered beyond Minara) | [Long-Term Platform Vision](../milestone-1-product-vision-platform-strategy/07-long-term-platform-vision.md) |

## Current / Planned / Future

| Release | Status |
|---|---|
| MVP Release | **Planned** |
| Version 1.1 | **Planned** |
| Version 1.2 | **Planned**, conditional per above |
| Version 2.0 | **Planned** |
| Future Platform Releases | **Future** |

## ⚠️ Needs Verification

- Version numbering here (1.1, 1.2, 2.0) is a planning convenience, not
  a commitment to semantic versioning or any particular release
  discipline — that is an implementation-adjacent decision for later.
- As with [Implementation Phases](./05-implementation-phases.md), the
  Version 1.2 (Clinical Operations) placement depends entirely on the
  still-unconfirmed launch Program's requirements.

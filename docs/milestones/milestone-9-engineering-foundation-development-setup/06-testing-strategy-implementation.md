# Testing Strategy Implementation

**Status:** Draft
**Milestone:** 9 — Engineering Foundation & Development Setup
**Date:** 2026-08-07

This document expands
[Testing & Quality Assurance Architecture](../milestone-8-technology-stack-development-architecture/07-testing-quality-assurance-architecture.md)'s
philosophy into concrete testing layers and, new to this milestone,
**quality gates** — the specific checkpoints a change must pass before
it reaches a real user.

## Testing Layers

| Layer | Scope | Runs |
|---|---|---|
| **Unit** | A single module's business rules, in isolation (per [Backend Architecture](../milestone-8-technology-stack-development-architecture/03-backend-architecture.md)) | On every code change, locally and in CI |
| **Integration** | Direct and Event-Driven interactions between modules (per [Service Boundaries](../milestone-6-technical-architecture/03-service-boundaries.md)) | On every pull request |
| **End-to-End** | Complete Milestone 3 workflows through the real interface | On every pull request affecting a MUST HAVE workflow (per [MVP Scope Definition](../milestone-7-mvp-definition-implementation-planning/02-mvp-scope-definition.md)); nightly for full coverage |
| **Security** | RBAC boundaries, Audit Log integrity | On every pull request touching permission logic; full suite before every release |
| **Accessibility** | Automated checks against the shared component library, manual spot-checks | On every pull request touching `packages/ui-components`; manual review before release |
| **Content Validation** | Curriculum content delivery mechanics (per [Testing & Quality Assurance Architecture §Content Testing](../milestone-8-technology-stack-development-architecture/07-testing-quality-assurance-architecture.md)) | On every pull request affecting Learning or Assessments modules |
| **AI Validation** | Safety & Scope Gate, escalation paths, output-boundary enforcement (per [AI Platform Architecture](../milestone-6-technical-architecture/06-ai-platform-architecture.md)) | On every pull request touching the AI module; full adversarial suite before every AI-related release |

## Unit Testing

Every module's business rules from the
[Business Rules Catalog](../milestone-5-domain-model-data-architecture/08-business-rules-catalog.md)
have a corresponding unit test — a rule without a test is treated as an
incomplete implementation, not an optional extra. Per
[Coding Standards Framework](./05-coding-standards-framework.md), each
test should be traceable to the specific rule or entity behavior it
verifies.

## Integration Testing

Verifies the Event-Driven flows cataloged in
[Notification & Event Architecture](../milestone-6-technical-architecture/08-notification-event-architecture.md) —
e.g., that a "Grade Approved" event genuinely reaches Notifications and
Certificates as designed, not just that the Gradebook module itself
behaves correctly in isolation.

## End-to-End Testing

Prioritized directly by
[MVP Feature Prioritization](../milestone-7-mvp-definition-implementation-planning/04-mvp-feature-prioritization.md):
every MUST HAVE workflow (Final Grade Approval, Certificate Issuance,
core course delivery) has full end-to-end coverage before the MVP
Release ships; SHOULD/COULD HAVE workflows are covered as they're built,
not held back for E2E coverage before merging.

## Security Testing

- **RBAC boundary tests** run against every Role Assignment × data
  domain combination in the
  [Permission Framework](../milestone-2-user-roles-permission-architecture/02-permission-framework.md) —
  the goal is a test suite that would catch a Faculty Instructor
  gaining access to another section's Grades the moment such a
  regression is introduced, not after it reaches Production.
- **Audit Log integrity tests** verify no code path can edit or delete
  an existing entry, consistent with the
  [Audit and Accountability Framework](../milestone-2-user-roles-permission-architecture/05-audit-accountability-framework.md).

## Accessibility Testing

Automated checks (contrast, semantic structure, keyboard navigability)
run against the shared component library on every change to it, per
[Coding Standards Framework §Accessibility Standards](./05-coding-standards-framework.md).
Manual testing (screen reader walkthroughs of key flows) supplements
automated checks ahead of each release, since some accessibility issues
only surface through real interaction.

## Content Validation

Verifies that content delivered from Minara-Curriculum renders and
tracks correctly within Minara-LMS (per
[Testing & Quality Assurance Architecture §Content Testing](../milestone-8-technology-stack-development-architecture/07-testing-quality-assurance-architecture.md)) —
this tests the delivery mechanism, never the academic correctness of the
content itself, which stays Minara-Curriculum's responsibility per
[Scope Boundaries](../milestone-1-product-vision-platform-strategy/09-scope-boundaries.md).

## AI Validation

The highest-scrutiny testing category in this framework, given the
stakes named throughout
[AI Platform Architecture](../milestone-6-technical-architecture/06-ai-platform-architecture.md)
and
[AI Technology Architecture](../milestone-8-technology-stack-development-architecture/09-ai-technology-architecture.md):

- Adversarial testing of the Safety & Scope Gate — attempting to elicit
  a response that should have been classified as a crisis/safety signal
  or an academic-integrity concern.
- Explicit boundary tests confirming the AI module cannot approve
  grades, approve graduation, or finalize any academic/clinical outcome —
  run as release-blocking tests, not advisory ones.
- Escalation-path tests confirming an escalation genuinely reaches a
  human, actionable, through Notifications.

## Quality Gates Before Release

A release does not ship unless:

1. All Unit and Integration tests pass for every module touched.
2. End-to-End tests pass for every MUST HAVE workflow the release
   affects.
3. Security tests (RBAC boundaries, Audit Log integrity) pass in full,
   regardless of which module the release touches.
4. Accessibility automated checks pass for any UI change.
5. **If the release touches the AI module:** the full AI Validation
   suite passes, with no exceptions — this gate cannot be waived, per
   the non-negotiable governing principle in
   [AI Platform Architecture](../milestone-6-technical-architecture/06-ai-platform-architecture.md).
6. Documentation has been updated to reflect any behavior change, per
   [Engineering Philosophy §Documentation Expectations](./01-engineering-philosophy.md).

## Current / Planned / Future

| Element | Status |
|---|---|
| Seven testing layers (as tabled above) | **Planned** |
| Unit/Integration tests as PR-blocking | **Planned** |
| E2E coverage for MUST HAVE workflows before MVP Release | **Planned** |
| Security and AI Validation as non-waivable release gates | **Current** — a firm principle, not subject to relaxation for schedule pressure |
| Full nightly E2E coverage | **Future**, once MUST HAVE coverage is established |

## ⚠️ Needs Verification

- Specific testing tools/frameworks are not named here, consistent with
  [Milestone 8](../milestone-8-technology-stack-development-architecture/07-testing-quality-assurance-architecture.md) —
  they follow from the frontend/backend technology selections once
  confirmed.
- The exact cadence of manual accessibility and AI adversarial testing
  (per-release vs. periodic) is not finally set here.

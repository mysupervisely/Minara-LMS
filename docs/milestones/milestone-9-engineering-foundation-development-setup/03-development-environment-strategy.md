# Development Environment Strategy

**Status:** Draft
**Milestone:** 9 — Engineering Foundation & Development Setup
**Date:** 2026-08-07

This document expands
[Deployment & Infrastructure Strategy §Environment Separation](../milestone-8-technology-stack-development-architecture/08-deployment-and-infrastructure-strategy.md)
into concrete purpose, data-handling, access, and promotion detail for
each environment.

## Local Development

- **Purpose:** where an individual engineer builds and runs Minara-LMS
  on their own machine.
- **Data Handling:** sample/fixture data only, from `content/` (per
  [Repository Structure](./02-repository-structure.md)) — never real
  Student, Faculty, or institutional data.
- **Access Rules:** unrestricted for the engineer running it locally;
  not reachable by anyone else.
- **Promotion Flow:** changes move from Local Development into version
  control via the workflow defined in
  [Version Control & Development Workflow](./07-version-control-development-workflow.md);
  Local Development itself is never "promoted" anywhere.
- **Security Considerations:** no real secrets are used locally —
  local-only placeholder credentials, per
  [Security Development Practices §Secrets Management](./08-security-development-practices.md).

## Development/Test

- **Purpose:** a shared environment where merged changes are
  automatically deployed and where automated tests (per
  [Testing Strategy Implementation](./06-testing-strategy-implementation.md))
  run against realistic, but non-real, data.
- **Data Handling:** synthetic data resembling production shape and
  volume, generated or seeded — never a copy of real production data.
- **Access Rules:** open to the engineering team; not reachable by
  Students, Faculty, or other real platform users.
- **Promotion Flow:** every change merged to the main branch (per
  [Version Control & Development Workflow](./07-version-control-development-workflow.md))
  deploys here automatically, ahead of Staging.
- **Security Considerations:** treated with real security discipline
  (proper authentication, no bypassed RBAC) despite non-real data — bad
  habits here migrate to Production if allowed.

## Staging

- **Purpose:** a production-like environment for final verification of
  a release before it reaches real users — the last checkpoint before
  Production.
- **Data Handling:** production-shaped synthetic data, at a scale
  sufficient to catch performance issues before they reach Production.
  **Never real Student data**, consistent with every environment above
  Local Development.
- **Access Rules:** engineering team, plus whichever stakeholders are
  part of release approval (see
  [Deployment Workflow Foundation §Approval](./09-deployment-workflow-foundation.md)).
- **Promotion Flow:** a specific, reviewed release candidate is promoted
  here from Development/Test, not every merge automatically — this is
  the deliberate slow-down point before Production.
- **Security Considerations:** configured identically to Production
  wherever possible, so Staging actually catches what Production would
  catch.
- **⚠️ Needs Verification:** whether a distinct Staging environment is
  justified at MVP scale remains open, carried forward from
  [Deployment & Infrastructure Strategy](../milestone-8-technology-stack-development-architecture/08-deployment-and-infrastructure-strategy.md) —
  this document defines Staging's shape *if* it exists, without
  resolving whether it should at launch.

## Production

- **Purpose:** where real Students, Faculty, and staff operate — the
  only environment holding real academic, financial, and
  clinical-adjacent data.
- **Data Handling:** real data, subject to every principle in
  [Security Architecture §Sensitive Data Handling](../milestone-6-technical-architecture/04-security-architecture.md)
  and the retention posture in
  [File Storage & Content Architecture](../milestone-6-technical-architecture/05-file-storage-content-architecture.md).
- **Access Rules:** real Users only, governed entirely by the RBAC model
  from [Milestone 2](../milestone-2-user-roles-permission-architecture/README.md) —
  no engineering "backdoor" access to real Student data outside that
  model, including for Administrators, per
  [Security Architecture §Administrative Actions](../milestone-6-technical-architecture/04-security-architecture.md).
- **Promotion Flow:** only a Staging-verified, formally approved release
  reaches Production — see
  [Deployment Workflow Foundation](./09-deployment-workflow-foundation.md)
  for the full approval sequence.
- **Security Considerations:** the highest bar in every dimension —
  monitored (per
  [Scalability & Reliability Framework](../milestone-6-technical-architecture/09-scalability-reliability-framework.md)),
  backed up (per
  [Deployment & Infrastructure Strategy](../milestone-8-technology-stack-development-architecture/08-deployment-and-infrastructure-strategy.md)),
  and audited (per the
  [Audit and Accountability Framework](../milestone-2-user-roles-permission-architecture/05-audit-accountability-framework.md)).

## Environment Comparison

| Environment | Real Data? | Who Has Access | Deploys Automatically? |
|---|---|---|---|
| Local Development | Never | The individual engineer | N/A |
| Development/Test | Never | Engineering team | Yes, on every merge |
| Staging | Never | Engineering team + release approvers | On promotion of a release candidate |
| Production | Yes | Real platform Users, per RBAC | On formal release approval only |

## Current / Planned / Future

| Element | Status |
|---|---|
| Four-environment model (Local, Dev/Test, Staging, Production) | **Planned** |
| Never-real-data rule for every environment but Production | **Current** — a non-negotiable principle |
| No engineering backdoor access to real Production data | **Current** |
| Staging as a distinct environment | **Planned**, pending the Needs Verification note above |

## ⚠️ Needs Verification

- Whether Staging is warranted as a distinct environment at MVP launch
  scale, carried forward unresolved from Milestone 8.
- Concrete data-refresh cadence for Development/Test and Staging's
  synthetic data (how often it's regenerated) is not defined here.

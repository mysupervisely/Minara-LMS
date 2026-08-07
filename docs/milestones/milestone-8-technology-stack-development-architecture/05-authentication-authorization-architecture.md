# Authentication & Authorization Architecture

**Status:** Draft
**Milestone:** 8 — Technology Stack & Development Architecture
**Date:** 2026-08-07

This document adds technical strategy on top of
[Security Architecture](../milestone-6-technical-architecture/04-security-architecture.md) —
it does not redefine RBAC, least privilege, or audit logging, all
already settled there and in
[Milestone 2](../milestone-2-user-roles-permission-architecture/README.md).
This document decides *how* those principles get technically realized.

## Authentication Strategy

**Recommendation: server-side session management, backed by an
OIDC-compatible identity approach, over pure stateless tokens (e.g.,
unmanaged JWTs) as the default.**

| Option | Strengths | Weaknesses |
|---|---|---|
| **Server-side sessions** | A session can be immediately revoked (e.g., if a Role Assignment changes or an account is compromised) — important given the sensitive-data categories in [Security Architecture](../milestone-6-technical-architecture/04-security-architecture.md); simpler mental model for the Portal Switcher's "active Role Assignment" tracking (see below) | Requires session state to be looked up per request — a solved problem at this platform's scale via the caching layer already recommended in [Database Architecture Strategy](./04-database-architecture-strategy.md) |
| **Stateless JWTs** | No server-side lookup needed per request | Revocation is hard — a compromised or role-changed token stays valid until expiry unless additional infrastructure is added, which undermines the "high-risk action" safeguards already flagged as unresolved in [Security Architecture](../milestone-6-technical-architecture/04-security-architecture.md) |

**Rationale:** revocability matters more for Minara-LMS than raw
statelessness — a platform managing academic, financial, and (in
places) health-sciences-adjacent data should be able to immediately cut
off access when something goes wrong, which server-side sessions support
directly and stateless JWTs do not without extra machinery that erodes
their main advantage anyway.

## Identity Management

- The **User** entity (per the
  [Platform Services Domain Model](../milestone-5-domain-model-data-architecture/06-platform-services-domain-model.md))
  is the system of record for a person's identity; the **Authentication
  Identity** entity holds the credential itself, kept conceptually
  distinct so a future second authentication method (see Future SSO
  Considerations, below) can attach to the same User without redesigning
  the identity model.
- Initial authentication method: direct login (email + secret), the
  simplest option that satisfies the MVP's requirements per
  [MVP Scope Definition](../milestone-7-mvp-definition-implementation-planning/02-mvp-scope-definition.md) —
  nothing in the MVP scope calls for more than this at launch.

## Role-Based Access Control (RBAC)

No new decision here — this document confirms the technical
implementation follows
[Security Architecture](../milestone-6-technical-architecture/04-security-architecture.md)
exactly: every Role Assignment resolves to `(Role, Scope)`, checked
against the [Permission Framework](../milestone-2-user-roles-permission-architecture/02-permission-framework.md)'s
View/Create/Edit/Approve matrix at the Application/Orchestration Layer,
per [System Architecture](../milestone-6-technical-architecture/01-system-architecture.md).

## Permission Enforcement

- **Enforced once, centrally** — a single authorization-checking
  component in the Application/Orchestration Layer, consulted by every
  module before a request reaches domain logic, rather than each of the
  thirteen modules from
  [Service Boundaries](../milestone-6-technical-architecture/03-service-boundaries.md)
  re-implementing its own checks. This directly prevents the
  "scattered checks inside individual services" anti-pattern already
  named in
  [System Architecture §Separation of Concerns](../milestone-6-technical-architecture/01-system-architecture.md).
- **Fails closed** — an ambiguous or unresolvable authorization check is
  treated as denied, never as allowed, consistent with the least-
  privilege default in
  [Security Architecture](../milestone-6-technical-architecture/04-security-architecture.md).

## Session Management

- A session tracks the authenticated User and their **currently active**
  Role Assignment — resolving the still-open Portal Switcher question
  from
  [Global Navigation Framework §Needs Verification](../milestone-4-information-architecture/01-global-navigation-framework.md)
  at the technical level: switching portals updates which Role
  Assignment is active within the existing session, rather than
  requiring a new login.
- **⚠️ Needs Verification:** concrete session lifetime and idle-timeout
  values remain unset, carried forward unresolved from
  [Security Architecture](../milestone-6-technical-architecture/04-security-architecture.md) —
  this document adds no new information on that specific question.

## Administrative Security

- Every Administrator action of consequence is Audit Logged exactly like
  any other role's, per
  [Security Architecture §Administrative Actions](../milestone-6-technical-architecture/04-security-architecture.md) —
  restated here because it directly shapes how the session/permission
  layer is built: there is no "trusted admin bypass" path in the
  authorization-checking component described above.
- **Recommendation:** high-risk Administrator actions (revoking another
  Administrator's access, mass Role Assignment changes) require
  re-authentication within the session, not just an active session —
  resolving, in the affirmative, the safeguard question
  [Security Architecture](../milestone-6-technical-architecture/04-security-architecture.md)
  left open. **⚠️ Needs Verification:** the exact list of actions this
  applies to is not yet finalized.

## Future SSO Considerations

- Explicitly **Future**: institutional single sign-on (e.g., if Minara
  schools later want faculty/staff to log in through an existing
  institutional identity system).
- Because Authentication Identity was modeled as distinct from User (per
  [Platform Services Domain Model](../milestone-5-domain-model-data-architecture/06-platform-services-domain-model.md)),
  adding SSO later means adding a second Authentication Identity option
  per User, not redesigning identity — this is the direct payoff of that
  earlier modeling decision.
- **Recommendation for when SSO is pursued:** favor OIDC-compatible
  integration over a proprietary SSO protocol, consistent with this
  milestone's anti-lock-in stance in
  [Technology Selection Principles](./01-technology-selection-principles.md).

## Current / Planned / Future

| Element | Status |
|---|---|
| Server-side session management | **Current** — this milestone's recommendation |
| Direct login (email + secret) as the initial authentication method | **Current** |
| Centralized, fail-closed permission enforcement | **Current** |
| Session tracking of active Role Assignment (Portal Switcher support) | **Planned** |
| Re-authentication requirement for high-risk Administrator actions | **Planned**, exact action list **⚠️ Needs Verification** |
| Institutional SSO (OIDC-compatible) | **Future** |
| Multiple Authentication Identities per User | **Future** |

## ⚠️ Needs Verification

- Concrete session lifetime and idle-timeout values.
- The exact list of "high-risk" Administrator actions requiring
  re-authentication.
- Whether any near-term stakeholder need for institutional SSO exists,
  which would move that item out of Future and into active scope.

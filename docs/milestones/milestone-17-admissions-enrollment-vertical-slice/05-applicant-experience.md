# Applicant Experience

**Status:** Implemented
**Milestone:** 17 — Admissions & Enrollment Vertical Slice
**Date:** 2026-08-12

## Public Entry Point

`src/app/(public)/apply/program/[slug]/page.tsx` — reached from the
existing Program detail page's new "Apply" button (the "Log In" button
remains, unchanged, for a returning User). SSR-first per ADR-002: the
account-creation form posts to a Server Action, nothing depends on
client JavaScript to render correctly.

An already-authenticated visitor hitting this page skips the
account-creation form entirely and is routed straight into starting/
resuming their Application — no redundant form for a returning Applicant
mid-flow.

### Account Creation

`registerAndApplyAction` (`src/app/(public)/apply/program/[slug]/actions.ts`):
validates name/email/password (Zod, min 8-character password, matching
the login form's field conventions), calls `registerApplicant` (the one
self-service exception — see
[Implementation Completion Record](./08-implementation-completion-record.md)),
signs the new User in immediately via the same `createSession` every
login uses, starts their Application, and redirects into the
authenticated flow. A duplicate email is rejected with a clear message
(`EmailAlreadyRegisteredError`), never a raw database constraint error.

## Authenticated Applicant Area

`src/app/(portal)/apply/*` — the one area of the authenticated portal
reachable with **zero Role Assignments**, using `requireSessionUser()`
rather than `requireSessionUserWithRole()`. This is a direct consequence
of "Applicant is not a Role" (see
[Admissions RBAC Design](./04-admissions-rbac-design.md)).

- **`/apply`** — "My Applications": every Application the signed-in User
  owns, with a status badge and a link into each.
- **`/apply/[applicationId]`** — the Applicant's own Application:
  - **DRAFT**: an optional-notes draft form + "Submit Application."
  - **Checklist**: read-only list of every `ApplicationRequirement` and
    its current status (including "⚠️ Needs Verification" literally
    rendered, never hidden).
  - **Decision** (`DENIED`/`WAITLISTED`/`DEFERRED`): the decision reason,
    if one was recorded — nothing about internal admissions notes beyond
    that single field is ever exposed.
  - **`ACCEPTED`**: "Confirm Offer" / "Decline Offer" buttons.
  - **`ACCEPTANCE_CONFIRMED`**: a status message — enrollment is now
    Admissions Staff's action, not the Applicant's.
  - **`ENROLLED`**: a completion message and a link into `/student`.

No form or button anywhere in this area lets an Applicant record a
Decision, edit the checklist, assign a Cohort, or create their own
Enrollment — every one of those actions is Admissions-Staff/
Administrator-only, enforced at the service layer independent of what
this UI does or does not render.

## Data Isolation

Every read in this area (`getApplicationById`,
`listApplicationsForApplicant`) asserts `actor.id === applicantId`
(or the broader staff/oversight read access the service also permits,
which this specific UI narrows further with an explicit
`if (application.applicantId !== user.id) notFound()` guard — the same
double-check pattern `program-director/graduation/[requestId]/page.tsx`
established in Milestone 16). An Applicant can never load another
Applicant's Application, confirmed by both a direct service-layer test
and the browser smoke test's own account-isolation implication (every
step operates as the one authenticated User at a time).

## Restrained Mission-Language Touches

Per this milestone's Phase 21, the MIHS motto ("Courage to begin.
Perseverance to continue. Education to succeed.") appears exactly twice,
both at genuine milestone moments in the Applicant's own journey — once
on the initial Apply page ("Courage to begin"), once on the Enrollment-
completion message ("Perseverance to continue") — never inserted into
business logic, database values, or repeated elsewhere.

## Current / Planned / Future

| Element | Status |
|---|---|
| Public `/apply/program/[slug]` account creation + auto-resume | **Implemented** |
| `/apply`, `/apply/[applicationId]` — draft/submit/status/checklist/decision/offer/enrollment | **Implemented** |
| Zero-Role authenticated access via `requireSessionUser` | **Implemented** |
| Applicant self-accept/self-enroll | **Not built** — explicitly denied, see [RBAC Design](./04-admissions-rbac-design.md) |
| Applicant-facing document upload | **Future** — no document model exists in this slice |

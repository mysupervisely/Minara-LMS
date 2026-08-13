# Tuition Configuration Design

**Status:** Implemented
**Milestone:** 18 — Tuition, Billing & Payments Vertical Slice
**Date:** 2026-08-13
**Implementation:** `prisma/schema.prisma`'s `TuitionConfiguration`; `src/services/billing/billing.ts`'s `configureTuition`

## Why Cohort-Scoped, Not Program-Scoped

This milestone's brief gives its own example: *"2026 Cohort — tuition
amount A; 2027 Cohort — tuition amount B. Existing enrolled students must
retain the amount they were actually charged."* `Cohort` is already the
model that distinguishes one enrollment cycle from the next within a
Program (Milestone 10) — attaching tuition to Program instead would make
it impossible to represent two different rates for two different
Cohorts of the same Program, exactly the scenario the brief asks for.
`TuitionConfiguration.cohortId` is therefore `@unique` — at most one
current rate per Cohort — rather than attaching to `Program` (too
coarse) or `Enrollment` (would require configuring tuition once per
Student, defeating the point of a *rate*).

```prisma
model TuitionConfiguration {
  id          String
  cohortId    String  @unique
  amountCents Int
  currency    String  @default("USD")
  description String?
  createdById String
}
```

## Why Not Program-Version-Scoped

The brief also asked whether tuition belongs to "Program Version." This
platform has no Program-versioning concept at all (only Lesson/
Assessment content is versioned, per Milestone 14's explicit scope) —
inventing one solely to hold a tuition rate would be new architecture
this milestone has no mandate to build. Cohort already provides the
temporal granularity the brief's own example needs.

## How Historical Preservation Actually Works

`TuitionConfiguration` is **not** itself append-only or versioned — it
is a single, current-value row per Cohort, upsertable by an
Administrator at any time (`configureTuition`'s `upsert`). The
historical-preservation guarantee comes from a different mechanism
entirely: `StudentCharge.amountCents` is captured **once**, at the
moment `createChargeForEnrollment` runs, copied from whatever
`TuitionConfiguration` says *at that instant* — and never read from
`TuitionConfiguration` again afterward. Changing a Cohort's rate later
(a typo fix, a genuine tuition increase) only ever affects the *next*
Student who enrolls into that Cohort; every already-created
`StudentCharge` is untouched, by construction (there is no code path
anywhere that recomputes or re-syncs an existing Charge's amount from
its Cohort's current configuration).

This is the same "the workflow row's data is frozen at creation, not
re-derived from a mutable source afterward" discipline already used
elsewhere in this schema (e.g., `Certificate.credentialNumber` is
generated once and never recomputed) — applied here to money instead of
an identifier.

## Non-Authoritative by Design

Every amount configured via `configureTuition` — including the amount
this milestone's own seed data uses — is explicitly demo/configurable,
never claimed as real MIHS pricing. The Admin billing screen's tuition
form carries an inline "⚠️ Demo/configurable value only" notice, and
this milestone's own seed script labels its demo Cohort's
`TuitionConfiguration.description` as "(demo rate, not official
pricing)." See [⚠️ Needs Verification](./13-needs-verification.md).

## Who Can Configure Tuition

Administrator-only, matching `ADMINISTRATOR`'s institution-wide
`ROLE_SCOPE` — tuition-setting is an institutional financial-policy
action, the same authority class as Milestone 16's institutional
Certificate issuance. No other role (including Program Director, despite
Program Director's academic authority over a Program's content) can
configure tuition — see [Security & RBAC](./09-security-rbac.md).

## Current / Planned / Future

| Element | Status |
|---|---|
| Cohort-scoped `TuitionConfiguration`, Administrator-only | **Implemented** |
| Historical preservation via frozen `StudentCharge.amountCents` | **Implemented** |
| Explicit non-authoritative demo labeling | **Implemented** |
| Program-level default rate / multi-currency conversion | **Future** — not required by this narrow slice |

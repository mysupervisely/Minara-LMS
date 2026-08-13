# Portal Impact

**Status:** Implemented
**Milestone:** 18 — Tuition, Billing & Payments Vertical Slice
**Date:** 2026-08-13

## Student Portal

**New:** `/student/billing` — "Billing & Payments," linked from the
shared portal nav (`src/app/(portal)/layout.tsx`).

Per-enrollment: a Financial Clearance badge; each Charge's description,
amount charged, amount paid, and balance; a "Pay Now" button (only shown
while `balanceCents > 0`, redirecting to the simulated hosted-checkout
page) or a "Paid in full" confirmation; a Payment History table (date,
amount, status, and — for a `SUCCEEDED` Payment — its own `id` as the
receipt reference).

Self-only — every read on this page is scoped to the authenticated
Student's own `user.id` at the service layer (`getBillingSummaryForStudent`
asserts self-or-Administrator), the same fail-closed guarantee
Milestones 14–17 established.

## Simulated Hosted-Checkout Page

**New:** `/pay/[sessionId]` — deliberately outside both the `(public)`
marketing site and the `(portal)` authenticated shell (uses only the
bare root layout) — no Minara nav, no Minara session required,
representing having left Minara's own domain entirely, the way a real
provider's hosted checkout page would be. Shows only the amount and
description; never a card-entry form (this page proves "Minara does not
collect raw card data" by never having anywhere to type one in). Two
buttons while `PENDING`: "Complete Test Payment" and "Simulate Failed
Payment" — both clearly labeled as a test/demo flow, not a real charge.

## Administrator Portal

**New:** `/admin/billing` — "Billing & Tuition," linked from the shared
nav. Two sections:

- **Tuition Configuration** — every Cohort, its Program, and its current
  rate (or "Not configured"); a form to set/update a Cohort's rate
  (Administrator-only, with an inline "⚠️ Demo/configurable value only"
  notice).
- **Charges & Payments** — every `StudentCharge` institution-wide, with
  computed charged/paid/balance and the latest Payment's status; a link
  to the Audit Log for full attributable history. No advanced accounting
  reports, no offline/manual-payment recording — this milestone's brief
  explicitly leaves both out as unnecessary for the vertical slice.

**Modified:** `/admin` (dashboard) — one new stat card, "Charges With
Outstanding Balance," linking into `/admin/billing`, matching the
established "administrator dashboard links into every domain's own
management screen" pattern from Milestones 15–17.

## Program Director Portal

**No new screen.** Program Director already sees Financial Clearance
status through the pre-existing Graduation Candidates / candidate-review
screens (Milestone 16), which render `determineGraduationEligibility`'s
`breakdown` — status + human-readable text, never a raw dollar amount.
This automatically satisfies this milestone's Section 14 constraint
("should not automatically receive detailed payment information") with
zero new Program Director-facing code, because that data-minimization
boundary was already built into the breakdown's shape in Milestone 16.

## Admissions Staff / Clinical Coordinator / Faculty Portals

**No changes.** None of these roles has any billing authority — see
[Security & RBAC](./09-security-rbac.md).

## Real Webhook Endpoint (Not a Portal Page)

**New:** `POST /api/webhooks/payments` — a Next.js Route Handler, not a
rendered page. Exists purely as the real, externally-callable HTTP
surface a payment provider (or this milestone's own tests/browser
verification) POSTs a signed confirmation event to. See
[Payment-Provider Architecture](./05-payment-provider-architecture.md).

## SSR Discipline

Every page above is a Server Component by default — `/student/billing`,
`/admin/billing`, and `/pay/[sessionId]` are all server-rendered, with
interactivity limited to plain `<form action={...}>` Server Actions
(Pay Now, Complete Test Payment, tuition configuration), never a broad
client-rendered page. No `"use client"` component was introduced by this
milestone at all — payment initiation needs nothing more than a form
submission and a server-side redirect, per this milestone's own SSR
discipline instruction.

## Current / Planned / Future

| Element | Status |
|---|---|
| Student Billing & Payments | **Implemented** |
| Simulated hosted-checkout page | **Implemented** |
| Administrator Billing & Tuition (config + charges/payments) | **Implemented** |
| Real webhook Route Handler | **Implemented** |
| Program Director / Admissions Staff / Coordinator / Faculty changes | **None required** |
| Offline/manual payment recording | **Not built** — explicitly left out |

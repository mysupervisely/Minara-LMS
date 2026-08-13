# Graduation Integration

**Status:** Implemented
**Milestone:** 18 — Tuition, Billing & Payments Vertical Slice
**Date:** 2026-08-13
**Implementation:** `src/services/graduation/graduation.ts`'s `determineGraduationEligibility` (Milestone 16, modified)

## Exactly What Changed

One import, one function call, one changed line in `eligible`'s
computation, and one changed `breakdown` entry. Nothing else in
`determineGraduationEligibility` — its academic-completion loop, its
externship check, its `missingRequirements` array, its function
signature, its callers — was touched.

**Before (Milestone 16):**
```ts
const eligible = academicComplete && (!externshipRequired || externshipVerified);
// ...
{ label: "Financial Clearance", status: "NOT_APPLICABLE", detail: "Not evaluated..." }
```

**After (Milestone 18):**
```ts
const financialClearance = await determineFinancialClearance(studentId, programId, actor);
const eligible =
  academicComplete && (!externshipRequired || externshipVerified) && financialClearance.status !== "FAILED";
// ...
{ label: "Financial Clearance", status: financialClearance.status, detail: financialClearance.detail }
```

## Read, Never Copy

`determineGraduationEligibility` calls `determineFinancialClearance`
directly, every time it runs — it does not store a financial-clearance
flag anywhere on `GraduationRequest` or any other row, and it does not
duplicate any `StudentCharge`/`Payment` fact. This is the exact same
"read, never copy" discipline this function already applies to
`Placement.completionStatus` (Milestone 15) — extended to a fourth
external signal without changing the pattern.

## What Did Not Change

- **"Academic Requirements" row logic** — untouched.
- **"Externship Requirement" row logic** — untouched.
- **"Other Program Requirements" row** — still hard-coded
  `NEEDS_VERIFICATION`, still never blocks `eligible`. This milestone
  did not touch it, and it is not related to billing.
- **`missingRequirements` array** — this milestone does not push a
  billing-related message onto it; the `breakdown` row is the sole place
  Financial Clearance's status is communicated (`missingRequirements` was
  already, before this milestone, a secondary/legacy field that the
  `breakdown` array's introduction in Milestone 16 partially superseded
  for disclosure purposes — this milestone does not extend its use).
- **`GraduationStateError`/`GraduationAuthorizationError`, the review
  workflow (`submitForGraduationReview`/`approveGraduation`/
  `returnGraduationReview`), or `issueCertificate`** — none of these
  functions changed. Certificate issuance still requires an `APPROVED`
  `GraduationRequest`, exactly as Milestone 16 built it; this milestone
  does not create a "pay-to-graduate" shortcut that bypasses Program
  Director review or Administrator issuance authority.

## Regression Guarantee

Every graduation-eligibility test written in Milestone 16 (and every
graduation-adjacent test in Milestone 17) creates its scenario through
fixtures that never call `configureTuition`/`createChargeForEnrollment`
— meaning `determineFinancialClearance` reads `NEEDS_VERIFICATION` for
every one of them, which (per [Financial-Clearance Design](./06-financial-clearance-design.md))
does not block `eligible`. The full pre-existing test suite was run
after this change and passes unmodified — see
[Testing & Browser Verification](./12-testing-browser-verification.md).

## Current / Planned / Future

| Element | Status |
|---|---|
| Financial Clearance row reads real, derived data | **Implemented** |
| `FAILED` gates `eligible`; `NEEDS_VERIFICATION` does not | **Implemented** |
| Certificate issuance still gated by Program Director approval | **Unchanged, verified** |
| Every other graduation-eligibility rule | **Unchanged, verified via full-suite regression** |

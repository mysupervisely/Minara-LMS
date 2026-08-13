# Minara-LMS

**Status:** Milestones 10 (Foundation Build), 13 (Curriculum Delivery Vertical Slice), 14 (Content Versioning Vertical Slice), 15 (Externship Eligibility & Placement Vertical Slice), 16 (Certificate & Graduation Vertical Slice), 17 (Admissions & Enrollment Vertical Slice), and 18 (Tuition, Billing & Payments Vertical Slice) implemented · Milestone 11 (Curriculum Management & Content Engine) documentation drafted, pending approval
**Last Updated:** 2026-08-13

## What This Repository Is

Minara-LMS is the Learning Management System (LMS) that will power the Minara
Institute of Health Sciences ecosystem — the software platform responsible
for delivering and managing the educational experience across Minara's
schools, programs, and student populations.

This repository is dedicated to the **LMS platform** specifically: its
architecture, product strategy, and implementation. It does not contain
institutional, curricular, or academic content.

## Relationship to Other Minara Repositories

Minara-LMS is one of three deliberately separate repositories in the Minara
ecosystem:

| Repository | Scope | Contains |
|---|---|---|
| **Minara-Master-Plan** | Institutional | Vision, governance, business planning, legal framework, accreditation planning, policies |
| **Minara-Curriculum** | Academic | Programs, courses, lessons, assessments, question banks, learning content |
| **Minara-LMS** (this repo) | Platform / Software | The system that delivers, manages, and operates the educational experience |

Minara-LMS treats institutional strategy (Master-Plan) and academic content
(Curriculum) as **inputs and consumers of the platform**, not as content this
repository owns or duplicates. Where LMS documentation references
institutional or curricular concepts, it does so only to the extent needed to
inform platform architecture, and defers to the source-of-truth repository
for the substance.

## Current Phase

**Milestone 10 — Foundation Build — implemented.** Milestones 1–9 and
the Architecture Decision Record (ADR) foundation (documentation-only)
are complete — see [`docs/`](./docs). This repository is a
[Next.js](https://nextjs.org) (TypeScript, App Router) application
implementing the first working vertical slice of the platform
(Authentication → RBAC → Student Learning → Faculty Grading → Program
Director Approval → Audit Trail), per
[docs/architecture/adr/README.md](./docs/architecture/adr/README.md) and
[docs/milestones/milestone-9-engineering-foundation-development-setup/](./docs/milestones/milestone-9-engineering-foundation-development-setup/).

**Milestone 11 — Curriculum Management & Content Engine — documentation
drafted, pending approval.** A documentation-only milestone specifying
the full curriculum authoring, versioning, publishing, competency
mapping, and assessment engine that extends Milestone 10's deliberately
narrow schema — see
[docs/milestones/milestone-11-curriculum-management-content-engine/](./docs/milestones/milestone-11-curriculum-management-content-engine/README.md).
No application code changes were made for Milestone 11; implementation
against it begins only after review and approval.

**Milestone 12 — Curriculum Delivery Vertical Slice — documentation
drafted, pending approval, now implemented as Milestone 13.** Per
[ADR-011](./docs/architecture/adr/ADR-011-vertical-slice-development-strategy.md),
planned the next narrow, end-to-end slice through Milestone 11's design.
See
[docs/milestones/milestone-12-curriculum-delivery-vertical-slice/](./docs/milestones/milestone-12-curriculum-delivery-vertical-slice/README.md)
for the plan; no application code changes were made under Milestone 12
itself.

**Milestone 13 — Curriculum Delivery Vertical Slice — implemented.**
Builds Milestone 12's plan: Faculty draft a Lesson/Assessment tagged
with a Competency → Program Director reviews (approve or return with a
required reason) → Administrator publishes → enrolled Students see and
complete Published content, submit Assessments, and see a Competency
Progress signal once their Grade is approved — every step audit-logged.
A deliberate narrowing of Milestone 11's full engine (single-track
review, no content versioning, one minimal Competency link, no Question
Banks) — see
[docs/milestones/milestone-12-curriculum-delivery-vertical-slice/03-domain-impact-review.md](./docs/milestones/milestone-12-curriculum-delivery-vertical-slice/03-domain-impact-review.md)
for exactly what was, and deliberately was not, built.

**Milestone 14 — Content Versioning Vertical Slice — implemented.** Per
[ADR-011](./docs/architecture/adr/ADR-011-vertical-slice-development-strategy.md),
the next narrow slice on top of Milestone 13: Lessons and Assessments are
now versioned identities. A Lesson/Assessment is a stable parent record
with a `publishedVersionId` pointer; each LessonVersion/AssessmentVersion
carries its own content and its own Draft → Submitted → Approved →
Published lifecycle through the same content-workflow.ts used since
Milestone 13 (no second workflow engine). Editing Published content is
impossible — Faculty instead create a new Version, which starts as a
Draft invisible to Students and goes through review independently while
the previously Published Version stays live and immutable. Publishing a
new Version only repoints `publishedVersionId` for *future* activity;
existing `LessonCompletion`/`Submission` rows stay foreign-keyed to the
exact Version a Student actually completed/submitted, so historical
records remain accurate after newer Versions are published. See
[docs/milestones/milestone-12-curriculum-delivery-vertical-slice/03-domain-impact-review.md](./docs/milestones/milestone-12-curriculum-delivery-vertical-slice/03-domain-impact-review.md)
for the boundary Milestone 13 deliberately left open ("no content
versioning") that this milestone now closes, narrowly, for Lessons and
Assessments only (Programs/Courses/Modules, Question Banks, and an
Archive workflow remain out of scope).

**Milestone 15 — Externship Eligibility & Placement Vertical Slice —
implemented.** Before extending the platform further, this milestone
first performed an architecture/product review — inventorying what's
actually implemented versus documentation only across every named
platform area, evaluating (and deferring) Course-level versioning,
ranking the next five implementation candidates against what a real
operating Pharmacy Technology school needs — then implemented the one
narrow slice that review recommended: eligibility determination → Clinical
Site management → Placement request/approval/activation → Midpoint/Final
Evaluation → joint Coordinator + Program Director Completion
Verification. Activates the already-declared `CLINICAL_COORDINATOR` role
(per `src/domain/roles.ts`, unchanged in shape since Milestone 10) rather
than introducing a new one; reuses the same approval-gate and audit
patterns proven in Milestones 10, 13, and 14. Deliberately excludes
Employer/Preceptor self-service login, itemized Hours Log, and Site
Agreement tracking — see
[docs/milestones/milestone-15-externship-eligibility-placement-vertical-slice/](./docs/milestones/milestone-15-externship-eligibility-placement-vertical-slice/README.md)
for the full planning package and the
[Implementation Completion Record](./docs/milestones/milestone-15-externship-eligibility-placement-vertical-slice/07-implementation-completion-record.md)
for exactly what was built.

**Milestone 16 — Certificate & Graduation Vertical Slice —
implemented.** The final leg of the Student Lifecycle Workflow: academic
completion → externship completion (when the Program requires one, read
directly from Milestone 15's `Placement.completionStatus === "VERIFIED"`
signal, never recomputed) → graduation eligibility (a derived, fail-closed
computation — never persisted) → Program Director review (approve or
return with a required reason, the same approval-gate shape reused a
fifth time) → institutional Certificate issuance (Administrator-only) →
the Student's Enrollment transitioning to Alumni status, reusing the
existing `Enrollment.status` field with an additive value rather than a
new entity. No new RBAC role, no invented GPA/hour/competency
requirement, no PDF or public verification service — see
[docs/milestones/milestone-16-certificate-graduation-vertical-slice/](./docs/milestones/milestone-16-certificate-graduation-vertical-slice/README.md)
for the full design and the
[Implementation Completion Record](./docs/milestones/milestone-16-certificate-graduation-vertical-slice/07-implementation-completion-record.md)
for exactly what was built.

**Milestone 17 — Admissions & Enrollment Vertical Slice —
implemented.** The first leg of the Student Lifecycle Workflow: a real
prospective learner can now go from a public Program page, through
self-service account creation (the platform's one deliberate exception
to otherwise Administrator-provisioned accounts), an Application,
Admissions Staff review, a Decision (Accept/Deny/Waitlist/Defer), offer
confirmation, and Cohort assignment, to a real Enrollment created
through Milestone 10's unmodified `createEnrollment` — the same User
identity moving from Applicant to Student, never duplicated. Activates
the already-declared `ADMISSIONS_STAFF` role (per `src/domain/roles.ts`,
unchanged in shape since Milestone 10) rather than introducing a new
one; Program Director admissions involvement stays read-only, per
[Admissions Workflows](./docs/milestones/milestone-3-student-journey-core-workflows/03-admissions-workflows.md)'s
own unresolved question about the exact Decision-authority split.
Reuses the same approval-gate and audit patterns proven in Milestones
10, 13, 14, 15, and 16. Deliberately excludes payments, financial aid,
transcripts, background checks, document upload/OCR, and any invented
Pharmacy Technology admission requirement — see
[docs/milestones/milestone-17-admissions-enrollment-vertical-slice/](./docs/milestones/milestone-17-admissions-enrollment-vertical-slice/README.md)
for the full design and the
[Implementation Completion Record](./docs/milestones/milestone-17-admissions-enrollment-vertical-slice/08-implementation-completion-record.md)
for exactly what was built. With Milestones 16 and 17 both implemented,
the full Student Lifecycle Workflow — Admissions → Enrollment → Learning
→ Assessment → Grade → Externship → Graduation → Alumni — is
demonstrable end-to-end for the first time.

**Milestone 18 — Tuition, Billing & Payments Vertical Slice —
implemented.** Replaces the disclosed `NEEDS_VERIFICATION` Financial
Clearance placeholder Milestone 16's graduation eligibility breakdown
left open with a real, derived, fail-closed signal. An Administrator
configures tuition per Cohort (`TuitionConfiguration`) — a later rate
change never retroactively affects a Student already charged, since
`StudentCharge.amountCents` is frozen at creation time. When an accepted
Applicant becomes Enrolled through Milestone 17's flow, a tuition Charge
is created automatically (idempotent — a duplicate enrollment trigger,
migration re-run, or browser refresh never produces a second Charge).
The Student initiates payment through a clean `PaymentProviderAdapter`
boundary (`MockPaymentProvider` standing in for a real provider — no
production account exists in this environment, but the same interface
would support one without changing any business rule in
`src/services/billing/billing.ts`); payment confirmation is never trusted
from a client-side redirect — it is confirmed only through a signed,
HMAC-verified webhook (`POST /api/webhooks/payments`), idempotent against
duplicate/retried delivery by three independent mechanisms. A Student's
outstanding balance is always derived (charges minus successful
payments), never a separately-maintained field. Financial Clearance
(`PASSED`/`FAILED`/`NEEDS_VERIFICATION`) is read live by graduation
eligibility, never copied into a graduation record; a real `FAILED`
balance blocks graduation, while `NEEDS_VERIFICATION` (no tuition
configured yet) deliberately does not, preserving every pre-existing
Milestone 16 graduation test unmodified. No general ledger, no financial
aid, no installment plans, no real payment-provider account, no
hard-coded Pharmacy Technology tuition — the seeded $5,000.00 demo rate
is explicitly labeled a demo value, never institutional policy — see
[docs/milestones/milestone-18-tuition-billing-payments-vertical-slice/](./docs/milestones/milestone-18-tuition-billing-payments-vertical-slice/README.md)
for the full design and the
[Implementation Completion Record](./docs/milestones/milestone-18-tuition-billing-payments-vertical-slice/11-implementation-completion-record.md)
for exactly what was built.

## Documentation

All architecture and product documentation lives under [`docs/`](./docs).
Start with the [documentation index](./docs/README.md), or the
[ADR index](./docs/architecture/adr/README.md) for the governing
architectural decisions.

## Local Development

```bash
npm install
npx prisma migrate dev   # applies the schema and creates the local SQLite database
npm run db:seed          # seeds a demo Institution/School/Program and one user per role
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). See
`docs/milestones/milestone-9-engineering-foundation-development-setup/03-development-environment-strategy.md`
for the full environment strategy this local setup implements.

```bash
npm test                 # runs the Vitest suite (auth, RBAC, curriculum delivery, versioning, externship, graduation/certificate, admissions/enrollment, and tuition/billing/payments workflow tests)
npm run build             # production build
```

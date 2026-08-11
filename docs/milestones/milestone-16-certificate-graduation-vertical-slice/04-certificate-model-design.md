# Certificate Model & Design

**Status:** Implemented
**Milestone:** 16 — Certificate & Graduation Vertical Slice
**Date:** 2026-08-11
**Implementation:** `prisma/schema.prisma`'s `GraduationRequest`/`Certificate` models; `issueCertificate` in `src/services/graduation/graduation.ts`

## Two Models, Not One

The brief asked for "the smallest useful representation" of a
Certificate. Rather than folding "review state" and "the record of
issuance" into one row, this milestone keeps the reused approval-gate
(`GraduationRequest`) and the institutional act of record (`Certificate`)
as two separate models connected 1:1:

```prisma
model GraduationRequest {
  id            String    @id @default(cuid())
  studentId     String
  programId     String
  status        String    @default("SUBMITTED") // SUBMITTED | APPROVED | RETURNED | CERTIFICATE_ISSUED
  returnReason  String?
  submittedById String
  submittedAt   DateTime  @default(now())
  approvedById  String?
  approvedAt    DateTime?
  certificate   Certificate?
  @@unique([studentId, programId])
}

model Certificate {
  id                   String   @id @default(cuid())
  graduationRequestId  String   @unique
  studentId            String
  programId            String
  credentialNumber     String   @unique
  status               String   @default("ISSUED")
  issuedById           String
  issuedAt             DateTime @default(now())
}
```

This mirrors the schema's own established convention (see e.g.
`LessonVersion`/`Submission` vs. `Grade` in Milestone 10/13/14): a
review/workflow row and the artifact it produces are separate models
connected by a foreign key, not one row wearing two hats. It also keeps
the 1:1 invariant explicit and enforced at the database level
(`graduationRequestId String @unique`) — a `GraduationRequest` can never
have more than one `Certificate`, and `issueCertificate` only ever
creates one, guarded by the `status !== "APPROVED"` check.

## Field-by-Field Rationale

| Field | Why it exists | Why nothing more |
|---|---|---|
| `studentId`, `programId` | Denormalized onto `Certificate` directly (not read only through `graduationRequest.studentId`) so every list/history query (`listIssuedCertificates`, the Student's own certificate view) is a single indexed query, matching the same denormalization already used elsewhere (e.g. `Placement.studentId` alongside `Placement.clinicalSiteId`). | No snapshot of the Student's name/Program name at issuance time — both are read live via the relation, consistent with this schema never freezing a name into a fact table. |
| `credentialNumber` | The one human-facing identifier a Certificate needs — see below. | No separately-tracked "certificate title," "degree type," or "field of study" — the Program relation already carries that. |
| `status` | `"ISSUED"` today; present as a field (not hard-coded) so a future revocation state has somewhere to go without a schema change. | No revocation workflow is built in this milestone — see [Known Limitations](./09-known-limitations-future-expansion.md). |
| `issuedById`, `issuedAt` | The actor and moment of the institutional act of record — the same "who and when" shape as `GraduationRequest.approvedById`/`approvedAt` and every other approval-gate before it. | No physical/PDF artifact is generated or stored — see below. |

## Credential Identifier

```ts
function generateCredentialNumber(): string {
  const year = new Date().getFullYear();
  const random = randomBytes(4).toString("hex").toUpperCase();
  return `CERT-${year}-${random}`;
}
```

`CERT-{year}-{8 hex characters}` — unique (`@unique` in the schema,
collision astronomically unlikely with 4 random bytes, and the field is
still uniqueness-checked by the database regardless). This is an
**internal identifier**, not a claim of any external credentialing
authority's numbering scheme — nothing about Pharmacy Technology
certification numbering was known or assumed, so nothing was invented.

## Deliberately Not Built

- **No public verification URL or endpoint.** The brief allowed one only
  "if the architecture requires it." Nothing in this slice requires an
  unauthenticated party to verify a Certificate — the Administrator's own
  issuance history and the Student's own portal view are the only
  consumers built. Adding a public verification surface is a distinct,
  separately-scoped feature (its own authentication/rate-limiting/data-
  exposure considerations) that this milestone does not need in order to
  prove the vertical slice.
- **No external credential-verification service integration.** Explicitly
  excluded in the brief; nothing here calls out to, or models data for,
  any third-party verification network.
- **No PDF/rendered certificate document.** The brief permitted this only
  if "minimal and necessary" — it is not necessary to prove the
  eligibility → review → issuance → Alumni vertical slice, so no
  document-generation dependency was introduced. The Student's portal
  displays the Certificate's fields directly (credential number, Program,
  issue date, issuing Administrator).
- **No digital badge infrastructure.** Explicitly excluded in the brief.

## Relationship to Graduation Request

`Certificate` only comes into existence via `issueCertificate(requestId,
actor)`, which requires `GraduationRequest.status === "APPROVED"` and
atomically (within the same function call) also transitions the request
to its terminal `"CERTIFICATE_ISSUED"` status and the Student's
`Enrollment.status` to `"ALUMNI"` — see
[Workflow & State Transitions](./05-workflow-state-transitions.md) for
the full sequence and why these three consequences are treated as one
institutional act rather than three separately-triggerable ones.

## ⚠️ Needs Verification

- Whether Minara's eventual credentialing/registrar process expects a
  specific credential-number format (e.g. a sequential registrar number
  rather than a random one) — `CERT-{year}-{hex}` is an internal
  placeholder scheme, not a claim about the institution's real numbering
  convention.
- Whether a Certificate ever needs to be revoked/reissued in practice,
  and under what governance — the `status` field exists to make this
  possible later without a schema change, but no revocation workflow is
  specified or built here.

## Current / Planned / Future

| Element | Status |
|---|---|
| `Certificate` model, 1:1 with `GraduationRequest` | **Implemented** |
| Internal credential number generation | **Implemented** |
| `status` field present for future revocation | **Implemented** (field only — no workflow) |
| Public verification URL/endpoint | **Future** — not required by this slice |
| PDF/rendered certificate document | **Future** — not required by this slice |
| External credential-verification integration | **Future** — explicitly out of scope |
| Digital badge issuance | **Future** — explicitly out of scope |

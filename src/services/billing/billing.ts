import "server-only";
import { db } from "@/lib/db";
import { recordAuditEvent } from "@/services/audit/audit";
import { isAdministrator, hasRoleForProgram, hasAnyRole } from "@/services/identity/rbac";
import { paymentProvider } from "@/services/billing/payment-provider";
import type { SessionUser } from "@/services/identity/session";

/**
 * Billing bounded context — Milestone 18's Tuition, Billing & Payments
 * Vertical Slice.
 *
 * Proves the core financial vertical slice:
 * Program Tuition Configuration → Student Charge → Payment → Balance
 * Update → Receipt → Financial Clearance → Audit Trail. Deliberately NOT
 * a general ledger — see this milestone's own "do not build unnecessary
 * accounting complexity" instruction and
 * docs/milestones/milestone-18-tuition-billing-payments-vertical-slice/04-charge-payment-domain-design.md.
 *
 * Every amount is derived, never cached: balance and financial clearance
 * are computed fresh from Charge/Payment rows every time they're asked
 * for, the same "derived, never persisted" discipline
 * src/services/graduation/graduation.ts's eligibility computation already
 * established in Milestone 16.
 *
 * Service-layer-enforced authorization throughout, per the pattern
 * Milestone 15 established and Milestones 16/17 continued: every scoped
 * function here asserts its own Role/Scope via
 * @/services/identity/rbac, never trusting its `actions.ts` caller
 * alone.
 *
 * No Pharmacy Technology (or any other Program's) tuition amount is
 * hard-coded anywhere in this module — every amount comes from a real
 * TuitionConfiguration row, entered as configurable, clearly
 * non-authoritative demo data (see prisma/seed.ts and this milestone's
 * own ⚠️ Needs Verification document).
 */

export class BillingStateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BillingStateError";
  }
}

export class BillingAuthorizationError extends Error {
  constructor(message = "You are not authorized to perform this action.") {
    super(message);
    this.name = "BillingAuthorizationError";
  }
}

function assertAdministrator(actor: SessionUser): void {
  if (!isAdministrator(actor)) {
    throw new BillingAuthorizationError("Only an Administrator may perform institutional financial administration.");
  }
}

function assertAdministratorOrAdmissionsStaff(actor: SessionUser): void {
  if (!isAdministrator(actor) && !hasAnyRole(actor, "ADMISSIONS_STAFF")) {
    throw new BillingAuthorizationError("Only Admissions Staff or an Administrator may perform this action.");
  }
}

/** A Student may always see/act on their own financial records. Fails closed otherwise. */
function assertStudentSelf(actor: SessionUser, studentId: string): void {
  if (actor.id !== studentId) {
    throw new BillingAuthorizationError("You may only access your own financial records.");
  }
}

/** Full billing detail (amounts, payment history): the Student themself, or an Administrator. Program Director and Admissions Staff are deliberately excluded — see this milestone's RBAC design doc for why Program Director only ever sees the status-only clearance signal (via determineFinancialClearance below, folded into Graduation Eligibility), never raw amounts. */
function assertFullBillingReadAccess(actor: SessionUser, studentId: string): void {
  if (actor.id === studentId) return;
  if (isAdministrator(actor)) return;
  throw new BillingAuthorizationError("You may not view this Student's financial records.");
}

// ── Tuition Configuration ────────────────────────────────────────────────

export interface ConfigureTuitionInput {
  cohortId: string;
  amountCents: number;
  currency?: string;
  description?: string;
}

/** Administrator-only — institutional financial policy, matching ADMINISTRATOR's institution-wide ROLE_SCOPE. Upserts the one TuitionConfiguration row per Cohort; changing it never retroactively affects an already-created StudentCharge (see this module's header comment). */
export async function configureTuition(input: ConfigureTuitionInput, actor: SessionUser) {
  assertAdministrator(actor);
  if (input.amountCents < 0 || !Number.isInteger(input.amountCents)) {
    throw new BillingStateError("Tuition amount must be a non-negative whole number of cents.");
  }

  const cohort = await db.cohort.findUnique({ where: { id: input.cohortId } });
  if (!cohort) throw new BillingStateError("Cohort not found.");

  const configuration = await db.tuitionConfiguration.upsert({
    where: { cohortId: input.cohortId },
    update: {
      amountCents: input.amountCents,
      currency: input.currency ?? "USD",
      description: input.description ?? null,
    },
    create: {
      cohortId: input.cohortId,
      amountCents: input.amountCents,
      currency: input.currency ?? "USD",
      description: input.description ?? null,
      createdById: actor.id,
    },
  });

  await recordAuditEvent({
    actorId: actor.id,
    action: "TUITION_CONFIGURED",
    entityType: "TuitionConfiguration",
    entityId: configuration.id,
    metadata: { cohortId: input.cohortId, amountCents: input.amountCents, currency: configuration.currency },
  });

  return configuration;
}

export async function getTuitionConfigurationForCohort(cohortId: string, actor: SessionUser) {
  assertAdministrator(actor);
  return db.tuitionConfiguration.findUnique({ where: { cohortId } });
}

// ── Charge Creation ──────────────────────────────────────────────────────

/**
 * Called from src/services/admissions/admissions.ts's
 * createEnrollmentFromApplication — see this milestone's own Section 3
 * framing ("through the existing Milestone 17 flow"). Idempotent by
 * construction: `StudentCharge`'s own `@@unique([enrollmentId, category])`
 * is the database-level guarantee; this function also checks first so a
 * repeated call returns the existing Charge rather than throwing.
 *
 * If the Enrollment's Cohort has no TuitionConfiguration, this returns
 * `null` — no error, no invented amount. A Program/Cohort simply not yet
 * having tuition configured is not a failure condition; the resulting
 * Enrollment has no financial obligation recorded and its financial
 * clearance later reads NEEDS_VERIFICATION, never a fabricated PASSED.
 */
export async function createChargeForEnrollment(enrollmentId: string, actor: SessionUser) {
  assertAdministratorOrAdmissionsStaff(actor);

  const existing = await db.studentCharge.findUnique({
    where: { enrollmentId_category: { enrollmentId, category: "TUITION" } },
  });
  if (existing) return existing;

  const enrollment = await db.enrollment.findUnique({ where: { id: enrollmentId } });
  if (!enrollment) throw new BillingStateError("Enrollment not found.");

  const tuition = await db.tuitionConfiguration.findUnique({ where: { cohortId: enrollment.cohortId } });
  if (!tuition) return null;

  try {
    const charge = await db.studentCharge.create({
      data: {
        enrollmentId,
        studentId: enrollment.studentId,
        programId: enrollment.programId,
        category: "TUITION",
        description: tuition.description ?? "Tuition",
        amountCents: tuition.amountCents,
        currency: tuition.currency,
      },
    });

    await recordAuditEvent({
      actorId: actor.id,
      action: "STUDENT_CHARGE_CREATED",
      entityType: "StudentCharge",
      entityId: charge.id,
      metadata: {
        enrollmentId,
        studentId: enrollment.studentId,
        programId: enrollment.programId,
        amountCents: charge.amountCents,
        currency: charge.currency,
      },
    });

    return charge;
  } catch (error) {
    // A concurrent call already created it between the findUnique above
    // and this create — the @@unique constraint is the true guarantee;
    // treat the race as the same idempotent outcome, not an error.
    const already = await db.studentCharge.findUnique({
      where: { enrollmentId_category: { enrollmentId, category: "TUITION" } },
    });
    if (already) return already;
    throw error;
  }
}

// ── Balance / Reads ───────────────────────────────────────────────────────

export interface ChargeSummary {
  id: string;
  description: string;
  amountCents: number;
  currency: string;
  paidCents: number;
  balanceCents: number;
  createdAt: Date;
  payments: {
    id: string;
    amountCents: number;
    currency: string;
    status: string;
    createdAt: Date;
    confirmedAt: Date | null;
  }[];
}

export interface BillingSummary {
  charges: ChargeSummary[];
  totalChargedCents: number;
  totalPaidCents: number;
  balanceCents: number;
  clearance: FinancialClearanceResult;
}

function summarizeCharge(
  charge: Awaited<ReturnType<typeof fetchChargesWithPayments>>[number],
): ChargeSummary {
  const paidCents = charge.payments
    .filter((p) => p.status === "SUCCEEDED")
    .reduce((sum, p) => sum + p.amountCents, 0);
  return {
    id: charge.id,
    description: charge.description,
    amountCents: charge.amountCents,
    currency: charge.currency,
    paidCents,
    balanceCents: charge.amountCents - paidCents,
    createdAt: charge.createdAt,
    payments: charge.payments.map((p) => ({
      id: p.id,
      amountCents: p.amountCents,
      currency: p.currency,
      status: p.status,
      createdAt: p.createdAt,
      confirmedAt: p.confirmedAt,
    })),
  };
}

async function fetchChargesWithPayments(where: { enrollmentId?: string; studentId?: string; programId?: string }) {
  return db.studentCharge.findMany({
    where,
    include: { payments: { orderBy: { createdAt: "asc" } } },
    orderBy: { createdAt: "asc" },
  });
}

/** Full detail — Student (self) or Administrator only. */
export async function getBillingSummaryForStudent(
  studentId: string,
  programId: string,
  actor: SessionUser,
): Promise<BillingSummary> {
  assertFullBillingReadAccess(actor, studentId);

  const charges = await fetchChargesWithPayments({ studentId, programId });
  const summarized = charges.map(summarizeCharge);
  const totalChargedCents = summarized.reduce((sum, c) => sum + c.amountCents, 0);
  const totalPaidCents = summarized.reduce((sum, c) => sum + c.paidCents, 0);

  return {
    charges: summarized,
    totalChargedCents,
    totalPaidCents,
    balanceCents: totalChargedCents - totalPaidCents,
    clearance: await determineFinancialClearance(studentId, programId, actor),
  };
}

// ── Financial Clearance ──────────────────────────────────────────────────

export type ClearanceStatus = "PASSED" | "FAILED" | "NEEDS_VERIFICATION";

export interface FinancialClearanceResult {
  status: ClearanceStatus;
  balanceCents: number | null;
  detail: string;
}

/** Same read-access shape graduation.ts's own assertStudentOrOversight uses (self, or Program-Director-with-oversight, or Administrator via that check's own bypass) — duplicated here narrowly rather than importing from graduation.ts, keeping the import direction one-way (graduation.ts imports this module, not the reverse). */
function assertClearanceReadAccess(actor: SessionUser, studentId: string, programId: string): void {
  if (actor.id === studentId) return;
  if (hasRoleForProgram(actor, "PROGRAM_DIRECTOR", programId)) return;
  throw new BillingAuthorizationError("You may not view this Student's financial clearance status.");
}

/**
 * Financially Cleared = required institutional balance is zero, per this
 * milestone's own narrow rule. Fails closed by construction:
 * - No Enrollment found → NEEDS_VERIFICATION (nothing to determine).
 * - No StudentCharge exists for the Enrollment → NEEDS_VERIFICATION
 *   (tuition was never configured/charged for this Enrollment — not an
 *   invented pass, not an invented fail).
 * - A real, positive outstanding balance → FAILED.
 * - Balance is zero (or, defensively, negative — an overpayment) →
 *   PASSED.
 *
 * This is the exact function src/services/graduation/graduation.ts calls
 * to replace its previous hard-coded "Financial Clearance: NOT_APPLICABLE"
 * placeholder — see this milestone's Graduation Integration doc for why
 * NEEDS_VERIFICATION deliberately does not gate graduation eligibility
 * (preserving every pre-Milestone-18 graduation test unmodified) while
 * FAILED does.
 */
export async function determineFinancialClearance(
  studentId: string,
  programId: string,
  actor: SessionUser,
): Promise<FinancialClearanceResult> {
  assertClearanceReadAccess(actor, studentId, programId);

  const enrollment = await db.enrollment.findUnique({
    where: { studentId_programId: { studentId, programId } },
  });
  if (!enrollment) {
    return { status: "NEEDS_VERIFICATION", balanceCents: null, detail: "No Enrollment found for this Student in this Program." };
  }

  const charges = await fetchChargesWithPayments({ enrollmentId: enrollment.id });
  if (charges.length === 0) {
    return {
      status: "NEEDS_VERIFICATION",
      balanceCents: null,
      detail: "No tuition charge has been recorded for this Enrollment yet.",
    };
  }

  const summarized = charges.map(summarizeCharge);
  const balanceCents = summarized.reduce((sum, c) => sum + c.balanceCents, 0);

  if (balanceCents > 0) {
    return { status: "FAILED", balanceCents, detail: `Outstanding balance of ${balanceCents} cents.` };
  }
  return { status: "PASSED", balanceCents, detail: "Required balance is zero." };
}

// ── Payment ───────────────────────────────────────────────────────────────

/**
 * Student-only (self) — starts (or, per this milestone's mandatory
 * idempotency requirement, resumes) a payment attempt against one
 * Charge. A repeated call (browser refresh, double-click) while a
 * PENDING Payment already exists for this Charge returns that same
 * Payment/checkout session rather than creating a second one.
 */
export async function startPayment(chargeId: string, actor: SessionUser) {
  const charge = await db.studentCharge.findUnique({ where: { id: chargeId } });
  if (!charge) throw new BillingStateError("Charge not found.");
  assertStudentSelf(actor, charge.studentId);

  const existingPending = await db.payment.findFirst({
    where: { chargeId, status: "PENDING" },
    orderBy: { createdAt: "desc" },
  });
  if (existingPending) return existingPending;

  const payments = await db.payment.findMany({ where: { chargeId } });
  const summarized = summarizeCharge({ ...charge, payments });
  if (summarized.balanceCents <= 0) {
    throw new BillingStateError("This Charge already has a zero (or credit) balance — no payment is needed.");
  }

  const session = await paymentProvider.createCheckoutSession({
    amountCents: summarized.balanceCents,
    currency: charge.currency,
  });

  const payment = await db.payment.create({
    data: {
      chargeId,
      studentId: charge.studentId,
      amountCents: summarized.balanceCents,
      currency: charge.currency,
      provider: paymentProvider.name,
      providerSessionId: session.providerSessionId,
      initiatedById: actor.id,
    },
  });

  await recordAuditEvent({
    actorId: actor.id,
    action: "PAYMENT_STARTED",
    entityType: "Payment",
    entityId: payment.id,
    metadata: { chargeId, studentId: charge.studentId, amountCents: payment.amountCents },
  });

  return payment;
}

/** Public checkout view — deliberately minimal (no Student name, no other Payments) since the simulated hosted-checkout page (src/app/(public)/pay/[sessionId]/page.tsx) represents having left Minara's authenticated context, mirroring a real provider's own hosted page. Looked up by providerSessionId — the identifier the (simulated) provider's own checkout URL is keyed by, not Minara's internal Payment id, matching how a real provider's hosted page works. */
export async function getPublicCheckoutView(providerSessionId: string) {
  const payment = await db.payment.findUnique({
    where: { providerSessionId },
    include: { charge: { select: { description: true } } },
  });
  if (!payment) return null;
  return {
    id: payment.id,
    status: payment.status,
    amountCents: payment.amountCents,
    currency: payment.currency,
    description: payment.charge.description,
    providerSessionId: payment.providerSessionId,
  };
}

export interface WebhookProcessingResult {
  ok: boolean;
  idempotent: boolean;
  reason?: string;
}

/**
 * The one, authoritative confirmation path — never trust a client
 * redirect as proof of payment (see this module's own checkout-return
 * page, which only ever displays status read fresh from the database,
 * never a query-string parameter). Idempotent by construction:
 * `Payment.providerEventId`'s own `@unique` constraint is the final
 * database-level guarantee; the `status: "PENDING"`-guarded
 * conditional update above that is what makes two concurrent deliveries
 * of the same event resolve to exactly one state change.
 */
export async function processPaymentWebhookPayload(
  rawBody: string,
  signatureHeader: string | null,
): Promise<WebhookProcessingResult> {
  const event = paymentProvider.verifyAndParseWebhook(rawBody, signatureHeader);
  if (!event) {
    return { ok: false, idempotent: false, reason: "Invalid or unverifiable webhook signature/payload." };
  }

  const payment = await db.payment.findUnique({ where: { providerSessionId: event.providerSessionId } });
  if (!payment) {
    return { ok: false, idempotent: false, reason: "Unknown payment session." };
  }

  if (payment.providerEventId === event.eventId) {
    // The exact same event, already processed — the idempotency
    // guarantee this milestone requires. Not an error; a no-op success.
    return { ok: true, idempotent: true };
  }

  const charge = await db.studentCharge.findUniqueOrThrow({ where: { id: payment.chargeId } });
  const before = await determineFinancialClearanceUnchecked(payment.studentId, charge);

  // Guarded by status: "PENDING" so two concurrent deliveries of the
  // same (or a conflicting) event can only ever have exactly one of
  // them actually flip the row — the other's updateMany affects 0 rows.
  const updateResult = await db.payment.updateMany({
    where: { id: payment.id, status: "PENDING" },
    data: {
      status: event.outcome,
      providerEventId: event.eventId,
      confirmedAt: new Date(),
    },
  });

  if (updateResult.count === 0) {
    // Already resolved by a prior event — idempotent no-op, not an error.
    return { ok: true, idempotent: true };
  }

  await recordAuditEvent({
    actorId: null, // system/external-provider-initiated — no authenticated Minara actor, per src/services/identity/auth.ts's own precedent for events with no Minara actor
    action: event.outcome === "SUCCEEDED" ? "PAYMENT_CONFIRMED" : "PAYMENT_FAILED",
    entityType: "Payment",
    entityId: payment.id,
    metadata: {
      chargeId: payment.chargeId,
      studentId: payment.studentId,
      amountCents: payment.amountCents,
      providerEventId: event.eventId,
    },
  });

  if (event.outcome === "SUCCEEDED") {
    const after = await determineFinancialClearanceUnchecked(payment.studentId, charge);
    if (before.status !== after.status) {
      await recordAuditEvent({
        actorId: null,
        action: "FINANCIAL_CLEARANCE_CHANGED",
        entityType: "StudentCharge",
        entityId: charge.id,
        metadata: { studentId: payment.studentId, programId: charge.programId, from: before.status, to: after.status },
      });
    }
  }

  return { ok: true, idempotent: false };
}

/** Internal, actor-free variant of determineFinancialClearance used only by the webhook processor above (a system event, not an authenticated request) — computes the same PASSED/FAILED/NEEDS_VERIFICATION signal without an RBAC check, since there is no session to check it against. */
async function determineFinancialClearanceUnchecked(
  studentId: string,
  chargeHint: { programId: string },
): Promise<FinancialClearanceResult> {
  const enrollment = await db.enrollment.findUnique({
    where: { studentId_programId: { studentId, programId: chargeHint.programId } },
  });
  if (!enrollment) return { status: "NEEDS_VERIFICATION", balanceCents: null, detail: "No Enrollment found." };

  const charges = await fetchChargesWithPayments({ enrollmentId: enrollment.id });
  if (charges.length === 0) {
    return { status: "NEEDS_VERIFICATION", balanceCents: null, detail: "No tuition charge recorded yet." };
  }
  const balanceCents = charges.map(summarizeCharge).reduce((sum, c) => sum + c.balanceCents, 0);
  if (balanceCents > 0) return { status: "FAILED", balanceCents, detail: `Outstanding balance of ${balanceCents} cents.` };
  return { status: "PASSED", balanceCents, detail: "Required balance is zero." };
}

// ── Administrator Reads ──────────────────────────────────────────────────

export async function listChargesForAdmin(actor: SessionUser, programId?: string) {
  assertAdministrator(actor);
  return db.studentCharge.findMany({
    where: programId ? { programId } : {},
    include: { student: true, program: true, payments: { orderBy: { createdAt: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
}

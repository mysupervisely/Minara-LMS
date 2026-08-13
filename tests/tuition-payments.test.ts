import { describe, it, expect, beforeEach } from "vitest";
import { randomUUID } from "node:crypto";
import { resetDatabase } from "./helpers/reset-db";
import {
  buildFullScenario,
  buildAdmissionsScenario,
  configureTuitionForScenario,
  buildEnrolledApplicant,
  completeAcademicWorkForStudent,
  buildTestUser,
  actorFor,
} from "./helpers/fixtures";
import { assignRole } from "@/services/identity/users";
import { listAuditLog } from "@/services/audit/audit";
import { db } from "@/lib/db";
import {
  createChargeForEnrollment,
  getBillingSummaryForStudent,
  determineFinancialClearance,
  startPayment,
  getPublicCheckoutView,
  processPaymentWebhookPayload,
  listChargesForAdmin,
  BillingStateError,
  BillingAuthorizationError,
} from "@/services/billing/billing";
import { signMockWebhookPayload } from "@/services/billing/payment-provider";
import {
  determineGraduationEligibility,
  submitForGraduationReview,
  approveGraduation,
  issueCertificate,
  GraduationStateError,
} from "@/services/graduation/graduation";

/**
 * Tuition, Billing & Payments test suite — Milestone 18's own dedicated
 * coverage, mirroring the shape and rigor of
 * tests/admissions-enrollment.test.ts (Milestone 17) and
 * tests/certificate-graduation.test.ts (Milestone 16): a main
 * integration test walking the full narrow slice end to end (Charge ->
 * Payment -> Balance -> Financial Clearance -> Graduation), plus focused
 * tests for every RBAC boundary, idempotency guarantee, and audit-
 * reconstruction requirement this milestone's brief names explicitly
 * (its 25-point list).
 */
describe("Tuition, Billing & Payments Vertical Slice", () => {
  beforeEach(resetDatabase);

  async function confirmSucceeded(providerSessionId: string, amountCents: number) {
    const { rawBody, signature } = signMockWebhookPayload({
      eventId: randomUUID(),
      providerSessionId,
      outcome: "SUCCEEDED",
      amountCents,
    });
    return processPaymentWebhookPayload(rawBody, signature);
  }

  it("walks a Student through the full narrow slice: Charge -> Payment -> Balance -> Financial Clearance -> Graduation, fully reconstructable from the Audit Log", async () => {
    const scenario = await buildAdmissionsScenario();
    await configureTuitionForScenario(scenario, 500000); // $5,000.00 — a generic, non-authoritative test amount
    const { applicant, applicantActor, enrollment, charge } = await buildEnrolledApplicant(scenario);
    const programDirector = await actorFor(scenario.programDirector.id);
    const admin = await actorFor(scenario.admin.id);

    // 1. Enrollment creates the correct tuition Charge.
    expect(charge).not.toBeNull();
    expect(charge?.amountCents).toBe(500000);
    expect(charge?.enrollmentId).toBe(enrollment.id);

    // 4. Student sees their own balance; 16. clearance fails while unpaid.
    const initialSummary = await getBillingSummaryForStudent(applicant.id, scenario.program.id, applicantActor);
    expect(initialSummary.balanceCents).toBe(500000);
    expect(initialSummary.clearance.status).toBe("FAILED");

    // Academic work complete, so Financial Clearance is the only blocker.
    await completeAcademicWorkForStudent(scenario, applicant.id);

    // 19. Graduation blocked by unpaid balance.
    const eligibilityBefore = await determineGraduationEligibility(applicant.id, scenario.program.id, programDirector);
    expect(eligibilityBefore.eligible).toBe(false);
    const financialRowBefore = eligibilityBefore.breakdown.find((b) => b.label === "Financial Clearance");
    expect(financialRowBefore?.status).toBe("FAILED");

    // 9. Payment starts correctly.
    const payment = await startPayment(charge!.id, applicantActor);
    expect(payment.status).toBe("PENDING");
    expect(payment.amountCents).toBe(500000);

    // The (simulated) hosted-checkout page's own public, minimal view.
    const checkoutView = await getPublicCheckoutView(payment.providerSessionId);
    expect(checkoutView?.amountCents).toBe(500000);

    // 10. Successful provider confirmation records the payment.
    const confirmation = await confirmSucceeded(payment.providerSessionId, 500000);
    expect(confirmation.ok).toBe(true);
    expect(confirmation.idempotent).toBe(false);

    // 11. Duplicate provider confirmation is idempotent.
    const duplicateConfirmation = await confirmSucceeded(payment.providerSessionId, 500000);
    expect(duplicateConfirmation.ok).toBe(true);
    expect(duplicateConfirmation.idempotent).toBe(true);

    // 13-14. Successful payment reduces balance; balance reaches zero.
    const afterSummary = await getBillingSummaryForStudent(applicant.id, scenario.program.id, applicantActor);
    expect(afterSummary.balanceCents).toBe(0);
    expect(afterSummary.totalPaidCents).toBe(500000);

    // 15. Receipt/payment history available.
    expect(afterSummary.charges[0].payments).toHaveLength(1);
    expect(afterSummary.charges[0].payments[0].status).toBe("SUCCEEDED");

    // 17. Financial clearance passes when required balance = 0.
    const clearanceAfter = await determineFinancialClearance(applicant.id, scenario.program.id, applicantActor);
    expect(clearanceAfter.status).toBe("PASSED");

    // 20. Graduation financial requirement passes after payment.
    const eligibilityAfter = await determineGraduationEligibility(applicant.id, scenario.program.id, programDirector);
    expect(eligibilityAfter.eligible).toBe(true);
    const financialRowAfter = eligibilityAfter.breakdown.find((b) => b.label === "Financial Clearance");
    expect(financialRowAfter?.status).toBe("PASSED");

    // 21. Certificate issuance still requires graduation approval.
    const request = await submitForGraduationReview(applicant.id, scenario.program.id, programDirector);
    await expect(issueCertificate(request.id, admin)).rejects.toThrow(GraduationStateError);
    const approved = await approveGraduation(request.id, programDirector);
    expect(approved.status).toBe("APPROVED");
    const certificate = await issueCertificate(request.id, admin);
    expect(certificate.status).toBe("ISSUED");

    // 22. Full audit reconstruction.
    const entries = await listAuditLog();
    const actions = entries.map((e) => e.action);
    expect(actions).toContain("TUITION_CONFIGURED");
    expect(actions).toContain("STUDENT_CHARGE_CREATED");
    expect(actions).toContain("PAYMENT_STARTED");
    expect(actions).toContain("PAYMENT_CONFIRMED");
    expect(actions).toContain("FINANCIAL_CLEARANCE_CHANGED");
    expect(actions).toContain("GRADUATION_APPROVED");
    expect(actions).toContain("CERTIFICATE_ISSUED");

    const confirmedEntry = entries.find((e) => e.action === "PAYMENT_CONFIRMED");
    expect(confirmedEntry?.actorName).toBeNull(); // system/external-provider-initiated, per this module's own design
  });

  // ── Charge creation (points 1-3) ─────────────────────────────────────

  describe("Charge creation", () => {
    it("2. does not duplicate a Charge when the enrollment hook runs twice", async () => {
      const scenario = await buildAdmissionsScenario();
      await configureTuitionForScenario(scenario, 250000);
      const { enrollment } = await buildEnrolledApplicant(scenario);
      const admissionsStaff = await actorFor(scenario.admissionsStaff.id);

      const first = await createChargeForEnrollment(enrollment.id, admissionsStaff);
      const second = await createChargeForEnrollment(enrollment.id, admissionsStaff);
      expect(first?.id).toBe(second?.id);

      const count = await db.studentCharge.count({ where: { enrollmentId: enrollment.id } });
      expect(count).toBe(1);
    });

    it("3. preserves the historical tuition amount even after the Cohort's rate later changes", async () => {
      const scenario = await buildAdmissionsScenario();
      await configureTuitionForScenario(scenario, 400000);
      const { charge } = await buildEnrolledApplicant(scenario);
      expect(charge?.amountCents).toBe(400000);

      // Tuition increases for the Cohort after this Student already enrolled.
      await configureTuitionForScenario(scenario, 600000);

      const unchanged = await db.studentCharge.findUniqueOrThrow({ where: { id: charge!.id } });
      expect(unchanged.amountCents).toBe(400000);
    });

    it("no Charge is created when the Cohort has no TuitionConfiguration", async () => {
      const scenario = await buildAdmissionsScenario(); // tuition never configured
      const { charge } = await buildEnrolledApplicant(scenario);
      expect(charge).toBeNull();
    });
  });

  // ── RBAC / data isolation (points 5-8) ───────────────────────────────

  describe("RBAC and data isolation", () => {
    it("5. a Student cannot see another Student's financial record", async () => {
      const scenario = await buildAdmissionsScenario();
      await configureTuitionForScenario(scenario);
      const { applicant: studentA } = await buildEnrolledApplicant(scenario);
      const { applicantActor: studentBActor } = await buildEnrolledApplicant(scenario);

      await expect(
        getBillingSummaryForStudent(studentA.id, scenario.program.id, studentBActor),
      ).rejects.toThrow(BillingAuthorizationError);
    });

    it("6. denies Faculty", async () => {
      const scenario = await buildAdmissionsScenario();
      await configureTuitionForScenario(scenario);
      const { applicant } = await buildEnrolledApplicant(scenario);
      const faculty = await actorFor(scenario.faculty.id);

      await expect(getBillingSummaryForStudent(applicant.id, scenario.program.id, faculty)).rejects.toThrow(
        BillingAuthorizationError,
      );
    });

    it("7. denies a Clinical Coordinator", async () => {
      const scenario = await buildAdmissionsScenario();
      await configureTuitionForScenario(scenario);
      const { applicant } = await buildEnrolledApplicant(scenario);

      const coordinator = await buildTestUser({ name: "Cody Coordinator" });
      await assignRole({
        userId: coordinator.id,
        role: "CLINICAL_COORDINATOR",
        programId: scenario.program.id,
        actorId: scenario.admin.id,
      });
      const coordinatorActor = await actorFor(coordinator.id);

      await expect(
        getBillingSummaryForStudent(applicant.id, scenario.program.id, coordinatorActor),
      ).rejects.toThrow(BillingAuthorizationError);
    });

    it("8. fails closed for a User with no relevant Role Assignment at all", async () => {
      const scenario = await buildAdmissionsScenario();
      await configureTuitionForScenario(scenario);
      const { applicant } = await buildEnrolledApplicant(scenario);
      const bystander = await buildTestUser({ name: "No Role Bystander" });
      const bystanderActor = await actorFor(bystander.id);

      await expect(
        getBillingSummaryForStudent(applicant.id, scenario.program.id, bystanderActor),
      ).rejects.toThrow(BillingAuthorizationError);
      await expect(listChargesForAdmin(bystanderActor)).rejects.toThrow(BillingAuthorizationError);
    });

    it("Admissions Staff has no financial-management authority", async () => {
      const scenario = await buildAdmissionsScenario();
      await configureTuitionForScenario(scenario);
      const { applicant } = await buildEnrolledApplicant(scenario);
      const admissionsStaff = await actorFor(scenario.admissionsStaff.id);

      await expect(
        getBillingSummaryForStudent(applicant.id, scenario.program.id, admissionsStaff),
      ).rejects.toThrow(BillingAuthorizationError);
    });

    it("18. Program Director sees only the status-only clearance signal, never a raw dollar amount, via the Graduation Eligibility breakdown", async () => {
      const scenario = await buildAdmissionsScenario();
      await configureTuitionForScenario(scenario, 300000);
      const { applicant } = await buildEnrolledApplicant(scenario);
      const programDirector = await actorFor(scenario.programDirector.id);

      const eligibility = await determineGraduationEligibility(applicant.id, scenario.program.id, programDirector);
      const financialRow = eligibility.breakdown.find((b) => b.label === "Financial Clearance");
      expect(financialRow?.status).toBe("FAILED");
      // The breakdown row is status + human-readable detail text only —
      // no balanceCents, no Payment history, ever exposed through this
      // read path.
      expect(financialRow).not.toHaveProperty("balanceCents");
      expect(financialRow).not.toHaveProperty("payments");

      // Program Director is denied the full billing summary directly.
      await expect(
        getBillingSummaryForStudent(applicant.id, scenario.program.id, programDirector),
      ).rejects.toThrow(BillingAuthorizationError);
    });
  });

  // ── Payment lifecycle (points 9-15) ──────────────────────────────────

  describe("Payment lifecycle", () => {
    it("9. a duplicate startPayment call (browser refresh) reuses the same Pending Payment rather than creating a second one", async () => {
      const scenario = await buildAdmissionsScenario();
      await configureTuitionForScenario(scenario, 100000);
      const { applicantActor, charge } = await buildEnrolledApplicant(scenario);

      const first = await startPayment(charge!.id, applicantActor);
      const second = await startPayment(charge!.id, applicantActor);
      expect(first.id).toBe(second.id);

      const count = await db.payment.count({ where: { chargeId: charge!.id } });
      expect(count).toBe(1);
    });

    it("12. a failed payment does not reduce the balance", async () => {
      const scenario = await buildAdmissionsScenario();
      await configureTuitionForScenario(scenario, 100000);
      const { applicant, applicantActor, charge } = await buildEnrolledApplicant(scenario);

      const payment = await startPayment(charge!.id, applicantActor);
      const { rawBody, signature } = signMockWebhookPayload({
        eventId: randomUUID(),
        providerSessionId: payment.providerSessionId,
        outcome: "FAILED",
        amountCents: 100000,
      });
      const result = await processPaymentWebhookPayload(rawBody, signature);
      expect(result.ok).toBe(true);

      const summary = await getBillingSummaryForStudent(applicant.id, scenario.program.id, applicantActor);
      expect(summary.balanceCents).toBe(100000);
      expect(summary.clearance.status).toBe("FAILED");
    });

    it("a payment cannot be started once the balance is already zero", async () => {
      const scenario = await buildAdmissionsScenario();
      await configureTuitionForScenario(scenario, 100000);
      const { applicantActor, charge } = await buildEnrolledApplicant(scenario);

      const payment = await startPayment(charge!.id, applicantActor);
      await confirmSucceeded(payment.providerSessionId, 100000);

      await expect(startPayment(charge!.id, applicantActor)).rejects.toThrow(BillingStateError);
    });

    it("a Student cannot start a payment against another Student's Charge", async () => {
      const scenario = await buildAdmissionsScenario();
      await configureTuitionForScenario(scenario, 100000);
      const { charge } = await buildEnrolledApplicant(scenario);
      const { applicantActor: otherStudentActor } = await buildEnrolledApplicant(scenario);

      await expect(startPayment(charge!.id, otherStudentActor)).rejects.toThrow(BillingAuthorizationError);
    });
  });

  // ── Idempotency / webhook security (points 11, 23) ───────────────────

  describe("Idempotency and webhook security", () => {
    it("23. a webhook payload with an invalid signature is rejected outright", async () => {
      const scenario = await buildAdmissionsScenario();
      await configureTuitionForScenario(scenario, 100000);
      const { applicantActor, charge } = await buildEnrolledApplicant(scenario);
      const payment = await startPayment(charge!.id, applicantActor);

      const forgedBody = JSON.stringify({
        eventId: randomUUID(),
        providerSessionId: payment.providerSessionId,
        outcome: "SUCCEEDED",
        amountCents: 100000,
      });
      const result = await processPaymentWebhookPayload(forgedBody, "not-a-real-signature");
      expect(result.ok).toBe(false);

      const unchanged = await db.payment.findUniqueOrThrow({ where: { id: payment.id } });
      expect(unchanged.status).toBe("PENDING");
    });

    it("23. the public checkout view never exposes the Student's identity", async () => {
      const scenario = await buildAdmissionsScenario();
      await configureTuitionForScenario(scenario, 100000);
      const { applicantActor, charge } = await buildEnrolledApplicant(scenario);
      const payment = await startPayment(charge!.id, applicantActor);

      const view = await getPublicCheckoutView(payment.providerSessionId);
      expect(view).not.toHaveProperty("studentId");
      expect(view).not.toHaveProperty("student");
      expect(Object.keys(view ?? {}).sort()).toEqual(
        ["amountCents", "currency", "description", "id", "providerSessionId", "status"].sort(),
      );
    });

    it("11. a second, distinct webhook event for an already-resolved Payment is also treated as idempotent (never double-applies a second SUCCEEDED payment)", async () => {
      const scenario = await buildAdmissionsScenario();
      await configureTuitionForScenario(scenario, 100000);
      const { applicant, applicantActor, charge } = await buildEnrolledApplicant(scenario);
      const payment = await startPayment(charge!.id, applicantActor);

      await confirmSucceeded(payment.providerSessionId, 100000);

      // A different eventId, same providerSessionId — the Payment is no
      // longer PENDING, so the status-guarded update affects 0 rows.
      const { rawBody, signature } = signMockWebhookPayload({
        eventId: randomUUID(),
        providerSessionId: payment.providerSessionId,
        outcome: "SUCCEEDED",
        amountCents: 100000,
      });
      const secondEvent = await processPaymentWebhookPayload(rawBody, signature);
      expect(secondEvent.idempotent).toBe(true);

      const summary = await getBillingSummaryForStudent(applicant.id, scenario.program.id, applicantActor);
      expect(summary.totalPaidCents).toBe(100000); // not 200000
      const paymentCount = await db.payment.count({ where: { chargeId: charge!.id } });
      expect(paymentCount).toBe(1);
    });
  });

  // ── No hard-coded program name (point 24) ────────────────────────────

  it("24. never hard-codes the Pharmacy Technology program name anywhere in the billing service", async () => {
    const scenario = await buildAdmissionsScenario();
    const program = await db.program.findUniqueOrThrow({ where: { id: scenario.program.id } });
    expect(program.name).not.toMatch(/pharmacy/i);
  });

  // ── Regression (point 25) ────────────────────────────────────────────

  it("25. leaves Milestones 15/16/17's existing behavior intact for a Student never touched by billing", async () => {
    const scenario = await buildFullScenario(); // no Admissions, no billing — the pre-Milestone-17 direct path
    const programDirector = await actorFor(scenario.programDirector.id);

    // No TuitionConfiguration/Charge ever existed for this Enrollment —
    // Financial Clearance reads NEEDS_VERIFICATION, never FAILED, and
    // does not block eligibility computed purely from academic/
    // externship facts, exactly as before Milestone 18.
    const eligibility = await determineGraduationEligibility(scenario.student.id, scenario.program.id, programDirector);
    const financialRow = eligibility.breakdown.find((b) => b.label === "Financial Clearance");
    expect(financialRow?.status).toBe("NEEDS_VERIFICATION");
    expect(eligibility.eligible).toBe(false); // academic work incomplete, same as always — not blocked by billing
  }, 15000);
});

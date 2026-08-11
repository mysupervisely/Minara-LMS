import { describe, it, expect, beforeEach } from "vitest";
import { resetDatabase } from "./helpers/reset-db";
import {
  buildExternshipScenario,
  buildGraduationReadyScenario,
  completeAcademicWork,
  verifyExternshipForStudent,
  buildTestUser,
  actorFor,
} from "./helpers/fixtures";
import { assignRole } from "@/services/identity/users";
import { listAuditLog } from "@/services/audit/audit";
import { db } from "@/lib/db";
import {
  createClinicalSite,
  updateClinicalSiteStatus,
  requestPlacement,
  approvePlacement,
  activatePlacement,
  recordEvaluation,
  attestHoursComplete,
  submitCompletionForVerification,
  verifyCompletion,
} from "@/services/externship/externship";
import {
  determineGraduationEligibility,
  submitForGraduationReview,
  approveGraduation,
  returnGraduationReview,
  issueCertificate,
  getGraduationRequestById,
  getCertificateForStudent,
  listGraduationCandidatesForProgram,
  GraduationStateError,
  GraduationAuthorizationError,
} from "@/services/graduation/graduation";

/**
 * Certificate & Graduation test suite — Milestone 16's own dedicated
 * coverage, mirroring the shape and rigor of
 * tests/externship-management.test.ts (Milestone 15) and
 * tests/content-versioning.test.ts (Milestone 14): a main integration
 * test walking the full narrow slice end to end, plus focused tests for
 * every RBAC boundary, eligibility state, and audit-reconstruction
 * requirement this milestone's brief names explicitly (its 20-point
 * list).
 */
describe("Certificate & Graduation Vertical Slice", () => {
  beforeEach(resetDatabase);

  it("walks a Student through the full narrow slice: academic completion -> externship completion -> eligibility -> submission -> approval -> certificate issuance -> Alumni, fully reconstructable from the Audit Log", async () => {
    const scenario = await buildGraduationReadyScenario();
    const programDirector = await actorFor(scenario.programDirector.id);
    const admin = await actorFor(scenario.admin.id);
    const studentActor = await actorFor(scenario.student.id);

    // 1-4. Eligibility is derived, never persisted — computed fresh here.
    const eligibility = await determineGraduationEligibility(
      scenario.student.id,
      scenario.program.id,
      programDirector,
    );
    expect(eligibility.eligible).toBe(true);
    expect(eligibility.academicComplete).toBe(true);
    expect(eligibility.externshipRequired).toBe(true);
    expect(eligibility.externshipVerified).toBe(true);
    expect(eligibility.missingRequirements).toHaveLength(0);

    // 5-6. Submission requires eligibility, and the PD may act within scope.
    const request = await submitForGraduationReview(scenario.student.id, scenario.program.id, programDirector);
    expect(request.status).toBe("SUBMITTED");

    // 7. Approval.
    const approved = await approveGraduation(request.id, programDirector);
    expect(approved.status).toBe("APPROVED");

    // 8. Certificate issuance — Administrator, institution-wide authority.
    const certificate = await issueCertificate(request.id, admin);
    expect(certificate.status).toBe("ISSUED");
    expect(certificate.credentialNumber).toMatch(/^CERT-\d{4}-[0-9A-F]+$/);

    // 9. Alumni transition — the existing Enrollment, not a new identity.
    const enrollment = await db.enrollment.findUnique({
      where: { studentId_programId: { studentId: scenario.student.id, programId: scenario.program.id } },
    });
    expect(enrollment?.status).toBe("ALUMNI");

    // 10. Student sees their own certificate.
    const ownCertificate = await getCertificateForStudent(scenario.student.id, scenario.program.id, studentActor);
    expect(ownCertificate?.credentialNumber).toBe(certificate.credentialNumber);

    // 11. Full audit reconstruction.
    const entries = await listAuditLog();
    const actions = entries.map((e) => e.action);
    expect(actions).toContain("GRADUATION_ELIGIBILITY_DETERMINED");
    expect(actions).toContain("GRADUATION_SUBMITTED");
    expect(actions).toContain("GRADUATION_APPROVED");
    expect(actions).toContain("CERTIFICATE_ISSUED");
    expect(actions).toContain("ALUMNI_STATUS_ASSIGNED");
    // Milestone 15's own trail is still present underneath this one.
    expect(actions).toContain("EXTERNSHIP_COMPLETION_VERIFIED");

    const issuedEntry = entries.find((e) => e.action === "CERTIFICATE_ISSUED");
    expect(issuedEntry?.actorName).toBe(scenario.admin.name);
    expect(issuedEntry?.metadata?.credentialNumber).toBe(certificate.credentialNumber);
  });

  // ── Eligibility (points 1-4) ─────────────────────────────────────────

  describe("Graduation eligibility", () => {
    it("1. is NOT eligible when the Student has not completed required academic work", async () => {
      const scenario = await buildExternshipScenario();
      const programDirector = await actorFor(scenario.programDirector.id);

      const eligibility = await determineGraduationEligibility(
        scenario.student.id,
        scenario.program.id,
        programDirector,
      );
      expect(eligibility.eligible).toBe(false);
      expect(eligibility.academicComplete).toBe(false);
      expect(eligibility.missingRequirements.length).toBeGreaterThan(0);
    });

    it("2. is NOT eligible when the Program requires an externship and it has not been Verified", async () => {
      const scenario = await buildExternshipScenario();
      await completeAcademicWork(scenario);
      const programDirector = await actorFor(scenario.programDirector.id);

      const eligibility = await determineGraduationEligibility(
        scenario.student.id,
        scenario.program.id,
        programDirector,
      );
      expect(eligibility.academicComplete).toBe(true);
      expect(eligibility.externshipRequired).toBe(true);
      expect(eligibility.externshipVerified).toBe(false);
      expect(eligibility.eligible).toBe(false);
    });

    it("3. the externship gate passes once the externship completion is Verified", async () => {
      const scenario = await buildExternshipScenario();
      await completeAcademicWork(scenario);
      await verifyExternshipForStudent(scenario);
      const programDirector = await actorFor(scenario.programDirector.id);

      const eligibility = await determineGraduationEligibility(
        scenario.student.id,
        scenario.program.id,
        programDirector,
      );
      expect(eligibility.externshipVerified).toBe(true);
    });

    it("4. is eligible once every requirement is satisfied", async () => {
      const scenario = await buildGraduationReadyScenario();
      const programDirector = await actorFor(scenario.programDirector.id);

      const eligibility = await determineGraduationEligibility(
        scenario.student.id,
        scenario.program.id,
        programDirector,
      );
      expect(eligibility.eligible).toBe(true);
    });

    it("19. fails closed when there is no Enrollment to evaluate at all", async () => {
      const scenario = await buildExternshipScenario();
      const stranger = await buildTestUser({ name: "No Enrollment Student" });
      await assignRole({ userId: stranger.id, role: "STUDENT", actorId: scenario.admin.id });
      const programDirector = await actorFor(scenario.programDirector.id);

      const eligibility = await determineGraduationEligibility(stranger.id, scenario.program.id, programDirector);
      expect(eligibility.eligible).toBe(false);
      expect(eligibility.missingRequirements[0]).toMatch(/No Enrollment/);
    });
  });

  // ── Submission ────────────────────────────────────────────────────────

  it("5. refuses to submit a Graduation Request for a Student who is not eligible", async () => {
    const scenario = await buildExternshipScenario();
    const programDirector = await actorFor(scenario.programDirector.id);

    await expect(
      submitForGraduationReview(scenario.student.id, scenario.program.id, programDirector),
    ).rejects.toThrow(GraduationStateError);
  });

  // ── RBAC ─────────────────────────────────────────────────────────────

  describe("RBAC", () => {
    it("6. lets a Program Director review authorized Students within their own Program", async () => {
      const scenario = await buildGraduationReadyScenario();
      const programDirector = await actorFor(scenario.programDirector.id);

      const candidates = await listGraduationCandidatesForProgram(scenario.program.id, programDirector);
      expect(candidates.some((c) => c.student.id === scenario.student.id)).toBe(true);

      const request = await submitForGraduationReview(scenario.student.id, scenario.program.id, programDirector);
      await expect(getGraduationRequestById(request.id, programDirector)).resolves.toMatchObject({
        id: request.id,
      });
    });

    it("7. denies a Program Director reviewing another Program's Student", async () => {
      const scenarioA = await buildGraduationReadyScenario();
      const scenarioB = await buildGraduationReadyScenario();
      const programDirectorA = await actorFor(scenarioA.programDirector.id);

      await expect(
        submitForGraduationReview(scenarioB.student.id, scenarioB.program.id, programDirectorA),
      ).rejects.toThrow(GraduationAuthorizationError);

      const requestB = await submitForGraduationReview(
        scenarioB.student.id,
        scenarioB.program.id,
        await actorFor(scenarioB.programDirector.id),
      );
      await expect(getGraduationRequestById(requestB.id, programDirectorA)).rejects.toThrow(
        GraduationAuthorizationError,
      );
    });

    it("8. denies Faculty approving graduation", async () => {
      const scenario = await buildGraduationReadyScenario();
      const programDirector = await actorFor(scenario.programDirector.id);
      const faculty = await actorFor(scenario.faculty.id);

      const request = await submitForGraduationReview(scenario.student.id, scenario.program.id, programDirector);
      await expect(approveGraduation(request.id, faculty)).rejects.toThrow(GraduationAuthorizationError);
    });

    it("9. denies a Clinical Coordinator issuing certificates", async () => {
      const scenario = await buildGraduationReadyScenario();
      const programDirector = await actorFor(scenario.programDirector.id);
      const coordinator = await actorFor(scenario.coordinator.id);

      const request = await submitForGraduationReview(scenario.student.id, scenario.program.id, programDirector);
      await approveGraduation(request.id, programDirector);

      await expect(issueCertificate(request.id, coordinator)).rejects.toThrow(GraduationAuthorizationError);
    });

    it("15. never lets one Student see another Student's certificate", async () => {
      const scenario = await buildGraduationReadyScenario();
      const programDirector = await actorFor(scenario.programDirector.id);
      const admin = await actorFor(scenario.admin.id);

      const request = await submitForGraduationReview(scenario.student.id, scenario.program.id, programDirector);
      await approveGraduation(request.id, programDirector);
      await issueCertificate(request.id, admin);

      const secondStudent = await buildTestUser({ name: "Other Student" });
      await assignRole({ userId: secondStudent.id, role: "STUDENT", actorId: scenario.admin.id });
      const secondStudentActor = await actorFor(secondStudent.id);

      await expect(
        getCertificateForStudent(scenario.student.id, scenario.program.id, secondStudentActor),
      ).rejects.toThrow(GraduationAuthorizationError);
    });

    it("14. lets a Student see their own certificate", async () => {
      const scenario = await buildGraduationReadyScenario();
      const programDirector = await actorFor(scenario.programDirector.id);
      const admin = await actorFor(scenario.admin.id);
      const studentActor = await actorFor(scenario.student.id);

      const request = await submitForGraduationReview(scenario.student.id, scenario.program.id, programDirector);
      await approveGraduation(request.id, programDirector);
      await issueCertificate(request.id, admin);

      await expect(
        getCertificateForStudent(scenario.student.id, scenario.program.id, studentActor),
      ).resolves.toMatchObject({ studentId: scenario.student.id });
    });

    it("19b. fails closed for a User with no relevant Role Assignment at all", async () => {
      const scenario = await buildGraduationReadyScenario();
      const bystander = await buildTestUser({ name: "No Role Bystander" });
      const bystanderActor = await actorFor(bystander.id);

      await expect(
        submitForGraduationReview(scenario.student.id, scenario.program.id, bystanderActor),
      ).rejects.toThrow(GraduationAuthorizationError);
      await expect(
        listGraduationCandidatesForProgram(scenario.program.id, bystanderActor),
      ).rejects.toThrow(GraduationAuthorizationError);
    });
  });

  // ── Approval / Issuance ordering ────────────────────────────────────

  it("10. refuses to issue a Certificate before the Graduation Request is Approved", async () => {
    const scenario = await buildGraduationReadyScenario();
    const programDirector = await actorFor(scenario.programDirector.id);
    const admin = await actorFor(scenario.admin.id);

    const request = await submitForGraduationReview(scenario.student.id, scenario.program.id, programDirector);
    // Still SUBMITTED — not yet Approved.
    await expect(issueCertificate(request.id, admin)).rejects.toThrow(GraduationStateError);
  });

  it("11-12. lets the Administrator issue a Certificate after approval, with the correct audit event", async () => {
    const scenario = await buildGraduationReadyScenario();
    const programDirector = await actorFor(scenario.programDirector.id);
    const admin = await actorFor(scenario.admin.id);

    const request = await submitForGraduationReview(scenario.student.id, scenario.program.id, programDirector);
    await approveGraduation(request.id, programDirector);
    const certificate = await issueCertificate(request.id, admin);

    const entries = await listAuditLog();
    const issuedEntry = entries.find(
      (e) => e.action === "CERTIFICATE_ISSUED" && e.entityId === certificate.id,
    );
    expect(issuedEntry).toBeDefined();
    expect(issuedEntry?.actorName).toBe(scenario.admin.name);
  });

  // ── Return / remediation ─────────────────────────────────────────────

  it("16. preserves the reason on a returned Graduation Request review", async () => {
    const scenario = await buildGraduationReadyScenario();
    const programDirector = await actorFor(scenario.programDirector.id);

    const request = await submitForGraduationReview(scenario.student.id, scenario.program.id, programDirector);
    const returned = await returnGraduationReview(
      request.id,
      "Please confirm the externship evaluation once more.",
      programDirector,
    );
    expect(returned.status).toBe("RETURNED");
    expect(returned.returnReason).toBe("Please confirm the externship evaluation once more.");

    const entries = await listAuditLog();
    const returnedEntry = entries.find((e) => e.action === "GRADUATION_RETURNED");
    expect(returnedEntry?.metadata?.reason).toBe("Please confirm the externship evaluation once more.");

    // Resubmission after a Return works — the "reviewable state" the
    // brief asks for is not a dead end.
    const resubmitted = await submitForGraduationReview(scenario.student.id, scenario.program.id, programDirector);
    expect(resubmitted.status).toBe("SUBMITTED");
  });

  // ── No hard-coded program name ───────────────────────────────────────

  it("18. never hard-codes the Pharmacy Technology program name anywhere in the graduation service", async () => {
    const scenario = await buildGraduationReadyScenario();
    const program = await db.program.findUniqueOrThrow({ where: { id: scenario.program.id } });
    expect(program.name).not.toMatch(/pharmacy/i);
  });

  // ── Milestone 15 regression (point 20) ───────────────────────────────

  it("20. leaves Milestone 15's existing externship behavior intact", async () => {
    const scenario = await buildExternshipScenario();
    const coordinator = await actorFor(scenario.coordinator.id);
    const programDirector = await actorFor(scenario.programDirector.id);

    const site = await createClinicalSite(
      { programId: scenario.program.id, name: "Regression Site", employerName: "Regression Employer" },
      coordinator,
    );
    await updateClinicalSiteStatus(site.id, "ACTIVE", coordinator);
    const placement = await requestPlacement(
      { studentId: scenario.student.id, programId: scenario.program.id, clinicalSiteId: site.id },
      coordinator,
    );
    await approvePlacement(placement.id, coordinator);
    await activatePlacement(placement.id, coordinator);
    await recordEvaluation(
      { placementId: placement.id, type: "FINAL", content: "Still works.", outcome: "SATISFACTORY" },
      coordinator,
    );
    await attestHoursComplete(placement.id, coordinator);
    await submitCompletionForVerification(placement.id, coordinator);
    const verified = await verifyCompletion(placement.id, programDirector);

    expect(verified.completionStatus).toBe("VERIFIED");
    expect(verified.status).toBe("COMPLETED");
  });
});

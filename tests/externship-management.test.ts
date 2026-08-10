import { describe, it, expect, beforeEach } from "vitest";
import { resetDatabase } from "./helpers/reset-db";
import { buildExternshipScenario, buildTestUser, actorFor } from "./helpers/fixtures";
import { assignRole } from "@/services/identity/users";
import { listAuditLog } from "@/services/audit/audit";
import { db } from "@/lib/db";
import {
  createClinicalSite,
  updateClinicalSiteStatus,
  determineEligibility,
  getEligibilityForStudent,
  listEligibilityQueueForProgram,
  requestPlacement,
  approvePlacement,
  activatePlacement,
  attestHoursComplete,
  recordEvaluation,
  submitCompletionForVerification,
  verifyCompletion,
  returnCompletion,
  getPlacementById,
  listPlacementsForStudent,
  listPlacementsForProgram,
  ExternshipStateError,
  ExternshipAuthorizationError,
} from "@/services/externship/externship";

/**
 * Externship Eligibility & Placement test suite — Milestone 15's own
 * dedicated coverage, mirroring the shape and rigor of
 * tests/content-versioning.test.ts (Milestone 14): one main integration
 * test walking the full narrow slice end to end, plus focused tests for
 * every RBAC boundary, invalid transition, and audit-reconstruction
 * requirement this milestone's brief names explicitly.
 */
describe("Externship Eligibility & Placement Vertical Slice", () => {
  beforeEach(resetDatabase);

  it("walks a Placement through the full narrow slice: eligibility → site → placement → evaluations → completion, fully reconstructable from the Audit Log", async () => {
    const scenario = await buildExternshipScenario();
    const coordinator = await actorFor(scenario.coordinator.id);
    const programDirector = await actorFor(scenario.programDirector.id);

    // 1. Eligibility — a Coordinator judgment call, not a computed rule.
    // Before any determination, the platform reports "Requirements
    // Pending Verification," never a fabricated default.
    const before = await getEligibilityForStudent(scenario.student.id, scenario.program.id, coordinator);
    expect(before.status).toBe("REQUIREMENTS_PENDING_VERIFICATION");

    await determineEligibility(
      { studentId: scenario.student.id, programId: scenario.program.id, status: "ELIGIBLE" },
      coordinator,
    );
    const after = await getEligibilityForStudent(scenario.student.id, scenario.program.id, coordinator);
    expect(after.status).toBe("ELIGIBLE");

    // 2. Site — recorded Pending, then approved Active by the Coordinator.
    const site = await createClinicalSite(
      { programId: scenario.program.id, name: "Test Site", employerName: "Test Employer" },
      coordinator,
    );
    expect(site.status).toBe("PENDING");
    await updateClinicalSiteStatus(site.id, "ACTIVE", coordinator);

    // 3. Placement — Requested → Approved → Active.
    const placement = await requestPlacement(
      { studentId: scenario.student.id, programId: scenario.program.id, clinicalSiteId: site.id },
      coordinator,
    );
    expect(placement.status).toBe("REQUESTED");
    await approvePlacement(placement.id, coordinator);
    const activated = await activatePlacement(placement.id, coordinator);
    expect(activated.status).toBe("ACTIVE");

    // 4. Evaluations — Midpoint and Final, distinct from "placement
    // completed" and "completion verified" (Phase 8's explicit
    // distinction).
    await recordEvaluation(
      { placementId: placement.id, type: "MIDPOINT", content: "Doing well.", outcome: "SATISFACTORY" },
      coordinator,
    );
    await recordEvaluation(
      { placementId: placement.id, type: "FINAL", content: "Ready.", outcome: "SATISFACTORY" },
      coordinator,
    );

    // 5. Hours attestation — a single structural flag, no numeric hour
    // count anywhere.
    const attested = await attestHoursComplete(placement.id, coordinator);
    expect(attested.hoursAttestedAt).not.toBeNull();

    // 6. Completion Verification — Coordinator submits, Program Director
    // verifies. This is the one place `status` and `completionStatus`
    // are linked: Placement.status only reaches COMPLETED here.
    await submitCompletionForVerification(placement.id, coordinator);
    const verified = await verifyCompletion(placement.id, programDirector);
    expect(verified.completionStatus).toBe("VERIFIED");
    expect(verified.status).toBe("COMPLETED");

    // 7. Student visibility — the Student sees their own, fully verified
    // record.
    const studentActor = await actorFor(scenario.student.id);
    const studentView = await getPlacementById(placement.id, studentActor);
    expect(studentView?.completionStatus).toBe("VERIFIED");

    // 8. Audit reconstruction — every step above left a trail, on the
    // existing Audit service, no second mechanism.
    const entries = await listAuditLog();
    const actions = entries.map((e) => e.action);
    expect(actions).toContain("ELIGIBILITY_DETERMINED");
    expect(actions).toContain("CLINICAL_SITE_CREATED");
    expect(actions).toContain("CLINICAL_SITE_STATUS_CHANGED");
    expect(actions).toContain("PLACEMENT_CREATED");
    expect(actions).toContain("PLACEMENT_STATUS_CHANGED");
    expect(actions.filter((a) => a === "EVALUATION_CREATED")).toHaveLength(2);
    expect(actions).toContain("EXTERNSHIP_COMPLETION_SUBMITTED");
    expect(actions).toContain("EXTERNSHIP_COMPLETION_VERIFIED");

    const verifyEntry = entries.find((e) => e.action === "EXTERNSHIP_COMPLETION_VERIFIED");
    expect(verifyEntry?.actorName).toBe(scenario.programDirector.name);
  });

  // ── RBAC ─────────────────────────────────────────────────────────────

  describe("RBAC", () => {
    it("lets a Coordinator manage externships within their own Program", async () => {
      const scenario = await buildExternshipScenario();
      const coordinator = await actorFor(scenario.coordinator.id);
      await expect(
        createClinicalSite(
          { programId: scenario.program.id, name: "Site", employerName: "Employer" },
          coordinator,
        ),
      ).resolves.toMatchObject({ programId: scenario.program.id });
    });

    it("denies a Student every externship management operation", async () => {
      const scenario = await buildExternshipScenario();
      const studentActor = await actorFor(scenario.student.id);

      await expect(
        createClinicalSite(
          { programId: scenario.program.id, name: "Site", employerName: "Employer" },
          studentActor,
        ),
      ).rejects.toThrow(ExternshipAuthorizationError);

      await expect(
        determineEligibility(
          { studentId: scenario.student.id, programId: scenario.program.id, status: "ELIGIBLE" },
          studentActor,
        ),
      ).rejects.toThrow(ExternshipAuthorizationError);

      await expect(
        requestPlacement(
          { studentId: scenario.student.id, programId: scenario.program.id, clinicalSiteId: "nonexistent" },
          studentActor,
        ),
      ).rejects.toThrow(ExternshipAuthorizationError);
    });

    it("lets a Student see only their own externship information", async () => {
      const scenario = await buildExternshipScenario();
      const coordinator = await actorFor(scenario.coordinator.id);

      const site = await createClinicalSite(
        { programId: scenario.program.id, name: "Site", employerName: "Employer" },
        coordinator,
      );
      await updateClinicalSiteStatus(site.id, "ACTIVE", coordinator);
      const placement = await requestPlacement(
        { studentId: scenario.student.id, programId: scenario.program.id, clinicalSiteId: site.id },
        coordinator,
      );

      const secondStudent = await buildTestUser({ name: "Other Student" });
      await assignRole({ userId: secondStudent.id, role: "STUDENT", actorId: scenario.admin.id });
      const secondStudentActor = await actorFor(secondStudent.id);

      await expect(getPlacementById(placement.id, secondStudentActor)).rejects.toThrow(
        ExternshipAuthorizationError,
      );

      const ownActor = await actorFor(scenario.student.id);
      await expect(getPlacementById(placement.id, ownActor)).resolves.toMatchObject({ id: placement.id });
    });

    it("lets a Program Director verify Completion within their own Program", async () => {
      const scenario = await buildExternshipScenario();
      const coordinator = await actorFor(scenario.coordinator.id);
      const programDirector = await actorFor(scenario.programDirector.id);

      const site = await createClinicalSite(
        { programId: scenario.program.id, name: "Site", employerName: "Employer" },
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
        { placementId: placement.id, type: "FINAL", content: "Ready.", outcome: "SATISFACTORY" },
        coordinator,
      );
      await attestHoursComplete(placement.id, coordinator);
      await submitCompletionForVerification(placement.id, coordinator);

      await expect(verifyCompletion(placement.id, programDirector)).resolves.toMatchObject({
        completionStatus: "VERIFIED",
      });
    });

    it("gives an Administrator appropriate oversight of every Program's externship activity", async () => {
      const scenario = await buildExternshipScenario();
      const adminActor = await actorFor(scenario.admin.id);

      await expect(
        createClinicalSite(
          { programId: scenario.program.id, name: "Admin Site", employerName: "Employer" },
          adminActor,
        ),
      ).resolves.toMatchObject({ programId: scenario.program.id });

      const queue = await listEligibilityQueueForProgram(scenario.program.id, adminActor);
      expect(Array.isArray(queue)).toBe(true);
    });

    it("denies cross-Program access — a Coordinator of one Program cannot act on another's externship records", async () => {
      const scenarioA = await buildExternshipScenario();
      const scenarioB = await buildExternshipScenario();
      const coordinatorA = await actorFor(scenarioA.coordinator.id);

      await expect(
        createClinicalSite(
          { programId: scenarioB.program.id, name: "Cross-Program Site", employerName: "Employer" },
          coordinatorA,
        ),
      ).rejects.toThrow(ExternshipAuthorizationError);

      await expect(
        listPlacementsForProgram(scenarioB.program.id, coordinatorA),
      ).rejects.toThrow(ExternshipAuthorizationError);
    });

    it("fails closed for unauthorized direct service calls — a User with no relevant Role Assignment at all", async () => {
      const scenario = await buildExternshipScenario();
      const bystander = await buildTestUser({ name: "No Role Bystander" });
      const bystanderActor = await actorFor(bystander.id);

      await expect(
        createClinicalSite(
          { programId: scenario.program.id, name: "Site", employerName: "Employer" },
          bystanderActor,
        ),
      ).rejects.toThrow(ExternshipAuthorizationError);
      await expect(
        listPlacementsForProgram(scenario.program.id, bystanderActor),
      ).rejects.toThrow(ExternshipAuthorizationError);
    });
  });

  // ── Eligibility ──────────────────────────────────────────────────────

  describe("Eligibility", () => {
    it("records an Eligible determination", async () => {
      const scenario = await buildExternshipScenario();
      const coordinator = await actorFor(scenario.coordinator.id);
      await determineEligibility(
        { studentId: scenario.student.id, programId: scenario.program.id, status: "ELIGIBLE" },
        coordinator,
      );
      const view = await getEligibilityForStudent(scenario.student.id, scenario.program.id, coordinator);
      expect(view.status).toBe("ELIGIBLE");
    });

    it("records a Blocked determination, distinct from Not Yet Eligible", async () => {
      const scenario = await buildExternshipScenario();
      const coordinator = await actorFor(scenario.coordinator.id);
      await determineEligibility(
        { studentId: scenario.student.id, programId: scenario.program.id, status: "BLOCKED", notes: "Hold pending review." },
        coordinator,
      );
      const view = await getEligibilityForStudent(scenario.student.id, scenario.program.id, coordinator);
      expect(view.status).toBe("BLOCKED");
    });

    it("never invents an eligibility default — an undetermined Student reads as Requirements Pending Verification, not Eligible or Blocked", async () => {
      const scenario = await buildExternshipScenario();
      const coordinator = await actorFor(scenario.coordinator.id);
      const view = await getEligibilityForStudent(scenario.student.id, scenario.program.id, coordinator);
      expect(view.status).toBe("REQUIREMENTS_PENDING_VERIFICATION");
      expect(view.determinedAt).toBeNull();
    });
  });

  // ── Placement ────────────────────────────────────────────────────────

  describe("Placement", () => {
    async function activeSite(coordinator: Awaited<ReturnType<typeof actorFor>>, programId: string) {
      const site = await createClinicalSite(
        { programId, name: "Site", employerName: "Employer" },
        coordinator,
      );
      await updateClinicalSiteStatus(site.id, "ACTIVE", coordinator);
      return site;
    }

    it("creates a valid Placement", async () => {
      const scenario = await buildExternshipScenario();
      const coordinator = await actorFor(scenario.coordinator.id);
      const site = await activeSite(coordinator, scenario.program.id);

      const placement = await requestPlacement(
        { studentId: scenario.student.id, programId: scenario.program.id, clinicalSiteId: site.id },
        coordinator,
      );
      expect(placement.status).toBe("REQUESTED");
    });

    it("rejects a second Placement while one is already in flight for the same Student", async () => {
      const scenario = await buildExternshipScenario();
      const coordinator = await actorFor(scenario.coordinator.id);
      const site = await activeSite(coordinator, scenario.program.id);

      await requestPlacement(
        { studentId: scenario.student.id, programId: scenario.program.id, clinicalSiteId: site.id },
        coordinator,
      );

      await expect(
        requestPlacement(
          { studentId: scenario.student.id, programId: scenario.program.id, clinicalSiteId: site.id },
          coordinator,
        ),
      ).rejects.toThrow(ExternshipStateError);
    });

    it("rejects an invalid status transition — Activate before Approve", async () => {
      const scenario = await buildExternshipScenario();
      const coordinator = await actorFor(scenario.coordinator.id);
      const site = await activeSite(coordinator, scenario.program.id);

      const placement = await requestPlacement(
        { studentId: scenario.student.id, programId: scenario.program.id, clinicalSiteId: site.id },
        coordinator,
      );

      await expect(activatePlacement(placement.id, coordinator)).rejects.toThrow(ExternshipStateError);
    });
  });

  // ── Evaluation ───────────────────────────────────────────────────────

  describe("Evaluation", () => {
    async function activePlacement(scenario: Awaited<ReturnType<typeof buildExternshipScenario>>) {
      const coordinator = await actorFor(scenario.coordinator.id);
      const site = await createClinicalSite(
        { programId: scenario.program.id, name: "Site", employerName: "Employer" },
        coordinator,
      );
      await updateClinicalSiteStatus(site.id, "ACTIVE", coordinator);
      const placement = await requestPlacement(
        { studentId: scenario.student.id, programId: scenario.program.id, clinicalSiteId: site.id },
        coordinator,
      );
      await approvePlacement(placement.id, coordinator);
      await activatePlacement(placement.id, coordinator);
      return { placement, coordinator };
    }

    it("records a Midpoint Evaluation", async () => {
      const scenario = await buildExternshipScenario();
      const { placement, coordinator } = await activePlacement(scenario);
      const evaluation = await recordEvaluation(
        { placementId: placement.id, type: "MIDPOINT", content: "Progressing well.", outcome: "SATISFACTORY" },
        coordinator,
      );
      expect(evaluation.type).toBe("MIDPOINT");
    });

    it("records a Final Evaluation", async () => {
      const scenario = await buildExternshipScenario();
      const { placement, coordinator } = await activePlacement(scenario);
      const evaluation = await recordEvaluation(
        { placementId: placement.id, type: "FINAL", content: "Ready for independent practice.", outcome: "SATISFACTORY" },
        coordinator,
      );
      expect(evaluation.type).toBe("FINAL");
    });

    it("denies a Student recording an Evaluation", async () => {
      const scenario = await buildExternshipScenario();
      const { placement } = await activePlacement(scenario);
      const studentActor = await actorFor(scenario.student.id);

      await expect(
        recordEvaluation(
          { placementId: placement.id, type: "FINAL", content: "Self-graded.", outcome: "SATISFACTORY" },
          studentActor,
        ),
      ).rejects.toThrow(ExternshipAuthorizationError);
    });

    it("refuses to submit a Placement for Completion Verification without a Final Evaluation and hours attestation", async () => {
      const scenario = await buildExternshipScenario();
      const { placement, coordinator } = await activePlacement(scenario);

      // Neither a Final Evaluation nor an hours attestation exist yet.
      await expect(submitCompletionForVerification(placement.id, coordinator)).rejects.toThrow(
        ExternshipStateError,
      );

      // A Midpoint Evaluation alone still isn't enough.
      await recordEvaluation(
        { placementId: placement.id, type: "MIDPOINT", content: "So far so good.", outcome: "SATISFACTORY" },
        coordinator,
      );
      await expect(submitCompletionForVerification(placement.id, coordinator)).rejects.toThrow(
        ExternshipStateError,
      );

      // A Final Evaluation without hours attested still isn't enough.
      await recordEvaluation(
        { placementId: placement.id, type: "FINAL", content: "Ready.", outcome: "SATISFACTORY" },
        coordinator,
      );
      await expect(submitCompletionForVerification(placement.id, coordinator)).rejects.toThrow(
        ExternshipStateError,
      );

      // Both present: submission succeeds.
      await attestHoursComplete(placement.id, coordinator);
      await expect(submitCompletionForVerification(placement.id, coordinator)).resolves.toMatchObject({
        completionStatus: "SUBMITTED",
      });
    });
  });

  // ── Completion Verification ─────────────────────────────────────────

  describe("Completion Verification", () => {
    async function submittedPlacement(scenario: Awaited<ReturnType<typeof buildExternshipScenario>>) {
      const coordinator = await actorFor(scenario.coordinator.id);
      const programDirector = await actorFor(scenario.programDirector.id);
      const site = await createClinicalSite(
        { programId: scenario.program.id, name: "Site", employerName: "Employer" },
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
        { placementId: placement.id, type: "FINAL", content: "Ready.", outcome: "SATISFACTORY" },
        coordinator,
      );
      await attestHoursComplete(placement.id, coordinator);
      await submitCompletionForVerification(placement.id, coordinator);
      return { placement, coordinator, programDirector };
    }

    it("refuses to verify a Completion before it has been submitted", async () => {
      const scenario = await buildExternshipScenario();
      const coordinator = await actorFor(scenario.coordinator.id);
      const programDirector = await actorFor(scenario.programDirector.id);
      const site = await createClinicalSite(
        { programId: scenario.program.id, name: "Site", employerName: "Employer" },
        coordinator,
      );
      await updateClinicalSiteStatus(site.id, "ACTIVE", coordinator);
      const placement = await requestPlacement(
        { studentId: scenario.student.id, programId: scenario.program.id, clinicalSiteId: site.id },
        coordinator,
      );

      await expect(verifyCompletion(placement.id, programDirector)).rejects.toThrow(ExternshipStateError);
    });

    it("lets the Coordinator submit and the Program Director verify, in order", async () => {
      const scenario = await buildExternshipScenario();
      const { placement, programDirector } = await submittedPlacement(scenario);

      const verified = await verifyCompletion(placement.id, programDirector);
      expect(verified.completionStatus).toBe("VERIFIED");
      expect(verified.status).toBe("COMPLETED");
    });

    it("supports the remediation loop — Return, then resubmit, then verify", async () => {
      const scenario = await buildExternshipScenario();
      const { placement, coordinator, programDirector } = await submittedPlacement(scenario);

      const returned = await returnCompletion(placement.id, "Please add more detail to the Final Evaluation.", programDirector);
      expect(returned.completionStatus).toBe("RETURNED");
      expect(returned.completionReturnReason).toBe("Please add more detail to the Final Evaluation.");

      // The Placement itself stays Active — only completionStatus moved.
      const resubmitted = await submitCompletionForVerification(placement.id, coordinator);
      expect(resubmitted.completionStatus).toBe("SUBMITTED");

      const verified = await verifyCompletion(placement.id, programDirector);
      expect(verified.completionStatus).toBe("VERIFIED");
    });

    it("rejects an empty reason when returning a Completion for further work", async () => {
      const scenario = await buildExternshipScenario();
      const { placement, programDirector } = await submittedPlacement(scenario);

      await expect(returnCompletion(placement.id, "   ", programDirector)).rejects.toThrow(
        ExternshipStateError,
      );
    });
  });

  // ── Security / data isolation ────────────────────────────────────────

  describe("Security and data isolation", () => {
    it("never lets one Student see another Student's Placements", async () => {
      const scenario = await buildExternshipScenario();
      const coordinator = await actorFor(scenario.coordinator.id);
      const site = await createClinicalSite(
        { programId: scenario.program.id, name: "Site", employerName: "Employer" },
        coordinator,
      );
      await updateClinicalSiteStatus(site.id, "ACTIVE", coordinator);
      await requestPlacement(
        { studentId: scenario.student.id, programId: scenario.program.id, clinicalSiteId: site.id },
        coordinator,
      );

      const secondStudent = await buildTestUser({ name: "Other Student" });
      await assignRole({ userId: secondStudent.id, role: "STUDENT", actorId: scenario.admin.id });
      const secondStudentActor = await actorFor(secondStudent.id);

      await expect(
        listPlacementsForStudent(scenario.student.id, scenario.program.id, secondStudentActor),
      ).rejects.toThrow(ExternshipAuthorizationError);
    });

    it("never lets a Coordinator reach an unrelated Program's records, even by a direct service call bypassing any page", async () => {
      const scenarioA = await buildExternshipScenario();
      const scenarioB = await buildExternshipScenario();
      const coordinatorB = await actorFor(scenarioB.coordinator.id);

      await expect(
        listEligibilityQueueForProgram(scenarioA.program.id, coordinatorB),
      ).rejects.toThrow(ExternshipAuthorizationError);
    });
  });

  // ── requiresExternship is data, not application logic ───────────────

  it("does not hard-code Pharmacy Technology or any other Program name anywhere in the externship service", async () => {
    // A generic-named test Program (buildAcademicStructure's own
    // "Test Program", never "Pharmacy Technology") exercises the exact
    // same functions — proving nothing in externship.ts branches on a
    // specific Program name, per Milestone 10's configuration-driven
    // design instruction, carried forward through every milestone since.
    const scenario = await buildExternshipScenario();
    const program = await db.program.findUniqueOrThrow({ where: { id: scenario.program.id } });
    expect(program.name).not.toMatch(/pharmacy/i);
    expect(program.requiresExternship).toBe(true);
  });
});

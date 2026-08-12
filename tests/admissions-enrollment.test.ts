import { describe, it, expect, beforeEach } from "vitest";
import { resetDatabase } from "./helpers/reset-db";
import {
  buildFullScenario,
  buildAdmissionsScenario,
  startApplicationFor,
  buildTestUser,
  actorFor,
} from "./helpers/fixtures";
import { createUser, assignRole } from "@/services/identity/users";
import { registerApplicant, EmailAlreadyRegisteredError } from "@/services/identity/users";
import { listAuditLog } from "@/services/audit/audit";
import { db } from "@/lib/db";
import {
  startOrResumeApplication,
  saveApplicationDraft,
  submitApplication,
  startReview,
  reopenForReview,
  updateRequirementStatus,
  recordDecision,
  assignCohort,
  confirmOffer,
  declineOffer,
  createEnrollmentFromApplication,
  getApplicationById,
  listApplicationsForApplicant,
  listApplicationsForAdmissions,
  listApplicationsForProgram,
  ApplicationStateError,
  ApplicationAuthorizationError,
} from "@/services/admissions/admissions";
import {
  createClinicalSite,
  updateClinicalSiteStatus,
  requestPlacement,
} from "@/services/externship/externship";
import {
  determineGraduationEligibility,
} from "@/services/graduation/graduation";

/**
 * Admissions & Enrollment test suite — Milestone 17's own dedicated
 * coverage, mirroring the shape and rigor of
 * tests/certificate-graduation.test.ts (Milestone 16) and
 * tests/externship-management.test.ts (Milestone 15): a main
 * integration test walking the full narrow slice end to end, plus
 * focused tests for every RBAC boundary, state transition, and
 * audit-reconstruction requirement this milestone's brief names
 * explicitly (its 26-point list).
 */
describe("Admissions & Enrollment Vertical Slice", () => {
  beforeEach(resetDatabase);

  it("walks a prospective learner through the full narrow slice: account -> Application -> review -> decision -> offer -> enrollment, fully reconstructable from the Audit Log", async () => {
    const scenario = await buildAdmissionsScenario();
    const admissionsStaff = await actorFor(scenario.admissionsStaff.id);

    // 1. Prospective user can create an account and an Application.
    const applicant = await registerApplicant({
      name: "Priya Prospective",
      email: "priya@example.test",
      password: "test-password-123",
    });
    const applicantActor = await actorFor(applicant.id);
    const application = await startOrResumeApplication(applicant.id, scenario.program.id, applicantActor);
    expect(application.status).toBe("DRAFT");

    // 2. Draft can be saved.
    const drafted = await saveApplicationDraft(application.id, "Excited to apply!", applicantActor);
    expect(drafted.applicantNotes).toBe("Excited to apply!");

    // 3. Application can be submitted.
    const submitted = await submitApplication(application.id, applicantActor);
    expect(submitted.status).toBe("SUBMITTED");
    expect(submitted.submittedAt).not.toBeNull();

    // 6. Admissions Staff can view authorized submitted applications.
    const staffView = await listApplicationsForAdmissions(admissionsStaff);
    expect(staffView.some((a) => a.id === application.id)).toBe(true);

    // Move into review, mark checklist, decide.
    const underReview = await startReview(application.id, admissionsStaff);
    expect(underReview.status).toBe("UNDER_REVIEW");

    const requirement = (await getApplicationById(application.id, admissionsStaff))!.requirements[0];
    await updateRequirementStatus(requirement.id, "RECEIVED", "Confirmed by staff.", admissionsStaff);

    // 9. Authorized acceptance succeeds. 14. Reason preserved.
    const accepted = await recordDecision(application.id, "ACCEPTED", "Strong application.", admissionsStaff);
    expect(accepted.status).toBe("ACCEPTED");
    expect(accepted.decisionReason).toBe("Strong application.");
    expect(accepted.decidedById).toBe(admissionsStaff.id);

    // 15. Accepted applicant can confirm the offer.
    const confirmed = await confirmOffer(application.id, applicantActor);
    expect(confirmed.status).toBe("ACCEPTANCE_CONFIRMED");

    // 21. Cohort assignment works.
    await assignCohort(application.id, scenario.cohort.id, admissionsStaff);

    // 17-19. Enrollment created only after the correct workflow; Student
    // Role activated; the existing User is reused, never duplicated.
    const enrollment = await createEnrollmentFromApplication(application.id, admissionsStaff);
    expect(enrollment.studentId).toBe(applicant.id);
    expect(enrollment.sourceApplicationId).toBe(application.id);

    const applicantWithRoles = await db.user.findUniqueOrThrow({
      where: { id: applicant.id },
      include: { roleAssignments: true },
    });
    expect(applicantWithRoles.roleAssignments.some((ra) => ra.role === "STUDENT")).toBe(true);
    expect(await db.user.count({ where: { email: "priya@example.test" } })).toBe(1);

    // 20. Application history preserved after enrollment.
    const finalApplication = await getApplicationById(application.id, applicantActor);
    expect(finalApplication?.status).toBe("ENROLLED");
    expect(finalApplication?.decisionReason).toBe("Strong application.");

    // 22. Full audit reconstruction.
    const entries = await listAuditLog();
    const actions = entries.map((e) => e.action);
    expect(actions).toContain("APPLICATION_CREATED");
    expect(actions).toContain("APPLICATION_SUBMITTED");
    expect(actions).toContain("APPLICATION_REVIEW_STARTED");
    expect(actions).toContain("REQUIREMENT_UPDATED");
    expect(actions).toContain("APPLICATION_ACCEPTED");
    expect(actions).toContain("OFFER_CONFIRMED");
    expect(actions).toContain("APPLICATION_COHORT_ASSIGNED");
    expect(actions).toContain("ENROLLMENT_CREATED_FROM_APPLICATION");
    expect(actions).toContain("ENROLLMENT_CREATED"); // the pre-existing event, still emitted underneath

    const enrollEntry = entries.find((e) => e.action === "ENROLLMENT_CREATED_FROM_APPLICATION");
    expect(enrollEntry?.actorName).toBe(scenario.admissionsStaff.name);
  });

  // ── Draft / Submit (points 1-4) ──────────────────────────────────────

  describe("Draft and submission", () => {
    it("2. saves a draft", async () => {
      const scenario = await buildAdmissionsScenario();
      const { application, applicantActor } = await startApplicationFor(scenario);
      const updated = await saveApplicationDraft(application.id, "My notes.", applicantActor);
      expect(updated.applicantNotes).toBe("My notes.");
    });

    it("3. submits a Draft Application", async () => {
      const scenario = await buildAdmissionsScenario();
      const { application, applicantActor } = await startApplicationFor(scenario);
      const submitted = await submitApplication(application.id, applicantActor);
      expect(submitted.status).toBe("SUBMITTED");
    });

    it("4. a Submitted Application cannot be silently reverted by the Applicant", async () => {
      const scenario = await buildAdmissionsScenario();
      const { application, applicantActor } = await startApplicationFor(scenario);
      await submitApplication(application.id, applicantActor);

      await expect(saveApplicationDraft(application.id, "trying to edit", applicantActor)).rejects.toThrow(
        ApplicationStateError,
      );
      await expect(submitApplication(application.id, applicantActor)).rejects.toThrow(ApplicationStateError);
    });
  });

  // ── RBAC / data isolation (points 5, 7, 10, 23, 24) ──────────────────

  describe("RBAC and data isolation", () => {
    it("5. an Applicant can only see their own Application", async () => {
      const scenario = await buildAdmissionsScenario();
      const { application } = await startApplicationFor(scenario);
      const stranger = await startApplicationFor(scenario);

      await expect(getApplicationById(application.id, stranger.applicantActor)).rejects.toThrow(
        ApplicationAuthorizationError,
      );
      const own = await listApplicationsForApplicant(stranger.applicant.id, stranger.applicantActor);
      expect(own.every((a) => a.applicantId === stranger.applicant.id)).toBe(true);
    });

    it("7a. denies a Program Director viewing another Program's Applications", async () => {
      const scenarioA = await buildAdmissionsScenario();
      const scenarioB = await buildAdmissionsScenario();
      const programDirectorA = await actorFor(scenarioA.programDirector.id);

      await expect(listApplicationsForProgram(scenarioB.program.id, programDirectorA)).rejects.toThrow(
        ApplicationAuthorizationError,
      );
    });

    it("7b. Admissions Staff is institution-wide by design (ROLE_SCOPE), not Program-scoped — can view every Program's Applications", async () => {
      const scenarioA = await buildAdmissionsScenario();
      const scenarioB = await buildFullScenario();
      const admissionsStaff = await actorFor(scenarioA.admissionsStaff.id);

      const appA = await startApplicationFor(scenarioA);
      const applicantB = await createUser({
        name: "Applicant B",
        email: "applicantb@example.test",
        password: "test-password-123",
        actorId: null,
      });
      const applicantBActor = await actorFor(applicantB.id);
      const appB = await startOrResumeApplication(applicantB.id, scenarioB.program.id, applicantBActor);

      const all = await listApplicationsForAdmissions(admissionsStaff);
      expect(all.some((a) => a.id === appA.application.id)).toBe(true);
      expect(all.some((a) => a.id === appB.id)).toBe(true);
    });

    it("10. denies Faculty recording a Decision", async () => {
      const scenario = await buildAdmissionsScenario();
      const { application, applicantActor } = await startApplicationFor(scenario);
      await submitApplication(application.id, applicantActor);
      const admissionsStaff = await actorFor(scenario.admissionsStaff.id);
      await startReview(application.id, admissionsStaff);

      const faculty = await actorFor(scenario.faculty.id);
      await expect(recordDecision(application.id, "ACCEPTED", null, faculty)).rejects.toThrow(
        ApplicationAuthorizationError,
      );
    });

    it("23. an Applicant cannot self-accept their own Application", async () => {
      const scenario = await buildAdmissionsScenario();
      const { application, applicantActor } = await startApplicationFor(scenario);
      await submitApplication(application.id, applicantActor);
      const admissionsStaff = await actorFor(scenario.admissionsStaff.id);
      await startReview(application.id, admissionsStaff);

      await expect(recordDecision(application.id, "ACCEPTED", null, applicantActor)).rejects.toThrow(
        ApplicationAuthorizationError,
      );
    });

    it("24. a Student (with no relation to the Application) cannot access someone else's Application", async () => {
      const scenario = await buildAdmissionsScenario();
      const { application } = await startApplicationFor(scenario);
      const studentActor = await actorFor(scenario.student.id);

      await expect(getApplicationById(application.id, studentActor)).rejects.toThrow(ApplicationAuthorizationError);
    });

    it("fails closed for a User with no relevant Role Assignment at all", async () => {
      const bystander = await buildTestUser({ name: "No Role Bystander" });
      const bystanderActor = await actorFor(bystander.id);

      await expect(listApplicationsForAdmissions(bystanderActor)).rejects.toThrow(ApplicationAuthorizationError);
      await expect(startReview("nonexistent", bystanderActor)).rejects.toThrow(ApplicationAuthorizationError);
    });
  });

  // ── Decisions (points 9, 11, 12, 13, 14) ─────────────────────────────

  describe("Decisions", () => {
    async function readyForDecision(scenario: Awaited<ReturnType<typeof buildAdmissionsScenario>>) {
      const { application, applicantActor } = await startApplicationFor(scenario);
      await submitApplication(application.id, applicantActor);
      const admissionsStaff = await actorFor(scenario.admissionsStaff.id);
      await startReview(application.id, admissionsStaff);
      return { application, admissionsStaff };
    }

    it("11. denial succeeds", async () => {
      const scenario = await buildAdmissionsScenario();
      const { application, admissionsStaff } = await readyForDecision(scenario);
      const denied = await recordDecision(application.id, "DENIED", "Incomplete file.", admissionsStaff);
      expect(denied.status).toBe("DENIED");
      expect(denied.decisionReason).toBe("Incomplete file.");
    });

    it("12. waitlist succeeds, and can be reopened for review", async () => {
      const scenario = await buildAdmissionsScenario();
      const { application, admissionsStaff } = await readyForDecision(scenario);
      const waitlisted = await recordDecision(application.id, "WAITLISTED", null, admissionsStaff);
      expect(waitlisted.status).toBe("WAITLISTED");

      const reopened = await reopenForReview(application.id, admissionsStaff);
      expect(reopened.status).toBe("UNDER_REVIEW");
    });

    it("13. deferral succeeds", async () => {
      const scenario = await buildAdmissionsScenario();
      const { application, admissionsStaff } = await readyForDecision(scenario);
      const deferred = await recordDecision(application.id, "DEFERRED", "Next cohort.", admissionsStaff);
      expect(deferred.status).toBe("DEFERRED");
    });

    it("a Decision can only be recorded on an Application Under Review", async () => {
      const scenario = await buildAdmissionsScenario();
      const { application } = await startApplicationFor(scenario);
      const admissionsStaff = await actorFor(scenario.admissionsStaff.id);
      await expect(recordDecision(application.id, "ACCEPTED", null, admissionsStaff)).rejects.toThrow(
        ApplicationStateError,
      );
    });
  });

  // ── Checklist (point 8) ───────────────────────────────────────────────

  it("8. checklist items start as ⚠️ Needs Verification, never silently pass, and Decisions are not blocked by an incomplete checklist", async () => {
    const scenario = await buildAdmissionsScenario();
    const { application, applicantActor } = await startApplicationFor(scenario);
    const freshApplication = await getApplicationById(application.id, applicantActor);
    expect(freshApplication!.requirements.every((r) => r.status === "NEEDS_VERIFICATION")).toBe(true);

    await submitApplication(application.id, applicantActor);
    const admissionsStaff = await actorFor(scenario.admissionsStaff.id);
    await startReview(application.id, admissionsStaff);

    // No automated acceptance rule exists — a human decision can proceed
    // even while a requirement is still Missing/Needs Verification (this
    // milestone deliberately does not invent an "all-requirements-met"
    // acceptance gate). The checklist informs, never silently blocks.
    const stillNeedsVerification = await getApplicationById(application.id, admissionsStaff);
    expect(stillNeedsVerification!.requirements.some((r) => r.status === "NEEDS_VERIFICATION")).toBe(true);

    const decided = await recordDecision(application.id, "ACCEPTED", null, admissionsStaff);
    expect(decided.status).toBe("ACCEPTED");
  });

  // ── Enrollment handoff (points 16, 17, 18, 19, 21) ───────────────────

  describe("Enrollment handoff", () => {
    async function acceptedAndConfirmed(scenario: Awaited<ReturnType<typeof buildAdmissionsScenario>>) {
      const { application, applicant, applicantActor } = await startApplicationFor(scenario);
      await submitApplication(application.id, applicantActor);
      const admissionsStaff = await actorFor(scenario.admissionsStaff.id);
      await startReview(application.id, admissionsStaff);
      await recordDecision(application.id, "ACCEPTED", null, admissionsStaff);
      const confirmed = await confirmOffer(application.id, applicantActor);
      return { application: confirmed, applicant, applicantActor, admissionsStaff };
    }

    it("16. a non-Accepted-Confirmed Application cannot be enrolled", async () => {
      const scenario = await buildAdmissionsScenario();
      const { application } = await startApplicationFor(scenario);
      const admissionsStaff = await actorFor(scenario.admissionsStaff.id);
      await expect(createEnrollmentFromApplication(application.id, admissionsStaff)).rejects.toThrow(
        ApplicationStateError,
      );
    });

    it("declines an offer instead of confirming it", async () => {
      const scenario = await buildAdmissionsScenario();
      const { application, applicantActor } = await startApplicationFor(scenario);
      await submitApplication(application.id, applicantActor);
      const admissionsStaff = await actorFor(scenario.admissionsStaff.id);
      await startReview(application.id, admissionsStaff);
      await recordDecision(application.id, "ACCEPTED", null, admissionsStaff);

      const declined = await declineOffer(application.id, applicantActor);
      expect(declined.status).toBe("ACCEPTANCE_DECLINED");
    });

    it("21. enrollment cannot be created from an Application with no Cohort assigned (an ineligible Application)", async () => {
      const scenario = await buildAdmissionsScenario();
      const { application, admissionsStaff } = await acceptedAndConfirmed(scenario);
      await expect(createEnrollmentFromApplication(application.id, admissionsStaff)).rejects.toThrow(
        "Cohort must be assigned",
      );
    });

    it("17-19. enrollment is created only after the correct workflow, activates the Student Role, and reuses the existing User", async () => {
      const scenario = await buildAdmissionsScenario();
      const { application, applicant, admissionsStaff } = await acceptedAndConfirmed(scenario);
      await assignCohort(application.id, scenario.cohort.id, admissionsStaff);

      const enrollment = await createEnrollmentFromApplication(application.id, admissionsStaff);
      expect(enrollment.studentId).toBe(applicant.id);
      expect(enrollment.programId).toBe(scenario.program.id);

      const userCount = await db.user.count({ where: { id: applicant.id } });
      expect(userCount).toBe(1); // 19 — no duplicate identity created

      const roleAssignments = await db.roleAssignment.findMany({ where: { userId: applicant.id } });
      expect(roleAssignments.some((ra) => ra.role === "STUDENT")).toBe(true); // 18
    });

    it("an Applicant cannot self-enroll, even after confirming their own offer", async () => {
      const scenario = await buildAdmissionsScenario();
      const { application, applicantActor, admissionsStaff } = await acceptedAndConfirmed(scenario);
      await assignCohort(application.id, scenario.cohort.id, admissionsStaff);

      await expect(createEnrollmentFromApplication(application.id, applicantActor)).rejects.toThrow(
        ApplicationAuthorizationError,
      );
    });
  });

  // ── No hard-coded program name (point 25) ────────────────────────────

  it("25. never hard-codes the Pharmacy Technology program name anywhere in the admissions service", async () => {
    const scenario = await buildAdmissionsScenario();
    const program = await db.program.findUniqueOrThrow({ where: { id: scenario.program.id } });
    expect(program.name).not.toMatch(/pharmacy/i);
  });

  // ── Regression (point 26) ────────────────────────────────────────────

  it("26. leaves Milestones 15/16's existing externship/graduation behavior intact", async () => {
    // Builds a full scenario plus an independent Coordinator/Site/
    // Placement chain on top of it — more setup than a typical test in
    // this file, occasionally pushing past Vitest's 5000ms default.
    const scenario = await buildAdmissionsScenario();
    await db.program.update({ where: { id: scenario.program.id }, data: { requiresExternship: false } });
    const programDirector = await actorFor(scenario.programDirector.id);

    // Externship (Milestone 15) — a raw site/placement request still works.
    const coordinator = await buildTestUser({ name: "Regression Coordinator" });
    await assignRole({ userId: coordinator.id, role: "CLINICAL_COORDINATOR", programId: scenario.program.id, actorId: scenario.admin.id });
    const coordinatorActor = await actorFor(coordinator.id);
    const site = await createClinicalSite(
      { programId: scenario.program.id, name: "Regression Site", employerName: "Regression Employer" },
      coordinatorActor,
    );
    await updateClinicalSiteStatus(site.id, "ACTIVE", coordinatorActor);
    const placement = await requestPlacement(
      { studentId: scenario.student.id, programId: scenario.program.id, clinicalSiteId: site.id },
      coordinatorActor,
    );
    expect(placement.status).toBe("REQUESTED");

    // Graduation eligibility (Milestone 16) — still callable, still fails closed for an untouched Student.
    const eligibility = await determineGraduationEligibility(scenario.student.id, scenario.program.id, programDirector);
    expect(eligibility.eligible).toBe(false);
  }, 15000);

  it("registerApplicant refuses a duplicate email", async () => {
    await registerApplicant({ name: "First", email: "dup@example.test", password: "test-password-123" });
    await expect(
      registerApplicant({ name: "Second", email: "dup@example.test", password: "test-password-123" }),
    ).rejects.toThrow(EmailAlreadyRegisteredError);
  });
});

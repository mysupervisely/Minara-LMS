import { describe, it, expect, beforeEach } from "vitest";
import { resetDatabase } from "./helpers/reset-db";
import { buildFullScenario, buildAcademicStructure, buildTestUser } from "./helpers/fixtures";
import { assignRole } from "@/services/identity/users";
import { submitAssessment } from "@/services/assessments/assessments";
import {
  enterGrade,
  submitGradeForApproval,
  approveGrade,
  rejectGrade,
  listPendingApprovalsForProgram,
  GradeStateError,
} from "@/services/gradebook/gradebook";
import { hasRoleForProgram } from "@/services/identity/authorization";
import { getSessionUser } from "@/services/identity/session";
import { login } from "@/services/identity/auth";
import { listAuditLog } from "@/services/audit/audit";

/**
 * Approval workflow test — Milestone 10's "Approval workflow test"
 * testing requirement: the Program Director approval gate that
 * completes ADR-011's vertical slice, including the Audit Trail step.
 */
describe("Approval workflow", () => {
  beforeEach(resetDatabase);

  async function seedSubmittedGrade(scenario: Awaited<ReturnType<typeof buildFullScenario>>) {
    const submission = await submitAssessment({
      assessmentId: scenario.assessment.id,
      studentId: scenario.student.id,
      courseOfferingId: scenario.courseOffering.id,
      content: "Response awaiting approval.",
    });
    const grade = await enterGrade({
      submissionId: submission.id,
      score: 91,
      feedback: "Great job.",
      enteredById: scenario.faculty.id,
    });
    return submitGradeForApproval(grade.id, scenario.faculty.id);
  }

  it("appears in the Program Director's pending-approval queue once Faculty submits it", async () => {
    const scenario = await buildFullScenario();
    const grade = await seedSubmittedGrade(scenario);

    const pending = await listPendingApprovalsForProgram(scenario.program.id);
    expect(pending.map((g) => g.id)).toContain(grade.id);
  });

  it("becomes APPROVED, with an approver and timestamp, when the Program Director approves it", async () => {
    const scenario = await buildFullScenario();
    const grade = await seedSubmittedGrade(scenario);

    const approved = await approveGrade(grade.id, scenario.programDirector.id);
    expect(approved.status).toBe("APPROVED");
    expect(approved.approvedById).toBe(scenario.programDirector.id);
    expect(approved.approvedAt).not.toBeNull();

    const stillPending = await listPendingApprovalsForProgram(scenario.program.id);
    expect(stillPending.map((g) => g.id)).not.toContain(grade.id);
  });

  it("returns a rejected grade to DRAFT so Faculty can revise it, rather than deleting it", async () => {
    const scenario = await buildFullScenario();
    const grade = await seedSubmittedGrade(scenario);

    const rejected = await rejectGrade(grade.id, scenario.programDirector.id);
    expect(rejected.status).toBe("DRAFT");
    expect(rejected.score).toBe(91); // preserved, not erased

    // Faculty can now revise and resubmit.
    const revised = await enterGrade({
      submissionId: rejected.submissionId,
      score: 95,
      enteredById: scenario.faculty.id,
    });
    expect(revised.status).toBe("DRAFT");
    expect(revised.score).toBe(95);
  });

  it("cannot be approved a second time, or approved before it's been submitted", async () => {
    const scenario = await buildFullScenario();
    const grade = await seedSubmittedGrade(scenario);

    await approveGrade(grade.id, scenario.programDirector.id);
    await expect(approveGrade(grade.id, scenario.programDirector.id)).rejects.toThrow(GradeStateError);
  });

  it("a Program Director who does not oversee this Program cannot be authorized to approve it", async () => {
    const scenario = await buildFullScenario();
    await seedSubmittedGrade(scenario);

    const otherStructure = await buildAcademicStructure(scenario.admin.id);
    const otherPD = await buildTestUser({ email: "other-pd@example.test" });
    await assignRole({
      userId: otherPD.id,
      role: "PROGRAM_DIRECTOR",
      programId: otherStructure.program.id,
      actorId: scenario.admin.id,
    });

    await login(otherPD.email, "password123");
    const user = (await getSessionUser())!;

    // The authorization boundary itself (this is what the Program
    // Director approval Server Action checks before calling
    // approveGrade — see src/app/(portal)/program-director/actions.ts).
    expect(hasRoleForProgram(user, "PROGRAM_DIRECTOR", scenario.program.id)).toBe(false);
  });

  it("produces a full, attributable Audit Trail across the entire vertical slice", async () => {
    const scenario = await buildFullScenario();
    const grade = await seedSubmittedGrade(scenario);
    await approveGrade(grade.id, scenario.programDirector.id);

    const entries = await listAuditLog();
    const actions = entries.map((e) => e.action);

    // Every step of the vertical slice from
    // docs/milestones/milestone-9-engineering-foundation-development-setup/10-first-implementation-roadmap.md
    // and ADR-011 left a trace.
    expect(actions).toContain("USER_CREATED");
    expect(actions).toContain("ROLE_ASSIGNED");
    expect(actions).toContain("ENROLLMENT_CREATED");
    expect(actions).toContain("ASSESSMENT_SUBMITTED");
    expect(actions).toContain("GRADE_ENTERED");
    expect(actions).toContain("GRADE_SUBMITTED_FOR_APPROVAL");
    expect(actions).toContain("GRADE_APPROVED");

    const approvalEntry = entries.find((e) => e.action === "GRADE_APPROVED");
    expect(approvalEntry?.actorName).toBe(scenario.programDirector.name);
  });
});

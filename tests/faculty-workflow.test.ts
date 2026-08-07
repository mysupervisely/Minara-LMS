import { describe, it, expect, beforeEach } from "vitest";
import { resetDatabase } from "./helpers/reset-db";
import { buildFullScenario } from "./helpers/fixtures";
import { submitAssessment, listSubmissionsForCourseOffering } from "@/services/assessments/assessments";
import { listRosterForCourseOffering } from "@/services/academic/institution";
import { enterGrade, submitGradeForApproval, GradeStateError } from "@/services/gradebook/gradebook";
import { listAuditLog } from "@/services/audit/audit";

/**
 * Faculty workflow test — Milestone 10's "Faculty workflow test"
 * testing requirement: roster visibility, submission review, and grade
 * entry through submission for Program Director approval — the second
 * link in ADR-011's vertical slice.
 */
describe("Faculty workflow", () => {
  beforeEach(resetDatabase);

  async function seedSubmission(scenario: Awaited<ReturnType<typeof buildFullScenario>>) {
    return submitAssessment({
      assessmentId: scenario.assessment.id,
      studentId: scenario.student.id,
      courseOfferingId: scenario.courseOffering.id,
      content: "Student response awaiting review.",
    });
  }

  it("shows the Faculty Instructor their roster and ungraded submissions", async () => {
    const scenario = await buildFullScenario();
    await seedSubmission(scenario);

    const roster = await listRosterForCourseOffering(scenario.courseOffering.id);
    expect(roster.map((e) => e.studentId)).toContain(scenario.student.id);

    const submissions = await listSubmissionsForCourseOffering(scenario.courseOffering.id);
    expect(submissions).toHaveLength(1);
    expect(submissions[0].grade).toBeNull();
  });

  it("lets Faculty enter a Draft grade with feedback, then submit it for approval", async () => {
    const scenario = await buildFullScenario();
    const submission = await seedSubmission(scenario);

    const grade = await enterGrade({
      submissionId: submission.id,
      score: 88,
      feedback: "Solid work overall.",
      enteredById: scenario.faculty.id,
    });
    expect(grade.status).toBe("DRAFT");
    expect(grade.score).toBe(88);

    const submitted = await submitGradeForApproval(grade.id, scenario.faculty.id);
    expect(submitted.status).toBe("SUBMITTED");
    expect(submitted.submittedAt).not.toBeNull();
  });

  it("does not let a grade be edited via enterGrade once it has been submitted for approval", async () => {
    const scenario = await buildFullScenario();
    const submission = await seedSubmission(scenario);

    const grade = await enterGrade({
      submissionId: submission.id,
      score: 70,
      enteredById: scenario.faculty.id,
    });
    await submitGradeForApproval(grade.id, scenario.faculty.id);

    await expect(
      enterGrade({ submissionId: submission.id, score: 95, enteredById: scenario.faculty.id }),
    ).rejects.toThrow(GradeStateError);
  });

  it("does not let a Draft grade be submitted for approval twice", async () => {
    const scenario = await buildFullScenario();
    const submission = await seedSubmission(scenario);
    const grade = await enterGrade({
      submissionId: submission.id,
      score: 70,
      enteredById: scenario.faculty.id,
    });

    await submitGradeForApproval(grade.id, scenario.faculty.id);
    await expect(submitGradeForApproval(grade.id, scenario.faculty.id)).rejects.toThrow(GradeStateError);
  });

  it("records GRADE_ENTERED and GRADE_SUBMITTED_FOR_APPROVAL audit events", async () => {
    const scenario = await buildFullScenario();
    const submission = await seedSubmission(scenario);
    const grade = await enterGrade({
      submissionId: submission.id,
      score: 82,
      enteredById: scenario.faculty.id,
    });
    await submitGradeForApproval(grade.id, scenario.faculty.id);

    const entries = await listAuditLog();
    expect(entries.some((e) => e.action === "GRADE_ENTERED")).toBe(true);
    expect(entries.some((e) => e.action === "GRADE_SUBMITTED_FOR_APPROVAL")).toBe(true);
  });
});

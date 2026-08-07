import { describe, it, expect, beforeEach } from "vitest";
import { resetDatabase } from "./helpers/reset-db";
import { buildFullScenario } from "./helpers/fixtures";
import { submitAssessment } from "@/services/assessments/assessments";
import { enterGrade, submitGradeForApproval, approveGrade } from "@/services/gradebook/gradebook";
import { getCompetencyProgressForStudent } from "@/services/academic/competency";

/**
 * Competency tracking test — Milestone 13's Implementation Plan Phase 5
 * ("Competency Tracking"): an Approved Grade against a Competency-
 * linked Lesson's Course moves that Competency into the Student's
 * Competency Progress, as a derived read with no separate write path —
 * per
 * docs/milestones/milestone-12-curriculum-delivery-vertical-slice/03-domain-impact-review.md.
 */
describe("Competency tracking", () => {
  beforeEach(resetDatabase);

  async function seedSubmittedGrade(scenario: Awaited<ReturnType<typeof buildFullScenario>>) {
    const submission = await submitAssessment({
      assessmentId: scenario.assessment.id,
      studentId: scenario.student.id,
      courseOfferingId: scenario.courseOffering.id,
      content: "Response.",
    });
    const grade = await enterGrade({
      submissionId: submission.id,
      score: 90,
      enteredById: scenario.faculty.id,
    });
    return submitGradeForApproval(grade.id, scenario.faculty.id);
  }

  it("does not show a Competency in progress before any Grade is Approved", async () => {
    const scenario = await buildFullScenario();
    await seedSubmittedGrade(scenario);

    const progress = await getCompetencyProgressForStudent(scenario.student.id);
    expect(progress.map((c) => c.id)).not.toContain(scenario.competency.id);
  });

  it("shows the Competency in progress immediately once the Grade is Approved", async () => {
    const scenario = await buildFullScenario();
    const grade = await seedSubmittedGrade(scenario);
    await approveGrade(grade.id, scenario.programDirector.id);

    const progress = await getCompetencyProgressForStudent(scenario.student.id);
    const entry = progress.find((c) => c.id === scenario.competency.id);
    expect(entry).toBeDefined();
    expect(entry?.lessonTitles).toContain(scenario.lessonVersion.title);
  });

  it("shows no Competency progress for a Student with no Approved Grades", async () => {
    const scenario = await buildFullScenario();
    const progress = await getCompetencyProgressForStudent(scenario.student.id);
    expect(progress).toHaveLength(0);
  });
});

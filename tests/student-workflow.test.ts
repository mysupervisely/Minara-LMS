import { describe, it, expect, beforeEach } from "vitest";
import { resetDatabase } from "./helpers/reset-db";
import { buildFullScenario } from "./helpers/fixtures";
import {
  listCourseOfferingsForStudent,
  markLessonComplete,
  getLessonCompletionsForStudent,
} from "@/services/enrollment/enrollment";
import { submitAssessment, getSubmissionForStudent } from "@/services/assessments/assessments";
import { listAuditLog } from "@/services/audit/audit";

/**
 * Student workflow test — Milestone 10's "Student workflow test"
 * testing requirement, exercising the first half of ADR-011's vertical
 * slice end-to-end: Enrollment → Course Content → Lesson Completion →
 * Assessment submission.
 */
describe("Student workflow", () => {
  beforeEach(resetDatabase);

  it("lets an enrolled Student see their Course Offering, complete a lesson, and submit an assessment", async () => {
    const scenario = await buildFullScenario();

    const offerings = await listCourseOfferingsForStudent(scenario.student.id);
    expect(offerings.map((o) => o.id)).toContain(scenario.courseOffering.id);

    let completions = await getLessonCompletionsForStudent(scenario.student.id, scenario.course.id);
    expect(completions).toHaveLength(0);

    await markLessonComplete({ studentId: scenario.student.id, lessonId: scenario.lesson.id });

    completions = await getLessonCompletionsForStudent(scenario.student.id, scenario.course.id);
    expect(completions).toHaveLength(1);
    expect(completions[0].lessonVersionId).toBe(scenario.lessonVersion.id);

    const submission = await submitAssessment({
      assessmentId: scenario.assessment.id,
      studentId: scenario.student.id,
      courseOfferingId: scenario.courseOffering.id,
      content: "My response to the assessment.",
    });

    expect(submission.content).toBe("My response to the assessment.");
    expect(submission.enrollmentId).toBeTruthy();

    const fetched = await getSubmissionForStudent(scenario.assessment.id, scenario.student.id);
    expect(fetched?.id).toBe(submission.id);
    expect(fetched?.grade).toBeNull();
  });

  it("marking the same lesson complete twice does not create duplicate completions", async () => {
    const scenario = await buildFullScenario();

    await markLessonComplete({ studentId: scenario.student.id, lessonId: scenario.lesson.id });
    await markLessonComplete({ studentId: scenario.student.id, lessonId: scenario.lesson.id });

    const completions = await getLessonCompletionsForStudent(scenario.student.id, scenario.course.id);
    expect(completions).toHaveLength(1);
  });

  it("resubmitting an assessment before it's graded updates the existing Submission rather than creating a second one", async () => {
    const scenario = await buildFullScenario();

    const first = await submitAssessment({
      assessmentId: scenario.assessment.id,
      studentId: scenario.student.id,
      courseOfferingId: scenario.courseOffering.id,
      content: "First attempt.",
    });
    const second = await submitAssessment({
      assessmentId: scenario.assessment.id,
      studentId: scenario.student.id,
      courseOfferingId: scenario.courseOffering.id,
      content: "Revised attempt.",
    });

    expect(second.id).toBe(first.id);
    expect(second.content).toBe("Revised attempt.");
  });

  it("records LESSON_COMPLETED and ASSESSMENT_SUBMITTED audit events", async () => {
    const scenario = await buildFullScenario();

    await markLessonComplete({ studentId: scenario.student.id, lessonId: scenario.lesson.id });
    await submitAssessment({
      assessmentId: scenario.assessment.id,
      studentId: scenario.student.id,
      courseOfferingId: scenario.courseOffering.id,
      content: "My response.",
    });

    const entries = await listAuditLog();
    expect(entries.some((e) => e.action === "LESSON_COMPLETED")).toBe(true);
    expect(entries.some((e) => e.action === "ASSESSMENT_SUBMITTED")).toBe(true);
  });
});

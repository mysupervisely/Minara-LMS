import { describe, it, expect, beforeEach } from "vitest";
import { resetDatabase } from "./helpers/reset-db";
import { buildFullScenario } from "./helpers/fixtures";
import { createLesson } from "@/services/academic/institution";
import { createAssessment, submitAssessment } from "@/services/assessments/assessments";
import {
  submitContentForReview,
  returnContentToDraft,
  approveContent,
  publishContent,
} from "@/services/academic/content-workflow";
import { markLessonComplete } from "@/services/enrollment/enrollment";
import { enterGrade, submitGradeForApproval, approveGrade } from "@/services/gradebook/gradebook";
import { getCompetencyProgressForStudent } from "@/services/academic/competency";
import { listAuditLog } from "@/services/audit/audit";

/**
 * End-to-end scenario test — Milestone 13's Implementation Plan Phase 6
 * ("Audit Validation"), replaying the full seven-step scenario from
 * docs/milestones/milestone-12-curriculum-delivery-vertical-slice/01-product-requirements-document.md#success-criteria
 * in one pass: Faculty Content Creation → Program Director Approval →
 * Publishing → Student Lesson Delivery → Assessment Completion → Grade
 * Recording → Competency Progress Signal → Audit Verification.
 */
describe("End-to-end Curriculum Delivery Vertical Slice", () => {
  beforeEach(resetDatabase);

  it("proves the complete lifecycle, fully reconstructable from the Audit Log alone", async () => {
    const scenario = await buildFullScenario();

    // 1. Faculty drafts a Lesson (tagged with a Competency) and an
    // Assessment.
    const lesson = await createLesson(
      {
        courseId: scenario.course.id,
        title: "E2E Lesson",
        content: "End-to-end lesson content.",
        competencyIds: [scenario.competency.id],
      },
      scenario.faculty.id,
    );
    const assessment = await createAssessment(
      { courseId: scenario.course.id, title: "E2E Quiz", instructions: "Answer honestly." },
      scenario.faculty.id,
    );

    // 2. Both are submitted, and the Lesson is returned once (proving
    // the return path) before resubmission and approval.
    await submitContentForReview("LESSON", lesson.id, scenario.faculty.id);
    await returnContentToDraft(
      "LESSON",
      lesson.id,
      "Add a worked example.",
      scenario.programDirector.id,
    );
    await submitContentForReview("LESSON", lesson.id, scenario.faculty.id);
    await approveContent("LESSON", lesson.id, scenario.programDirector.id);

    await submitContentForReview("ASSESSMENT", assessment.id, scenario.faculty.id);
    await approveContent("ASSESSMENT", assessment.id, scenario.programDirector.id);

    // 3. Administrator publishes both.
    await publishContent("LESSON", lesson.id, scenario.admin.id);
    await publishContent("ASSESSMENT", assessment.id, scenario.admin.id);

    // 4. The Student — who could not see either item before — now
    // completes the Lesson and submits the Assessment.
    const completion = await markLessonComplete({
      studentId: scenario.student.id,
      lessonId: lesson.id,
    });
    expect(completion.lessonId).toBe(lesson.id);

    const submission = await submitAssessment({
      assessmentId: assessment.id,
      studentId: scenario.student.id,
      courseOfferingId: scenario.courseOffering.id,
      content: "My honest answer.",
    });

    // 5. Faculty grades it; Program Director approves the Grade.
    const grade = await enterGrade({
      submissionId: submission.id,
      score: 88,
      feedback: "Well reasoned.",
      enteredById: scenario.faculty.id,
    });
    await submitGradeForApproval(grade.id, scenario.faculty.id);
    await approveGrade(grade.id, scenario.programDirector.id);

    // 6. The Student's Competency Progress reflects the newly Approved
    // Grade.
    const progress = await getCompetencyProgressForStudent(scenario.student.id);
    expect(progress.map((c) => c.id)).toContain(scenario.competency.id);

    // 7. An Administrator, using only the Audit Log, can reconstruct
    // every step above.
    const entries = await listAuditLog();
    const actions = entries.map((e) => e.action);

    expect(actions).toContain("LESSON_CREATED");
    expect(actions).toContain("ASSESSMENT_CREATED");
    expect(actions).toContain("CONTENT_SUBMITTED_FOR_REVIEW");
    expect(actions).toContain("CONTENT_RETURNED_TO_DRAFT");
    expect(actions).toContain("CONTENT_APPROVED");
    expect(actions).toContain("CONTENT_PUBLISHED");
    expect(actions).toContain("LESSON_COMPLETED");
    expect(actions).toContain("ASSESSMENT_SUBMITTED");
    expect(actions).toContain("GRADE_ENTERED");
    expect(actions).toContain("GRADE_SUBMITTED_FOR_APPROVAL");
    expect(actions).toContain("GRADE_APPROVED");

    // The Return event's reason is preserved in the Audit Log itself —
    // not only on the Lesson row — per this milestone's audit design.
    const returnEntry = entries.find((e) => e.action === "CONTENT_RETURNED_TO_DRAFT");
    expect(returnEntry?.metadata?.reason).toBe("Add a worked example.");

    // Every CONTENT_PUBLISHED event is attributed to the Administrator
    // who published it, not the Faculty author or Program Director
    // approver — the institution-wide authority split this milestone's
    // Architecture Review confirms against ADR-005.
    const publishEntries = entries.filter((e) => e.action === "CONTENT_PUBLISHED");
    expect(publishEntries.every((e) => e.actorName === scenario.admin.name)).toBe(true);
  });
});

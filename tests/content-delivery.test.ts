import { describe, it, expect, beforeEach } from "vitest";
import { resetDatabase } from "./helpers/reset-db";
import { buildFullScenario } from "./helpers/fixtures";
import { createLesson, getCourseOfferingForStudent, getCourseOfferingById } from "@/services/academic/institution";
import { createAssessment } from "@/services/assessments/assessments";
import { markLessonComplete } from "@/services/enrollment/enrollment";
import { submitAssessment } from "@/services/assessments/assessments";

/**
 * Content delivery test — Milestone 13's Implementation Plan Phase 3
 * ("Student Delivery"): Published content, and only Published content,
 * reaches enrolled Students; a direct request against non-Published
 * content is denied at the service layer (fail-closed), per
 * docs/milestones/milestone-12-curriculum-delivery-vertical-slice/01-product-requirements-document.md
 * (S-1).
 */
describe("Content delivery", () => {
  beforeEach(resetDatabase);

  it("only lists Published Lessons/Assessments on the Student-facing Course Offering read", async () => {
    const scenario = await buildFullScenario();
    // A Draft Lesson, never submitted/approved/published.
    await createLesson(
      { courseId: scenario.course.id, title: "Still Drafting", content: "Not ready." },
      scenario.faculty.id,
    );

    const studentView = await getCourseOfferingForStudent(scenario.courseOffering.id);
    const titles = studentView?.course.lessons.map((l) => l.title) ?? [];
    expect(titles).toContain(scenario.lesson.title); // published by the fixture
    expect(titles).not.toContain("Still Drafting");

    // The Faculty-facing read is unfiltered — it must still see the Draft.
    const facultyView = await getCourseOfferingById(scenario.courseOffering.id);
    const facultyTitles = facultyView?.course.lessons.map((l) => l.title) ?? [];
    expect(facultyTitles).toContain("Still Drafting");
  });

  it("lets a Student complete a Published Lesson exactly as in Milestone 10", async () => {
    const scenario = await buildFullScenario();
    const completion = await markLessonComplete({
      studentId: scenario.student.id,
      lessonId: scenario.lesson.id,
    });
    expect(completion.lessonId).toBe(scenario.lesson.id);
  });

  it("denies completing a Lesson that is not Published, even with a direct id (fail-closed)", async () => {
    const scenario = await buildFullScenario();
    const draftLesson = await createLesson(
      { courseId: scenario.course.id, title: "Not Yet", content: "Draft." },
      scenario.faculty.id,
    );

    await expect(
      markLessonComplete({ studentId: scenario.student.id, lessonId: draftLesson.id }),
    ).rejects.toThrow(/not available/i);
  });

  it("lets a Student submit a Published Assessment exactly as in Milestone 10", async () => {
    const scenario = await buildFullScenario();
    const submission = await submitAssessment({
      assessmentId: scenario.assessment.id,
      studentId: scenario.student.id,
      courseOfferingId: scenario.courseOffering.id,
      content: "My response.",
    });
    expect(submission.content).toBe("My response.");
  });

  it("denies submitting an Assessment that is not Published, even with a direct id (fail-closed)", async () => {
    const scenario = await buildFullScenario();
    const draftAssessment = await createAssessment(
      { courseId: scenario.course.id, title: "Not Yet", instructions: "Draft." },
      scenario.faculty.id,
    );

    await expect(
      submitAssessment({
        assessmentId: draftAssessment.id,
        studentId: scenario.student.id,
        courseOfferingId: scenario.courseOffering.id,
        content: "Trying anyway.",
      }),
    ).rejects.toThrow(/not available/i);
  });
});

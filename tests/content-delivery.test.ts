import { describe, it, expect, beforeEach } from "vitest";
import { resetDatabase } from "./helpers/reset-db";
import { buildFullScenario } from "./helpers/fixtures";
import { createLesson, getCourseOfferingForStudent } from "@/services/academic/institution";
import { listContentForCourse } from "@/services/academic/content-workflow";
import { createAssessment } from "@/services/assessments/assessments";
import { markLessonComplete } from "@/services/enrollment/enrollment";
import { submitAssessment } from "@/services/assessments/assessments";

/**
 * Content delivery test — Milestone 13's Implementation Plan Phase 3
 * ("Student Delivery"), extended by Milestone 14: only a Lesson's/
 * Assessment's *currently published version* reaches enrolled
 * Students; a direct request against non-Published content — or a
 * Draft/Submitted/Approved newer version of already-Published content
 * — is denied at the service layer (fail-closed), per
 * docs/milestones/milestone-12-curriculum-delivery-vertical-slice/01-product-requirements-document.md
 * (S-1) and this milestone's identical requirement.
 */
describe("Content delivery", () => {
  beforeEach(resetDatabase);

  it("only lists Published Lessons/Assessments (their published version) on the Student-facing Course Offering read", async () => {
    const scenario = await buildFullScenario();
    // A Draft Lesson, never submitted/approved/published.
    await createLesson(
      { courseId: scenario.course.id, title: "Still Drafting", content: "Not ready." },
      scenario.faculty.id,
    );

    const studentView = await getCourseOfferingForStudent(scenario.courseOffering.id);
    const titles = studentView?.course.lessons.map((l) => l.publishedVersion?.title) ?? [];
    expect(titles).toContain(scenario.lessonVersion.title); // published by the fixture
    expect(titles).not.toContain("Still Drafting");

    // The Faculty-facing read (listContentForCourse) is unfiltered — it
    // must still see the Draft Lesson's latest version.
    const facultyView = await listContentForCourse(scenario.course.id);
    const facultyTitles = facultyView.lessons.map((l) => l.versions[0]?.title);
    expect(facultyTitles).toContain("Still Drafting");
  });

  it("lets a Student complete a Published Lesson exactly as in Milestone 10, recorded against the published version", async () => {
    const scenario = await buildFullScenario();
    const completion = await markLessonComplete({
      studentId: scenario.student.id,
      lessonId: scenario.lesson.id,
    });
    expect(completion.lessonVersionId).toBe(scenario.lessonVersion.id);
  });

  it("denies completing a Lesson that is not Published, even with a direct id (fail-closed)", async () => {
    const scenario = await buildFullScenario();
    const { lesson: draftLesson } = await createLesson(
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
    expect(submission.assessmentVersionId).toBe(scenario.assessmentVersion.id);
  });

  it("denies submitting an Assessment that is not Published, even with a direct id (fail-closed)", async () => {
    const scenario = await buildFullScenario();
    const { assessment: draftAssessment } = await createAssessment(
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

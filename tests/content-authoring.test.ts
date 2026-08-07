import { describe, it, expect, beforeEach } from "vitest";
import { resetDatabase } from "./helpers/reset-db";
import { buildFullScenario } from "./helpers/fixtures";
import { createLesson, updateLessonDraft } from "@/services/academic/institution";
import { createAssessment, updateAssessmentDraft } from "@/services/assessments/assessments";
import { createCompetency, listCompetenciesForProgram } from "@/services/academic/competency";
import { listAuditLog } from "@/services/audit/audit";
import { db } from "@/lib/db";

/**
 * Content authoring test — Milestone 13's Implementation Plan Phase 1
 * ("Content Authoring Foundation"): Faculty can draft a Lesson and an
 * Assessment, tagged with a Competency, and edit them while still
 * Draft.
 */
describe("Content authoring", () => {
  beforeEach(resetDatabase);

  it("creates a Lesson as Draft by default, with no Competency required at creation time", async () => {
    const scenario = await buildFullScenario();

    const lesson = await createLesson(
      { courseId: scenario.course.id, title: "New Lesson", content: "Some content." },
      scenario.faculty.id,
    );

    expect(lesson.status).toBe("DRAFT");
  });

  it("links a Lesson to one or more Competencies at creation", async () => {
    const scenario = await buildFullScenario();
    const competency = await createCompetency(
      { programId: scenario.program.id, name: "A Second Competency" },
      scenario.admin.id,
    );

    const lesson = await createLesson(
      {
        courseId: scenario.course.id,
        title: "Tagged Lesson",
        content: "Content.",
        competencyIds: [scenario.competency.id, competency.id],
      },
      scenario.faculty.id,
    );

    const found = await db.lesson.findUnique({
      where: { id: lesson.id },
      include: { competencies: true },
    });
    expect(found?.competencies).toHaveLength(2);
  });

  it("creates an Assessment as Draft by default", async () => {
    const scenario = await buildFullScenario();

    const assessment = await createAssessment(
      { courseId: scenario.course.id, title: "New Quiz", instructions: "Answer the question." },
      scenario.faculty.id,
    );

    expect(assessment.status).toBe("DRAFT");
  });

  it("allows editing a Draft Lesson's content and Competency tags", async () => {
    const scenario = await buildFullScenario();
    const lesson = await createLesson(
      { courseId: scenario.course.id, title: "Original Title", content: "Original content." },
      scenario.faculty.id,
    );

    const updated = await updateLessonDraft({
      lessonId: lesson.id,
      title: "Revised Title",
      content: "Revised content.",
      competencyIds: [scenario.competency.id],
    });

    expect(updated.title).toBe("Revised Title");
    expect(updated.content).toBe("Revised content.");
  });

  it("allows editing a Draft Assessment's instructions and max score", async () => {
    const scenario = await buildFullScenario();
    const assessment = await createAssessment(
      { courseId: scenario.course.id, title: "Quiz", instructions: "Original instructions." },
      scenario.faculty.id,
    );

    const updated = await updateAssessmentDraft({
      assessmentId: assessment.id,
      title: "Quiz — Revised",
      instructions: "Revised instructions.",
      maxScore: 50,
    });

    expect(updated.title).toBe("Quiz — Revised");
    expect(updated.maxScore).toBe(50);
  });

  it("does not allow editing content once it is no longer Draft", async () => {
    const scenario = await buildFullScenario();
    // scenario.lesson was published by the fixture itself.
    await expect(
      updateLessonDraft({
        lessonId: scenario.lesson.id,
        title: "Should not apply",
        content: "Should not apply.",
        competencyIds: [],
      }),
    ).rejects.toThrow(/only draft lessons/i);
  });

  it("lists Competencies scoped to a Program", async () => {
    const scenario = await buildFullScenario();
    const otherScenario = await buildFullScenario();

    const competencies = await listCompetenciesForProgram(scenario.program.id);
    expect(competencies.map((c) => c.id)).toContain(scenario.competency.id);
    expect(competencies.map((c) => c.id)).not.toContain(otherScenario.competency.id);
  });

  it("records LESSON_CREATED, ASSESSMENT_CREATED, and COMPETENCY_CREATED audit events", async () => {
    const scenario = await buildFullScenario();
    await createLesson(
      { courseId: scenario.course.id, title: "Another Lesson", content: "Content." },
      scenario.faculty.id,
    );
    await createAssessment(
      { courseId: scenario.course.id, title: "Another Quiz", instructions: "Instructions." },
      scenario.faculty.id,
    );

    const entries = await listAuditLog();
    const actions = entries.map((e) => e.action);
    expect(actions).toContain("LESSON_CREATED");
    expect(actions).toContain("ASSESSMENT_CREATED");
    expect(actions).toContain("COMPETENCY_CREATED");
  });
});

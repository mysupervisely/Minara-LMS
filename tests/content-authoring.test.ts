import { describe, it, expect, beforeEach } from "vitest";
import { resetDatabase } from "./helpers/reset-db";
import { buildFullScenario } from "./helpers/fixtures";
import { createLesson, updateLessonVersionDraft } from "@/services/academic/institution";
import { createAssessment, updateAssessmentVersionDraft } from "@/services/assessments/assessments";
import { createCompetency, listCompetenciesForProgram } from "@/services/academic/competency";
import { listAuditLog } from "@/services/audit/audit";
import { db } from "@/lib/db";

/**
 * Content authoring test — Milestone 13's Implementation Plan Phase 1
 * ("Content Authoring Foundation"), extended by Milestone 14: Faculty
 * can draft a Lesson/Assessment (its first Version), tagged with a
 * Competency, and edit that version while still Draft.
 */
describe("Content authoring", () => {
  beforeEach(resetDatabase);

  it("creates a Lesson and its first Version (v1) as Draft by default, with no Competency required at creation time", async () => {
    const scenario = await buildFullScenario();

    const { lesson, version } = await createLesson(
      { courseId: scenario.course.id, title: "New Lesson", content: "Some content." },
      scenario.faculty.id,
    );

    expect(version.status).toBe("DRAFT");
    expect(version.versionNumber).toBe(1);
    expect(version.lessonId).toBe(lesson.id);
    expect(lesson.publishedVersionId).toBeNull();
  });

  it("links a Lesson Version to one or more Competencies at creation", async () => {
    const scenario = await buildFullScenario();
    const competency = await createCompetency(
      { programId: scenario.program.id, name: "A Second Competency" },
      scenario.admin.id,
    );

    const { version } = await createLesson(
      {
        courseId: scenario.course.id,
        title: "Tagged Lesson",
        content: "Content.",
        competencyIds: [scenario.competency.id, competency.id],
      },
      scenario.faculty.id,
    );

    const found = await db.lessonVersion.findUnique({
      where: { id: version.id },
      include: { competencies: true },
    });
    expect(found?.competencies).toHaveLength(2);
  });

  it("creates an Assessment and its first Version (v1) as Draft by default", async () => {
    const scenario = await buildFullScenario();

    const { assessment, version } = await createAssessment(
      { courseId: scenario.course.id, title: "New Quiz", instructions: "Answer the question." },
      scenario.faculty.id,
    );

    expect(version.status).toBe("DRAFT");
    expect(version.versionNumber).toBe(1);
    expect(version.assessmentId).toBe(assessment.id);
    expect(assessment.publishedVersionId).toBeNull();
  });

  it("allows editing a Draft Lesson Version's content and Competency tags", async () => {
    const scenario = await buildFullScenario();
    const { version } = await createLesson(
      { courseId: scenario.course.id, title: "Original Title", content: "Original content." },
      scenario.faculty.id,
    );

    const updated = await updateLessonVersionDraft({
      versionId: version.id,
      title: "Revised Title",
      content: "Revised content.",
      competencyIds: [scenario.competency.id],
    });

    expect(updated.title).toBe("Revised Title");
    expect(updated.content).toBe("Revised content.");
  });

  it("allows editing a Draft Assessment Version's instructions and max score", async () => {
    const scenario = await buildFullScenario();
    const { version } = await createAssessment(
      { courseId: scenario.course.id, title: "Quiz", instructions: "Original instructions." },
      scenario.faculty.id,
    );

    const updated = await updateAssessmentVersionDraft({
      versionId: version.id,
      title: "Quiz — Revised",
      instructions: "Revised instructions.",
      maxScore: 50,
    });

    expect(updated.title).toBe("Quiz — Revised");
    expect(updated.maxScore).toBe(50);
  });

  it("does not allow editing a version once it is no longer Draft — Published Version 1 cannot be modified", async () => {
    const scenario = await buildFullScenario();
    // scenario.lessonVersion (v1) was published by the fixture itself.
    await expect(
      updateLessonVersionDraft({
        versionId: scenario.lessonVersion.id,
        title: "Should not apply",
        content: "Should not apply.",
        competencyIds: [],
      }),
    ).rejects.toThrow(/only a draft version/i);
  });

  it("does not allow editing a Published Assessment Version either", async () => {
    const scenario = await buildFullScenario();
    await expect(
      updateAssessmentVersionDraft({
        versionId: scenario.assessmentVersion.id,
        title: "Should not apply",
        instructions: "Should not apply.",
        maxScore: 1,
      }),
    ).rejects.toThrow(/only a draft version/i);
  });

  it("lists Competencies scoped to a Program", async () => {
    const scenario = await buildFullScenario();
    const otherScenario = await buildFullScenario();

    const competencies = await listCompetenciesForProgram(scenario.program.id);
    expect(competencies.map((c) => c.id)).toContain(scenario.competency.id);
    expect(competencies.map((c) => c.id)).not.toContain(otherScenario.competency.id);
  });

  it("records LESSON_CREATED, ASSESSMENT_CREATED, VERSION_CREATED, and COMPETENCY_CREATED audit events", async () => {
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
    expect(actions).toContain("VERSION_CREATED");
    expect(actions).toContain("COMPETENCY_CREATED");
  });
});

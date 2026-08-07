import { describe, it, expect, beforeEach } from "vitest";
import { resetDatabase } from "./helpers/reset-db";
import { buildFullScenario, buildAcademicStructure, buildTestUser } from "./helpers/fixtures";
import {
  createLesson,
  createNewLessonVersion,
  updateLessonVersionDraft,
  getLatestLessonVersion,
  getPublishedLessonVersion,
  facultyCanAccessCourse,
} from "@/services/academic/institution";
import {
  submitContentForReview,
  approveContent,
  publishContent,
  ContentStateError,
} from "@/services/academic/content-workflow";
import {
  markLessonComplete,
  getCompletionForStudent,
  getCompletionHistoryForStudent,
  createEnrollment,
} from "@/services/enrollment/enrollment";
import { hasRoleForProgram } from "@/services/identity/authorization";
import { assignRole } from "@/services/identity/users";
import { login } from "@/services/identity/auth";
import { getSessionUser } from "@/services/identity/session";
import { listAuditLog } from "@/services/audit/audit";
import { db } from "@/lib/db";

/**
 * Content versioning test — Milestone 14 (Content Versioning Vertical
 * Slice)'s required 18-point scenario, per this milestone's own
 * instructions. This is the milestone's "critical demonstration":
 *
 *   Version 1 → Student completes Version 1 → Version 2 created →
 *   Version 2 published → new activity uses Version 2 → historical
 *   activity still points to Version 1.
 *
 * "A published educational record can evolve without rewriting
 * history."
 */
describe("Content versioning (Milestone 14)", () => {
  beforeEach(resetDatabase);

  it("walks a Lesson from Version 1 through Version 2, preserving Version 1's historical Student activity untouched (points 1–13, 18)", async () => {
    const scenario = await buildFullScenario();

    // 1. Faculty creates Version 1.
    const { lesson, version: v1 } = await createLesson(
      {
        courseId: scenario.course.id,
        title: "Pharmacology Basics",
        content: "Version 1 content.",
        competencyIds: [scenario.competency.id],
      },
      scenario.faculty.id,
    );
    expect(v1.versionNumber).toBe(1);
    expect(v1.status).toBe("DRAFT");

    // 2. Version 1 is submitted.
    await submitContentForReview("LESSON", v1.id, scenario.faculty.id);
    // 3. Version 1 is approved.
    await approveContent("LESSON", v1.id, scenario.programDirector.id);
    // 4. Version 1 is published.
    const publishedV1 = await publishContent("LESSON", v1.id, scenario.admin.id);
    expect(publishedV1.status).toBe("PUBLISHED");
    expect(publishedV1.publishedAt).not.toBeNull();

    const lessonAfterV1Publish = await db.lesson.findUnique({ where: { id: lesson.id } });
    expect(lessonAfterV1Publish?.publishedVersionId).toBe(v1.id);

    // 5. Student can access Version 1.
    const deliveredV1 = await getPublishedLessonVersion(lesson.id);
    expect(deliveredV1?.id).toBe(v1.id);
    expect(deliveredV1?.content).toBe("Version 1 content.");

    // 6. Student completes Version 1.
    const completionV1 = await markLessonComplete({
      studentId: scenario.student.id,
      lessonId: lesson.id,
    });
    expect(completionV1.lessonVersionId).toBe(v1.id);

    // 7. Faculty creates Version 2.
    const v2 = await createNewLessonVersion(lesson.id, scenario.faculty.id);
    expect(v2.versionNumber).toBe(2);
    expect(v2.status).toBe("DRAFT");
    // Seeded from Version 1's content as an editable starting point;
    // Faculty then edits it — a genuine content change, not a copy.
    await updateLessonVersionDraft({
      versionId: v2.id,
      title: "Pharmacology Basics",
      content: "Version 2 content — revised and expanded.",
      competencyIds: [scenario.competency.id],
    });

    // 8. Version 2 remains invisible to students while Draft — the
    // Student-facing delivery function still resolves to Version 1.
    const stillDeliveredV1 = await getPublishedLessonVersion(lesson.id);
    expect(stillDeliveredV1?.id).toBe(v1.id);
    expect(stillDeliveredV1?.content).toBe("Version 1 content.");

    // A direct, fail-closed attempt to complete "the Lesson" still
    // only ever resolves against whatever IS published — at this
    // point, still Version 1 — never Version 2's Draft content.
    const completionWhileV2Draft = await markLessonComplete({
      studentId: scenario.student.id,
      lessonId: lesson.id,
    });
    expect(completionWhileV2Draft.lessonVersionId).toBe(v1.id);

    // 9. Version 2 is submitted.
    await submitContentForReview("LESSON", v2.id, scenario.faculty.id);
    // 10. Program Director approves Version 2.
    await approveContent("LESSON", v2.id, scenario.programDirector.id);
    // 11. Version 2 is published.
    const publishedV2 = await publishContent("LESSON", v2.id, scenario.admin.id);
    expect(publishedV2.status).toBe("PUBLISHED");

    const lessonAfterV2Publish = await db.lesson.findUnique({ where: { id: lesson.id } });
    expect(lessonAfterV2Publish?.publishedVersionId).toBe(v2.id);

    // 12. New student activity uses Version 2.
    const deliveredV2 = await getPublishedLessonVersion(lesson.id);
    expect(deliveredV2?.id).toBe(v2.id);
    expect(deliveredV2?.content).toBe("Version 2 content — revised and expanded.");

    // A different Student, completing the Lesson for the first time
    // now, is recorded against Version 2.
    const secondStudent = await buildTestUser({ name: "Nadia New Student" });
    await createEnrollment(
      { studentId: secondStudent.id, programId: scenario.program.id, cohortId: scenario.cohort.id },
      scenario.admin.id,
    );
    const newActivity = await markLessonComplete({
      studentId: secondStudent.id,
      lessonId: lesson.id,
    });
    expect(newActivity.lessonVersionId).toBe(v2.id);

    // 13. Historical Student activity remains associated with Version
    // 1 — the original Student's Version 1 completion, recorded back
    // in step 6, is untouched: same version id, same timestamp, still
    // queryable.
    const originalStudentCurrentCompletion = await getCompletionForStudent(
      lesson.id,
      scenario.student.id,
    );
    // The original Student has NOT completed the new live version
    // (Version 2) — their "current" completion is absent...
    expect(originalStudentCurrentCompletion).toBeNull();
    // ...but their full history still shows the Version 1 completion,
    // exactly as it was.
    const originalStudentHistory = await getCompletionHistoryForStudent(
      lesson.id,
      scenario.student.id,
    );
    expect(originalStudentHistory).toHaveLength(1);
    expect(originalStudentHistory[0].lessonVersionId).toBe(v1.id);
    expect(originalStudentHistory[0].completedAt.getTime()).toBe(
      completionV1.completedAt.getTime(),
    );

    // Version 1's own row is byte-for-byte unchanged throughout.
    const v1AfterEverything = await db.lessonVersion.findUnique({ where: { id: v1.id } });
    expect(v1AfterEverything?.content).toBe("Version 1 content.");
    expect(v1AfterEverything?.status).toBe("PUBLISHED");

    // 18. Audit trail reconstructs the version lifecycle — every step
    // above left a trace, in order, attributable.
    const entries = await listAuditLog();
    const actions = entries.map((e) => e.action);
    expect(actions).toContain("VERSION_CREATED"); // fires for both v1 and v2
    expect(actions).toContain("VERSION_SUBMITTED");
    expect(actions).toContain("VERSION_APPROVED");
    expect(actions).toContain("VERSION_PUBLISHED");
    expect(actions).toContain("LESSON_COMPLETED");

    const versionCreatedEntries = entries.filter((e) => e.action === "VERSION_CREATED");
    expect(versionCreatedEntries.length).toBeGreaterThanOrEqual(2); // v1 and v2

    const publishEntries = entries.filter(
      (e) => e.action === "VERSION_PUBLISHED" && e.entityId && [v1.id, v2.id].includes(e.entityId),
    );
    expect(publishEntries).toHaveLength(2);
    expect(publishEntries.every((e) => e.actorName === scenario.admin.name)).toBe(true);
  });

  // 14. Published Version 1 cannot be modified.
  it("refuses to edit a Published Version 1", async () => {
    const scenario = await buildFullScenario();
    // scenario.lessonVersion (v1) was published by the fixture itself.
    await expect(
      updateLessonVersionDraft({
        versionId: scenario.lessonVersion.id,
        title: "Tampered",
        content: "Tampered.",
        competencyIds: [],
      }),
    ).rejects.toThrow(/only a draft version/i);
  });

  // 15. Published Version 2 cannot be modified.
  it("refuses to edit a Published Version 2, identically to Version 1", async () => {
    const scenario = await buildFullScenario();
    const v2 = await createNewLessonVersion(scenario.lesson.id, scenario.faculty.id);
    await submitContentForReview("LESSON", v2.id, scenario.faculty.id);
    await approveContent("LESSON", v2.id, scenario.programDirector.id);
    await publishContent("LESSON", v2.id, scenario.admin.id);

    await expect(
      updateLessonVersionDraft({
        versionId: v2.id,
        title: "Tampered",
        content: "Tampered.",
        competencyIds: [],
      }),
    ).rejects.toThrow(/only a draft version/i);

    // And, symmetrically, Version 1 remains just as unmodifiable after
    // Version 2 has published — publishing a new version never
    // reopens an old one for editing.
    await expect(
      updateLessonVersionDraft({
        versionId: scenario.lessonVersion.id,
        title: "Tampered",
        content: "Tampered.",
        competencyIds: [],
      }),
    ).rejects.toThrow(/only a draft version/i);
  });

  // 16. Faculty cannot bypass the workflow.
  it("blocks every attempt to bypass the Draft → Submitted → Approved → Published sequence", async () => {
    const scenario = await buildFullScenario();
    const { version } = await createLesson(
      {
        courseId: scenario.course.id,
        title: "Bypass Attempt",
        content: "Content.",
        competencyIds: [scenario.competency.id],
      },
      scenario.faculty.id,
    );

    // Cannot approve a Draft directly.
    await expect(
      approveContent("LESSON", version.id, scenario.programDirector.id),
    ).rejects.toThrow(ContentStateError);
    // Cannot publish a Draft directly.
    await expect(publishContent("LESSON", version.id, scenario.admin.id)).rejects.toThrow(
      ContentStateError,
    );

    await submitContentForReview("LESSON", version.id, scenario.faculty.id);
    // Cannot publish a Submitted (not yet Approved) version.
    await expect(publishContent("LESSON", version.id, scenario.admin.id)).rejects.toThrow(
      ContentStateError,
    );
    // Cannot submit an already-Submitted version a second time.
    await expect(
      submitContentForReview("LESSON", version.id, scenario.faculty.id),
    ).rejects.toThrow(ContentStateError);

    // Nothing above ever created a second Version or moved the
    // Lesson's publishedVersionId — the bypass attempts are pure
    // no-ops on the state machine.
    const lesson = await db.lesson.findUnique({ where: { id: version.lessonId } });
    expect(lesson?.publishedVersionId).toBeNull();
    const versionCount = await db.lessonVersion.count({ where: { lessonId: version.lessonId } });
    expect(versionCount).toBe(1);
  });

  // 17. Cross-program access remains denied.
  it("denies a Program Director from another Program any authority over this Program's Version review, and Faculty from another Course any authorship", async () => {
    const scenario = await buildFullScenario();
    const otherStructure = await buildAcademicStructure(scenario.admin.id);

    const otherPD = await buildTestUser({ email: "cross-program-pd@example.test" });
    await assignRole({
      userId: otherPD.id,
      role: "PROGRAM_DIRECTOR",
      programId: otherStructure.program.id,
      actorId: scenario.admin.id,
    });
    // The RBAC boundary this Program Director's authority is checked
    // against — same mechanism proven in
    // tests/content-approval-workflow.test.ts, restated here as this
    // milestone's own point 17.
    await login(otherPD.email, "password123");
    const sessionUser = (await getSessionUser())!;
    expect(hasRoleForProgram(sessionUser, "PROGRAM_DIRECTOR", scenario.program.id)).toBe(false);
    expect(
      hasRoleForProgram(sessionUser, "PROGRAM_DIRECTOR", otherStructure.program.id),
    ).toBe(true);

    // Faculty scoped to the other Course Offering cannot claim to
    // teach this scenario's Course either.
    const otherFaculty = await buildTestUser({ email: "cross-program-faculty@example.test" });
    await assignRole({
      userId: otherFaculty.id,
      role: "FACULTY",
      courseOfferingId: otherStructure.courseOffering.id,
      actorId: scenario.admin.id,
    });
    expect(await facultyCanAccessCourse(otherFaculty.id, scenario.course.id)).toBe(false);
  });

  it("lets Faculty draft the second version only after the first reaches Published — one in-flight version at a time", async () => {
    const scenario = await buildFullScenario();
    const { lesson, version: v1 } = await createLesson(
      {
        courseId: scenario.course.id,
        title: "Sequenced Lesson",
        content: "v1",
        competencyIds: [scenario.competency.id],
      },
      scenario.faculty.id,
    );

    // Cannot start Version 2 while Version 1 is still Draft.
    await expect(createNewLessonVersion(lesson.id, scenario.faculty.id)).rejects.toThrow(
      /already in progress/i,
    );

    await submitContentForReview("LESSON", v1.id, scenario.faculty.id);
    // Still cannot start Version 2 while Version 1 is Submitted.
    await expect(createNewLessonVersion(lesson.id, scenario.faculty.id)).rejects.toThrow(
      /already in progress/i,
    );

    await approveContent("LESSON", v1.id, scenario.programDirector.id);
    await publishContent("LESSON", v1.id, scenario.admin.id);

    // Now — and only now — Version 2 can begin.
    const latest = await getLatestLessonVersion(lesson.id);
    expect(latest?.id).toBe(v1.id);
    const v2 = await createNewLessonVersion(lesson.id, scenario.faculty.id);
    expect(v2.versionNumber).toBe(2);
  });
});

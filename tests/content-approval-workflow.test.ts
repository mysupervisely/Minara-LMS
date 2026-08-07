import { describe, it, expect, beforeEach } from "vitest";
import { resetDatabase } from "./helpers/reset-db";
import { buildFullScenario, buildAcademicStructure, buildTestUser } from "./helpers/fixtures";
import { createLesson } from "@/services/academic/institution";
import { createAssessment } from "@/services/assessments/assessments";
import {
  submitContentForReview,
  returnContentToDraft,
  approveContent,
  publishContent,
  listContentPendingReviewForProgram,
  listApprovedContent,
  ContentStateError,
} from "@/services/academic/content-workflow";
import { hasRoleForProgram } from "@/services/identity/authorization";
import { getSessionUser } from "@/services/identity/session";
import { login } from "@/services/identity/auth";
import { assignRole } from "@/services/identity/users";
import { listAuditLog } from "@/services/audit/audit";

/**
 * Content approval workflow test — Milestone 13's Implementation Plan
 * Phase 2 ("Approval Workflow"): the four-state Draft → Submitted →
 * Approved → Published machine, per
 * docs/milestones/milestone-12-curriculum-delivery-vertical-slice/02-content-lifecycle-workflow.md,
 * including the RBAC boundary and the required Return-with-reason step.
 */
describe("Content approval workflow", () => {
  beforeEach(resetDatabase);

  async function draftLessonWithCompetency(scenario: Awaited<ReturnType<typeof buildFullScenario>>) {
    return createLesson(
      {
        courseId: scenario.course.id,
        title: "Workflow Lesson",
        content: "Content.",
        competencyIds: [scenario.competency.id],
      },
      scenario.faculty.id,
    );
  }

  it("walks a Lesson through Draft → Submitted → Approved → Published", async () => {
    const scenario = await buildFullScenario();
    const lesson = await draftLessonWithCompetency(scenario);

    const submitted = await submitContentForReview("LESSON", lesson.id, scenario.faculty.id);
    expect(submitted.status).toBe("SUBMITTED");

    const approved = await approveContent("LESSON", lesson.id, scenario.programDirector.id);
    expect(approved.status).toBe("APPROVED");

    const published = await publishContent("LESSON", lesson.id, scenario.admin.id);
    expect(published.status).toBe("PUBLISHED");
  });

  it("refuses to submit a Lesson with no Competency tagged", async () => {
    const scenario = await buildFullScenario();
    const lesson = await createLesson(
      { courseId: scenario.course.id, title: "Untagged Lesson", content: "Content." },
      scenario.faculty.id,
    );

    await expect(
      submitContentForReview("LESSON", lesson.id, scenario.faculty.id),
    ).rejects.toThrow(ContentStateError);
  });

  it("submits an Assessment for review with no Competency requirement", async () => {
    const scenario = await buildFullScenario();
    const assessment = await createAssessment(
      { courseId: scenario.course.id, title: "Untagged Quiz", instructions: "Instructions." },
      scenario.faculty.id,
    );

    const submitted = await submitContentForReview("ASSESSMENT", assessment.id, scenario.faculty.id);
    expect(submitted.status).toBe("SUBMITTED");
  });

  it("returns Submitted content to Draft with a required reason, clearing on resubmission", async () => {
    const scenario = await buildFullScenario();
    const lesson = await draftLessonWithCompetency(scenario);
    await submitContentForReview("LESSON", lesson.id, scenario.faculty.id);

    const returned = await returnContentToDraft(
      "LESSON",
      lesson.id,
      "Please clarify the second paragraph.",
      scenario.programDirector.id,
    );
    expect(returned.status).toBe("DRAFT");
    expect(returned.returnReason).toBe("Please clarify the second paragraph.");

    // Resubmitting clears the reason.
    const resubmitted = await submitContentForReview("LESSON", lesson.id, scenario.faculty.id);
    expect(resubmitted.returnReason).toBeNull();
  });

  it("rejects an empty reason when returning content to Draft", async () => {
    const scenario = await buildFullScenario();
    const lesson = await draftLessonWithCompetency(scenario);
    await submitContentForReview("LESSON", lesson.id, scenario.faculty.id);

    await expect(
      returnContentToDraft("LESSON", lesson.id, "   ", scenario.programDirector.id),
    ).rejects.toThrow(ContentStateError);
  });

  it("cannot skip states — Draft cannot be approved or published directly", async () => {
    const scenario = await buildFullScenario();
    const lesson = await draftLessonWithCompetency(scenario);

    await expect(approveContent("LESSON", lesson.id, scenario.programDirector.id)).rejects.toThrow(
      ContentStateError,
    );
    await expect(publishContent("LESSON", lesson.id, scenario.admin.id)).rejects.toThrow(
      ContentStateError,
    );
  });

  it("cannot approve content that is not Submitted, and cannot publish content that is not Approved", async () => {
    const scenario = await buildFullScenario();
    const lesson = await draftLessonWithCompetency(scenario);
    await submitContentForReview("LESSON", lesson.id, scenario.faculty.id);
    await approveContent("LESSON", lesson.id, scenario.programDirector.id);

    // Already Approved — approving again should fail.
    await expect(approveContent("LESSON", lesson.id, scenario.programDirector.id)).rejects.toThrow(
      ContentStateError,
    );

    await publishContent("LESSON", lesson.id, scenario.admin.id);
    // Already Published — publishing again should fail.
    await expect(publishContent("LESSON", lesson.id, scenario.admin.id)).rejects.toThrow(
      ContentStateError,
    );
  });

  it("appears in the Program Director's pending-review queue once Submitted, and no longer once Approved", async () => {
    const scenario = await buildFullScenario();
    const lesson = await draftLessonWithCompetency(scenario);
    await submitContentForReview("LESSON", lesson.id, scenario.faculty.id);

    let pending = await listContentPendingReviewForProgram(scenario.program.id);
    expect(pending.lessons.map((l) => l.id)).toContain(lesson.id);

    await approveContent("LESSON", lesson.id, scenario.programDirector.id);
    pending = await listContentPendingReviewForProgram(scenario.program.id);
    expect(pending.lessons.map((l) => l.id)).not.toContain(lesson.id);

    const approved = await listApprovedContent(scenario.program.id);
    expect(approved.lessons.map((l) => l.id)).toContain(lesson.id);
  });

  it("a Program Director who does not oversee this Program has no authority to approve it", async () => {
    const scenario = await buildFullScenario();
    const lesson = await draftLessonWithCompetency(scenario);
    await submitContentForReview("LESSON", lesson.id, scenario.faculty.id);

    const otherStructure = await buildAcademicStructure(scenario.admin.id);
    const otherPD = await buildTestUser({ email: "other-pd-content@example.test" });
    await assignRole({
      userId: otherPD.id,
      role: "PROGRAM_DIRECTOR",
      programId: otherStructure.program.id,
      actorId: scenario.admin.id,
    });

    await login(otherPD.email, "password123");
    const user = (await getSessionUser())!;

    // The authorization boundary the Server Action checks before
    // calling approveContent — see
    // src/app/(portal)/program-director/actions.ts's
    // assertProgramDirectorOwnsContent.
    expect(hasRoleForProgram(user, "PROGRAM_DIRECTOR", scenario.program.id)).toBe(false);
  });

  it("records CONTENT_SUBMITTED_FOR_REVIEW, CONTENT_RETURNED_TO_DRAFT, CONTENT_APPROVED, and CONTENT_PUBLISHED audit events", async () => {
    const scenario = await buildFullScenario();
    const lesson = await draftLessonWithCompetency(scenario);

    await submitContentForReview("LESSON", lesson.id, scenario.faculty.id);
    await returnContentToDraft("LESSON", lesson.id, "Needs work.", scenario.programDirector.id);
    await submitContentForReview("LESSON", lesson.id, scenario.faculty.id);
    await approveContent("LESSON", lesson.id, scenario.programDirector.id);
    await publishContent("LESSON", lesson.id, scenario.admin.id);

    const entries = await listAuditLog();
    const actions = entries.map((e) => e.action);
    expect(actions).toContain("CONTENT_SUBMITTED_FOR_REVIEW");
    expect(actions).toContain("CONTENT_RETURNED_TO_DRAFT");
    expect(actions).toContain("CONTENT_APPROVED");
    expect(actions).toContain("CONTENT_PUBLISHED");

    const publishEntry = entries.find((e) => e.action === "CONTENT_PUBLISHED");
    expect(publishEntry?.actorName).toBe(scenario.admin.name);
  });
});

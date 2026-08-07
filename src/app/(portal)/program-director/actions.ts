"use server";

import { revalidatePath } from "next/cache";
import { requireSessionUserWithRole, hasRoleForProgram } from "@/services/identity/authorization";
import { getGradeForApproval, approveGrade, rejectGrade } from "@/services/gradebook/gradebook";
import {
  type ContentType,
  getLessonVersionForReview,
  getAssessmentVersionForReview,
  approveContent,
  returnContentToDraft,
  ContentStateError,
} from "@/services/academic/content-workflow";

async function assertProgramDirectorOwnsGrade(gradeId: string, userId: string) {
  const grade = await getGradeForApproval(gradeId);
  if (!grade) throw new Error("Grade not found.");

  const user = await requireSessionUserWithRole("PROGRAM_DIRECTOR");
  if (user.id !== userId) throw new Error("Session mismatch.");

  const isAdministrator = user.roleAssignments.some((ra) => ra.role === "ADMINISTRATOR");
  const programId = grade.submission.assessmentVersion.assessment.course.programId;
  if (!isAdministrator && !hasRoleForProgram(user, "PROGRAM_DIRECTOR", programId)) {
    throw new Error("You do not oversee the Program this grade belongs to.");
  }

  return grade;
}

/**
 * Bound directly to a plain `<form action={...}>`, so this matches
 * React's expected `(formData: FormData) => Promise<void>` shape once
 * `gradeId` is bound — see markLessonCompleteAction's comment in
 * src/app/(portal)/student/actions.ts for why this throws rather than
 * returning a `{ error }` state.
 */
export async function approveGradeAction(gradeId: string, _formData: FormData): Promise<void> {
  const user = await requireSessionUserWithRole("PROGRAM_DIRECTOR");
  await assertProgramDirectorOwnsGrade(gradeId, user.id);

  await approveGrade(gradeId, user.id);
  revalidatePath("/program-director");
  revalidatePath(`/program-director/approvals/${gradeId}`);
}

export async function rejectGradeAction(gradeId: string, _formData: FormData): Promise<void> {
  const user = await requireSessionUserWithRole("PROGRAM_DIRECTOR");
  await assertProgramDirectorOwnsGrade(gradeId, user.id);

  await rejectGrade(gradeId, user.id);
  revalidatePath("/program-director");
  revalidatePath(`/program-director/approvals/${gradeId}`);
}

// ── Content review — Milestone 13/14 (Curriculum Delivery Vertical
// Slice, Content Versioning Vertical Slice) ─────────────────────────────
//
// "Curriculum Committee Review" in Milestone 11's fuller design is held
// here, by the existing Program Director Role — see
// docs/milestones/milestone-11-curriculum-management-content-engine/05-publishing-workflow.md#no-new-role-curriculum-committee-review-uses-existing-authority.
// No new RBAC Role is introduced, per this milestone's constraint. Every
// action below is scoped to a specific Version id (Milestone 14) rather
// than a Lesson/Assessment id directly (Milestone 13) — the review
// target is unambiguously "this Version," never "whatever this Lesson's
// latest version happens to be" once more than one version can exist.

async function assertProgramDirectorOwnsContent(contentType: ContentType, versionId: string) {
  const content =
    contentType === "LESSON"
      ? await getLessonVersionForReview(versionId)
      : await getAssessmentVersionForReview(versionId);
  if (!content) throw new Error("Content not found.");

  const user = await requireSessionUserWithRole("PROGRAM_DIRECTOR");
  const isAdministrator = user.roleAssignments.some((ra) => ra.role === "ADMINISTRATOR");
  const programId =
    "lesson" in content ? content.lesson.course.programId : content.assessment.course.programId;
  if (!isAdministrator && !hasRoleForProgram(user, "PROGRAM_DIRECTOR", programId)) {
    throw new Error("You do not oversee the Program this content belongs to.");
  }

  return { content, user };
}

/**
 * Bound to a plain `<form action={...}>` — see approveGradeAction's
 * comment above for why this throws rather than returning a state.
 */
export async function approveContentAction(
  contentType: ContentType,
  versionId: string,
  _formData: FormData,
): Promise<void> {
  const { user } = await assertProgramDirectorOwnsContent(contentType, versionId);

  try {
    await approveContent(contentType, versionId, user.id);
  } catch (error) {
    if (error instanceof ContentStateError) throw new Error(error.message);
    throw error;
  }

  revalidatePath("/program-director/content");
  revalidatePath(`/program-director/content/${contentType.toLowerCase()}s/${versionId}`);
}

export interface ReturnContentState {
  error?: string;
  success?: boolean;
}

/**
 * A required "reason" text field means this can't be a zero-argument
 * plain-form action like approveContentAction — it needs
 * `useActionState` to surface the "reason is required" validation
 * error back to the Program Director.
 */
export async function returnContentToDraftAction(
  contentType: ContentType,
  versionId: string,
  _prevState: ReturnContentState,
  formData: FormData,
): Promise<ReturnContentState> {
  const { user } = await assertProgramDirectorOwnsContent(contentType, versionId);

  const reason = String(formData.get("reason") ?? "").trim();
  if (!reason) return { error: "A reason is required when returning content for revision." };

  try {
    await returnContentToDraft(contentType, versionId, reason, user.id);
  } catch (error) {
    if (error instanceof ContentStateError) return { error: error.message };
    throw error;
  }

  revalidatePath("/program-director/content");
  revalidatePath(`/program-director/content/${contentType.toLowerCase()}s/${versionId}`);
  return { success: true };
}

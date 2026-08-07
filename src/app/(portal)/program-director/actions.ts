"use server";

import { revalidatePath } from "next/cache";
import { requireSessionUserWithRole, hasRoleForProgram } from "@/services/identity/authorization";
import { getGradeForApproval, approveGrade, rejectGrade } from "@/services/gradebook/gradebook";

async function assertProgramDirectorOwnsGrade(gradeId: string, userId: string) {
  const grade = await getGradeForApproval(gradeId);
  if (!grade) throw new Error("Grade not found.");

  const user = await requireSessionUserWithRole("PROGRAM_DIRECTOR");
  if (user.id !== userId) throw new Error("Session mismatch.");

  const isAdministrator = user.roleAssignments.some((ra) => ra.role === "ADMINISTRATOR");
  const programId = grade.submission.assessment.course.programId;
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

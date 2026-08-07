"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireSessionUserWithRole } from "@/services/identity/authorization";
import { facultyCanAccessCourse } from "@/services/academic/institution";
import { getSubmissionById } from "@/services/assessments/assessments";
import { enterGrade, submitGradeForApproval, GradeStateError } from "@/services/gradebook/gradebook";

const EnterGradeSchema = z.object({
  score: z.coerce.number().int().min(0, "Score cannot be negative."),
  feedback: z.string().trim().optional(),
});

export interface GradeFormState {
  error?: string;
  success?: boolean;
}

async function assertFacultyOwnsSubmission(submissionId: string, facultyId: string) {
  const submission = await getSubmissionById(submissionId);
  if (!submission) throw new Error("Submission not found.");

  const canAccess = await facultyCanAccessCourse(facultyId, submission.assessment.course.id);
  if (!canAccess) throw new Error("You are not assigned to teach this course.");

  return submission;
}

export async function enterGradeAction(
  submissionId: string,
  _prevState: GradeFormState,
  formData: FormData,
): Promise<GradeFormState> {
  const user = await requireSessionUserWithRole("FACULTY");
  await assertFacultyOwnsSubmission(submissionId, user.id);

  const parsed = EnterGradeSchema.safeParse({
    score: formData.get("score"),
    feedback: formData.get("feedback"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid grade." };
  }

  try {
    await enterGrade({
      submissionId,
      score: parsed.data.score,
      feedback: parsed.data.feedback,
      enteredById: user.id,
    });
  } catch (error) {
    if (error instanceof GradeStateError) return { error: error.message };
    throw error;
  }

  revalidatePath(`/faculty/submissions/${submissionId}`);
  return { success: true };
}

/**
 * Bound directly to a plain `<form action={...}>`, so this matches
 * React's expected `(formData: FormData) => Promise<void>` shape once
 * `submissionId`/`gradeId` are bound — see markLessonCompleteAction's
 * comment in src/app/(portal)/student/actions.ts for why this throws
 * rather than returning a `{ error }` state.
 */
export async function submitGradeForApprovalAction(
  submissionId: string,
  gradeId: string,
  _formData: FormData,
): Promise<void> {
  const user = await requireSessionUserWithRole("FACULTY");
  await assertFacultyOwnsSubmission(submissionId, user.id);

  await submitGradeForApproval(gradeId, user.id);
  revalidatePath(`/faculty/submissions/${submissionId}`);
}

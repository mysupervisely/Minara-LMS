"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireSessionUserWithRole } from "@/services/identity/authorization";
import { studentCanAccessCourseOffering, markLessonComplete } from "@/services/enrollment/enrollment";
import { submitAssessment } from "@/services/assessments/assessments";
import { db } from "@/lib/db";

/**
 * Bound directly to a plain `<form action={...}>` (see the Lesson page),
 * so this matches React's expected `(formData: FormData) => Promise<void>`
 * shape once `courseOfferingId`/`lessonId` are bound — it throws on
 * failure rather than returning a `{ error }` state, since this simple
 * one-click action isn't wired through `useActionState` for a display
 * surface. Thrown errors surface via the nearest error boundary.
 */
export async function markLessonCompleteAction(
  courseOfferingId: string,
  lessonId: string,
  _formData: FormData,
): Promise<void> {
  const user = await requireSessionUserWithRole("STUDENT");

  const allowed = await studentCanAccessCourseOffering(user.id, courseOfferingId);
  if (!allowed) throw new Error("You are not enrolled in this course.");

  const lesson = await db.lesson.findUnique({ where: { id: lessonId } });
  if (!lesson) throw new Error("Lesson not found.");

  await markLessonComplete({ studentId: user.id, lessonId });
  revalidatePath(`/student/courses/${courseOfferingId}`);
  revalidatePath(`/student/courses/${courseOfferingId}/lessons/${lessonId}`);
  revalidatePath("/student");
}

const SubmitAssessmentSchema = z.object({
  content: z.string().trim().min(1, "Enter a response before submitting."),
});

export interface SubmitAssessmentState {
  error?: string;
  success?: boolean;
}

export async function submitAssessmentAction(
  courseOfferingId: string,
  assessmentId: string,
  _prevState: SubmitAssessmentState,
  formData: FormData,
): Promise<SubmitAssessmentState> {
  const user = await requireSessionUserWithRole("STUDENT");

  const allowed = await studentCanAccessCourseOffering(user.id, courseOfferingId);
  if (!allowed) return { error: "You are not enrolled in this course." };

  const parsed = SubmitAssessmentSchema.safeParse({ content: formData.get("content") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid submission." };
  }

  await submitAssessment({
    assessmentId,
    studentId: user.id,
    courseOfferingId,
    content: parsed.data.content,
  });

  revalidatePath(`/student/courses/${courseOfferingId}`);
  revalidatePath(`/student/courses/${courseOfferingId}/assessments/${assessmentId}`);
  return { success: true };
}

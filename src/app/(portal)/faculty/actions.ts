"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireSessionUserWithRole } from "@/services/identity/authorization";
import {
  facultyCanAccessCourse,
  facultyCanAccessCourseOffering,
  createLesson,
  createNewLessonVersion,
  updateLessonVersionDraft,
  getLatestLessonVersion,
} from "@/services/academic/institution";
import {
  getSubmissionById,
  createAssessment,
  createNewAssessmentVersion,
  updateAssessmentVersionDraft,
  getLatestAssessmentVersion,
} from "@/services/assessments/assessments";
import { enterGrade, submitGradeForApproval, GradeStateError } from "@/services/gradebook/gradebook";
import { submitContentForReview, ContentStateError } from "@/services/academic/content-workflow";
import type { SimpleActionState } from "@/components/action-form";

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

  const canAccess = await facultyCanAccessCourse(
    facultyId,
    submission.assessmentVersion.assessment.course.id,
  );
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

// ── Content authoring — Milestone 13/14 (Curriculum Delivery Vertical
// Slice, Content Versioning Vertical Slice) ─────────────────────────────
//
// Faculty capabilities per
// docs/milestones/milestone-12-curriculum-delivery-vertical-slice/01-product-requirements-document.md,
// now version-aware: draft a Lesson/Assessment (its first Version),
// create a new Version once the current one is Published, edit while
// Draft, submit for review. Every action below is scoped to Course
// Offerings the Faculty member is assigned to teach — the same
// `facultyCanAccessCourseOffering` check every other Faculty screen in
// this codebase uses.
//
// Every action here is addressed by `lessonId`/`assessmentId` (the
// stable identity, matching the URL structure), never by a client-
// supplied version id — the server resolves "the version currently
// being edited or reviewed" itself via getLatestLessonVersion/
// getLatestAssessmentVersion, which is unambiguous because
// createNewLessonVersion/createNewAssessmentVersion refuse to start a
// second version while one is already in flight.

async function assertFacultyOwnsCourseOffering(courseOfferingId: string, facultyId: string) {
  const allowed = await facultyCanAccessCourseOffering(facultyId, courseOfferingId);
  if (!allowed) throw new Error("You are not assigned to teach this course.");
}

const LessonDraftSchema = z.object({
  title: z.string().trim().min(1, "Title is required."),
  content: z.string().trim().min(1, "Content is required."),
  competencyIds: z.array(z.string()).default([]),
});

export async function createLessonDraftAction(
  courseOfferingId: string,
  courseId: string,
  _prevState: SimpleActionState,
  formData: FormData,
): Promise<SimpleActionState> {
  const user = await requireSessionUserWithRole("FACULTY");
  const allowed = await facultyCanAccessCourseOffering(user.id, courseOfferingId);
  if (!allowed) return { error: "You are not assigned to teach this course." };

  const parsed = LessonDraftSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
    competencyIds: formData.getAll("competencyIds"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  await createLesson(
    {
      courseId,
      title: parsed.data.title,
      content: parsed.data.content,
      competencyIds: parsed.data.competencyIds,
    },
    user.id,
  );

  revalidatePath(`/faculty/courses/${courseOfferingId}`);
  return { success: "Lesson drafted." };
}

export async function updateLessonDraftAction(
  lessonId: string,
  courseOfferingId: string,
  _prevState: SimpleActionState,
  formData: FormData,
): Promise<SimpleActionState> {
  const user = await requireSessionUserWithRole("FACULTY");
  await assertFacultyOwnsCourseOffering(courseOfferingId, user.id);

  const parsed = LessonDraftSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
    competencyIds: formData.getAll("competencyIds"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const latest = await getLatestLessonVersion(lessonId);
  if (!latest) return { error: "Lesson not found." };

  try {
    await updateLessonVersionDraft({
      versionId: latest.id,
      title: parsed.data.title,
      content: parsed.data.content,
      competencyIds: parsed.data.competencyIds,
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not save the Lesson." };
  }

  revalidatePath(`/faculty/courses/${courseOfferingId}/lessons/${lessonId}`);
  revalidatePath(`/faculty/courses/${courseOfferingId}`);
  return { success: "Lesson saved." };
}

/**
 * Bound to a plain `<form action={...}>` — see submitGradeForApprovalAction's
 * comment above for why this throws rather than returning a state.
 */
export async function submitLessonForReviewAction(
  lessonId: string,
  courseOfferingId: string,
  _formData: FormData,
): Promise<void> {
  const user = await requireSessionUserWithRole("FACULTY");
  await assertFacultyOwnsCourseOffering(courseOfferingId, user.id);

  const latest = await getLatestLessonVersion(lessonId);
  if (!latest) throw new Error("Lesson not found.");

  try {
    await submitContentForReview("LESSON", latest.id, user.id);
  } catch (error) {
    if (error instanceof ContentStateError) throw new Error(error.message);
    throw error;
  }

  revalidatePath(`/faculty/courses/${courseOfferingId}/lessons/${lessonId}`);
  revalidatePath(`/faculty/courses/${courseOfferingId}`);
}

/**
 * "Faculty creates an edit" → "New Version 2 is created" — this
 * milestone's Core Workflow, step one. Bound to a plain
 * `<form action={...}>`; createNewLessonVersion itself refuses to run
 * if a version is already in flight, surfacing that as a thrown error.
 */
export async function createNewLessonVersionAction(
  lessonId: string,
  courseOfferingId: string,
  _formData: FormData,
): Promise<void> {
  const user = await requireSessionUserWithRole("FACULTY");
  await assertFacultyOwnsCourseOffering(courseOfferingId, user.id);

  await createNewLessonVersion(lessonId, user.id);
  revalidatePath(`/faculty/courses/${courseOfferingId}/lessons/${lessonId}`);
  revalidatePath(`/faculty/courses/${courseOfferingId}`);
}

const AssessmentDraftSchema = z.object({
  title: z.string().trim().min(1, "Title is required."),
  instructions: z.string().trim().min(1, "Instructions are required."),
  maxScore: z.coerce.number().int().min(1).max(1000).optional(),
});

export async function createAssessmentDraftAction(
  courseOfferingId: string,
  courseId: string,
  _prevState: SimpleActionState,
  formData: FormData,
): Promise<SimpleActionState> {
  const user = await requireSessionUserWithRole("FACULTY");
  const allowed = await facultyCanAccessCourseOffering(user.id, courseOfferingId);
  if (!allowed) return { error: "You are not assigned to teach this course." };

  const parsed = AssessmentDraftSchema.safeParse({
    title: formData.get("title"),
    instructions: formData.get("instructions"),
    maxScore: formData.get("maxScore") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  await createAssessment(
    { courseId, title: parsed.data.title, instructions: parsed.data.instructions, maxScore: parsed.data.maxScore },
    user.id,
  );

  revalidatePath(`/faculty/courses/${courseOfferingId}`);
  return { success: "Assessment drafted." };
}

export async function updateAssessmentDraftAction(
  assessmentId: string,
  courseOfferingId: string,
  _prevState: SimpleActionState,
  formData: FormData,
): Promise<SimpleActionState> {
  const user = await requireSessionUserWithRole("FACULTY");
  await assertFacultyOwnsCourseOffering(courseOfferingId, user.id);

  const parsed = AssessmentDraftSchema.safeParse({
    title: formData.get("title"),
    instructions: formData.get("instructions"),
    maxScore: formData.get("maxScore") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const latest = await getLatestAssessmentVersion(assessmentId);
  if (!latest) return { error: "Assessment not found." };

  try {
    await updateAssessmentVersionDraft({
      versionId: latest.id,
      title: parsed.data.title,
      instructions: parsed.data.instructions,
      maxScore: parsed.data.maxScore ?? 100,
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not save the Assessment." };
  }

  revalidatePath(`/faculty/courses/${courseOfferingId}/assessments/${assessmentId}`);
  revalidatePath(`/faculty/courses/${courseOfferingId}`);
  return { success: "Assessment saved." };
}

export async function submitAssessmentForReviewAction(
  assessmentId: string,
  courseOfferingId: string,
  _formData: FormData,
): Promise<void> {
  const user = await requireSessionUserWithRole("FACULTY");
  await assertFacultyOwnsCourseOffering(courseOfferingId, user.id);

  const latest = await getLatestAssessmentVersion(assessmentId);
  if (!latest) throw new Error("Assessment not found.");

  try {
    await submitContentForReview("ASSESSMENT", latest.id, user.id);
  } catch (error) {
    if (error instanceof ContentStateError) throw new Error(error.message);
    throw error;
  }

  revalidatePath(`/faculty/courses/${courseOfferingId}/assessments/${assessmentId}`);
  revalidatePath(`/faculty/courses/${courseOfferingId}`);
}

/** The Assessment counterpart to createNewLessonVersionAction above. */
export async function createNewAssessmentVersionAction(
  assessmentId: string,
  courseOfferingId: string,
  _formData: FormData,
): Promise<void> {
  const user = await requireSessionUserWithRole("FACULTY");
  await assertFacultyOwnsCourseOffering(courseOfferingId, user.id);

  await createNewAssessmentVersion(assessmentId, user.id);
  revalidatePath(`/faculty/courses/${courseOfferingId}/assessments/${assessmentId}`);
  revalidatePath(`/faculty/courses/${courseOfferingId}`);
}

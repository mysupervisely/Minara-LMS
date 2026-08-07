import "server-only";
import { db } from "@/lib/db";
import { recordAuditEvent } from "@/services/audit/audit";

/**
 * Student bounded context — Enrollment and Course Progress (Lesson
 * Completion), narrowed for this vertical slice.
 *
 * Enrollment creation here is manual/Administrator-driven, per
 * docs/milestones/milestone-7-mvp-definition-implementation-planning/02-mvp-scope-definition.md's
 * MVP scope decision and this milestone's "Out of Scope: Admissions
 * automation" — there is no Applicant/admissions-decision pipeline in
 * this module, only the Enrollment record itself, exactly as the
 * Student Lifecycle Workflow's "Enrollment" step describes it once an
 * admissions decision (here, an Administrator's manual action) has
 * already been made.
 */

export async function createEnrollment(
  input: { studentId: string; programId: string; cohortId: string },
  actorId: string,
) {
  const enrollment = await db.enrollment.create({
    data: {
      studentId: input.studentId,
      programId: input.programId,
      cohortId: input.cohortId,
      status: "ACTIVE",
    },
  });

  // Business rule: a User with an active Enrollment holds the Student
  // Role (scoped to Self — no programId/courseOfferingId, per
  // src/domain/roles.ts's ROLE_SCOPE). Granting it here, rather than
  // requiring a separate manual step, is what makes "create an
  // Enrollment" the single action that actually gets someone into the
  // Student Portal — consistent with this milestone's MVP framing of
  // Enrollment as the terminal step of manual onboarding.
  const existingStudentRole = await db.roleAssignment.findFirst({
    where: { userId: input.studentId, role: "STUDENT" },
  });
  if (!existingStudentRole) {
    const roleAssignment = await db.roleAssignment.create({
      data: { userId: input.studentId, role: "STUDENT" },
    });
    await recordAuditEvent({
      actorId,
      action: "ROLE_ASSIGNED",
      entityType: "RoleAssignment",
      entityId: roleAssignment.id,
      metadata: { userId: input.studentId, role: "STUDENT", reason: "auto-granted-on-enrollment" },
    });
  }

  await recordAuditEvent({
    actorId,
    action: "ENROLLMENT_CREATED",
    entityType: "Enrollment",
    entityId: enrollment.id,
    metadata: { studentId: input.studentId, programId: input.programId },
  });

  return enrollment;
}

export async function listEnrollmentsForStudent(studentId: string) {
  return db.enrollment.findMany({
    where: { studentId },
    include: {
      program: true,
      cohort: true,
    },
  });
}

/** Every Course Offering a Student can access, derived from their Active Enrollments' Cohorts. */
export async function listCourseOfferingsForStudent(studentId: string) {
  const enrollments = await db.enrollment.findMany({
    where: { studentId, status: "ACTIVE" },
    select: { cohortId: true },
  });
  const cohortIds = enrollments.map((e) => e.cohortId);
  if (cohortIds.length === 0) return [];

  return db.courseOffering.findMany({
    where: { cohortId: { in: cohortIds } },
    include: { course: true, cohort: { include: { program: true } } },
  });
}

export async function markLessonComplete(
  input: { studentId: string; lessonId: string },
) {
  // Fail-closed, per this milestone's Product Requirements Document
  // (S-1) and Milestone 14's identical requirement: a Student can only
  // ever complete the Lesson's *currently published* version —
  // resolved here, server-side, from `publishedVersionId`, never
  // accepted as a client-supplied version id. This is the last line of
  // defense, in addition to the page/action layer that reaches it.
  const lesson = await db.lesson.findUnique({
    where: { id: input.lessonId },
    select: { publishedVersionId: true },
  });
  if (!lesson || !lesson.publishedVersionId) {
    throw new Error("This Lesson is not available.");
  }
  const lessonVersionId = lesson.publishedVersionId;

  // Keyed on [studentId, lessonVersionId]: completing the same
  // published version twice is idempotent (Milestone 10's original
  // behavior, preserved exactly), while completing a Lesson after a
  // newer version has published records a distinct completion against
  // that new version, leaving the Student's completion of the prior
  // version (and its timestamp) completely untouched — the same
  // "new activity uses the new version; historical activity stays put"
  // mechanism as submitAssessment in src/services/assessments/assessments.ts.
  const completion = await db.lessonCompletion.upsert({
    where: { studentId_lessonVersionId: { studentId: input.studentId, lessonVersionId } },
    update: {},
    create: { studentId: input.studentId, lessonVersionId },
  });

  await recordAuditEvent({
    actorId: input.studentId,
    action: "LESSON_COMPLETED",
    entityType: "Lesson",
    entityId: input.lessonId,
    metadata: { lessonVersionId },
  });

  return completion;
}

/** A Student's completion of a Lesson's *currently published* version — what the live Course/Lesson page shows. Does not surface a completion of a since-superseded version; see getCompletionHistoryForStudent for that. */
export async function getCompletionForStudent(lessonId: string, studentId: string) {
  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    select: { publishedVersionId: true },
  });
  if (!lesson?.publishedVersionId) return null;

  return db.lessonCompletion.findUnique({
    where: {
      studentId_lessonVersionId: { studentId, lessonVersionId: lesson.publishedVersionId },
    },
  });
}

/** Every completion a Student has ever recorded for any version of a Lesson, newest first — the historical record Milestone 14's core principle exists to preserve. */
export async function getCompletionHistoryForStudent(lessonId: string, studentId: string) {
  return db.lessonCompletion.findMany({
    where: { studentId, lessonVersion: { lessonId } },
    include: { lessonVersion: true },
    orderBy: { completedAt: "desc" },
  });
}

/**
 * Every completion a Student holds toward Lessons in a Course, scoped
 * to each Lesson's *current* published version only — "N of M lessons
 * complete" on the Student Dashboard reflects the live requirement,
 * not a stale one. A completion of a since-superseded version does not
 * count here (it remains fully queryable via
 * getCompletionHistoryForStudent, it simply isn't "current" anymore).
 */
export async function getLessonCompletionsForStudent(studentId: string, courseId: string) {
  const lessons = await db.lesson.findMany({
    where: { courseId, publishedVersionId: { not: null } },
    select: { publishedVersionId: true },
  });
  const publishedVersionIds = lessons
    .map((l) => l.publishedVersionId)
    .filter((id): id is string => id !== null);
  if (publishedVersionIds.length === 0) return [];

  return db.lessonCompletion.findMany({
    where: { studentId, lessonVersionId: { in: publishedVersionIds } },
  });
}

/**
 * Authorization support: does this Student have an Active Enrollment
 * that grants them access to this Course Offering? Called by every
 * /student/courses/[courseOfferingId]/* page before showing any data,
 * per Security Architecture's "fail closed" principle — a Student
 * should never see a Course Offering belonging to a Cohort they aren't
 * enrolled in, even if they know or guess its id.
 */
export async function studentCanAccessCourseOffering(
  studentId: string,
  courseOfferingId: string,
): Promise<boolean> {
  const offering = await db.courseOffering.findUnique({
    where: { id: courseOfferingId },
    select: { cohortId: true },
  });
  if (!offering) return false;

  const enrollment = await db.enrollment.findFirst({
    where: { studentId, cohortId: offering.cohortId, status: "ACTIVE" },
    select: { id: true },
  });
  return Boolean(enrollment);
}

/** The Enrollment linking a Student to the Program a given Course Offering belongs to — needed to attach a Submission to the right Enrollment. */
export async function findEnrollmentForCourseOffering(
  studentId: string,
  courseOfferingId: string,
) {
  const offering = await db.courseOffering.findUnique({
    where: { id: courseOfferingId },
    select: { course: { select: { programId: true } } },
  });
  if (!offering) return null;

  return db.enrollment.findUnique({
    where: { studentId_programId: { studentId, programId: offering.course.programId } },
  });
}

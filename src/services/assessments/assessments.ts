import "server-only";
import { db } from "@/lib/db";
import { recordAuditEvent } from "@/services/audit/audit";
import { findEnrollmentForCourseOffering } from "@/services/enrollment/enrollment";

/**
 * Assessments module — Assignment/Assessment delivery and submission.
 * Narrowed for this vertical slice to a single "Assessment" concept
 * (text submission, numeric score) rather than the full
 * Assignment/Assessment/Quiz/Question Bank family from the Academic
 * Domain Model — sufficient to prove the Submission → Grade → Approval
 * chain the vertical slice exists to validate (ADR-011), without
 * building the full curriculum/assessment authoring tooling that
 * remains explicitly out of scope for Milestone 10.
 */

export async function createAssessment(
  input: { courseId: string; title: string; instructions: string; maxScore?: number },
  actorId: string,
) {
  const assessment = await db.assessment.create({
    data: {
      courseId: input.courseId,
      title: input.title,
      instructions: input.instructions,
      maxScore: input.maxScore ?? 100,
    },
  });
  await recordAuditEvent({
    actorId,
    action: "ASSESSMENT_CREATED",
    entityType: "Assessment",
    entityId: assessment.id,
    metadata: { title: input.title },
  });
  return assessment;
}

export async function submitAssessment(input: {
  assessmentId: string;
  studentId: string;
  courseOfferingId: string;
  content: string;
}) {
  const enrollment = await findEnrollmentForCourseOffering(
    input.studentId,
    input.courseOfferingId,
  );
  if (!enrollment) {
    throw new Error(
      "No active Enrollment links this Student to the Program this Assessment belongs to.",
    );
  }

  const submission = await db.submission.upsert({
    where: {
      assessmentId_studentId: { assessmentId: input.assessmentId, studentId: input.studentId },
    },
    update: { content: input.content, submittedAt: new Date() },
    create: {
      assessmentId: input.assessmentId,
      studentId: input.studentId,
      enrollmentId: enrollment.id,
      content: input.content,
    },
  });

  await recordAuditEvent({
    actorId: input.studentId,
    action: "ASSESSMENT_SUBMITTED",
    entityType: "Submission",
    entityId: submission.id,
    metadata: { assessmentId: input.assessmentId },
  });

  return submission;
}

export async function getSubmissionForStudent(assessmentId: string, studentId: string) {
  return db.submission.findUnique({
    where: { assessmentId_studentId: { assessmentId, studentId } },
    include: { grade: true },
  });
}

/** Every Submission for a given Course Offering's Assessments, for Faculty review. */
export async function listSubmissionsForCourseOffering(courseOfferingId: string) {
  const offering = await db.courseOffering.findUnique({
    where: { id: courseOfferingId },
    select: { courseId: true },
  });
  if (!offering) return [];

  return db.submission.findMany({
    where: { assessment: { courseId: offering.courseId } },
    include: { student: true, assessment: true, grade: true },
    orderBy: { submittedAt: "asc" },
  });
}

export async function getSubmissionById(submissionId: string) {
  return db.submission.findUnique({
    where: { id: submissionId },
    include: { student: true, assessment: { include: { course: true } }, grade: true },
  });
}

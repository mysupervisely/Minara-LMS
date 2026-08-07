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
 *
 * Milestone 14: Assessment definitions are now versioned identically to
 * Lesson (see src/services/academic/institution.ts's matching
 * comments) — Assessment is the stable identity, AssessmentVersion
 * holds the actual instructions/maxScore content, and a Submission
 * belongs to a specific AssessmentVersion rather than the Assessment
 * directly, so a Student's historical attempt always says exactly
 * which version they answered, even after a newer version publishes.
 */

/**
 * Creates an Assessment (the stable identity) and its first
 * AssessmentVersion (versionNumber 1, Draft) together, atomically —
 * the Assessment counterpart to institution.ts's createLesson.
 */
export async function createAssessment(
  input: { courseId: string; title: string; instructions: string; maxScore?: number },
  actorId: string,
) {
  const assessment = await db.assessment.create({ data: { courseId: input.courseId } });
  const version = await db.assessmentVersion.create({
    data: {
      assessmentId: assessment.id,
      versionNumber: 1,
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
  await recordAuditEvent({
    actorId,
    action: "VERSION_CREATED",
    entityType: "AssessmentVersion",
    entityId: version.id,
    metadata: { assessmentId: assessment.id, versionNumber: version.versionNumber },
  });

  return { assessment, version };
}

/**
 * Creates AssessmentVersion N+1 for an Assessment that already has at
 * least one version, seeded from the latest version's instructions/
 * maxScore — the Assessment counterpart to institution.ts's
 * createNewLessonVersion, including the identical "only one version in
 * flight at a time" rule.
 */
export async function createNewAssessmentVersion(assessmentId: string, actorId: string) {
  const versions = await db.assessmentVersion.findMany({
    where: { assessmentId },
    orderBy: { versionNumber: "desc" },
  });
  if (versions.length === 0) {
    throw new Error("This Assessment has no existing version to base a new version on.");
  }
  const inFlight = versions.find((v) => v.status !== "PUBLISHED");
  if (inFlight) {
    throw new Error(
      "A version of this Assessment is already in progress — finish or have it returned before creating another.",
    );
  }

  const latest = versions[0];
  const version = await db.assessmentVersion.create({
    data: {
      assessmentId,
      versionNumber: latest.versionNumber + 1,
      title: latest.title,
      instructions: latest.instructions,
      maxScore: latest.maxScore,
    },
  });

  await recordAuditEvent({
    actorId,
    action: "VERSION_CREATED",
    entityType: "AssessmentVersion",
    entityId: version.id,
    metadata: { assessmentId, versionNumber: version.versionNumber },
  });

  return version;
}

/**
 * Edits an AssessmentVersion's instructions/max score while it is
 * still Draft — the Assessment counterpart to institution.ts's
 * updateLessonVersionDraft. Assessment has no Competency link of its
 * own (see src/services/academic/competency.ts's module comment), so
 * there is nothing else to edit here.
 */
export async function updateAssessmentVersionDraft(input: {
  versionId: string;
  title: string;
  instructions: string;
  maxScore: number;
}) {
  const version = await db.assessmentVersion.findUnique({ where: { id: input.versionId } });
  if (!version) throw new Error("Assessment version not found.");
  if (version.status !== "DRAFT") {
    throw new Error(
      "Only a Draft version can be edited. Submitted, Approved, and Published versions are read-only.",
    );
  }

  return db.assessmentVersion.update({
    where: { id: input.versionId },
    data: { title: input.title, instructions: input.instructions, maxScore: input.maxScore },
  });
}

/** The Assessment row itself (identity + the publishedVersionId pointer) — no content, since Milestone 14 moved all content onto AssessmentVersion. */
export async function getAssessmentById(assessmentId: string) {
  return db.assessment.findUnique({ where: { id: assessmentId } });
}

/** The Assessment's currently Published version, or null if none has been published yet — the Assessment counterpart to institution.ts's getPublishedLessonVersion, and the fail-closed resolution point for Student delivery. */
export async function getPublishedAssessmentVersion(assessmentId: string) {
  const assessment = await db.assessment.findUnique({
    where: { id: assessmentId },
    select: { publishedVersionId: true },
  });
  if (!assessment?.publishedVersionId) return null;
  return db.assessmentVersion.findUnique({ where: { id: assessment.publishedVersionId } });
}

/** The most recently created AssessmentVersion for an Assessment — see institution.ts's getLatestLessonVersion for why this is unambiguous during an edit cycle. */
export async function getLatestAssessmentVersion(assessmentId: string) {
  return db.assessmentVersion.findFirst({
    where: { assessmentId },
    orderBy: { versionNumber: "desc" },
  });
}

/** Every version of an Assessment, newest first — the Faculty "View version status" / version history capability. */
export async function listAssessmentVersions(assessmentId: string) {
  return db.assessmentVersion.findMany({
    where: { assessmentId },
    orderBy: { versionNumber: "desc" },
  });
}

export async function submitAssessment(input: {
  assessmentId: string;
  studentId: string;
  courseOfferingId: string;
  content: string;
}) {
  // Fail-closed, per this milestone's Product Requirements Document
  // (S-1) and Milestone 14's identical requirement: a Student can only
  // ever submit against the Assessment's *currently published* version
  // — resolved here, server-side, from `publishedVersionId`, never
  // accepted as a client-supplied version id. A Draft/Submitted/
  // Approved-but-unpublished newer version stays completely
  // unreachable through this function no matter what a Student
  // requests.
  const assessment = await db.assessment.findUnique({
    where: { id: input.assessmentId },
    select: { publishedVersionId: true },
  });
  if (!assessment || !assessment.publishedVersionId) {
    throw new Error("This Assessment is not available.");
  }
  const assessmentVersionId = assessment.publishedVersionId;

  const enrollment = await findEnrollmentForCourseOffering(
    input.studentId,
    input.courseOfferingId,
  );
  if (!enrollment) {
    throw new Error(
      "No active Enrollment links this Student to the Program this Assessment belongs to.",
    );
  }

  // Keyed on [assessmentVersionId, studentId]: resubmitting against the
  // same published version updates the existing Submission (Milestone
  // 10's original upsert behavior, preserved exactly), while a Student
  // submitting for the first time against a newer version — after
  // Version 2 publishes — creates a brand new Submission row, leaving
  // their Version 1 Submission (and any Grade against it) completely
  // untouched. This is the mechanism behind "new activity uses Version
  // 2; historical activity remains associated with Version 1."
  const submission = await db.submission.upsert({
    where: {
      assessmentVersionId_studentId: { assessmentVersionId, studentId: input.studentId },
    },
    update: { content: input.content, submittedAt: new Date() },
    create: {
      assessmentVersionId,
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
    metadata: { assessmentId: input.assessmentId, assessmentVersionId },
  });

  return submission;
}

/** A Student's Submission against an Assessment's *currently published* version — what the live Course page shows (Not Submitted / Submitted / Grade). Does not surface Submissions against a since-superseded version; see getSubmissionHistoryForStudent for that. */
export async function getSubmissionForStudent(assessmentId: string, studentId: string) {
  const assessment = await db.assessment.findUnique({
    where: { id: assessmentId },
    select: { publishedVersionId: true },
  });
  if (!assessment?.publishedVersionId) return null;

  return db.submission.findUnique({
    where: {
      assessmentVersionId_studentId: {
        assessmentVersionId: assessment.publishedVersionId,
        studentId,
      },
    },
    include: { grade: true },
  });
}

/**
 * Every Submission a Student has ever made against any version of an
 * Assessment, newest first — the historical record Milestone 14's
 * core principle exists to preserve. Used to show a Student "you
 * completed an earlier version of this" note even once a newer
 * version has been published and superseded the one they attempted.
 */
export async function getSubmissionHistoryForStudent(assessmentId: string, studentId: string) {
  return db.submission.findMany({
    where: { studentId, assessmentVersion: { assessmentId } },
    include: { assessmentVersion: true, grade: true },
    orderBy: { submittedAt: "desc" },
  });
}

/** Every Submission for a given Course Offering's Assessments, across every version, for Faculty review — an ungraded Submission against a since-superseded version still needs grading. */
export async function listSubmissionsForCourseOffering(courseOfferingId: string) {
  const offering = await db.courseOffering.findUnique({
    where: { id: courseOfferingId },
    select: { courseId: true },
  });
  if (!offering) return [];

  return db.submission.findMany({
    where: { assessmentVersion: { assessment: { courseId: offering.courseId } } },
    include: { student: true, assessmentVersion: true, grade: true },
    orderBy: { submittedAt: "asc" },
  });
}

export async function getSubmissionById(submissionId: string) {
  return db.submission.findUnique({
    where: { id: submissionId },
    include: {
      student: true,
      assessmentVersion: { include: { assessment: { include: { course: true } } } },
      grade: true,
    },
  });
}

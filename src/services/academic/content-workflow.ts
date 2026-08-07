import "server-only";
import { db } from "@/lib/db";
import { recordAuditEvent } from "@/services/audit/audit";

/**
 * Content lifecycle workflow — Milestone 13 (Curriculum Delivery
 * Vertical Slice), implementing
 * docs/milestones/milestone-12-curriculum-delivery-vertical-slice/02-content-lifecycle-workflow.md's
 * four-state machine: DRAFT → SUBMITTED → APPROVED → PUBLISHED.
 *
 * A deliberate narrowing of Milestone 11's six-state Publishing
 * Workflow (Faculty Review and Curriculum Committee Review collapsed
 * into a single Program-Director-held review step; no Archive) — see
 * that document's README for the full rationale. Both Lesson and
 * Assessment definitions share this one state machine, mirroring the
 * approval-gate pattern already proven by
 * src/services/gradebook/gradebook.ts's Grade lifecycle (DRAFT →
 * SUBMITTED → APPROVED) rather than inventing a new shape.
 *
 * Creation and Draft-editing stay with their existing per-entity
 * modules (src/services/academic/institution.ts's createLesson/
 * updateLessonDraft, src/services/assessments/assessments.ts's
 * createAssessment/updateAssessmentDraft) — this module owns only the
 * state transitions and review-queue reads that are identical across
 * both content types, so the two entity types don't each need their
 * own copy of the same four functions.
 */

export type ContentType = "LESSON" | "ASSESSMENT";

const ENTITY_TYPE: Record<ContentType, string> = {
  LESSON: "Lesson",
  ASSESSMENT: "Assessment",
};

export class ContentStateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContentStateError";
  }
}

async function findContentWithScope(contentType: ContentType, contentId: string) {
  if (contentType === "LESSON") {
    return db.lesson.findUnique({
      where: { id: contentId },
      include: { competencies: true, course: { select: { id: true, programId: true } } },
    });
  }
  return db.assessment.findUnique({
    where: { id: contentId },
    include: { course: { select: { id: true, programId: true } } },
  });
}

async function updateContentStatus(
  contentType: ContentType,
  contentId: string,
  data: { status: string; returnReason?: string | null },
) {
  if (contentType === "LESSON") {
    return db.lesson.update({ where: { id: contentId }, data });
  }
  return db.assessment.update({ where: { id: contentId }, data });
}

/**
 * Draft → Submitted for Review. Per the Product Requirements Document
 * (F-5), a Lesson must carry at least one Competency tag before it can
 * be submitted — Assessments have no such requirement, since their
 * Competency contribution is derived via their Course's Lessons (see
 * src/services/academic/competency.ts).
 */
export async function submitContentForReview(
  contentType: ContentType,
  contentId: string,
  actorId: string,
) {
  const content = await findContentWithScope(contentType, contentId);
  if (!content) throw new ContentStateError("Content not found.");
  if (content.status !== "DRAFT") {
    throw new ContentStateError("Only Draft content can be submitted for review.");
  }
  if (contentType === "LESSON" && "competencies" in content && content.competencies.length === 0) {
    throw new ContentStateError(
      "Tag at least one Competency before submitting this Lesson for review.",
    );
  }

  const updated = await updateContentStatus(contentType, contentId, {
    status: "SUBMITTED",
    returnReason: null,
  });

  await recordAuditEvent({
    actorId,
    action: "CONTENT_SUBMITTED_FOR_REVIEW",
    entityType: ENTITY_TYPE[contentType],
    entityId: contentId,
  });

  return updated;
}

/**
 * Submitted → Draft, with a required reason. Stored on the row itself
 * (not only in the Audit Log) since the Audit Log is Administrator-only
 * (ADR-005) and Faculty need to see why their own content was
 * returned — see the schema comment on Lesson/Assessment.
 */
export async function returnContentToDraft(
  contentType: ContentType,
  contentId: string,
  reason: string,
  actorId: string,
) {
  const content = await findContentWithScope(contentType, contentId);
  if (!content) throw new ContentStateError("Content not found.");
  if (content.status !== "SUBMITTED") {
    throw new ContentStateError("Only content Submitted for Review can be returned.");
  }
  const trimmedReason = reason.trim();
  if (!trimmedReason) {
    throw new ContentStateError("A reason is required when returning content for revision.");
  }

  const updated = await updateContentStatus(contentType, contentId, {
    status: "DRAFT",
    returnReason: trimmedReason,
  });

  await recordAuditEvent({
    actorId,
    action: "CONTENT_RETURNED_TO_DRAFT",
    entityType: ENTITY_TYPE[contentType],
    entityId: contentId,
    metadata: { reason: trimmedReason },
  });

  return updated;
}

/** Submitted → Approved. Program Director (or Administrator) authority, checked by the caller — see src/app/(portal)/program-director/actions.ts. */
export async function approveContent(contentType: ContentType, contentId: string, actorId: string) {
  const content = await findContentWithScope(contentType, contentId);
  if (!content) throw new ContentStateError("Content not found.");
  if (content.status !== "SUBMITTED") {
    throw new ContentStateError("Only content Submitted for Review can be approved.");
  }

  const updated = await updateContentStatus(contentType, contentId, { status: "APPROVED" });

  await recordAuditEvent({
    actorId,
    action: "CONTENT_APPROVED",
    entityType: ENTITY_TYPE[contentType],
    entityId: contentId,
  });

  return updated;
}

/** Approved → Published. Administrator-only authority, institution-wide, per Milestone 11's authority split — checked by the caller. */
export async function publishContent(contentType: ContentType, contentId: string, actorId: string) {
  const content = await findContentWithScope(contentType, contentId);
  if (!content) throw new ContentStateError("Content not found.");
  if (content.status !== "APPROVED") {
    throw new ContentStateError("Only Approved content can be published.");
  }

  const updated = await updateContentStatus(contentType, contentId, { status: "PUBLISHED" });

  await recordAuditEvent({
    actorId,
    action: "CONTENT_PUBLISHED",
    entityType: ENTITY_TYPE[contentType],
    entityId: contentId,
  });

  return updated;
}

// ── Read helpers ────────────────────────────────────────────────────────

/** A single Lesson with enough detail for the Faculty/Program Director review screens, including its Program (for authorization). */
export async function getLessonForReview(lessonId: string) {
  return db.lesson.findUnique({
    where: { id: lessonId },
    include: { course: { include: { program: true } }, competencies: true },
  });
}

/** A single Assessment with enough detail for the Faculty/Program Director review screens, including its Program (for authorization). */
export async function getAssessmentForReview(assessmentId: string) {
  return db.assessment.findUnique({
    where: { id: assessmentId },
    include: { course: { include: { program: true } } },
  });
}

/** Every Lesson/Assessment Submitted for Review within a Program — the Program Director's content review queue. */
export async function listContentPendingReviewForProgram(programId: string) {
  const [lessons, assessments] = await Promise.all([
    db.lesson.findMany({
      where: { status: "SUBMITTED", course: { programId } },
      include: { course: true, competencies: true },
      orderBy: { createdAt: "asc" },
    }),
    db.assessment.findMany({
      where: { status: "SUBMITTED", course: { programId } },
      include: { course: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);
  return { lessons, assessments };
}

/**
 * Every Lesson/Assessment that is Approved but not yet Published —
 * Program Director's Curriculum Oversight view (scoped to their own
 * Program) when `programId` is given, and the Administrator's
 * institution-wide Publishing Queue when it's omitted.
 */
export async function listApprovedContent(programId?: string) {
  const [lessons, assessments] = await Promise.all([
    db.lesson.findMany({
      where: { status: "APPROVED", ...(programId ? { course: { programId } } : {}) },
      include: { course: { include: { program: true } }, competencies: true },
      orderBy: { createdAt: "asc" },
    }),
    db.assessment.findMany({
      where: { status: "APPROVED", ...(programId ? { course: { programId } } : {}) },
      include: { course: { include: { program: true } } },
      orderBy: { createdAt: "asc" },
    }),
  ]);
  return { lessons, assessments };
}

/** Every Lesson/Assessment for a Course, at every status — the Faculty content-authoring view (Track Curriculum Status). */
export async function listContentForCourse(courseId: string) {
  const [lessons, assessments] = await Promise.all([
    db.lesson.findMany({
      where: { courseId },
      include: { competencies: true },
      orderBy: { order: "asc" },
    }),
    db.assessment.findMany({ where: { courseId }, orderBy: { createdAt: "asc" } }),
  ]);
  return { lessons, assessments };
}

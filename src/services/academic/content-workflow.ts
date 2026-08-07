import "server-only";
import { db } from "@/lib/db";
import { recordAuditEvent } from "@/services/audit/audit";

/**
 * Content lifecycle workflow — Milestone 13 introduced the four-state
 * machine (DRAFT → SUBMITTED → APPROVED → PUBLISHED); Milestone 14
 * (Content Versioning Vertical Slice) re-targets every function in
 * this module from the Lesson/Assessment row itself to a specific
 * LessonVersion/AssessmentVersion row, per
 * docs/milestones/milestone-11-curriculum-management-content-engine/04-versioning-strategy.md's
 * entity/version split. This is the SAME state machine, reused exactly
 * as it was — this milestone's own instruction is explicit: "Do not
 * create a second workflow engine."
 *
 * The one behavior genuinely new to this module is in publishContent:
 * publishing a version is now two writes, not one — the version row
 * itself moves to PUBLISHED (and gets its `publishedAt` stamp), and
 * the *parent* Lesson/Assessment's `publishedVersionId` pointer is
 * updated to name it as the live version. That parent-row write is the
 * only thing that ever changes after a version reaches PUBLISHED — the
 * version row itself is never written to again by any function here,
 * which is what makes "Published Version 1 cannot be modified" true by
 * construction, not just by convention.
 *
 * Creation and Draft-editing stay with their existing per-entity
 * modules (src/services/academic/institution.ts's createLesson/
 * createNewLessonVersion/updateLessonVersionDraft,
 * src/services/assessments/assessments.ts's createAssessment/
 * createNewAssessmentVersion/updateAssessmentVersionDraft) — this
 * module owns only the state transitions and review-queue reads that
 * are identical across both content types.
 */

export type ContentType = "LESSON" | "ASSESSMENT";

const ENTITY_TYPE: Record<ContentType, string> = {
  LESSON: "LessonVersion",
  ASSESSMENT: "AssessmentVersion",
};

export class ContentStateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContentStateError";
  }
}

/**
 * Fetches a version row with the join path needed for authorization
 * scope (…→ Course → Program) and the Lesson-only Competency
 * requirement, dispatching per content type since LessonVersion and
 * AssessmentVersion have different parent relations. Returned as a
 * discriminated shape so the transition functions below never need a
 * type assertion.
 */
async function findVersionWithScope(contentType: ContentType, versionId: string) {
  if (contentType === "LESSON") {
    const version = await db.lessonVersion.findUnique({
      where: { id: versionId },
      include: { competencies: true, lesson: { include: { course: true } } },
    });
    if (!version) return null;
    return {
      kind: "LESSON" as const,
      version,
      programId: version.lesson.course.programId,
      parentId: version.lessonId,
    };
  }

  const version = await db.assessmentVersion.findUnique({
    where: { id: versionId },
    include: { assessment: { include: { course: true } } },
  });
  if (!version) return null;
  return {
    kind: "ASSESSMENT" as const,
    version,
    programId: version.assessment.course.programId,
    parentId: version.assessmentId,
  };
}

async function updateVersionStatus(
  contentType: ContentType,
  versionId: string,
  data: { status: string; returnReason?: string | null; publishedAt?: Date },
) {
  if (contentType === "LESSON") {
    return db.lessonVersion.update({ where: { id: versionId }, data });
  }
  return db.assessmentVersion.update({ where: { id: versionId }, data });
}

/**
 * Draft → Submitted for Review. Per the Product Requirements Document
 * (F-5), a Lesson Version must carry at least one Competency tag
 * before it can be submitted — Assessment Versions have no such
 * requirement, since their Competency contribution is derived via
 * their Course's Lessons (see src/services/academic/competency.ts).
 */
export async function submitContentForReview(
  contentType: ContentType,
  versionId: string,
  actorId: string,
) {
  const found = await findVersionWithScope(contentType, versionId);
  if (!found) throw new ContentStateError("Content not found.");
  if (found.version.status !== "DRAFT") {
    throw new ContentStateError("Only a Draft version can be submitted for review.");
  }
  if (found.kind === "LESSON" && found.version.competencies.length === 0) {
    throw new ContentStateError(
      "Tag at least one Competency before submitting this Lesson Version for review.",
    );
  }

  const updated = await updateVersionStatus(contentType, versionId, {
    status: "SUBMITTED",
    returnReason: null,
  });

  await recordAuditEvent({
    actorId,
    action: "VERSION_SUBMITTED",
    entityType: ENTITY_TYPE[contentType],
    entityId: versionId,
    metadata: { versionNumber: found.version.versionNumber },
  });

  return updated;
}

/**
 * Submitted → Draft, with a required reason. Stored on the version row
 * itself (not only in the Audit Log) since the Audit Log is
 * Administrator-only (ADR-005) and Faculty need to see why their own
 * version was returned — see the schema comment on LessonVersion/
 * AssessmentVersion. A returned version stays the version being
 * edited — it is not archived or replaced, per this milestone's
 * explicit "Return for Revision" requirement.
 */
export async function returnContentToDraft(
  contentType: ContentType,
  versionId: string,
  reason: string,
  actorId: string,
) {
  const found = await findVersionWithScope(contentType, versionId);
  if (!found) throw new ContentStateError("Content not found.");
  if (found.version.status !== "SUBMITTED") {
    throw new ContentStateError("Only a version Submitted for Review can be returned.");
  }
  const trimmedReason = reason.trim();
  if (!trimmedReason) {
    throw new ContentStateError("A reason is required when returning a version for revision.");
  }

  const updated = await updateVersionStatus(contentType, versionId, {
    status: "DRAFT",
    returnReason: trimmedReason,
  });

  await recordAuditEvent({
    actorId,
    action: "VERSION_RETURNED",
    entityType: ENTITY_TYPE[contentType],
    entityId: versionId,
    metadata: { reason: trimmedReason, versionNumber: found.version.versionNumber },
  });

  return updated;
}

/** Submitted → Approved. Program Director (or Administrator) authority, checked by the caller — see src/app/(portal)/program-director/actions.ts. */
export async function approveContent(contentType: ContentType, versionId: string, actorId: string) {
  const found = await findVersionWithScope(contentType, versionId);
  if (!found) throw new ContentStateError("Content not found.");
  if (found.version.status !== "SUBMITTED") {
    throw new ContentStateError("Only a version Submitted for Review can be approved.");
  }

  const updated = await updateVersionStatus(contentType, versionId, { status: "APPROVED" });

  await recordAuditEvent({
    actorId,
    action: "VERSION_APPROVED",
    entityType: ENTITY_TYPE[contentType],
    entityId: versionId,
    metadata: { versionNumber: found.version.versionNumber },
  });

  return updated;
}

/**
 * Approved → Published. Administrator-only authority, institution-
 * wide, per Milestone 11's authority split — checked by the caller.
 *
 * Two writes, deliberately in this order: (1) the version itself moves
 * to PUBLISHED and receives its `publishedAt` timestamp — the last
 * write this row will ever receive, by construction (every function in
 * this module guards on `status !== "APPROVED"`/`!== "SUBMITTED"`/
 * `!== "DRAFT"` before writing, so nothing can reach a PUBLISHED row
 * again); (2) the parent Lesson/Assessment's `publishedVersionId`
 * pointer is updated to this version's id — the single switch that
 * makes it the version Students receive for new activity. A prior
 * Published version's own row is never touched by this or any other
 * step — it simply stops being the one the pointer names, which is
 * exactly how "Published Version 1 remains immutable" and "Version 2
 * becomes the active version" are both true at once.
 */
export async function publishContent(contentType: ContentType, versionId: string, actorId: string) {
  const found = await findVersionWithScope(contentType, versionId);
  if (!found) throw new ContentStateError("Content not found.");
  if (found.version.status !== "APPROVED") {
    throw new ContentStateError("Only an Approved version can be published.");
  }

  const publishedAt = new Date();
  const updated = await updateVersionStatus(contentType, versionId, {
    status: "PUBLISHED",
    publishedAt,
  });

  if (contentType === "LESSON") {
    await db.lesson.update({ where: { id: found.parentId }, data: { publishedVersionId: versionId } });
  } else {
    await db.assessment.update({
      where: { id: found.parentId },
      data: { publishedVersionId: versionId },
    });
  }

  await recordAuditEvent({
    actorId,
    action: "VERSION_PUBLISHED",
    entityType: ENTITY_TYPE[contentType],
    entityId: versionId,
    metadata: {
      versionNumber: found.version.versionNumber,
      [contentType === "LESSON" ? "lessonId" : "assessmentId"]: found.parentId,
    },
  });

  return updated;
}

// ── Read helpers ────────────────────────────────────────────────────────

/** A single Lesson Version with enough detail for the Faculty/Program Director review screens, including its Program (for authorization). */
export async function getLessonVersionForReview(versionId: string) {
  return db.lessonVersion.findUnique({
    where: { id: versionId },
    include: { competencies: true, lesson: { include: { course: { include: { program: true } } } } },
  });
}

/** A single Assessment Version with enough detail for the Faculty/Program Director review screens, including its Program (for authorization). */
export async function getAssessmentVersionForReview(versionId: string) {
  return db.assessmentVersion.findUnique({
    where: { id: versionId },
    include: { assessment: { include: { course: { include: { program: true } } } } },
  });
}

/** Every Lesson/Assessment Version Submitted for Review within a Program — the Program Director's content review queue. */
export async function listContentPendingReviewForProgram(programId: string) {
  const [lessonVersions, assessmentVersions] = await Promise.all([
    db.lessonVersion.findMany({
      where: { status: "SUBMITTED", lesson: { course: { programId } } },
      include: { lesson: { include: { course: true } }, competencies: true },
      orderBy: { createdAt: "asc" },
    }),
    db.assessmentVersion.findMany({
      where: { status: "SUBMITTED", assessment: { course: { programId } } },
      include: { assessment: { include: { course: true } } },
      orderBy: { createdAt: "asc" },
    }),
  ]);
  return { lessonVersions, assessmentVersions };
}

/**
 * Every Lesson/Assessment Version that is Approved but not yet
 * Published — Program Director's Curriculum Oversight view (scoped to
 * their own Program) when `programId` is given, and the
 * Administrator's institution-wide Publishing Queue when it's omitted.
 */
export async function listApprovedContent(programId?: string) {
  const [lessonVersions, assessmentVersions] = await Promise.all([
    db.lessonVersion.findMany({
      where: {
        status: "APPROVED",
        ...(programId ? { lesson: { course: { programId } } } : {}),
      },
      include: { lesson: { include: { course: { include: { program: true } } } }, competencies: true },
      orderBy: { createdAt: "asc" },
    }),
    db.assessmentVersion.findMany({
      where: {
        status: "APPROVED",
        ...(programId ? { assessment: { course: { programId } } } : {}),
      },
      include: { assessment: { include: { course: { include: { program: true } } } } },
      orderBy: { createdAt: "asc" },
    }),
  ]);
  return { lessonVersions, assessmentVersions };
}

/**
 * Every Lesson/Assessment for a Course, each with its latest Version
 * (per src/services/academic/institution.ts's getLatestLessonVersion,
 * "the version currently being authored or reviewed" is always
 * unambiguous, since only one non-Published version can exist per
 * Lesson/Assessment at a time) — the Faculty content-authoring view
 * (Track Curriculum Status).
 */
export async function listContentForCourse(courseId: string) {
  const [lessons, assessments] = await Promise.all([
    db.lesson.findMany({
      where: { courseId },
      include: {
        versions: { orderBy: { versionNumber: "desc" }, take: 1, include: { competencies: true } },
      },
      orderBy: { order: "asc" },
    }),
    db.assessment.findMany({
      where: { courseId },
      include: { versions: { orderBy: { versionNumber: "desc" }, take: 1 } },
      orderBy: { createdAt: "asc" },
    }),
  ]);
  return { lessons, assessments };
}

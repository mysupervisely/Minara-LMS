import "server-only";
import { db } from "@/lib/db";
import { recordAuditEvent } from "@/services/audit/audit";

/**
 * Competency — Milestone 13's minimal stand-in for Milestone 11's full
 * four-level Competency Mapping chain (Course Outcome → Program
 * Competency → Program Learning Outcome → Institution Mission), per
 * docs/milestones/milestone-12-curriculum-delivery-vertical-slice/03-domain-impact-review.md#new-concept-required-competency-minimal.
 * A Competency is a simple, Program-scoped named record; a Lesson links
 * to one or more directly. Do not extend this into the full chain
 * without a new milestone — that expansion is explicitly Future, per
 * this slice's Domain Impact Review.
 */

export async function createCompetency(
  input: { programId: string; name: string },
  actorId: string,
) {
  const competency = await db.competency.create({
    data: { programId: input.programId, name: input.name },
  });
  await recordAuditEvent({
    actorId,
    action: "COMPETENCY_CREATED",
    entityType: "Competency",
    entityId: competency.id,
    metadata: { name: input.name },
  });
  return competency;
}

export async function listCompetenciesForProgram(programId: string) {
  return db.competency.findMany({ where: { programId }, orderBy: { createdAt: "asc" } });
}

export interface CompetencyProgressView {
  id: string;
  name: string;
  programId: string;
  lessonTitles: string[];
}

/**
 * A Student's Competency Progress — a derived read, not a stored
 * entity or its own write path. Per the Domain Impact Review: a
 * Competency counts as "in progress" for a Student once they hold at
 * least one APPROVED Grade for an Assessment in a Course that has at
 * least one Lesson tagged with that Competency. This is intentionally
 * loose (course-level, not lesson-level, granularity) — a deliberate
 * simplification named explicitly in that document, not an oversight.
 *
 * No new audit event is emitted here: the provenance is already fully
 * captured by the underlying GRADE_APPROVED event (see
 * docs/milestones/milestone-12-curriculum-delivery-vertical-slice/02-content-lifecycle-workflow.md#why-competency-progress-has-no-new-audit-event).
 */
export async function getCompetencyProgressForStudent(
  studentId: string,
): Promise<CompetencyProgressView[]> {
  const approvedGrades = await db.grade.findMany({
    where: { status: "APPROVED", submission: { studentId } },
    select: { submission: { select: { assessment: { select: { courseId: true } } } } },
  });

  const courseIds = Array.from(
    new Set(approvedGrades.map((g) => g.submission.assessment.courseId)),
  );
  if (courseIds.length === 0) return [];

  const competencies = await db.competency.findMany({
    where: { lessons: { some: { courseId: { in: courseIds } } } },
    include: {
      lessons: { where: { courseId: { in: courseIds } }, select: { title: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return competencies.map((c) => ({
    id: c.id,
    name: c.name,
    programId: c.programId,
    lessonTitles: c.lessons.map((l) => l.title),
  }));
}

import "server-only";
import { db } from "@/lib/db";
import { recordAuditEvent } from "@/services/audit/audit";

/**
 * Gradebook module — the approval-gate pattern ADR-011's vertical slice
 * exists to prove: DRAFT (Faculty enters) → SUBMITTED (Faculty submits
 * for approval) → APPROVED (Program Director approves — official), per
 * docs/milestones/milestone-3-student-journey-core-workflows/02-faculty-workflows.md's
 * §Approval Points and the
 * Business Rules Catalog's Faculty & Staffing Rules
 * (docs/milestones/milestone-5-domain-model-data-architecture/08-business-rules-catalog.md):
 * "Final Grades require approval by the Program Director... before they
 * are considered final."
 *
 * Every state transition here writes an Audit Log entry — this module
 * is one of the two (with Identity) most directly exercised by the
 * Milestone 10 vertical slice's validation goal.
 */

export class GradeStateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GradeStateError";
  }
}

export async function enterGrade(input: {
  submissionId: string;
  score: number;
  feedback?: string;
  enteredById: string;
}) {
  const existing = await db.grade.findUnique({ where: { submissionId: input.submissionId } });
  if (existing && existing.status !== "DRAFT") {
    throw new GradeStateError(
      "This Grade has already been submitted for approval and can no longer be edited directly.",
    );
  }

  const grade = await db.grade.upsert({
    where: { submissionId: input.submissionId },
    update: { score: input.score, feedback: input.feedback, enteredById: input.enteredById },
    create: {
      submissionId: input.submissionId,
      score: input.score,
      feedback: input.feedback,
      enteredById: input.enteredById,
      status: "DRAFT",
    },
  });

  await recordAuditEvent({
    actorId: input.enteredById,
    action: "GRADE_ENTERED",
    entityType: "Grade",
    entityId: grade.id,
    metadata: { submissionId: input.submissionId, score: input.score },
  });

  return grade;
}

export async function submitGradeForApproval(gradeId: string, actorId: string) {
  const grade = await db.grade.findUnique({ where: { id: gradeId } });
  if (!grade) throw new GradeStateError("Grade not found.");
  if (grade.status !== "DRAFT") {
    throw new GradeStateError("Only a Draft grade can be submitted for approval.");
  }

  const updated = await db.grade.update({
    where: { id: gradeId },
    data: { status: "SUBMITTED", submittedAt: new Date() },
  });

  await recordAuditEvent({
    actorId,
    action: "GRADE_SUBMITTED_FOR_APPROVAL",
    entityType: "Grade",
    entityId: gradeId,
  });

  return updated;
}

export async function approveGrade(gradeId: string, approverId: string) {
  const grade = await db.grade.findUnique({ where: { id: gradeId } });
  if (!grade) throw new GradeStateError("Grade not found.");
  if (grade.status !== "SUBMITTED") {
    throw new GradeStateError("Only a Submitted grade can be approved.");
  }

  const updated = await db.grade.update({
    where: { id: gradeId },
    data: { status: "APPROVED", approvedById: approverId, approvedAt: new Date() },
  });

  await recordAuditEvent({
    actorId: approverId,
    action: "GRADE_APPROVED",
    entityType: "Grade",
    entityId: gradeId,
    metadata: { score: grade.score },
  });

  return updated;
}

export async function rejectGrade(gradeId: string, approverId: string) {
  const grade = await db.grade.findUnique({ where: { id: gradeId } });
  if (!grade) throw new GradeStateError("Grade not found.");
  if (grade.status !== "SUBMITTED") {
    throw new GradeStateError("Only a Submitted grade can be rejected.");
  }

  // Rejected grades return to DRAFT so Faculty can revise and resubmit —
  // never silently overwritten, per the Business Rules Catalog's Audit
  // & Accountability Rules; the rejection itself is the audited event.
  const updated = await db.grade.update({
    where: { id: gradeId },
    data: { status: "DRAFT", submittedAt: null },
  });

  await recordAuditEvent({
    actorId: approverId,
    action: "GRADE_REJECTED",
    entityType: "Grade",
    entityId: gradeId,
  });

  return updated;
}

/** Every SUBMITTED grade for Course Offerings within a Program — the Program Director's approval queue. */
export async function listPendingApprovalsForProgram(programId: string) {
  return db.grade.findMany({
    where: {
      status: "SUBMITTED",
      submission: { assessment: { course: { programId } } },
    },
    include: {
      submission: {
        include: { student: true, assessment: { include: { course: true } } },
      },
      enteredBy: true,
    },
    orderBy: { submittedAt: "asc" },
  });
}

export async function getGradeForStudent(submissionId: string) {
  return db.grade.findUnique({ where: { submissionId } });
}

export async function listApprovedGradesForStudent(studentId: string) {
  return db.grade.findMany({
    where: { status: "APPROVED", submission: { studentId } },
    include: { submission: { include: { assessment: { include: { course: true } } } } },
  });
}

/** A single Grade with enough detail for the Program Director approval screen, including the Program it belongs to (for authorization). */
export async function getGradeForApproval(gradeId: string) {
  return db.grade.findUnique({
    where: { id: gradeId },
    include: {
      submission: {
        include: {
          student: true,
          assessment: { include: { course: { include: { program: true } } } },
        },
      },
      enteredBy: true,
    },
  });
}

import "server-only";
import { db } from "@/lib/db";

/**
 * Audit service — the platform-wide implementation of ADR-005 (RBAC and
 * Audit-First Security Model) and
 * docs/milestones/milestone-2-user-roles-permission-architecture/05-audit-accountability-framework.md.
 *
 * Every module that performs a Create, Edit, or Approve action of
 * consequence calls `recordAuditEvent` — this is the platform's single
 * write path into the AuditLog table. No other module should write to
 * `db.auditLog` directly; centralizing the write path here is what makes
 * it possible to guarantee every entry is attributed and timestamped
 * consistently.
 *
 * Immutability: nothing in this module — or anywhere else in the
 * codebase — updates or deletes an AuditLog row. This is an
 * application-layer convention rather than a database-enforced one,
 * since SQLite has no row-level permission system; the Database
 * Architecture Strategy (Milestone 8, Doc 4) recommends enforcing this
 * at the database level in a production Postgres deployment. That
 * remains a documented limitation of this vertical slice — see the
 * Milestone 10 deliverables summary.
 */

export type AuditAction =
  | "USER_LOGIN"
  | "USER_LOGIN_FAILED"
  | "USER_LOGOUT"
  | "USER_CREATED"
  | "ROLE_ASSIGNED"
  | "ROLE_REVOKED"
  | "INSTITUTION_CREATED"
  | "SCHOOL_CREATED"
  | "PROGRAM_CREATED"
  | "COHORT_CREATED"
  | "COURSE_CREATED"
  | "COURSE_OFFERING_CREATED"
  | "LESSON_CREATED"
  | "ASSESSMENT_CREATED"
  | "ENROLLMENT_CREATED"
  | "LESSON_COMPLETED"
  | "ASSESSMENT_SUBMITTED"
  | "GRADE_ENTERED"
  | "GRADE_SUBMITTED_FOR_APPROVAL"
  | "GRADE_APPROVED"
  | "GRADE_REJECTED"
  // Milestone 13 — Curriculum Delivery Vertical Slice: the content
  // lifecycle (Draft → Submitted → Approved → Published), per
  // docs/milestones/milestone-12-curriculum-delivery-vertical-slice/02-content-lifecycle-workflow.md.
  // "Content created" is already covered by LESSON_CREATED /
  // ASSESSMENT_CREATED above — these four cover the rest of that
  // milestone's required audit list ("submitted, approved, published"),
  // plus the required Return-with-reason step.
  | "CONTENT_SUBMITTED_FOR_REVIEW"
  | "CONTENT_RETURNED_TO_DRAFT"
  | "CONTENT_APPROVED"
  | "CONTENT_PUBLISHED"
  | "COMPETENCY_CREATED";

export interface RecordAuditEventInput {
  /** The acting User's id, or null for a system-initiated event (e.g. a failed login for an unknown email). */
  actorId: string | null;
  action: AuditAction;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}

export async function recordAuditEvent(input: RecordAuditEventInput) {
  return db.auditLog.create({
    data: {
      actorId: input.actorId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      metadata: input.metadata ? JSON.stringify(input.metadata) : null,
    },
  });
}

export interface AuditLogEntryView {
  id: string;
  actorName: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
}

/**
 * Reads the audit trail. Per the Permission Framework
 * (docs/milestones/milestone-2-user-roles-permission-architecture/02-permission-framework.md),
 * this is Administrator-only under current conceptual scope — callers
 * (server actions / pages) are responsible for enforcing that via
 * `requireRole` before calling this function; this function does not
 * re-check authorization itself, consistent with the centralized
 * enforcement pattern in `src/services/identity/authorization.ts`.
 */
export async function listAuditLog(limit = 100): Promise<AuditLogEntryView[]> {
  const rows = await db.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { actor: { select: { name: true } } },
  });

  return rows.map((row) => ({
    id: row.id,
    actorName: row.actor?.name ?? null,
    action: row.action,
    entityType: row.entityType,
    entityId: row.entityId,
    metadata: row.metadata ? (JSON.parse(row.metadata) as Record<string, unknown>) : null,
    createdAt: row.createdAt,
  }));
}

import "server-only";
import { db } from "@/lib/db";
import { hashPassword } from "@/services/identity/password";
import { recordAuditEvent } from "@/services/audit/audit";
import type { Role } from "@/domain/roles";

/**
 * User account creation and Role Assignment management.
 *
 * Per Milestone 10, Phase 3 ("User account creation") and Phase 4
 * ("Implement role-based access control"). Consistent with the MVP's
 * "manual, Administrator-provisioned Enrollment" scope
 * (docs/milestones/milestone-7-mvp-definition-implementation-planning/02-mvp-scope-definition.md)
 * and this milestone's explicit "Out of Scope: Admissions automation,"
 * there is no public self-service registration page — account creation
 * happens through the Administrator foundation (see
 * src/app/(portal)/admin), consistent with
 * docs/milestones/milestone-4-information-architecture/08-administrator-portal.md's
 * User Accounts and Role Assignments screens.
 *
 * `actorId` accepts `null` in both functions below specifically to
 * support bootstrapping the very first Administrator account in a
 * fresh deployment (see prisma/seed.ts) — there is, by definition, no
 * existing Administrator to attribute that one creation to. A null
 * actor is recorded as a system-initiated event, per
 * src/services/audit/audit.ts, never silently omitted from the trail.
 * Every other caller in this codebase (the Administrator foundation
 * screens) passes a real, authenticated Administrator's id.
 */

export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
  actorId: string | null;
}

export async function createUser(input: CreateUserInput) {
  const passwordHash = await hashPassword(input.password);

  const user = await db.user.create({
    data: {
      email: input.email.toLowerCase().trim(),
      passwordHash,
      name: input.name,
    },
  });

  await recordAuditEvent({
    actorId: input.actorId,
    action: "USER_CREATED",
    entityType: "User",
    entityId: user.id,
    metadata: { email: user.email },
  });

  return user;
}

export interface AssignRoleInput {
  userId: string;
  role: Role;
  programId?: string | null;
  courseOfferingId?: string | null;
  actorId: string | null;
}

export async function assignRole(input: AssignRoleInput) {
  const assignment = await db.roleAssignment.create({
    data: {
      userId: input.userId,
      role: input.role,
      programId: input.programId ?? null,
      courseOfferingId: input.courseOfferingId ?? null,
    },
  });

  await recordAuditEvent({
    actorId: input.actorId,
    action: "ROLE_ASSIGNED",
    entityType: "RoleAssignment",
    entityId: assignment.id,
    metadata: {
      userId: input.userId,
      role: input.role,
      programId: input.programId ?? null,
      courseOfferingId: input.courseOfferingId ?? null,
    },
  });

  return assignment;
}

export async function listUsers() {
  return db.user.findMany({
    orderBy: { createdAt: "asc" },
    include: { roleAssignments: true },
  });
}

export async function getUserById(userId: string) {
  return db.user.findUnique({
    where: { id: userId },
    include: { roleAssignments: true },
  });
}

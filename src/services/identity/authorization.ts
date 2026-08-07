import "server-only";
import { redirect } from "next/navigation";
import { getSessionUser, type SessionUser } from "@/services/identity/session";
import { ROLE_HOME_ROUTE, type Role } from "@/domain/roles";

/**
 * Centralized authorization enforcement — the single component every
 * Server Action and protected page/layout calls through, per
 * Security Architecture's "no scattered checks" rule
 * (docs/milestones/milestone-6-technical-architecture/04-security-architecture.md,
 * §Authorization & RBAC) and ADR-005 (RBAC and Audit-First Security
 * Model). No module should re-implement its own permission check —
 * every check in this codebase resolves a Role Assignment's
 * `(Role, Scope)` against what the caller is asking to do, here.
 *
 * Fails closed throughout: an ambiguous or missing Role Assignment is
 * always treated as "not authorized," never as "allowed."
 */

export class AuthorizationError extends Error {
  constructor(message = "You are not authorized to perform this action.") {
    super(message);
    this.name = "AuthorizationError";
  }
}

/**
 * For use in Server Components / pages: resolves the current session or
 * redirects to /login. Every page under the authenticated portal calls
 * this first — there is no page that reads protected data without going
 * through this gate.
 */
export async function requireSessionUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

/** True if the User holds an institution-wide Administrator Role Assignment. */
export function isAdministrator(user: SessionUser): boolean {
  return user.roleAssignments.some((ra) => ra.role === "ADMINISTRATOR");
}

/** True if the User holds the given Role, scoped to the given Program (or institution-wide, for Administrator). */
export function hasRoleForProgram(
  user: SessionUser,
  role: Role,
  programId: string,
): boolean {
  if (isAdministrator(user)) return true;
  return user.roleAssignments.some(
    (ra) => ra.role === role && ra.programId === programId,
  );
}

/** True if the User holds the given Role, scoped to the given Course Offering (or institution-wide, for Administrator). */
export function hasRoleForCourseOffering(
  user: SessionUser,
  role: Role,
  courseOfferingId: string,
): boolean {
  if (isAdministrator(user)) return true;
  return user.roleAssignments.some(
    (ra) => ra.role === role && ra.courseOfferingId === courseOfferingId,
  );
}

/** True if the User holds the given Role at all, in any scope (used for coarse checks like "is this a Faculty account"). */
export function hasAnyRole(user: SessionUser, role: Role): boolean {
  return user.roleAssignments.some((ra) => ra.role === role);
}

/**
 * Server Action guard: throws AuthorizationError (fail closed) unless
 * the user is an Administrator or holds `role` scoped to `programId`.
 * Server Actions catch AuthorizationError and surface a generic denial
 * — never leaking *why* a check failed, consistent with least-privilege
 * information handling.
 */
export function requireRoleForProgram(
  user: SessionUser,
  role: Role,
  programId: string,
): void {
  if (!hasRoleForProgram(user, role, programId)) {
    throw new AuthorizationError();
  }
}

export function requireRoleForCourseOffering(
  user: SessionUser,
  role: Role,
  courseOfferingId: string,
): void {
  if (!hasRoleForCourseOffering(user, role, courseOfferingId)) {
    throw new AuthorizationError();
  }
}

export function requireAdministrator(user: SessionUser): void {
  if (!isAdministrator(user)) {
    throw new AuthorizationError();
  }
}

/** Where to send a User immediately after login, based on their first Role Assignment. */
export function resolveHomeRoute(user: SessionUser): string {
  const primary = user.roleAssignments[0];
  if (!primary) return "/login";
  return ROLE_HOME_ROUTE[primary.role] ?? "/login";
}

/**
 * For use at the top of a role-specific top-level page (e.g. /student,
 * /faculty): resolves the session and, if the User does not hold `role`
 * in any scope, redirects them to their own home route rather than
 * showing a page scoped to a role they don't hold — fail closed, per
 * Security Architecture, rather than rendering an empty or partial
 * screen.
 */
export async function requireSessionUserWithRole(role: Role): Promise<SessionUser> {
  const user = await requireSessionUser();
  if (!hasAnyRole(user, role) && !isAdministrator(user)) {
    redirect(resolveHomeRoute(user));
  }
  return user;
}

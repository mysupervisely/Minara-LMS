import "server-only";
import type { SessionUser } from "@/services/identity/session";
import type { Role } from "@/domain/roles";

/**
 * Pure Role/Scope predicates — split out of authorization.ts (Milestone
 * 15) specifically so a module can depend on these checks without also
 * pulling in "next/navigation" (which authorization.ts's `redirect`-based
 * page guards need, but a plain service module should not).
 *
 * Why this split exists: src/services/externship/externship.ts is the
 * first service module in this codebase to enforce Role/Scope checks
 * itself rather than leaving that entirely to its caller's
 * src/app/(portal)/*\/actions.ts (per this milestone's explicit "enforce
 * authorization at the service layer" instruction). Importing
 * `hasRoleForProgram` from authorization.ts worked correctly inside the
 * real Next.js server-action/page runtime, but broke prisma/seed.ts's
 * plain `tsx` process — outside Next's own module resolution, importing
 * anything from a module whose top level also imports "next/navigation"
 * (authorization.ts's `redirect`, used by `requireSessionUser`) fails to
 * load. Moving the Next.js-independent predicates here, with
 * authorization.ts re-exporting them unchanged, fixes the seed script
 * without changing a single existing import site — every
 * `src/app/(portal)/*\/actions.ts` and `page.tsx` file still imports
 * `hasRoleForProgram`/`isAdministrator`/etc. from
 * "@/services/identity/authorization" exactly as before.
 *
 * This is a disclosed, narrow refactor of already-shared infrastructure,
 * not a new decision about what RBAC means — ADR-005's "one
 * implementation of each check" holds exactly as before; only which file
 * physically contains that implementation changed.
 */

/** True if the User holds an institution-wide Administrator Role Assignment. */
export function isAdministrator(user: SessionUser): boolean {
  return user.roleAssignments.some((ra) => ra.role === "ADMINISTRATOR");
}

/** True if the User holds the given Role, scoped to the given Program (or institution-wide, for Administrator). */
export function hasRoleForProgram(user: SessionUser, role: Role, programId: string): boolean {
  if (isAdministrator(user)) return true;
  return user.roleAssignments.some((ra) => ra.role === role && ra.programId === programId);
}

/** True if the User holds the given Role, scoped to the given Course Offering (or institution-wide, for Administrator). */
export function hasRoleForCourseOffering(
  user: SessionUser,
  role: Role,
  courseOfferingId: string,
): boolean {
  if (isAdministrator(user)) return true;
  return user.roleAssignments.some((ra) => ra.role === role && ra.courseOfferingId === courseOfferingId);
}

/** True if the User holds the given Role at all, in any scope (used for coarse checks like "is this a Faculty account"). */
export function hasAnyRole(user: SessionUser, role: Role): boolean {
  return user.roleAssignments.some((ra) => ra.role === role);
}

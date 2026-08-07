import "server-only";
import { cookies } from "next/headers";
import { randomBytes, createHash } from "node:crypto";
import { db } from "@/lib/db";
import type { Role } from "@/domain/roles";

/**
 * Session management — server-side sessions, per ADR/Milestone 8's
 * "server-side sessions over stateless JWTs" decision
 * (docs/milestones/milestone-8-technology-stack-development-architecture/05-authentication-authorization-architecture.md):
 * revocable by deleting the Session row, not just by waiting out an
 * expiry, because Minara-LMS handles sensitive academic/financial data
 * where immediate revocation matters.
 *
 * The raw session token is only ever held by the browser (as an httpOnly
 * cookie) and transiently in memory on the server while validating a
 * request — only its SHA-256 hash is stored in the database, so a
 * database read alone can never be used to impersonate a session.
 *
 * ⚠️ Needs Verification (carried from Security Architecture and
 * Security Development Practices): concrete session lifetime is not an
 * institutionally-confirmed policy value. SESSION_MAX_AGE_MS below is a
 * reasonable working default for this vertical slice, not a final
 * decision — see
 * docs/milestones/milestone-6-technical-architecture/04-security-architecture.md.
 */

const COOKIE_NAME = "minara_session";
const SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7; // 7 days — placeholder default

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  roleAssignments: {
    id: string;
    role: Role;
    programId: string | null;
    courseOfferingId: string | null;
  }[];
}

export async function createSession(userId: string): Promise<void> {
  const rawToken = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_MS);

  await db.session.create({
    data: {
      userId,
      tokenHash: hashToken(rawToken),
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, rawToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroyCurrentSession(): Promise<void> {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(COOKIE_NAME)?.value;

  if (rawToken) {
    await db.session.deleteMany({ where: { tokenHash: hashToken(rawToken) } });
  }

  cookieStore.delete(COOKIE_NAME);
}

/**
 * Resolves the current request's authenticated User and their full set
 * of Role Assignments, or null if there is no valid session. This is
 * the single place session-cookie-to-User resolution happens — every
 * page and server action that needs to know "who is calling" goes
 * through this function or `requireSessionUser` in authorization.ts,
 * never reads the cookie directly.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(COOKIE_NAME)?.value;
  if (!rawToken) return null;

  const session = await db.session.findUnique({
    where: { tokenHash: hashToken(rawToken) },
    include: {
      user: {
        include: { roleAssignments: true },
      },
    },
  });

  if (!session) return null;

  if (session.expiresAt.getTime() < Date.now()) {
    // Expired — clean up rather than leaving a dead row and a dead cookie.
    await db.session.delete({ where: { id: session.id } });
    cookieStore.delete(COOKIE_NAME);
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    roleAssignments: session.user.roleAssignments.map((ra) => ({
      id: ra.id,
      role: ra.role as Role,
      programId: ra.programId,
      courseOfferingId: ra.courseOfferingId,
    })),
  };
}

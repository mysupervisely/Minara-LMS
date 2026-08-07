import "server-only";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/services/identity/password";
import { createSession, destroyCurrentSession } from "@/services/identity/session";
import { recordAuditEvent } from "@/services/audit/audit";

/**
 * Authentication — Identity module.
 * Implements docs/milestones/milestone-9-engineering-foundation-development-setup/10-first-implementation-roadmap.md's
 * "Authentication" step and
 * docs/milestones/milestone-8-technology-stack-development-architecture/05-authentication-authorization-architecture.md.
 *
 * No advanced identity integrations (SSO/OIDC) — per Milestone 10,
 * Phase 3: "Do not implement advanced identity integrations yet." Direct
 * email + password login only, matching that document's MVP-scoped
 * recommendation.
 */

export class AuthenticationError extends Error {
  constructor(message = "Incorrect email or password.") {
    super(message);
    this.name = "AuthenticationError";
  }
}

export async function login(email: string, password: string): Promise<void> {
  const user = await db.user.findUnique({ where: { email: email.toLowerCase().trim() } });

  if (!user) {
    // Deliberately the same error as a wrong password — never reveal
    // whether an email exists, per standard authentication-protection
    // practice (see Security Development Practices).
    await recordAuditEvent({
      actorId: null,
      action: "USER_LOGIN_FAILED",
      entityType: "User",
      metadata: { email },
    });
    throw new AuthenticationError();
  }

  const passwordIsValid = await verifyPassword(password, user.passwordHash);
  if (!passwordIsValid) {
    await recordAuditEvent({
      actorId: user.id,
      action: "USER_LOGIN_FAILED",
      entityType: "User",
      entityId: user.id,
    });
    throw new AuthenticationError();
  }

  await createSession(user.id);
  await recordAuditEvent({
    actorId: user.id,
    action: "USER_LOGIN",
    entityType: "User",
    entityId: user.id,
  });
}

export async function logout(actorId: string | null): Promise<void> {
  await destroyCurrentSession();
  if (actorId) {
    await recordAuditEvent({
      actorId,
      action: "USER_LOGOUT",
      entityType: "User",
      entityId: actorId,
    });
  }
}

export { hashPassword };

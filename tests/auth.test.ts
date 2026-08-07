import { describe, it, expect, beforeEach } from "vitest";
import { resetDatabase } from "./helpers/reset-db";
import { buildTestUser } from "./helpers/fixtures";
import { login, logout, AuthenticationError } from "@/services/identity/auth";
import { getSessionUser } from "@/services/identity/session";
import { listAuditLog } from "@/services/audit/audit";
import { fakeCookieStore } from "./setup";

/**
 * Authentication tests — Milestone 10's "Authentication tests" testing
 * requirement, covering
 * docs/milestones/milestone-8-technology-stack-development-architecture/05-authentication-authorization-architecture.md's
 * server-side session model.
 */
describe("Authentication", () => {
  beforeEach(resetDatabase);

  it("logs a user in with correct credentials and establishes a session", async () => {
    await buildTestUser({ email: "auth-success@example.test", password: "correct-horse-battery" });

    expect(await getSessionUser()).toBeNull();

    await login("auth-success@example.test", "correct-horse-battery");

    const sessionUser = await getSessionUser();
    expect(sessionUser).not.toBeNull();
    expect(sessionUser?.email).toBe("auth-success@example.test");
  });

  it("rejects an incorrect password without establishing a session", async () => {
    await buildTestUser({ email: "auth-badpass@example.test", password: "correct-password" });

    await expect(login("auth-badpass@example.test", "wrong-password")).rejects.toThrow(
      AuthenticationError,
    );
    expect(await getSessionUser()).toBeNull();
  });

  it("rejects a login for an email that doesn't exist, with the same error as a wrong password", async () => {
    await expect(login("nobody@example.test", "irrelevant")).rejects.toThrow(AuthenticationError);

    const bad = await login("nobody@example.test", "irrelevant").catch((e: Error) => e);
    const wrongPassUser = await buildTestUser({ email: "exists@example.test", password: "real-password" });
    const wrongPass = await login("exists@example.test", "wrong").catch((e: Error) => e);
    expect((bad as Error).message).toBe((wrongPass as Error).message);
    void wrongPassUser;
  });

  it("records a USER_LOGIN audit event on success and USER_LOGIN_FAILED on failure", async () => {
    await buildTestUser({ email: "auth-audit@example.test", password: "correct-password" });

    await login("auth-audit@example.test", "correct-password").catch(() => {});
    await login("auth-audit@example.test", "wrong-password").catch(() => {});

    const entries = await listAuditLog();
    expect(entries.some((e) => e.action === "USER_LOGIN")).toBe(true);
    expect(entries.some((e) => e.action === "USER_LOGIN_FAILED")).toBe(true);
  });

  it("clears the session on logout, so getSessionUser returns null afterward", async () => {
    const user = await buildTestUser({ email: "auth-logout@example.test", password: "correct-password" });
    await login("auth-logout@example.test", "correct-password");
    expect(await getSessionUser()).not.toBeNull();

    await logout(user.id);
    expect(await getSessionUser()).toBeNull();
  });

  it("never stores the raw session token in the database — only its hash", async () => {
    await buildTestUser({ email: "auth-tokenhash@example.test", password: "correct-password" });
    await login("auth-tokenhash@example.test", "correct-password");

    const rawToken = fakeCookieStore.get("minara_session")?.value;
    expect(rawToken).toBeTruthy();

    const { db } = await import("@/lib/db");
    const sessions = await db.session.findMany();
    expect(sessions).toHaveLength(1);
    expect(sessions[0].tokenHash).not.toBe(rawToken);
  });
});

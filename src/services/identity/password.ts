import "server-only";
import bcrypt from "bcryptjs";

/**
 * Password hashing — Identity module.
 *
 * Per Security Development Practices §Authentication Protection
 * (docs/milestones/milestone-9-engineering-foundation-development-setup/08-security-development-practices.md),
 * credentials are never logged and are always hashed before storage.
 * bcrypt is a well-established, boring choice per Technology Selection
 * Principles' "long-term maintainability" rule — not chosen for novelty.
 */

const SALT_ROUNDS = 12;

export async function hashPassword(plainTextPassword: string): Promise<string> {
  return bcrypt.hash(plainTextPassword, SALT_ROUNDS);
}

export async function verifyPassword(
  plainTextPassword: string,
  passwordHash: string,
): Promise<boolean> {
  return bcrypt.compare(plainTextPassword, passwordHash);
}

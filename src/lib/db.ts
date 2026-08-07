import { PrismaClient } from "@prisma/client";

/**
 * Prisma Client singleton.
 *
 * Server-only. Next.js hot-reloads modules in development, which would
 * otherwise create a new PrismaClient (and a new SQLite connection) on
 * every edit — this caches the instance on `globalThis` in development
 * to avoid that, a standard, well-established pattern for this framework
 * per the "boring over clever" principle in
 * docs/milestones/milestone-8-technology-stack-development-architecture/01-technology-selection-principles.md.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

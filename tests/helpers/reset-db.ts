import { db } from "@/lib/db";

/**
 * Clears every table between tests, in foreign-key-safe order (children
 * before parents). Tests run against a dedicated test database (see
 * package.json's "pretest"/"test" scripts, which point DATABASE_URL at
 * prisma/test.db) — this never touches Local Development's dev.db or
 * any real data, per
 * docs/milestones/milestone-9-engineering-foundation-development-setup/03-development-environment-strategy.md.
 */
export async function resetDatabase() {
  await db.auditLog.deleteMany();
  await db.grade.deleteMany();
  await db.submission.deleteMany();
  await db.lessonCompletion.deleteMany();
  await db.enrollment.deleteMany();
  await db.roleAssignment.deleteMany();
  await db.session.deleteMany();
  await db.courseOffering.deleteMany();
  await db.assessment.deleteMany();
  await db.lesson.deleteMany(); // cascades the implicit _CompetencyToLesson join rows
  await db.competency.deleteMany();
  await db.course.deleteMany();
  await db.cohort.deleteMany();
  await db.program.deleteMany();
  await db.school.deleteMany();
  await db.institution.deleteMany();
  await db.user.deleteMany();
}

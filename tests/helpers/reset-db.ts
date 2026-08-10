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

  // Milestone 15 — Externship Eligibility & Placement Vertical Slice:
  // Evaluation -> Placement -> ClinicalSite -> ExternshipEligibility, all
  // referencing User/Program, none referencing anything deleted below —
  // safe to clear anywhere before program.deleteMany()/user.deleteMany().
  await db.evaluation.deleteMany();
  await db.placement.deleteMany();
  await db.clinicalSite.deleteMany();
  await db.externshipEligibility.deleteMany();

  await db.grade.deleteMany();
  await db.submission.deleteMany();
  await db.lessonCompletion.deleteMany();
  await db.enrollment.deleteMany();
  await db.roleAssignment.deleteMany();
  await db.session.deleteMany();
  await db.courseOffering.deleteMany();

  // Milestone 14: Lesson <-> LessonVersion and Assessment <->
  // AssessmentVersion are mutually referential
  // (Lesson.publishedVersionId -> LessonVersion.id,
  // LessonVersion.lessonId -> Lesson.id, and the same shape for
  // Assessment/AssessmentVersion) — deleting either side first always
  // violates the other's foreign key. Null out the publishedVersionId
  // pointers first to break the cycle, then delete each pair in either
  // order.
  await db.lesson.updateMany({ data: { publishedVersionId: null } });
  await db.assessment.updateMany({ data: { publishedVersionId: null } });
  await db.assessmentVersion.deleteMany();
  await db.assessment.deleteMany();
  await db.lessonVersion.deleteMany(); // cascades the implicit _CompetencyToLessonVersion join rows
  await db.lesson.deleteMany();
  await db.competency.deleteMany();
  await db.course.deleteMany();
  await db.cohort.deleteMany();
  await db.program.deleteMany();
  await db.school.deleteMany();
  await db.institution.deleteMany();
  await db.user.deleteMany();
}

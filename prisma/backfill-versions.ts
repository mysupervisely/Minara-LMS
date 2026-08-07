/**
 * Milestone 14 (Content Versioning Vertical Slice) — one-time data
 * backfill.
 *
 * Excluded from TypeScript compilation (tsconfig.json) on purpose: it
 * was written and run against the intermediate schema shape that
 * existed between Migration A and Migration B, when Lesson/Assessment
 * still carried their pre-versioning columns (title/content/status/
 * etc.) *and* their new nullable Version-pointer columns side by side.
 * Migration B has since removed those pre-versioning columns, so this
 * file no longer type-checks against the current schema — by design,
 * not decay. It is kept, unexecuted, as the exact record of how the
 * Milestone 13 → 14 migration moved real data, referenced from this
 * milestone's "Database migration summary." Do not attempt to run it
 * again; see "NOT idempotent" below.
 *
 * Migration A (prisma/migrations/20260807211514_m14a_add_lesson_assessment_versions/)
 * is purely additive: it adds the `lesson_versions`/`assessment_versions`
 * tables and nullable `publishedVersionId`/`lessonVersionId`/
 * `assessmentVersionId` columns, without touching any existing row's
 * data. That migration alone leaves every pre-existing Lesson and
 * Assessment with zero Versions — this script is the second step that
 * gives each of them their "Version 1," generated through the real
 * Prisma Client (not hand-written SQL), so ids are real cuids and every
 * write is fully type-checked.
 *
 * Order of operations matters and mirrors the dependency graph:
 *   1. One LessonVersion (versionNumber 1) per existing Lesson, copying
 *      its title/content/status/returnReason/createdAt, and connecting
 *      the same Competencies the Lesson already carried.
 *   2. Lesson.publishedVersionId set to that Version's id, but only if
 *      the Lesson's own status was already PUBLISHED — a Lesson still
 *      sitting in Draft/Submitted/Approved has no published version to
 *      point to yet, exactly as before this migration.
 *   3. Every existing LessonCompletion for that Lesson gets
 *      lessonVersionId set to the same Version 1 — the only version
 *      that could possibly have existed at the time that completion was
 *      recorded, so this is not a guess, it is the historically correct
 *      value.
 *   4. The identical three steps for Assessment → AssessmentVersion →
 *      Submission.assessmentVersionId.
 *
 * This script is NOT idempotent and is NOT part of ongoing seeding
 * (contrast prisma/seed.ts, which is safe to re-run against a fresh
 * database) — it is a one-time migration step, run once against the
 * Milestone 13 database immediately after Migration A and immediately
 * before Migration B
 * (prisma/migrations/<timestamp>_m14b_finalize_lesson_assessment_versions/),
 * which removes the now-redundant pre-versioning columns this script
 * reads from. Re-running it against an already-backfilled database
 * would create duplicate Version 1 rows — guarded against below by
 * skipping any Lesson/Assessment that already has at least one Version.
 *
 * Run with: npx tsx --conditions=react-server prisma/backfill-versions.ts
 */

import { db } from "../src/lib/db";

async function backfillLessons() {
  const lessons = await db.lesson.findMany({
    include: { competencies: true, completions: true, versions: true },
  });

  let created = 0;
  for (const lesson of lessons) {
    if (lesson.versions.length > 0) {
      console.log(`  skip Lesson ${lesson.id} — already has a Version`);
      continue;
    }

    const version = await db.lessonVersion.create({
      data: {
        lessonId: lesson.id,
        versionNumber: 1,
        title: lesson.title,
        content: lesson.content,
        status: lesson.status,
        returnReason: lesson.returnReason,
        createdAt: lesson.createdAt,
        publishedAt: lesson.status === "PUBLISHED" ? lesson.createdAt : null,
        competencies: { connect: lesson.competencies.map((c) => ({ id: c.id })) },
      },
    });

    if (lesson.status === "PUBLISHED") {
      await db.lesson.update({
        where: { id: lesson.id },
        data: { publishedVersionId: version.id },
      });
    }

    if (lesson.completions.length > 0) {
      await db.lessonCompletion.updateMany({
        where: { lessonId: lesson.id },
        data: { lessonVersionId: version.id },
      });
    }

    created += 1;
    console.log(
      `  Lesson ${lesson.id} ("${lesson.title}") → Version ${version.id} ` +
        `[${lesson.status}]${lesson.status === "PUBLISHED" ? ", set as published version" : ""}` +
        `${lesson.completions.length > 0 ? `, backfilled ${lesson.completions.length} completion(s)` : ""}`,
    );
  }
  return created;
}

async function backfillAssessments() {
  const assessments = await db.assessment.findMany({
    include: { submissions: true, versions: true },
  });

  let created = 0;
  for (const assessment of assessments) {
    if (assessment.versions.length > 0) {
      console.log(`  skip Assessment ${assessment.id} — already has a Version`);
      continue;
    }

    const version = await db.assessmentVersion.create({
      data: {
        assessmentId: assessment.id,
        versionNumber: 1,
        title: assessment.title,
        instructions: assessment.instructions,
        maxScore: assessment.maxScore,
        status: assessment.status,
        returnReason: assessment.returnReason,
        createdAt: assessment.createdAt,
        publishedAt: assessment.status === "PUBLISHED" ? assessment.createdAt : null,
      },
    });

    if (assessment.status === "PUBLISHED") {
      await db.assessment.update({
        where: { id: assessment.id },
        data: { publishedVersionId: version.id },
      });
    }

    if (assessment.submissions.length > 0) {
      await db.submission.updateMany({
        where: { assessmentId: assessment.id },
        data: { assessmentVersionId: version.id },
      });
    }

    created += 1;
    console.log(
      `  Assessment ${assessment.id} ("${assessment.title}") → Version ${version.id} ` +
        `[${assessment.status}]${assessment.status === "PUBLISHED" ? ", set as published version" : ""}` +
        `${assessment.submissions.length > 0 ? `, backfilled ${assessment.submissions.length} submission(s)` : ""}`,
    );
  }
  return created;
}

async function main() {
  console.log("Milestone 14 backfill: Lesson/Assessment → Lesson Version 1/Assessment Version 1\n");

  console.log("Lessons:");
  const lessonVersionsCreated = await backfillLessons();

  console.log("\nAssessments:");
  const assessmentVersionsCreated = await backfillAssessments();

  console.log(
    `\nDone. Created ${lessonVersionsCreated} Lesson Version(s) and ` +
      `${assessmentVersionsCreated} Assessment Version(s).`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });

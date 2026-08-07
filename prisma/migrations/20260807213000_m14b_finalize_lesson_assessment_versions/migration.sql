-- DropIndex
DROP INDEX "_CompetencyToLesson_B_index";

-- DropIndex
DROP INDEX "_CompetencyToLesson_AB_unique";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_CompetencyToLesson";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_assessments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "courseId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedVersionId" TEXT,
    CONSTRAINT "assessments_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "assessments_publishedVersionId_fkey" FOREIGN KEY ("publishedVersionId") REFERENCES "assessment_versions" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_assessments" ("courseId", "createdAt", "id", "publishedVersionId") SELECT "courseId", "createdAt", "id", "publishedVersionId" FROM "assessments";
DROP TABLE "assessments";
ALTER TABLE "new_assessments" RENAME TO "assessments";
CREATE TABLE "new_lesson_completions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "lessonVersionId" TEXT NOT NULL,
    "completedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "lesson_completions_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "lesson_completions_lessonVersionId_fkey" FOREIGN KEY ("lessonVersionId") REFERENCES "lesson_versions" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_lesson_completions" ("completedAt", "id", "lessonVersionId", "studentId") SELECT "completedAt", "id", "lessonVersionId", "studentId" FROM "lesson_completions";
DROP TABLE "lesson_completions";
ALTER TABLE "new_lesson_completions" RENAME TO "lesson_completions";
CREATE UNIQUE INDEX "lesson_completions_studentId_lessonVersionId_key" ON "lesson_completions"("studentId", "lessonVersionId");
CREATE TABLE "new_lessons" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "courseId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedVersionId" TEXT,
    CONSTRAINT "lessons_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "lessons_publishedVersionId_fkey" FOREIGN KEY ("publishedVersionId") REFERENCES "lesson_versions" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_lessons" ("courseId", "createdAt", "id", "order", "publishedVersionId") SELECT "courseId", "createdAt", "id", "order", "publishedVersionId" FROM "lessons";
DROP TABLE "lessons";
ALTER TABLE "new_lessons" RENAME TO "lessons";
CREATE TABLE "new_submissions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "assessmentVersionId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "submissions_assessmentVersionId_fkey" FOREIGN KEY ("assessmentVersionId") REFERENCES "assessment_versions" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "submissions_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "submissions_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "enrollments" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_submissions" ("assessmentVersionId", "content", "enrollmentId", "id", "studentId", "submittedAt") SELECT "assessmentVersionId", "content", "enrollmentId", "id", "studentId", "submittedAt" FROM "submissions";
DROP TABLE "submissions";
ALTER TABLE "new_submissions" RENAME TO "submissions";
CREATE UNIQUE INDEX "submissions_assessmentVersionId_studentId_key" ON "submissions"("assessmentVersionId", "studentId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;


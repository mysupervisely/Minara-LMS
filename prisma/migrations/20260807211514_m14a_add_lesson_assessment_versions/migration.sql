-- CreateTable
CREATE TABLE "lesson_versions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lessonId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "returnReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" DATETIME,
    CONSTRAINT "lesson_versions_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lessons" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "assessment_versions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "assessmentId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "instructions" TEXT NOT NULL,
    "maxScore" INTEGER NOT NULL DEFAULT 100,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "returnReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" DATETIME,
    CONSTRAINT "assessment_versions_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "assessments" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_CompetencyToLessonVersion" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_CompetencyToLessonVersion_A_fkey" FOREIGN KEY ("A") REFERENCES "competencies" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_CompetencyToLessonVersion_B_fkey" FOREIGN KEY ("B") REFERENCES "lesson_versions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_assessments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "instructions" TEXT NOT NULL,
    "maxScore" INTEGER NOT NULL DEFAULT 100,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "returnReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedVersionId" TEXT,
    CONSTRAINT "assessments_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "assessments_publishedVersionId_fkey" FOREIGN KEY ("publishedVersionId") REFERENCES "assessment_versions" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_assessments" ("courseId", "createdAt", "id", "instructions", "maxScore", "returnReason", "status", "title") SELECT "courseId", "createdAt", "id", "instructions", "maxScore", "returnReason", "status", "title" FROM "assessments";
DROP TABLE "assessments";
ALTER TABLE "new_assessments" RENAME TO "assessments";
CREATE TABLE "new_lesson_completions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "lessonVersionId" TEXT,
    "completedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "lesson_completions_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "lesson_completions_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lessons" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "lesson_completions_lessonVersionId_fkey" FOREIGN KEY ("lessonVersionId") REFERENCES "lesson_versions" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_lesson_completions" ("completedAt", "id", "lessonId", "studentId") SELECT "completedAt", "id", "lessonId", "studentId" FROM "lesson_completions";
DROP TABLE "lesson_completions";
ALTER TABLE "new_lesson_completions" RENAME TO "lesson_completions";
CREATE UNIQUE INDEX "lesson_completions_studentId_lessonId_key" ON "lesson_completions"("studentId", "lessonId");
CREATE TABLE "new_lessons" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "returnReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedVersionId" TEXT,
    CONSTRAINT "lessons_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "lessons_publishedVersionId_fkey" FOREIGN KEY ("publishedVersionId") REFERENCES "lesson_versions" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_lessons" ("content", "courseId", "createdAt", "id", "order", "returnReason", "status", "title") SELECT "content", "courseId", "createdAt", "id", "order", "returnReason", "status", "title" FROM "lessons";
DROP TABLE "lessons";
ALTER TABLE "new_lessons" RENAME TO "lessons";
CREATE TABLE "new_submissions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "assessmentId" TEXT NOT NULL,
    "assessmentVersionId" TEXT,
    "studentId" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "submissions_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "assessments" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "submissions_assessmentVersionId_fkey" FOREIGN KEY ("assessmentVersionId") REFERENCES "assessment_versions" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "submissions_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "submissions_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "enrollments" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_submissions" ("assessmentId", "content", "enrollmentId", "id", "studentId", "submittedAt") SELECT "assessmentId", "content", "enrollmentId", "id", "studentId", "submittedAt" FROM "submissions";
DROP TABLE "submissions";
ALTER TABLE "new_submissions" RENAME TO "submissions";
CREATE UNIQUE INDEX "submissions_assessmentId_studentId_key" ON "submissions"("assessmentId", "studentId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "lesson_versions_lessonId_versionNumber_key" ON "lesson_versions"("lessonId", "versionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "assessment_versions_assessmentId_versionNumber_key" ON "assessment_versions"("assessmentId", "versionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "_CompetencyToLessonVersion_AB_unique" ON "_CompetencyToLessonVersion"("A", "B");

-- CreateIndex
CREATE INDEX "_CompetencyToLessonVersion_B_index" ON "_CompetencyToLessonVersion"("B");

-- CreateTable
CREATE TABLE "applications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "applicantId" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "applicantNotes" TEXT,
    "decisionReason" TEXT,
    "submittedAt" DATETIME,
    "decisionAt" DATETIME,
    "decidedById" TEXT,
    "cohortId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "applications_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "applications_programId_fkey" FOREIGN KEY ("programId") REFERENCES "programs" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "applications_decidedById_fkey" FOREIGN KEY ("decidedById") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "applications_cohortId_fkey" FOREIGN KEY ("cohortId") REFERENCES "cohorts" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "application_requirements" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "applicationId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NEEDS_VERIFICATION',
    "note" TEXT,
    "updatedById" TEXT,
    "updatedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "application_requirements_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "application_requirements_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_enrollments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "cohortId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sourceApplicationId" TEXT,
    CONSTRAINT "enrollments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "enrollments_programId_fkey" FOREIGN KEY ("programId") REFERENCES "programs" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "enrollments_cohortId_fkey" FOREIGN KEY ("cohortId") REFERENCES "cohorts" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "enrollments_sourceApplicationId_fkey" FOREIGN KEY ("sourceApplicationId") REFERENCES "applications" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_enrollments" ("cohortId", "createdAt", "id", "programId", "status", "studentId") SELECT "cohortId", "createdAt", "id", "programId", "status", "studentId" FROM "enrollments";
DROP TABLE "enrollments";
ALTER TABLE "new_enrollments" RENAME TO "enrollments";
CREATE UNIQUE INDEX "enrollments_sourceApplicationId_key" ON "enrollments"("sourceApplicationId");
CREATE INDEX "enrollments_programId_idx" ON "enrollments"("programId");
CREATE INDEX "enrollments_cohortId_idx" ON "enrollments"("cohortId");
CREATE UNIQUE INDEX "enrollments_studentId_programId_key" ON "enrollments"("studentId", "programId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "applications_programId_idx" ON "applications"("programId");

-- CreateIndex
CREATE INDEX "applications_applicantId_idx" ON "applications"("applicantId");

-- CreateIndex
CREATE INDEX "application_requirements_applicationId_idx" ON "application_requirements"("applicationId");

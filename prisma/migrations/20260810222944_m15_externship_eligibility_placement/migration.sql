-- CreateTable
CREATE TABLE "externship_eligibilities" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "notes" TEXT,
    "determinedById" TEXT NOT NULL,
    "determinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "externship_eligibilities_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "externship_eligibilities_programId_fkey" FOREIGN KEY ("programId") REFERENCES "programs" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "externship_eligibilities_determinedById_fkey" FOREIGN KEY ("determinedById") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "clinical_sites" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "programId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "employerName" TEXT NOT NULL,
    "contactName" TEXT,
    "contactInfo" TEXT,
    "capacity" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "clinical_sites_programId_fkey" FOREIGN KEY ("programId") REFERENCES "programs" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "clinical_sites_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "placements" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "clinicalSiteId" TEXT NOT NULL,
    "preceptorName" TEXT,
    "preceptorContact" TEXT,
    "status" TEXT NOT NULL DEFAULT 'REQUESTED',
    "hoursAttestedAt" DATETIME,
    "hoursAttestedById" TEXT,
    "completionStatus" TEXT NOT NULL DEFAULT 'NOT_SUBMITTED',
    "completionReturnReason" TEXT,
    "completionSubmittedAt" DATETIME,
    "completionSubmittedById" TEXT,
    "completionVerifiedAt" DATETIME,
    "completionVerifiedById" TEXT,
    "requestedById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "placements_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "placements_programId_fkey" FOREIGN KEY ("programId") REFERENCES "programs" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "placements_clinicalSiteId_fkey" FOREIGN KEY ("clinicalSiteId") REFERENCES "clinical_sites" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "placements_hoursAttestedById_fkey" FOREIGN KEY ("hoursAttestedById") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "placements_completionSubmittedById_fkey" FOREIGN KEY ("completionSubmittedById") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "placements_completionVerifiedById_fkey" FOREIGN KEY ("completionVerifiedById") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "placements_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "evaluations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "placementId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "outcome" TEXT NOT NULL DEFAULT 'SATISFACTORY',
    "recordedById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "evaluations_placementId_fkey" FOREIGN KEY ("placementId") REFERENCES "placements" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "evaluations_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "externship_eligibilities_studentId_programId_key" ON "externship_eligibilities"("studentId", "programId");

-- CreateIndex
CREATE INDEX "clinical_sites_programId_idx" ON "clinical_sites"("programId");

-- CreateIndex
CREATE INDEX "placements_studentId_idx" ON "placements"("studentId");

-- CreateIndex
CREATE INDEX "placements_programId_idx" ON "placements"("programId");

-- CreateIndex
CREATE INDEX "placements_clinicalSiteId_idx" ON "placements"("clinicalSiteId");

-- CreateIndex
CREATE INDEX "evaluations_placementId_idx" ON "evaluations"("placementId");

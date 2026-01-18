-- CreateTable
CREATE TABLE "session_photos" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "caption" VARCHAR(140),
    "capturedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_photos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "session_photos_sessionId_idx" ON "session_photos"("sessionId");

-- AddForeignKey
ALTER TABLE "session_photos" ADD CONSTRAINT "session_photos_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "treatment_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

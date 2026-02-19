ALTER TABLE "protocols"
ADD COLUMN "deletedAt" TIMESTAMP(3);

CREATE INDEX "protocols_deletedAt_idx" ON "protocols"("deletedAt");

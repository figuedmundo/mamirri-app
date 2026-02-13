-- DropForeignKey
ALTER TABLE "ai_analyses" DROP CONSTRAINT "ai_analyses_therapistId_fkey";

-- AddForeignKey
ALTER TABLE "ai_analyses" ADD CONSTRAINT "ai_analyses_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

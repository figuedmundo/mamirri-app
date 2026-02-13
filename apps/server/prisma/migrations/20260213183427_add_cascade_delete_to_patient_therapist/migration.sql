-- DropForeignKey
ALTER TABLE "patients" DROP CONSTRAINT "patients_therapistId_fkey";

-- AddForeignKey
ALTER TABLE "patients" ADD CONSTRAINT "patients_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

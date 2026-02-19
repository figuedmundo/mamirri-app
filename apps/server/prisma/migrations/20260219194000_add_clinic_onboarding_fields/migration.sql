ALTER TABLE "clinics"
ADD COLUMN "logoUrl" TEXT,
ADD COLUMN "subdomain" TEXT,
ADD COLUMN "businessHours" JSONB;

CREATE UNIQUE INDEX "clinics_subdomain_key" ON "clinics"("subdomain");
CREATE INDEX "clinics_name_idx" ON "clinics"("name");

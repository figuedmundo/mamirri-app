-- CreateTable
CREATE TABLE "clinical_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clinical_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "protocols" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "definition" TEXT NOT NULL,
    "rationale" TEXT NOT NULL,
    "procedure" TEXT[],
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "documentId" UUID,

    CONSTRAINT "protocols_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bibliographic_references" (
    "id" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "originalLanguage" TEXT NOT NULL DEFAULT 'es',
    "summaryEs" TEXT NOT NULL,
    "originalText" TEXT,
    "url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bibliographic_references_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "protocol_references" (
    "protocolId" TEXT NOT NULL,
    "referenceId" TEXT NOT NULL,

    CONSTRAINT "protocol_references_pkey" PRIMARY KEY ("protocolId","referenceId")
);

-- CreateTable
CREATE TABLE "anatomical_diagrams" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "anatomical_diagrams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "treatment_plan_protocols" (
    "treatmentPlanId" TEXT NOT NULL,
    "protocolId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "treatment_plan_protocols_pkey" PRIMARY KEY ("treatmentPlanId","protocolId")
);

-- CreateIndex
CREATE INDEX "protocols_categoryId_idx" ON "protocols"("categoryId");

-- AddForeignKey
ALTER TABLE "protocols" ADD CONSTRAINT "protocols_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "clinical_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "protocols" ADD CONSTRAINT "protocols_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "protocol_references" ADD CONSTRAINT "protocol_references_protocolId_fkey" FOREIGN KEY ("protocolId") REFERENCES "protocols"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "protocol_references" ADD CONSTRAINT "protocol_references_referenceId_fkey" FOREIGN KEY ("referenceId") REFERENCES "bibliographic_references"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treatment_plan_protocols" ADD CONSTRAINT "treatment_plan_protocols_treatmentPlanId_fkey" FOREIGN KEY ("treatmentPlanId") REFERENCES "treatment_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treatment_plan_protocols" ADD CONSTRAINT "treatment_plan_protocols_protocolId_fkey" FOREIGN KEY ("protocolId") REFERENCES "protocols"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

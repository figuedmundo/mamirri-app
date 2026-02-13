-- CreateTable
CREATE TABLE "ai_analyses" (
    "id" TEXT NOT NULL,
    "clinicalCaseId" TEXT NOT NULL,
    "therapistId" TEXT NOT NULL,
    "result" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_feedbacks" (
    "id" TEXT NOT NULL,
    "aiAnalysisId" TEXT NOT NULL,
    "suggestionIndex" INTEGER NOT NULL,
    "isPositive" BOOLEAN NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_feedbacks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ai_analyses_clinicalCaseId_idx" ON "ai_analyses"("clinicalCaseId");

-- CreateIndex
CREATE UNIQUE INDEX "ai_feedbacks_aiAnalysisId_suggestionIndex_key" ON "ai_feedbacks"("aiAnalysisId", "suggestionIndex");

-- AddForeignKey
ALTER TABLE "ai_analyses" ADD CONSTRAINT "ai_analyses_clinicalCaseId_fkey" FOREIGN KEY ("clinicalCaseId") REFERENCES "clinical_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_analyses" ADD CONSTRAINT "ai_analyses_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_feedbacks" ADD CONSTRAINT "ai_feedbacks_aiAnalysisId_fkey" FOREIGN KEY ("aiAnalysisId") REFERENCES "ai_analyses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

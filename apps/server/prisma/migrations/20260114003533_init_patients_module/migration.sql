/*
  Warnings:

  - You are about to drop the column `createdAt` on the `patients` table. All the data in the column will be lost.
  - You are about to drop the column `dob` on the `patients` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `patients` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `patients` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `patients` table. All the data in the column will be lost.
  - The `status` column on the `sessions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `edad` to the `patients` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fechaNacimiento` to the `patients` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombre` to the `patients` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ocupacion` to the `patients` table without a default value. This is not possible if the table is not empty.
  - Added the required column `telefono` to the `patients` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "patients_firstName_lastName_idx";

-- DropIndex
DROP INDEX "sessions_patientId_therapistId_date_idx";

-- AlterTable
ALTER TABLE "patients" DROP COLUMN "createdAt",
DROP COLUMN "dob",
DROP COLUMN "firstName",
DROP COLUMN "lastName",
DROP COLUMN "phone",
ADD COLUMN     "activo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "direccion" TEXT,
ADD COLUMN     "edad" INTEGER NOT NULL,
ADD COLUMN     "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "fechaNacimiento" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "genero" TEXT,
ADD COLUMN     "nombre" TEXT NOT NULL,
ADD COLUMN     "ocupacion" TEXT NOT NULL,
ADD COLUMN     "ocupacionAnterior" TEXT,
ADD COLUMN     "telefono" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "sessions" DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'DRAFT';

-- DropEnum
DROP TYPE "SessionStatus";

-- CreateTable
CREATE TABLE "clinical_cases" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3),
    "motivoConsulta" TEXT NOT NULL,
    "antecedentesPatologicos" JSONB,
    "antecedentesFarmacologicos" TEXT,
    "diagnosticoMedicoInicial" TEXT,
    "patientId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clinical_cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluations" (
    "id" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "posturograma" JSONB NOT NULL,
    "testOrtopedicos" JSONB NOT NULL,
    "evaluacionAVD" JSONB NOT NULL,
    "escalaDolor" JSONB NOT NULL,
    "diagnostico" JSONB NOT NULL,
    "notasVoz" JSONB,
    "clinicalCaseId" TEXT NOT NULL,

    CONSTRAINT "evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "treatment_plans" (
    "id" TEXT NOT NULL,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "objetivos" JSONB NOT NULL,
    "fases" JSONB NOT NULL,
    "plantilla" JSONB,
    "clinicalCaseId" TEXT NOT NULL,

    CONSTRAINT "treatment_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "treatment_sessions" (
    "id" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "faseNumero" INTEGER NOT NULL,
    "tecnicasAplicadas" TEXT[],
    "respuestaPaciente" TEXT NOT NULL,
    "dolorFinal" INTEGER NOT NULL,
    "observaciones" TEXT NOT NULL,
    "notasVoz" JSONB,
    "clinicalCaseId" TEXT NOT NULL,
    "therapistId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "treatment_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "huellas" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "url" TEXT NOT NULL,
    "analisis" JSONB,
    "comparacion" JSONB,
    "evaluationId" TEXT NOT NULL,

    CONSTRAINT "huellas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "videos_postura" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "url" TEXT NOT NULL,
    "duracion" INTEGER NOT NULL,
    "observaciones" TEXT NOT NULL,
    "evaluationId" TEXT NOT NULL,

    CONSTRAINT "videos_postura_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plantillas" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "material" TEXT NOT NULL,
    "caracteristicas" JSONB,
    "clinicalCaseId" TEXT NOT NULL,

    CONSTRAINT "plantillas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "evaluations_clinicalCaseId_key" ON "evaluations"("clinicalCaseId");

-- CreateIndex
CREATE UNIQUE INDEX "treatment_plans_clinicalCaseId_key" ON "treatment_plans"("clinicalCaseId");

-- CreateIndex
CREATE INDEX "patients_nombre_idx" ON "patients"("nombre");

-- AddForeignKey
ALTER TABLE "patients" ADD CONSTRAINT "patients_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinical_cases" ADD CONSTRAINT "clinical_cases_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_clinicalCaseId_fkey" FOREIGN KEY ("clinicalCaseId") REFERENCES "clinical_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treatment_plans" ADD CONSTRAINT "treatment_plans_clinicalCaseId_fkey" FOREIGN KEY ("clinicalCaseId") REFERENCES "clinical_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treatment_sessions" ADD CONSTRAINT "treatment_sessions_clinicalCaseId_fkey" FOREIGN KEY ("clinicalCaseId") REFERENCES "clinical_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treatment_sessions" ADD CONSTRAINT "treatment_sessions_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "huellas" ADD CONSTRAINT "huellas_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "evaluations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "videos_postura" ADD CONSTRAINT "videos_postura_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "evaluations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plantillas" ADD CONSTRAINT "plantillas_clinicalCaseId_fkey" FOREIGN KEY ("clinicalCaseId") REFERENCES "clinical_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

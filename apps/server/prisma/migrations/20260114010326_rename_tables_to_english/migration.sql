/*
  Warnings:

  - You are about to drop the column `antecedentesFarmacologicos` on the `clinical_cases` table. All the data in the column will be lost.
  - You are about to drop the column `antecedentesPatologicos` on the `clinical_cases` table. All the data in the column will be lost.
  - You are about to drop the column `diagnosticoMedicoInicial` on the `clinical_cases` table. All the data in the column will be lost.
  - You are about to drop the column `estado` on the `clinical_cases` table. All the data in the column will be lost.
  - You are about to drop the column `fechaFin` on the `clinical_cases` table. All the data in the column will be lost.
  - You are about to drop the column `fechaInicio` on the `clinical_cases` table. All the data in the column will be lost.
  - You are about to drop the column `motivoConsulta` on the `clinical_cases` table. All the data in the column will be lost.
  - You are about to drop the column `titulo` on the `clinical_cases` table. All the data in the column will be lost.
  - You are about to drop the column `diagnostico` on the `evaluations` table. All the data in the column will be lost.
  - You are about to drop the column `escalaDolor` on the `evaluations` table. All the data in the column will be lost.
  - You are about to drop the column `evaluacionAVD` on the `evaluations` table. All the data in the column will be lost.
  - You are about to drop the column `fecha` on the `evaluations` table. All the data in the column will be lost.
  - You are about to drop the column `notasVoz` on the `evaluations` table. All the data in the column will be lost.
  - You are about to drop the column `posturograma` on the `evaluations` table. All the data in the column will be lost.
  - You are about to drop the column `testOrtopedicos` on the `evaluations` table. All the data in the column will be lost.
  - You are about to drop the column `activo` on the `patients` table. All the data in the column will be lost.
  - You are about to drop the column `direccion` on the `patients` table. All the data in the column will be lost.
  - You are about to drop the column `edad` on the `patients` table. All the data in the column will be lost.
  - You are about to drop the column `fechaCreacion` on the `patients` table. All the data in the column will be lost.
  - You are about to drop the column `fechaNacimiento` on the `patients` table. All the data in the column will be lost.
  - You are about to drop the column `genero` on the `patients` table. All the data in the column will be lost.
  - You are about to drop the column `nombre` on the `patients` table. All the data in the column will be lost.
  - You are about to drop the column `ocupacion` on the `patients` table. All the data in the column will be lost.
  - You are about to drop the column `ocupacionAnterior` on the `patients` table. All the data in the column will be lost.
  - You are about to drop the column `telefono` on the `patients` table. All the data in the column will be lost.
  - You are about to drop the column `fases` on the `treatment_plans` table. All the data in the column will be lost.
  - You are about to drop the column `fechaCreacion` on the `treatment_plans` table. All the data in the column will be lost.
  - You are about to drop the column `objetivos` on the `treatment_plans` table. All the data in the column will be lost.
  - You are about to drop the column `plantilla` on the `treatment_plans` table. All the data in the column will be lost.
  - You are about to drop the column `dolorFinal` on the `treatment_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `faseNumero` on the `treatment_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `fecha` on the `treatment_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `notasVoz` on the `treatment_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `observaciones` on the `treatment_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `respuestaPaciente` on the `treatment_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `tecnicasAplicadas` on the `treatment_sessions` table. All the data in the column will be lost.
  - You are about to drop the `huellas` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `plantillas` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `videos_postura` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `consultationReason` to the `clinical_cases` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `clinical_cases` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `clinical_cases` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `clinical_cases` table without a default value. This is not possible if the table is not empty.
  - Added the required column `avdEvaluation` to the `evaluations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date` to the `evaluations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `diagnosis` to the `evaluations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orthopedicTests` to the `evaluations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `painScale` to the `evaluations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `posturogram` to the `evaluations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `age` to the `patients` table without a default value. This is not possible if the table is not empty.
  - Added the required column `birthDate` to the `patients` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `patients` table without a default value. This is not possible if the table is not empty.
  - Added the required column `occupation` to the `patients` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `patients` table without a default value. This is not possible if the table is not empty.
  - Added the required column `objectives` to the `treatment_plans` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phases` to the `treatment_plans` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date` to the `treatment_sessions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `finalPainLevel` to the `treatment_sessions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `observations` to the `treatment_sessions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `patientResponse` to the `treatment_sessions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phaseNumber` to the `treatment_sessions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "huellas" DROP CONSTRAINT "huellas_evaluationId_fkey";

-- DropForeignKey
ALTER TABLE "plantillas" DROP CONSTRAINT "plantillas_clinicalCaseId_fkey";

-- DropForeignKey
ALTER TABLE "videos_postura" DROP CONSTRAINT "videos_postura_evaluationId_fkey";

-- DropIndex
DROP INDEX "patients_nombre_idx";

-- AlterTable
ALTER TABLE "clinical_cases" DROP COLUMN "antecedentesFarmacologicos",
DROP COLUMN "antecedentesPatologicos",
DROP COLUMN "diagnosticoMedicoInicial",
DROP COLUMN "estado",
DROP COLUMN "fechaFin",
DROP COLUMN "fechaInicio",
DROP COLUMN "motivoConsulta",
DROP COLUMN "titulo",
ADD COLUMN     "consultationReason" TEXT NOT NULL,
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "initialMedicalDiagnosis" TEXT,
ADD COLUMN     "pathologicalHistory" JSONB,
ADD COLUMN     "pharmacologicalHistory" TEXT,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "evaluations" DROP COLUMN "diagnostico",
DROP COLUMN "escalaDolor",
DROP COLUMN "evaluacionAVD",
DROP COLUMN "fecha",
DROP COLUMN "notasVoz",
DROP COLUMN "posturograma",
DROP COLUMN "testOrtopedicos",
ADD COLUMN     "avdEvaluation" JSONB NOT NULL,
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "diagnosis" JSONB NOT NULL,
ADD COLUMN     "orthopedicTests" JSONB NOT NULL,
ADD COLUMN     "painScale" JSONB NOT NULL,
ADD COLUMN     "posturogram" JSONB NOT NULL,
ADD COLUMN     "voiceNotes" JSONB;

-- AlterTable
ALTER TABLE "patients" DROP COLUMN "activo",
DROP COLUMN "direccion",
DROP COLUMN "edad",
DROP COLUMN "fechaCreacion",
DROP COLUMN "fechaNacimiento",
DROP COLUMN "genero",
DROP COLUMN "nombre",
DROP COLUMN "ocupacion",
DROP COLUMN "ocupacionAnterior",
DROP COLUMN "telefono",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "age" INTEGER NOT NULL,
ADD COLUMN     "birthDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "occupation" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT NOT NULL,
ADD COLUMN     "previousOccupation" TEXT;

-- AlterTable
ALTER TABLE "treatment_plans" DROP COLUMN "fases",
DROP COLUMN "fechaCreacion",
DROP COLUMN "objetivos",
DROP COLUMN "plantilla",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "insoleSnapshot" JSONB,
ADD COLUMN     "objectives" JSONB NOT NULL,
ADD COLUMN     "phases" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "treatment_sessions" DROP COLUMN "dolorFinal",
DROP COLUMN "faseNumero",
DROP COLUMN "fecha",
DROP COLUMN "notasVoz",
DROP COLUMN "observaciones",
DROP COLUMN "respuestaPaciente",
DROP COLUMN "tecnicasAplicadas",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "finalPainLevel" INTEGER NOT NULL,
ADD COLUMN     "observations" TEXT NOT NULL,
ADD COLUMN     "patientResponse" TEXT NOT NULL,
ADD COLUMN     "phaseNumber" INTEGER NOT NULL,
ADD COLUMN     "procedures" TEXT[],
ADD COLUMN     "voiceNotes" JSONB;

-- DropTable
DROP TABLE "huellas";

-- DropTable
DROP TABLE "plantillas";

-- DropTable
DROP TABLE "videos_postura";

-- CreateTable
CREATE TABLE "footprints" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "url" TEXT NOT NULL,
    "analysis" JSONB,
    "comparison" JSONB,
    "evaluationId" TEXT NOT NULL,

    CONSTRAINT "footprints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posture_videos" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "url" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "observations" TEXT NOT NULL,
    "evaluationId" TEXT NOT NULL,

    CONSTRAINT "posture_videos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insoles" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "material" TEXT NOT NULL,
    "features" JSONB,
    "clinicalCaseId" TEXT NOT NULL,

    CONSTRAINT "insoles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "patients_name_idx" ON "patients"("name");

-- AddForeignKey
ALTER TABLE "footprints" ADD CONSTRAINT "footprints_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "evaluations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posture_videos" ADD CONSTRAINT "posture_videos_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "evaluations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insoles" ADD CONSTRAINT "insoles_clinicalCaseId_fkey" FOREIGN KEY ("clinicalCaseId") REFERENCES "clinical_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

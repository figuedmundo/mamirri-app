import { Injectable, Logger } from '@nestjs/common';
import {
  AnonymizationMapping,
  AnonymizedResult,
} from '../interfaces/analysis.interfaces';

interface ClinicalCaseWithPatient {
  id: string;
  title: string;
  consultationReason: string;
  initialMedicalDiagnosis?: string;
  pathologicalHistory?: Record<string, unknown>;
  pharmacologicalHistory?: string;
  patient: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    birthDate: Date;
    gender?: string;
    occupation?: string;
    emergencyContact?: Record<string, unknown>;
  };
  evaluations?: Array<{
    diagnosis?: Record<string, unknown>;
    orthopedicTests?: Record<string, unknown>;
    painScale?: Record<string, unknown>;
  }>;
}

const PII_FIELDS = [
  'patient.name',
  'patient.email',
  'patient.phone',
  'patient.emergencyContact',
] as const;

const FIELDS_TO_REMOVE = [
  'patient.email',
  'patient.phone',
  'patient.emergencyContact',
];

@Injectable()
export class AnonymizerService {
  private readonly logger = new Logger(AnonymizerService.name);

  anonymize(caseData: ClinicalCaseWithPatient): AnonymizedResult {
    const mapping: AnonymizationMapping = {};
    const anonymizedData = this.deepClone(caseData);

    if (anonymizedData.patient?.name) {
      mapping['[PATIENT]'] = anonymizedData.patient.name;
      anonymizedData.patient.name = '[PATIENT]';
    }

    if (anonymizedData.patient?.birthDate) {
      const age = this.calculateAge(new Date(anonymizedData.patient.birthDate));
      mapping[`[AGE] años`] = anonymizedData.patient.birthDate.toString();
      (anonymizedData.patient as Record<string, unknown>).birthDate =
        `[AGE] años (${age})`;
    }

    for (const field of FIELDS_TO_REMOVE) {
      this.removeField(
        anonymizedData as unknown as Record<string, unknown>,
        field,
      );
    }

    const text = this.formatCaseAsText(anonymizedData);

    this.logger.log('Anonymization applied to clinical case');

    return {
      text,
      data: anonymizedData as unknown as Record<string, unknown>,
      mapping,
    };
  }

  rehydrate(text: string, mapping: AnonymizationMapping): string {
    let result = text;

    for (const [placeholder, original] of Object.entries(mapping)) {
      const escapedPlaceholder = placeholder.replace(
        /[.*+?^${}()|[\]\\]/g,
        '\\$&',
      );
      result = result.replace(new RegExp(escapedPlaceholder, 'g'), original);
    }

    return result;
  }

  private calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    if (age < 0 || age > 150) {
      return 0;
    }

    return age;
  }

  private deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }

  private removeField(obj: Record<string, unknown>, path: string): void {
    const parts = path.split('.');
    let current: Record<string, unknown> = obj;

    for (let i = 0; i < parts.length - 1; i++) {
      if (current[parts[i]] === undefined || current[parts[i]] === null) {
        return;
      }
      current = current[parts[i]] as Record<string, unknown>;
    }

    const lastKey = parts[parts.length - 1];
    if (current && lastKey in current) {
      delete current[lastKey];
    }
  }

  private formatCaseAsText(caseData: ClinicalCaseWithPatient): string {
    const lines: string[] = [];

    lines.push(`## Información del Caso`);
    lines.push(`- Título: ${caseData.title}`);
    lines.push(`- Motivo de consulta: ${caseData.consultationReason}`);

    if (caseData.initialMedicalDiagnosis) {
      lines.push(
        `- Diagnóstico médico inicial: ${caseData.initialMedicalDiagnosis}`,
      );
    }

    lines.push('');
    lines.push(`## Información del Paciente`);
    lines.push(`- Paciente: ${caseData.patient.name}`);

    const birthDateStr = caseData.patient.birthDate as unknown as string;
    if (birthDateStr) {
      lines.push(`- Edad: ${birthDateStr}`);
    }

    if (caseData.patient.gender) {
      lines.push(`- Género: ${caseData.patient.gender}`);
    }

    if (caseData.patient.occupation) {
      lines.push(`- Ocupación: ${caseData.patient.occupation}`);
    }

    if (caseData.pharmacologicalHistory) {
      lines.push('');
      lines.push(`## Historia Farmacológica`);
      lines.push(caseData.pharmacologicalHistory);
    }

    if (caseData.pathologicalHistory) {
      lines.push('');
      lines.push(`## Historia Patológica`);
      lines.push(JSON.stringify(caseData.pathologicalHistory, null, 2));
    }

    if (caseData.evaluations && caseData.evaluations.length > 0) {
      lines.push('');
      lines.push(`## Evaluaciones`);
      for (const evaluation of caseData.evaluations) {
        if (evaluation.diagnosis) {
          lines.push(`### Diagnóstico`);
          lines.push(JSON.stringify(evaluation.diagnosis, null, 2));
        }
        if (evaluation.painScale) {
          lines.push(`### Escala de Dolor`);
          lines.push(JSON.stringify(evaluation.painScale, null, 2));
        }
      }
    }

    return lines.join('\n');
  }
}

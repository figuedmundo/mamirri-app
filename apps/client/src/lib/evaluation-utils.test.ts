import { describe, expect, it } from 'vitest';
import { getActiveEvaluation, getCaseEvaluations } from './evaluation-utils';
import type { ClinicalCase, Evaluation } from '../types/patient';

const createEvaluation = (id: string): Evaluation =>
  ({ id, date: '2026-02-26' }) as unknown as Evaluation;

const createCase = (overrides: Partial<ClinicalCase>): ClinicalCase =>
  ({
    id: 'case-1',
    patientId: 'patient-1',
    title: 'Case',
    status: 'active',
    startDate: '2026-02-26',
    consultationReason: '',
    treatmentPlan: {} as ClinicalCase['treatmentPlan'],
    treatmentSessions: [],
    ...overrides,
  }) as ClinicalCase;

describe('evaluation-utils', () => {
  it('returns singular evaluation as active', () => {
    const evaluation = createEvaluation('eval-1');
    const clinicalCase = createCase({ evaluation });

    expect(getActiveEvaluation(clinicalCase)?.id).toBe('eval-1');
  });

  it('falls back to array for legacy payloads', () => {
    const evaluation = createEvaluation('eval-legacy');
    const clinicalCase = createCase({ evaluations: [evaluation] });

    expect(getActiveEvaluation(clinicalCase)?.id).toBe('eval-legacy');
  });

  it('returns normalized single-item array for singular model', () => {
    const evaluation = createEvaluation('eval-1');
    const clinicalCase = createCase({ evaluation });

    expect(getCaseEvaluations(clinicalCase)).toHaveLength(1);
    expect(getCaseEvaluations(clinicalCase)[0].id).toBe('eval-1');
  });

  it('returns empty list when no evaluation exists', () => {
    const clinicalCase = createCase({ evaluation: undefined, evaluations: [] });

    expect(getCaseEvaluations(clinicalCase)).toEqual([]);
    expect(getActiveEvaluation(clinicalCase)).toBeUndefined();
  });
});

import type { ClinicalCase, Evaluation } from '../types/patient';

export function getActiveEvaluation(
  clinicalCase: ClinicalCase,
): Evaluation | undefined {
  if (clinicalCase.evaluation) {
    return clinicalCase.evaluation;
  }

  if (clinicalCase.evaluations && clinicalCase.evaluations.length > 0) {
    return clinicalCase.evaluations[0];
  }

  return undefined;
}

export function getCaseEvaluations(clinicalCase: ClinicalCase): Evaluation[] {
  if (clinicalCase.evaluation) {
    return [clinicalCase.evaluation];
  }

  return clinicalCase.evaluations ?? [];
}

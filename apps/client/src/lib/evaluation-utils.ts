import type { ClinicalCase, Evaluation } from '../types/patient';

/**
 * Get the initial evaluation from a clinical case.
 * Falls back to first evaluation if no INITIAL type found.
 */
export function getInitialEvaluation(
  clinicalCase: ClinicalCase,
): Evaluation | undefined {
  if (!clinicalCase.evaluations || clinicalCase.evaluations.length === 0) {
    return undefined;
  }
  return (
    clinicalCase.evaluations.find((e) => e.type === 'INITIAL') ||
    clinicalCase.evaluations[0]
  );
}

/**
 * Get the final evaluation from a clinical case.
 */
export function getFinalEvaluation(
  clinicalCase: ClinicalCase,
): Evaluation | undefined {
  if (!clinicalCase.evaluations) return undefined;
  return clinicalCase.evaluations.find((e) => e.type === 'FINAL');
}

/**
 * Get the most recent evaluation from a clinical case.
 */
export function getLatestEvaluation(
  clinicalCase: ClinicalCase,
): Evaluation | undefined {
  if (!clinicalCase.evaluations || clinicalCase.evaluations.length === 0) {
    return undefined;
  }
  return [...clinicalCase.evaluations].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )[0];
}

/**
 * Get the active/working evaluation (latest or initial if none).
 */
export function getActiveEvaluation(
  clinicalCase: ClinicalCase,
): Evaluation | undefined {
  return (
    getLatestEvaluation(clinicalCase) || getInitialEvaluation(clinicalCase)
  );
}

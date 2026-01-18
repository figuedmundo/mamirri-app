import { describe, it, expect } from 'vitest';
import {
  getInitialEvaluation,
  getFinalEvaluation,
  getLatestEvaluation,
  getActiveEvaluation,
  canCreateEvaluationOfType,
} from './evaluation-utils';
import type { ClinicalCase, Evaluation } from '../types/patient';
import { EvaluationType } from '../types/patient';

describe('evaluation-utils', () => {
  const createCase = (evaluations: Evaluation[] | undefined): ClinicalCase =>
    ({
      id: 'case-1',
      evaluations,
    }) as unknown as ClinicalCase;

  const createEvaluation = (
    id: string,
    type: 'INITIAL' | 'FINAL' | 'PROGRESS',
    date: string,
  ): Evaluation =>
    ({
      id,
      type,
      date,
    }) as unknown as Evaluation;

  describe('getInitialEvaluation', () => {
    it('returns evaluation with INITIAL type', () => {
      const initial = createEvaluation('1', 'INITIAL', '2024-01-01');
      const final = createEvaluation('2', 'FINAL', '2024-02-01');
      const clinicalCase = createCase([final, initial]);

      expect(getInitialEvaluation(clinicalCase)).toBe(initial);
    });

    it('falls back to first evaluation if no INITIAL type exists', () => {
      const prog1 = createEvaluation('1', 'PROGRESS', '2024-01-01');
      const prog2 = createEvaluation('2', 'PROGRESS', '2024-01-02');
      const clinicalCase = createCase([prog1, prog2]);

      expect(getInitialEvaluation(clinicalCase)).toBe(prog1);
    });

    it('returns undefined for empty evaluations', () => {
      const clinicalCase = createCase([]);
      expect(getInitialEvaluation(clinicalCase)).toBeUndefined();
    });

    it('returns undefined for undefined evaluations', () => {
      const clinicalCase = createCase(undefined);
      expect(getInitialEvaluation(clinicalCase)).toBeUndefined();
    });
  });

  describe('getFinalEvaluation', () => {
    it('returns evaluation with FINAL type', () => {
      const initial = createEvaluation('1', 'INITIAL', '2024-01-01');
      const final = createEvaluation('2', 'FINAL', '2024-02-01');
      const clinicalCase = createCase([initial, final]);

      expect(getFinalEvaluation(clinicalCase)).toBe(final);
    });

    it('returns undefined if no FINAL type exists', () => {
      const initial = createEvaluation('1', 'INITIAL', '2024-01-01');
      const clinicalCase = createCase([initial]);

      expect(getFinalEvaluation(clinicalCase)).toBeUndefined();
    });

    it('returns undefined for empty evaluations', () => {
      const clinicalCase = createCase([]);
      expect(getFinalEvaluation(clinicalCase)).toBeUndefined();
    });

    it('returns undefined for undefined evaluations', () => {
      const clinicalCase = createCase(undefined);
      expect(getFinalEvaluation(clinicalCase)).toBeUndefined();
    });
  });

  describe('getLatestEvaluation', () => {
    it('returns evaluation with most recent date', () => {
      const oldEval = createEvaluation('1', 'INITIAL', '2024-01-01');
      const newEval = createEvaluation('2', 'PROGRESS', '2024-03-01');
      const midEval = createEvaluation('3', 'PROGRESS', '2024-02-01');

      const clinicalCase = createCase([oldEval, newEval, midEval]);

      expect(getLatestEvaluation(clinicalCase)).toBe(newEval);
    });

    it('returns undefined for empty evaluations', () => {
      const clinicalCase = createCase([]);
      expect(getLatestEvaluation(clinicalCase)).toBeUndefined();
    });

    it('returns stable sort result for identical dates', () => {
      const eval1 = createEvaluation('1', 'PROGRESS', '2024-01-01');
      const eval2 = createEvaluation('2', 'PROGRESS', '2024-01-01');

      const clinicalCase = createCase([eval1, eval2]);

      expect(getLatestEvaluation(clinicalCase)).toBe(eval1);
    });
  });

  describe('getActiveEvaluation', () => {
    it('returns latest evaluation if available', () => {
      const initial = createEvaluation('1', 'INITIAL', '2024-01-01');
      const progress = createEvaluation('2', 'PROGRESS', '2024-02-01');
      const clinicalCase = createCase([initial, progress]);

      expect(getActiveEvaluation(clinicalCase)).toBe(progress);
    });

    it('falls back to initial evaluation logic if no latest', () => {
      // This case technically overlaps with latest since latest covers all non-empty arrays,
      // but ensures the fallback chain works for robustness.
      const initial = createEvaluation('1', 'INITIAL', '2024-01-01');
      const clinicalCase = createCase([initial]);

      expect(getActiveEvaluation(clinicalCase)).toBe(initial);
    });

    it('returns undefined for empty evaluations', () => {
      const clinicalCase = createCase([]);
      expect(getActiveEvaluation(clinicalCase)).toBeUndefined();
    });

    it('handles single item fallback explicitly', () => {
      const singleEval = createEvaluation('1', 'PROGRESS', '2024-01-01');
      const clinicalCase = createCase([singleEval]);
      expect(getActiveEvaluation(clinicalCase)).toBe(singleEval);
    });
  });

  describe('canCreateEvaluationOfType', () => {
    it('returns true when no evaluations exist', () => {
      const clinicalCase = createCase([]);
      expect(
        canCreateEvaluationOfType(clinicalCase, EvaluationType.INITIAL),
      ).toEqual({ canCreate: true });
    });

    it('returns true when evaluations is undefined', () => {
      const clinicalCase = createCase(undefined);
      expect(
        canCreateEvaluationOfType(clinicalCase, EvaluationType.INITIAL),
      ).toEqual({ canCreate: true });
    });

    it('returns false + message when duplicate INITIAL blocked', () => {
      const initial = createEvaluation('1', 'INITIAL', '2024-01-01');
      const clinicalCase = createCase([initial]);
      const result = canCreateEvaluationOfType(
        clinicalCase,
        EvaluationType.INITIAL,
      );
      expect(result.canCreate).toBe(false);
      expect(result.message).toContain('Ya existe una Evaluación Inicial');
    });

    it('returns false + message when duplicate FINAL blocked', () => {
      const final = createEvaluation('1', 'FINAL', '2024-01-01');
      const clinicalCase = createCase([final]);
      const result = canCreateEvaluationOfType(
        clinicalCase,
        EvaluationType.FINAL,
      );
      expect(result.canCreate).toBe(false);
      expect(result.message).toContain('Ya existe una Evaluación Final');
    });

    it('returns true for PROGRESS regardless of existing evaluations', () => {
      const initial = createEvaluation('1', 'INITIAL', '2024-01-01');
      const final = createEvaluation('2', 'FINAL', '2024-02-01');
      const progress = createEvaluation('3', 'PROGRESS', '2024-01-15');
      const clinicalCase = createCase([initial, final, progress]);

      expect(
        canCreateEvaluationOfType(clinicalCase, EvaluationType.PROGRESS),
      ).toEqual({ canCreate: true });
    });
  });
});

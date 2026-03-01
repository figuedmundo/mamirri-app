import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { EvaluationForm } from './EvaluationForm';
import type { ClinicalCase } from '../../types/patient';

vi.mock('./VoiceRecorder', () => ({
  VoiceRecorder: () => <div data-testid="voice-recorder">Voice Recorder</div>,
}));

vi.mock('../../hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

const mockClinicalCase = {
  id: 'case-123',
  patientId: 'patient-123',
  title: 'Test Case',
  status: 'active',
  startDate: '2023-01-01',
  consultationReason: 'Pain',
  evaluation: {
    id: 'eval-1',
    clinicalCaseId: 'case-123',
    date: '2023-01-01',
    posturogram: {},
    orthopedicTests: {
      thomas: { result: 0, interpretation: '' },
      ely: { result: 0, interpretation: '' },
      ober: { result: 0, interpretation: '' },
      schober: { result: 0, interpretation: '' },
    },
    avdEvaluation: {
      barthel: {
        feeding: 0,
        bathing: 0,
        grooming: 0,
        dressing: 0,
        bowels: 0,
        bladder: 0,
        toiletUse: 0,
        transfers: 0,
        mobility: 0,
        stairs: 0,
        total: 0,
        interpretation: '',
      },
      lawton: {
        phoneUse: 0,
        shopping: 0,
        foodPreparation: 0,
        housekeeping: 0,
        laundry: 0,
        transportation: 0,
        medication: 0,
        finances: 0,
        total: 0,
        interpretation: '',
      },
    },
    painScale: { activity: 0, rest: 0, palpation: 0, type: 'chronic' },
    diagnosis: {
      functionalIndicator: '',
      clinicalAspect: '',
      anatomopathology: '',
      avdConsequences: '',
    },
    footprints: [],
    postureVideos: [],
    voiceNotes: [],
  },
  evaluations: [],
  treatmentPlan: {
    id: 'plan-123',
    clinicalCaseId: 'case-123',
    createdAt: '2023-01-01',
    objectives: { therapeutic: '', prophylactic: '', educational: '' },
    phases: [],
  },
  treatmentSessions: [],
} as unknown as ClinicalCase;

describe('EvaluationForm SOAP', () => {
  it('renders SOAP navigation', () => {
    render(<EvaluationForm clinicalCase={mockClinicalCase} />);

    expect(screen.getByText('S - Subjetivo')).toBeInTheDocument();
    expect(screen.getByText('O - Objetivo')).toBeInTheDocument();
    expect(screen.getByText('A - Analisis')).toBeInTheDocument();
    expect(screen.getByText('P - Plan')).toBeInTheDocument();
  });

  it('shows plan guard message when diagnosis is empty', () => {
    render(<EvaluationForm clinicalCase={mockClinicalCase} />);

    fireEvent.click(screen.getByText('P - Plan'));
    expect(
      screen.getByText(
        /Completa el diagnostico en Analisis para poder definir el plan de tratamiento/i,
      ),
    ).toBeInTheDocument();
  });
});

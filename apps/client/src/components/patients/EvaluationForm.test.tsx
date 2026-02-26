import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { EvaluationForm } from './EvaluationForm';
import type { ClinicalCase, Evaluation } from '../../types/patient';

vi.mock('./VoiceRecorder', () => ({
  VoiceRecorder: () => <div data-testid="voice-recorder">Voice Recorder</div>,
}));

vi.mock('../../hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

const mockEvaluation: Evaluation = {
  id: 'eval-1',
  clinicalCaseId: 'case-1',
  date: '2026-02-26',
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
  painScale: {
    activity: 1,
    rest: 2,
    palpation: 3,
    type: 'chronic',
  },
  diagnosis: {
    functionalIndicator: '',
    clinicalAspect: '',
    anatomopathology: '',
    avdConsequences: '',
  },
  footprints: [],
  postureVideos: [],
};

const mockClinicalCase: ClinicalCase = {
  id: 'case-1',
  patientId: 'patient-1',
  title: 'Test Case',
  status: 'active',
  startDate: '2026-02-26',
  consultationReason: 'Test',
  evaluation: mockEvaluation,
  evaluations: [mockEvaluation],
  treatmentPlan: {
    id: 'plan-1',
    clinicalCaseId: 'case-1',
    createdAt: '2026-02-26',
    objectives: { therapeutic: '', prophylactic: '', educational: '' },
    phases: [],
  },
  treatmentSessions: [],
};

describe('EvaluationForm SOAP', () => {
  it('renders SOAP tabs', () => {
    render(<EvaluationForm clinicalCase={mockClinicalCase} />);

    expect(screen.getByText('S - Subjective')).toBeInTheDocument();
    expect(screen.getByText('O - Objective')).toBeInTheDocument();
    expect(screen.getByText('A - Assessment')).toBeInTheDocument();
    expect(screen.getByText('P - Plan')).toBeInTheDocument();
  });

  it('renders voice recorder in Subjective section', () => {
    render(<EvaluationForm clinicalCase={mockClinicalCase} />);

    expect(screen.getByTestId('voice-recorder')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Motivo de consulta, historia y síntomas'),
    ).toBeInTheDocument();
  });

  it('shows objective section and allows adding tests', () => {
    render(<EvaluationForm clinicalCase={mockClinicalCase} />);

    fireEvent.click(screen.getByText('O - Objective'));
    expect(screen.getByText('Escala de dolor')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('Buscar prueba'), {
      target: { value: 'Thomas' },
    });
    fireEvent.click(screen.getByText('+ Thomas'));

    expect(screen.getByText('Thomas')).toBeInTheDocument();
    expect(screen.getByText('Quitar')).toBeInTheDocument();
  });

  it('calls onPainScaleChange when objective slider changes', async () => {
    const onPainScaleChange = vi.fn();
    render(
      <EvaluationForm
        clinicalCase={mockClinicalCase}
        onPainScaleChange={onPainScaleChange}
      />,
    );

    fireEvent.click(screen.getByText('O - Objective'));
    const sliders = screen.getAllByRole('slider');
    fireEvent.change(sliders[0], { target: { value: '8' } });

    await waitFor(() => expect(onPainScaleChange).toHaveBeenCalled());
  });

  it('calls onSave with updated diagnosis', async () => {
    const onSave = vi.fn();
    render(<EvaluationForm clinicalCase={mockClinicalCase} onSave={onSave} />);

    fireEvent.click(screen.getByText('A - Assessment'));
    fireEvent.change(screen.getByPlaceholderText('Indicador funcional'), {
      target: { value: 'Dolor mandibular' },
    });

    fireEvent.click(screen.getByText('Guardar Evaluación'));

    await waitFor(() => expect(onSave).toHaveBeenCalled());
    const payload = onSave.mock.calls[0][0] as Evaluation;
    expect(payload.diagnosis.functionalIndicator).toBe('Dolor mandibular');
  });
});

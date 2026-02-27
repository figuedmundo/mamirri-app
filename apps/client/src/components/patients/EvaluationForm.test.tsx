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

    expect(screen.getByText('Evaluación SOAP')).toBeInTheDocument();
    expect(screen.getByText(/Caso:\s*Test Case/)).toBeInTheDocument();
    expect(screen.getByText('S - Subjetivo')).toBeInTheDocument();
    expect(screen.getByText('O - Objetivo')).toBeInTheDocument();
    expect(screen.getByText('A - Analisis')).toBeInTheDocument();
    expect(screen.getByText('P - Plan')).toBeInTheDocument();
  });

  it('renders voice recorder in Subjective section', () => {
    render(<EvaluationForm clinicalCase={mockClinicalCase} />);

    expect(screen.getByTestId('voice-recorder')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Motivo de consulta, historia y síntomas'),
    ).toBeInTheDocument();
  });

  it('persists subjective text inside diagnosis on manual save', async () => {
    const onSave = vi.fn();
    render(<EvaluationForm clinicalCase={mockClinicalCase} onSave={onSave} />);

    fireEvent.change(
      screen.getByPlaceholderText('Motivo de consulta, historia y síntomas'),
      {
        target: { value: 'Paciente refiere dolor mandibular al despertar' },
      },
    );
    fireEvent.click(screen.getByText('Guardar Evaluación'));

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    const payload = onSave.mock.calls[0][0] as Evaluation;
    expect(payload.diagnosis.subjective).toBe(
      'Paciente refiere dolor mandibular al despertar',
    );
  });

  it('does a silent save on unmount when there are unsaved changes', async () => {
    const onSave = vi.fn();
    const { unmount } = render(
      <EvaluationForm clinicalCase={mockClinicalCase} onSave={onSave} />,
    );

    fireEvent.change(
      screen.getByPlaceholderText('Motivo de consulta, historia y síntomas'),
      {
        target: { value: 'Texto pendiente antes de salir de la vista' },
      },
    );

    unmount();

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    const payload = onSave.mock.calls[0][0] as Evaluation;
    expect(payload.diagnosis.subjective).toBe(
      'Texto pendiente antes de salir de la vista',
    );
    expect(onSave.mock.calls[0][1]).toEqual({ silent: true });
  });

  it('shows objective section and allows adding tests', () => {
    render(<EvaluationForm clinicalCase={mockClinicalCase} />);

    fireEvent.click(screen.getByText('O - Objetivo'));
    expect(screen.getByText('Escala de dolor')).toBeInTheDocument();
    expect(screen.getByText('Actividad: 1/10')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('Buscar prueba'), {
      target: { value: 'Thomas' },
    });
    fireEvent.click(screen.getByText('+ Thomas'));

    expect(screen.getByText('Thomas')).toBeInTheDocument();
    expect(screen.getByText('Quitar')).toBeInTheDocument();
  });

  it('updates objective slider value locally without triggering external save callback', async () => {
    const onSave = vi.fn();
    render(<EvaluationForm clinicalCase={mockClinicalCase} onSave={onSave} />);

    fireEvent.click(screen.getByText('O - Objetivo'));
    const sliders = screen.getAllByRole('slider');
    fireEvent.change(sliders[0], { target: { value: '8' } });

    await waitFor(() =>
      expect((sliders[0] as HTMLInputElement).value).toBe('8'),
    );
    expect(onSave).not.toHaveBeenCalled();
  });

  it('calls onSave with updated diagnosis', async () => {
    const onSave = vi.fn();
    render(<EvaluationForm clinicalCase={mockClinicalCase} onSave={onSave} />);

    fireEvent.click(screen.getByText('A - Analisis'));
    fireEvent.change(screen.getByPlaceholderText('Indicador funcional'), {
      target: { value: 'Dolor mandibular' },
    });

    fireEvent.click(screen.getByText('Guardar Evaluación'));

    await waitFor(() => expect(onSave).toHaveBeenCalled());
    const payload = onSave.mock.calls[0][0] as Evaluation;
    expect(payload.diagnosis.functionalIndicator).toBe('Dolor mandibular');
  });

  it('shows plan guard and allows quick navigation to Analisis', () => {
    render(<EvaluationForm clinicalCase={mockClinicalCase} />);

    fireEvent.click(screen.getByText('P - Plan'));
    expect(
      screen.getByText(
        /Completa el diagnostico en Analisis para poder definir el plan de tratamiento/i,
      ),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByText('Ir a Analisis'));
    expect(screen.getByText('Analisis')).toBeInTheDocument();
  });

  it('renders editable plan fields when diagnosis exists', () => {
    const evaluationWithDiagnosis: Evaluation = {
      ...mockEvaluation,
      diagnosis: {
        ...mockEvaluation.diagnosis,
        functionalIndicator: 'Dolor lumbar',
      },
    };

    const caseWithDiagnosis: ClinicalCase = {
      ...mockClinicalCase,
      evaluation: evaluationWithDiagnosis,
      evaluations: [evaluationWithDiagnosis],
    };

    render(<EvaluationForm clinicalCase={caseWithDiagnosis} />);
    fireEvent.click(screen.getByText('P - Plan'));

    expect(screen.getByText('Intervenciones planificadas')).toBeInTheDocument();
    expect(screen.getByText('Frecuencia y duracion')).toBeInTheDocument();
    expect(screen.getByText('Ejercicios para casa')).toBeInTheDocument();
    expect(screen.getByText('Proxima cita')).toBeInTheDocument();
    expect(screen.getByText('Notas adicionales')).toBeInTheDocument();
  });

  it('calls timeline navigation callback from Plan tab', () => {
    const evaluationWithDiagnosis: Evaluation = {
      ...mockEvaluation,
      diagnosis: {
        ...mockEvaluation.diagnosis,
        functionalIndicator: 'Dolor lumbar',
      },
    };
    const caseWithDiagnosis: ClinicalCase = {
      ...mockClinicalCase,
      evaluation: evaluationWithDiagnosis,
      evaluations: [evaluationWithDiagnosis],
    };
    const onNavigateToTimeline = vi.fn();

    render(
      <EvaluationForm
        clinicalCase={caseWithDiagnosis}
        onNavigateToTimeline={onNavigateToTimeline}
      />,
    );
    fireEvent.click(screen.getByText('P - Plan'));
    fireEvent.click(screen.getByText('Ver cronograma de tratamiento →'));

    expect(onNavigateToTimeline).toHaveBeenCalledTimes(1);
  });
});

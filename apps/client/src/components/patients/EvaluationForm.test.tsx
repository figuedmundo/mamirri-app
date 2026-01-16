import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { EvaluationForm } from './EvaluationForm';
import type { ClinicalCase, Evaluation } from '../../types/patient';

// Mock child components to simplify testing
vi.mock('./BodySilhouette', () => ({
  BodySilhouette: ({ onChange }: { onChange: any }) => (
    <div
      data-testid="body-silhouette"
      onClick={() => onChange('head', { deviation: 'test', severity: 'mild' })}
    >
      Body Silhouette
    </div>
  ),
}));

vi.mock('./VoiceRecorder', () => ({
  VoiceRecorder: () => <div data-testid="voice-recorder">Voice Recorder</div>,
}));

// Mock hooks
const mockMarkDirty = vi.fn();
const mockMarkClean = vi.fn();

vi.mock('../../hooks/use-unsaved-changes', () => ({
  useUnsavedChanges: () => ({
    isDirty: true, // Force dirty to enable save button for testing
    markDirty: mockMarkDirty,
    markClean: mockMarkClean,
  }),
}));

vi.mock('../../hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

const mockEvaluation: Evaluation = {
  id: 'eval-1',
  clinicalCaseId: 'case-1',
  date: '2023-01-01',
  posturogram: {
    head: { deviation: 'normal', severity: 'normal' },
    shoulders: { deviation: 'normal', severity: 'normal' },
  },
  orthopedicTests: {
    thomas: { result: 1, interpretation: 'Normal' },
    ely: { result: 1, interpretation: 'Normal' },
    ober: { result: 1, interpretation: 'Normal' },
    schober: { result: 1, interpretation: 'Normal' },
  },
  avdEvaluation: {
    barthel: {
      feeding: 10,
      bathing: 5,
      grooming: 5,
      dressing: 10,
      bowels: 10,
      bladder: 10,
      toiletUse: 10,
      transfers: 15,
      mobility: 15,
      stairs: 10,
      total: 100,
      interpretation: 'Independiente',
    },
    lawton: {
      phoneUse: 1,
      shopping: 1,
      foodPreparation: 1,
      housekeeping: 1,
      laundry: 1,
      transportation: 1,
      medication: 1,
      finances: 1,
      total: 8,
      interpretation: 'Independiente',
    },
  },
  painScale: {
    activity: 5,
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
  startDate: '2023-01-01',
  consultationReason: 'Test',
  evaluation: mockEvaluation,
  treatmentPlan: {
    id: 'plan-1',
    clinicalCaseId: 'case-1',
    createdAt: '2023-01-01',
    objectives: { therapeutic: '', prophylactic: '', educational: '' },
    phases: [],
  },
  treatmentSessions: [],
};

describe('EvaluationForm', () => {
  it('calls onPosturogramChange when posturogram data changes', async () => {
    const onPosturogramChange = vi.fn();
    render(
      <EvaluationForm
        clinicalCase={mockClinicalCase}
        onPosturogramChange={onPosturogramChange}
      />,
    );

    // Simulate change in BodySilhouette
    const silhouette = screen.getByTestId('body-silhouette');
    fireEvent.click(silhouette);

    // Wait for debounce
    await waitFor(
      () => {
        expect(onPosturogramChange).toHaveBeenCalled();
      },
      { timeout: 1000 },
    );
  });

  it('calls onPainScaleChange when pain scale data changes', async () => {
    const onPainScaleChange = vi.fn();
    render(
      <EvaluationForm
        clinicalCase={mockClinicalCase}
        onPainScaleChange={onPainScaleChange}
      />,
    );

    // Switch to Pain section
    const painTab = screen.getByText('Escala de Dolor');
    fireEvent.click(painTab);

    // Change pain value
    const activitySlider = screen.getByLabelText(/Durante actividad/i);
    fireEvent.change(activitySlider, { target: { value: '8' } });

    // Wait for debounce
    await waitFor(
      () => {
        expect(onPainScaleChange).toHaveBeenCalled();
      },
      { timeout: 1000 },
    );
  });

  it('calls onSave when save button is clicked', async () => {
    const onSave = vi.fn();
    render(<EvaluationForm clinicalCase={mockClinicalCase} onSave={onSave} />);

    const saveButton = screen.getByText('Guardar Evaluación');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(onSave).toHaveBeenCalled();
    });
  });
});

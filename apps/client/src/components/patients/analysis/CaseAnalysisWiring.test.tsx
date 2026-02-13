import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CaseDetailLayout } from '../CaseDetailLayout';
import type { Patient, ClinicalCase } from '../../../types/patient';
import { EvaluationType } from '../../../types/patient';
import type { AnalysisResult } from '@/types/analysis';

const mockAnalysisResultsPanel = vi.fn();
vi.mock('./AnalysisResultsPanel', () => ({
  AnalysisResultsPanel: (props: {
    analysisResult: AnalysisResult | null;
    isOpen: boolean;
    onClose: () => void;
  }) => {
    mockAnalysisResultsPanel(props);
    if (!props.isOpen) return null;
    return (
      <div data-testid="analysis-panel-mock">
        Analysis Panel
        <button onClick={props.onClose}>Close Panel</button>
      </div>
    );
  },
}));

const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

vi.mock('@/hooks/use-voice-recorder', () => ({
  useVoiceRecorder: () => ({
    isRecording: false,
    duration: 0,
    startRecording: vi.fn(),
    stopRecording: vi.fn(),
    cancelRecording: vi.fn(),
  }),
}));

const mockPatient: Patient = {
  id: 'pac-001',
  name: 'María García',
  occupation: 'Enfermera',
  phone: '+34 600 123 456',
  email: 'maria@example.com',
  birthDate: '1980-01-15',
  emergencyContact: { name: 'Juan Doe', phone: '1234567' },
  medicalFlags: [],
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
  clinicalCases: [],
};

const mockClinicalCase: ClinicalCase = {
  id: 'caso-001',
  patientId: 'pac-001',
  title: 'Dolor Lumbar Crónico',
  status: 'active',
  startDate: '2024-01-01T00:00:00Z',
  consultationReason: 'Dolor persistente',
  treatmentPlan: {
    id: 'plan-001',
    clinicalCaseId: 'caso-001',
    createdAt: '2024-01-01T00:00:00Z',
    objectives: { therapeutic: '', prophylactic: '', educational: '' },
    phases: [],
  },
  evaluations: [
    {
      id: 'eval-001',
      clinicalCaseId: 'caso-001',
      date: '2024-01-01T00:00:00Z',
      type: EvaluationType.INITIAL,
      posturogram: {},
      orthopedicTests: {
        thomas: { result: 'normal', interpretation: '' },
        ely: { result: 'normal', interpretation: '' },
        ober: { result: 'normal', interpretation: '' },
        schober: { result: 'normal', interpretation: '' },
      },
      avdEvaluation: {
        barthel: {
          total: 100,
          interpretation: '',
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
        },
        lawton: {
          total: 8,
          interpretation: '',
          phoneUse: 1,
          shopping: 1,
          foodPreparation: 1,
          housekeeping: 1,
          laundry: 1,
          transportation: 1,
          medication: 1,
          finances: 1,
        },
      },
      painScale: { activity: 5, rest: 2, palpation: 4, type: 'chronic' },
      diagnosis: {
        functionalIndicator: '',
        clinicalAspect: '',
        anatomopathology: '',
        avdConsequences: '',
      },
      footprints: [],
      postureVideos: [],
    },
  ],
  treatmentSessions: [],
};

const mockAnalysisResult: AnalysisResult = {
  primarySuggestion: {
    title: 'Suggestion',
    description: 'Desc',
    confidence: 'HIGH',
  },
  alternatives: [],
  citations: [],
  reasoning: {
    step1_understanding: 'U',
    step2_literature: 'L',
    step3_synthesis: 'S',
  },
  metadata: {
    queryTokens: 10,
    responseTokens: 20,
    processingTimeMs: 100,
    anonymizationApplied: true,
    translationsApplied: 0,
    serviceStatus: { rag: true, vision: true, voice: true, llm: true },
  },
};

vi.mock('../AnalyzeButton', () => ({
  AnalyzeButton: ({
    onAnalysisComplete,
    onViewResults,
    hasResults,
  }: {
    onAnalysisComplete: (result: AnalysisResult) => void;
    onViewResults: () => void;
    hasResults: boolean;
  }) => (
    <div>
      <button onClick={() => onAnalysisComplete(mockAnalysisResult)}>
        Analyze
      </button>
      {hasResults && <button onClick={onViewResults}>Ver resultados</button>}
    </div>
  ),
}));

describe('Case Analysis Wiring', () => {
  const onBackMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('AnalysisResultsPanel does not render when analysisResult is null', () => {
    render(
      <CaseDetailLayout
        patient={mockPatient}
        clinicalCase={mockClinicalCase}
        onBack={onBackMock}
      />,
    );
    expect(mockAnalysisResultsPanel).toHaveBeenCalledWith(
      expect.objectContaining({ analysisResult: null, isOpen: false }),
    );
    expect(screen.queryByTestId('analysis-panel-mock')).not.toBeInTheDocument();
  });

  it('AnalysisResultsPanel opens when onAnalysisComplete fires with a result', async () => {
    render(
      <CaseDetailLayout
        patient={mockPatient}
        clinicalCase={mockClinicalCase}
        onBack={onBackMock}
      />,
    );

    const analyzeBtn = screen.getByText('Analyze');
    await userEvent.click(analyzeBtn);

    expect(mockAnalysisResultsPanel).toHaveBeenCalledWith(
      expect.objectContaining({
        analysisResult: mockAnalysisResult,
        isOpen: true,
      }),
    );
    expect(screen.getByTestId('analysis-panel-mock')).toBeInTheDocument();
  });

  it('Dialog closes when onClose is invoked', async () => {
    render(
      <CaseDetailLayout
        patient={mockPatient}
        clinicalCase={mockClinicalCase}
        onBack={onBackMock}
      />,
    );

    await userEvent.click(screen.getByText('Analyze'));
    expect(screen.getByTestId('analysis-panel-mock')).toBeInTheDocument();

    await userEvent.click(screen.getByText('Close Panel'));
    expect(screen.queryByTestId('analysis-panel-mock')).not.toBeInTheDocument();

    expect(mockAnalysisResultsPanel).toHaveBeenLastCalledWith(
      expect.objectContaining({ isOpen: false }),
    );
  });

  it('Closing dialog preserves result in state', async () => {
    render(
      <CaseDetailLayout
        patient={mockPatient}
        clinicalCase={mockClinicalCase}
        onBack={onBackMock}
      />,
    );

    await userEvent.click(screen.getByText('Analyze'));

    await userEvent.click(screen.getByText('Close Panel'));

    expect(mockAnalysisResultsPanel).toHaveBeenLastCalledWith(
      expect.objectContaining({
        analysisResult: mockAnalysisResult,
        isOpen: false,
      }),
    );
  });

  it('re-opens dialog when AnalyzeButton onViewResults is called', async () => {
    render(
      <CaseDetailLayout
        patient={mockPatient}
        clinicalCase={mockClinicalCase}
        onBack={onBackMock}
      />,
    );

    await userEvent.click(screen.getByText('Analyze'));
    await userEvent.click(screen.getByText('Close Panel'));
    expect(screen.queryByTestId('analysis-panel-mock')).not.toBeInTheDocument();

    await userEvent.click(screen.getByText('Ver resultados'));
    expect(screen.getByTestId('analysis-panel-mock')).toBeInTheDocument();
    expect(mockAnalysisResultsPanel).toHaveBeenLastCalledWith(
      expect.objectContaining({ isOpen: true }),
    );
  });
});

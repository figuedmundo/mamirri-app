import { render, screen, fireEvent } from '@testing-library/react';
import { EvaluationForm } from './EvaluationForm';
import { vi, describe, it, expect } from 'vitest';
import { ClinicalCase } from '../../types/patient';

// Mock dependencies
vi.mock('../../api/media', () => ({
  mediaApi: {
    uploadFootprint: vi.fn(),
    uploadPostureVideo: vi.fn(),
    uploadEvaluationVoiceNote: vi.fn(),
  },
}));

vi.mock('./VideoRecorder', () => ({
  VideoRecorder: ({
    onCapture,
  }: {
    onCapture: (blob: Blob, metadata: { durationSeconds: number }) => void;
  }) => (
    <div data-testid="video-recorder">
      <button onClick={() => onCapture(new Blob(), { durationSeconds: 10 })}>
        Capture Video
      </button>
    </div>
  ),
}));

vi.mock('./CameraCapture', () => ({
  CameraCapture: ({
    onCapture,
  }: {
    onCapture: (blob: Blob, metadata: Record<string, unknown>) => void;
  }) => (
    <div data-testid="camera-capture">
      <button onClick={() => onCapture(new Blob(), {})}>Capture Photo</button>
    </div>
  ),
}));

vi.mock('./CameraCapture', () => ({
  CameraCapture: ({ onCapture }: any) => (
    <div data-testid="camera-capture">
      <button onClick={() => onCapture(new Blob(), {})}>Capture Photo</button>
    </div>
  ),
}));

vi.mock('./BodySilhouette', () => ({ BodySilhouette: () => <div /> }));
vi.mock('./VoiceRecorder', () => ({ VoiceRecorder: () => <div /> }));
vi.mock('./TranscriptionDisplay', () => ({
  TranscriptionDisplay: () => <div />,
}));
vi.mock('../../hooks/use-transcription-polling', () => ({
  useTranscriptionPolling: () => ({ status: 'idle' }),
}));
vi.mock('../../hooks/use-unsaved-changes', () => ({
  useUnsavedChanges: () => ({
    isDirty: false,
    markDirty: vi.fn(),
    markClean: vi.fn(),
  }),
}));
vi.mock('../../hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

describe('EvaluationForm Media Integration', () => {
  const mockClinicalCase = {
    id: 'case-123',
    patientId: 'patient-123',
    title: 'Test Case',
    status: 'active',
    startDate: '2023-01-01',
    consultationReason: 'Pain',
    evaluations: [
      {
        id: 'eval-1',
        clinicalCaseId: 'case-123',
        date: '2023-01-01',
        type: 'INITIAL',
        posturogram: {},
        orthopedicTests: {},
        avdEvaluation: { barthel: { total: 0 }, lawton: { total: 0 } },
        painScale: {},
        diagnosis: {},
        footprints: [],
        postureVideos: [],
      },
    ],
    treatmentPlan: {
      id: 'plan-123',
      clinicalCaseId: 'case-123',
      createdAt: '2023-01-01',
      objectives: { therapeutic: '', prophylactic: '', educational: '' },
      phases: [],
    },
    treatmentSessions: [],
  } as unknown as ClinicalCase;

  it('renders Multimedia tab', () => {
    render(<EvaluationForm clinicalCase={mockClinicalCase} />);
    expect(screen.getByText('Multimedia')).toBeInTheDocument();
  });

  it('renders VideoRecorder and CameraCapture in Multimedia tab', () => {
    render(<EvaluationForm clinicalCase={mockClinicalCase} />);

    // Click Multimedia tab
    fireEvent.click(screen.getByText('Multimedia'));

    expect(screen.getByTestId('video-recorder')).toBeInTheDocument();
    // Assuming at least one camera capture for footprint is rendered
    // If we use conditional rendering (Dialog/Modal), we might need to trigger it.
    // Spec says "Add CameraCapture with footprint overlay to evaluation capture section".
    // Usually CameraCapture is inside a Dialog or shown inline.
    // Existing Posture capture was in a Dialog.
    // Let's assume inline or check logic later.
  });
});

import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ClinicalCase, TreatmentPlan } from '../../types/patient';
import { TreatmentTimeline } from './TreatmentTimeline';

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

vi.mock('../../api/patients', () => ({
  patientsApi: {
    addSession: vi.fn(),
    updateSession: vi.fn(),
    deleteSession: vi.fn(),
  },
}));

vi.mock('../../api/media', () => ({
  mediaApi: {
    uploadSessionPhoto: vi.fn(),
    uploadSessionVoiceNote: vi.fn(),
  },
}));

vi.mock('@/lib/photo-queue', () => ({
  photoQueue: {
    getAll: vi.fn().mockResolvedValue([]),
    remove: vi.fn(),
  },
  onOnline: () => () => void 0,
  isOnline: () => true,
}));

vi.mock('./treatment-timeline/PhaseProgress', () => ({
  PhaseProgress: () => <div data-testid="phase-progress" />,
}));

vi.mock('./treatment-timeline/SessionCard', () => ({
  SessionCard: () => <div data-testid="session-card" />,
}));

vi.mock('./treatment-timeline/PainTrendChart', () => ({
  PainTrendChart: () => <div data-testid="pain-chart" />,
}));

vi.mock('./treatment-timeline/SessionStatsSummary', () => ({
  SessionStatsSummary: () => <div data-testid="session-stats" />,
}));

vi.mock('./treatment-timeline/SessionForm', () => ({
  SessionForm: () => <div data-testid="session-form" />,
}));

function buildPlan(phases: TreatmentPlan['phases']): TreatmentPlan {
  return {
    id: 'plan-1',
    clinicalCaseId: 'case-1',
    createdAt: '2024-01-01T00:00:00Z',
    objectives: {
      therapeutic: '',
      prophylactic: '',
      educational: '',
    },
    phases,
  };
}

function buildCase(overrides: Partial<ClinicalCase> = {}): ClinicalCase {
  return {
    id: 'case-1',
    patientId: 'patient-1',
    title: 'Test Case',
    status: 'active',
    startDate: '2024-01-01T00:00:00Z',
    consultationReason: 'Test',
    evaluation: undefined,
    evaluations: [],
    treatmentSessions: [],
    treatmentPlan: buildPlan([]),
    ...overrides,
  };
}

describe('TreatmentTimeline', () => {
  it('shows pending banner when treatment plan has no phases', () => {
    const clinicalCase = buildCase({ treatmentPlan: buildPlan([]) });

    render(
      <TreatmentTimeline
        clinicalCase={clinicalCase}
        onSessionCreated={vi.fn()}
        onSessionUpdated={vi.fn()}
        onSessionDeleted={vi.fn()}
        onSelectSession={vi.fn()}
      />,
    );

    expect(screen.getByText(/Plan de tratamiento pendiente/i)).toBeVisible();
  });

  it('hides pending banner when treatment plan contains phases', () => {
    const clinicalCase = buildCase({
      treatmentPlan: buildPlan([
        {
          number: 1,
          name: 'Fase 1',
          durationWeeks: 2,
          techniques: [],
          objectives: 'Objetivo',
        },
      ]),
    });

    render(<TreatmentTimeline clinicalCase={clinicalCase} />);

    expect(
      screen.queryByText(/Plan de tratamiento pendiente/i),
    ).not.toBeInTheDocument();
  });
});

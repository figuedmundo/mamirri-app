import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PosturogramViewer } from './PosturogramViewer';
import type { ClinicalCase } from '@/types/patient';

// Mock dependencies
vi.mock('@/hooks/use-debounce', () => ({
  useDebounce: (fn: (...args: unknown[]) => unknown) => fn, // Run immediately
}));

vi.mock('@/components/ui/BeforeAfterSlider', () => ({
  BeforeAfterSlider: ({
    labelBefore,
    labelAfter,
  }: {
    labelBefore?: string;
    labelAfter?: string;
  }) => (
    <div data-testid="before-after-slider">
      <span>{labelBefore}</span>
      <span>{labelAfter}</span>
    </div>
  ),
}));

// ResizeObserver mock
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('PosturogramViewer', () => {
  const mockClinicalCase = {
    id: 'case-123',
    title: 'Test Case',
    patientId: 'patient-123',
    status: 'active',
    startDate: '2023-01-01',
    consultationReason: 'Pain',
    treatmentSessions: [],
    treatmentPlan: {
      id: 'plan-123',
      clinicalCaseId: 'case-123',
      createdAt: '2023-01-01',
      objectives: { therapeutic: '', prophylactic: '', educational: '' },
      phases: [],
    },
    evaluation: {
      id: 'eval-123',
      clinicalCaseId: 'case-123',
      date: '2023-01-01',
      posturogram: {
        anteriorView: {
          head: { deviation: 'normal', severity: 'normal' },
          shoulders: { deviation: 'normal', severity: 'normal' },
          spine: { deviation: 'normal', severity: 'normal' },
          pelvis: { deviation: 'normal', severity: 'normal' },
          knees: { deviation: 'normal', severity: 'normal' },
          feet: { deviation: 'normal', severity: 'normal' },
        },
      },
      orthopedicTests: {},
      avdEvaluation: {
        barthel: { total: 100 },
        lawton: { total: 8 },
      },
      painScale: { activity: 0, rest: 0, palpation: 0, type: 'acute' },
      diagnosis: {},
      footprints: [],
      postureVideos: [],
    },
  } as unknown as ClinicalCase;

  beforeEach(() => {
    vi.clearAllMocks();
    // Polyfill pointer capture methods for Radix UI
    Element.prototype.hasPointerCapture = () => false;
    Element.prototype.setPointerCapture = () => {};
    Element.prototype.releasePointerCapture = () => {};
    // Polyfill scrollIntoView for Radix Select
    Element.prototype.scrollIntoView = () => {};
  });

  describe('Rendering', () => {
    it('should render slider and anatomical markers', () => {
      render(<PosturogramViewer clinicalCase={mockClinicalCase} />);

      expect(screen.getByTestId('before-after-slider')).toBeInTheDocument();
      // 6 markers
      expect(screen.getAllByRole('button').length).toBe(6);
    });

    it('should render empty state when images are missing', () => {
      render(
        <PosturogramViewer
          clinicalCase={mockClinicalCase}
          initialPosturogramUrl=""
          currentPosturogramUrl=""
        />,
      );

      expect(
        screen.getByText(/no hay posturogramas disponibles/i),
      ).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should open popover when marker is clicked', async () => {
      const user = userEvent.setup();
      render(<PosturogramViewer clinicalCase={mockClinicalCase} />);

      // Find head marker (first one usually, or by label if accessible)
      // Since markers are buttons inside SVG, userEvent might be tricky with tooltips overlaying
      // But we can try finding by aria-label
      const headMarker = screen.getByLabelText(/cabeza: normal/i);
      await user.click(headMarker);

      expect(screen.getByText('Desviación')).toBeInTheDocument();
      expect(screen.getByText('Severidad')).toBeInTheDocument();
    });

    it('should update deviation and call callback', async () => {
      const user = userEvent.setup();
      const onPosturogramChange = vi.fn();
      render(
        <PosturogramViewer
          clinicalCase={mockClinicalCase}
          onPosturogramChange={onPosturogramChange}
        />,
      );

      const headMarker = screen.getByLabelText(/cabeza: normal/i);
      await user.click(headMarker);

      // Open deviation select (Shadcn select uses combobox role usually)
      // We might need to find by text content or role
      // SelectTrigger usually has text of current value ("Normal")
      const deviationTrigger = screen.getAllByRole('combobox')[0]; // First one is deviation
      await user.click(deviationTrigger);

      // Select option
      // Use findByText to wait for portal
      const option = await screen.findByText('Escoliosis');
      await user.click(option);

      expect(onPosturogramChange).toHaveBeenCalledTimes(1);
      expect(onPosturogramChange).toHaveBeenCalledWith(
        expect.objectContaining({
          anteriorView: expect.objectContaining({
            head: expect.objectContaining({
              deviation: 'scoliosis',
              severity: 'severe', // Auto-severity check
            }),
          }),
        }),
      );
    });
  });

  describe('Legacy Data Migration', () => {
    it('should migrate legacy flat structure to nested anteriorView', () => {
      const legacyCase = {
        ...mockClinicalCase,
        evaluation: {
          ...mockClinicalCase.evaluation,
          posturogram: {
            head: { deviation: 'rotation', severity: 'mild' },
            shoulders: { deviation: 'normal', severity: 'normal' },
          },
        },
      } as unknown as ClinicalCase;

      render(<PosturogramViewer clinicalCase={legacyCase} />);

      const headMarker = screen.getByLabelText(/cabeza: rotation/i);
      expect(headMarker).toBeInTheDocument();
    });
  });
});

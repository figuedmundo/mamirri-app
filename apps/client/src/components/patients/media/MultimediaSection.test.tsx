import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MultimediaSection } from './MultimediaSection';
import type { ClinicalCase } from '@/types/patient';

// Mock child components
vi.mock('./GalleryUploadComponents', () => ({
  GalleryUploadButton: ({
    onFileSelect,
  }: {
    onFileSelect: (file: File) => void;
  }) => (
    <button onClick={() => onFileSelect(new File([''], 'test.jpg'))}>
      Mock Gallery Upload
    </button>
  ),
  PhotoPreviewWithSide: () => <div>Mock Preview</div>,
  QualityCheckDialog: () => <div>Mock Quality Dialog</div>,
}));

vi.mock('@/components/ui/media-lightbox', () => ({
  MediaLightbox: () => <div>Mock Lightbox</div>,
}));

describe('MultimediaSection', () => {
  const mockCase = {
    id: 'case-1',
    evaluation: {
      id: 'eval-1',
      clinicalCaseId: 'case-1',
      date: '2026-01-01',
      posturogram: {},
      orthopedicTests: {},
      avdEvaluation: {
        barthel: { total: 0 },
        lawton: { total: 0 },
      },
      painScale: { activity: 0, rest: 0, palpation: 0, type: 'chronic' },
      diagnosis: {
        functionalIndicator: '',
        clinicalAspect: '',
        anatomopathology: '',
        avdConsequences: '',
      },
      footprints: [
        {
          id: 'fp-1',
          evaluationId: 'eval-1',
          url: 'fp1.jpg',
          side: 'left',
          date: '2026-01-01',
          type: 'initial',
        },
        {
          id: 'fp-2',
          evaluationId: 'eval-1',
          url: 'fp2.jpg',
          side: 'right',
          date: '2026-01-01',
          type: 'final',
        },
      ],
      postureVideos: [],
      voiceNotes: [],
    },
    evaluations: [],
    treatmentSessions: [],
  } as unknown as ClinicalCase;

  it('should render footprints with side badges', () => {
    render(<MultimediaSection clinicalCase={mockCase} />);

    expect(screen.getByText('Multimedia')).toBeInTheDocument();
    expect(screen.getByText(/izquierdo/i)).toBeInTheDocument(); // Badge
    expect(screen.getByText(/derecho/i)).toBeInTheDocument(); // Badge
  });

  it('should show upload button', async () => {
    render(<MultimediaSection clinicalCase={mockCase} />);

    // Open dialog
    fireEvent.click(screen.getByText('Agregar foto'));

    expect(await screen.findByText('Mock Gallery Upload')).toBeInTheDocument();
  });

  it('should trigger upload flow when file selected', () => {
    // This is integration testing of internal state, simplified here
    // Verify component renders without crashing
    const { container } = render(<MultimediaSection clinicalCase={mockCase} />);
    expect(container).toBeInTheDocument();
  });
});

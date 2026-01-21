import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import {
  GalleryUploadButton,
  PhotoPreviewWithSide,
  QualityCheckDialog,
} from './GalleryUploadComponents';

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  Image: () => <div data-testid="icon-image" />,
  AlertTriangle: () => <div data-testid="icon-alert" />,
  Check: () => <div data-testid="icon-check" />,
  X: () => <div data-testid="icon-close" />,
}));

describe('GalleryUploadButton', () => {
  it('should trigger onFileSelect when file is picked', () => {
    const onFileSelect = vi.fn();
    render(<GalleryUploadButton onFileSelect={onFileSelect} />);

    // Find hidden input by label
    const button = screen.getByRole('button', { name: /elegir de galería/i });
    expect(button).toBeInTheDocument();

    // Since hidden input interaction is hard to test directly via button click in jsdom without userEvent
    // We'll query the input directly to simulate change
    const input = document.querySelector('input[type="file"]');
    expect(input).toBeInTheDocument();

    if (input) {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
      fireEvent.change(input, { target: { files: [file] } });
      expect(onFileSelect).toHaveBeenCalledWith(file);
    }
  });
});

describe('PhotoPreviewWithSide', () => {
  it('should display image and side toggle', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
    const previewUrl = 'blob:test';

    render(
      <PhotoPreviewWithSide
        file={file}
        previewUrl={previewUrl}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );

    expect(screen.getByRole('img')).toHaveAttribute('src', previewUrl);
    expect(screen.getByText(/izquierdo/i)).toBeInTheDocument();
    expect(screen.getByText(/derecho/i)).toBeInTheDocument();
  });

  it('should require side selection before confirm', () => {
    const onConfirm = vi.fn();
    render(
      <PhotoPreviewWithSide
        file={new File([''], 'test.jpg')}
        previewUrl="blob:test"
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />,
    );

    const confirmBtn = screen.getByRole('button', { name: /continuar/i });
    expect(confirmBtn).toBeDisabled();

    // Select side
    fireEvent.click(screen.getByText(/izquierdo/i));
    expect(confirmBtn).not.toBeDisabled();

    fireEvent.click(confirmBtn);
    expect(onConfirm).toHaveBeenCalledWith('left');
  });
});

describe('QualityCheckDialog', () => {
  const mockQuality = {
    finalScore: 90,
    recommendation: 'auto-accept' as const,
    issues: [],
    metrics: {
      blur: { score: 100, status: 'good' as const },
      brightness: { score: 100, status: 'good' as const },
      resolution: { score: 100, status: 'good' as const },
    },
  };

  it('should display quality score', () => {
    render(
      <QualityCheckDialog
        quality={mockQuality}
        onConfirm={vi.fn()}
        onRetake={vi.fn()}
        previewUrl="blob:test"
      />,
    );

    expect(screen.getByText(/90\/100/)).toBeInTheDocument();
    expect(screen.getByText(/claridad/i)).toBeInTheDocument();
  });

  it('should show issues if present', () => {
    const badQuality = {
      ...mockQuality,
      finalScore: 40,
      recommendation: 'block' as const,
      issues: ['Imagen borrosa', 'Muy oscura'],
    };

    render(
      <QualityCheckDialog
        quality={badQuality}
        onConfirm={vi.fn()}
        onRetake={vi.fn()}
        previewUrl="blob:test"
      />,
    );

    expect(screen.getByText(/imagen borrosa/i)).toBeInTheDocument();
    expect(screen.getByText(/muy oscura/i)).toBeInTheDocument();
  });
});

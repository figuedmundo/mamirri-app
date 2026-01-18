import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CameraCapture } from './CameraCapture';

vi.mock('@/utils/media', () => ({
  getCameraErrorMessage: (error: unknown) =>
    error instanceof Error ? error.message : 'Error desconocido',
}));

vi.mock('./overlays/PostureOverlay', () => ({
  PostureOverlay: ({ view }: { view: string }) => (
    <div data-testid="posture-overlay">{view}</div>
  ),
}));

const mockStream = {
  getTracks: () => [{ stop: vi.fn() }],
} as unknown as MediaStream;

describe('CameraCapture', () => {
  const mockOnCapture = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    Object.defineProperty(navigator, 'mediaDevices', {
      writable: true,
      value: {
        getUserMedia: vi.fn().mockResolvedValue(mockStream),
        enumerateDevices: vi.fn().mockResolvedValue([]),
      },
    });

    HTMLCanvasElement.prototype.toDataURL = vi.fn(
      () => 'data:image/jpeg;base64,mock-data',
    );
    HTMLCanvasElement.prototype.toBlob = vi.fn((callback) => {
      callback(new Blob(['mock-image'], { type: 'image/jpeg' }));
    });
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      drawImage: vi.fn(),
      translate: vi.fn(),
      scale: vi.fn(),
    })) as any;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Idle state', () => {
    it('should render start button in idle state', () => {
      render(
        <CameraCapture onCapture={mockOnCapture} onCancel={mockOnCancel} />,
      );
      expect(screen.getByText('Activar cámara')).toBeInTheDocument();
    });
  });

  describe('Previewing state', () => {
    it('should request camera permission and show preview on start', async () => {
      const user = userEvent.setup();
      render(
        <CameraCapture onCapture={mockOnCapture} onCancel={mockOnCancel} />,
      );

      await user.click(screen.getByText('Activar cámara'));

      await waitFor(() => {
        expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalled();
      });

      expect(screen.getByLabelText('Capturar foto')).toBeInTheDocument();
    });

    it('should show error state if permission denied', async () => {
      const user = userEvent.setup();

      const error = new Error('Permiso denegado');
      error.name = 'NotAllowedError';
      (navigator.mediaDevices.getUserMedia as any).mockRejectedValueOnce(error);

      render(
        <CameraCapture onCapture={mockOnCapture} onCancel={mockOnCancel} />,
      );

      await user.click(screen.getByText('Activar cámara'));

      await waitFor(() => {
        expect(screen.getByText('Permiso denegado')).toBeInTheDocument();
      });

      expect(screen.getByText('Reintentar')).toBeInTheDocument();
    });
  });

  describe('Captured state', () => {
    it('should show confirm/retake buttons after capture', async () => {
      const user = userEvent.setup();
      render(
        <CameraCapture onCapture={mockOnCapture} onCancel={mockOnCancel} />,
      );

      await user.click(screen.getByText('Activar cámara'));
      await waitFor(() => screen.getByLabelText('Capturar foto'));

      await user.click(screen.getByLabelText('Capturar foto'));

      await waitFor(() => {
        expect(screen.getByText('Confirmar')).toBeInTheDocument();
      });
      expect(screen.getByText('Repetir')).toBeInTheDocument();
    });

    it('should call onCapture with blob on confirm', async () => {
      const user = userEvent.setup();
      render(
        <CameraCapture onCapture={mockOnCapture} onCancel={mockOnCancel} />,
      );

      await user.click(screen.getByText('Activar cámara'));
      await waitFor(() => screen.getByLabelText('Capturar foto'));
      await user.click(screen.getByLabelText('Capturar foto'));

      await waitFor(() => {
        expect(screen.getByText('Confirmar')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Confirmar'));

      expect(mockOnCapture).toHaveBeenCalledTimes(1);
      expect(mockOnCapture.mock.calls[0][0]).toBeInstanceOf(Blob);
      expect(mockOnCapture.mock.calls[0][1]).toHaveProperty('width');
    });

    it('should return to preview on retake', async () => {
      const user = userEvent.setup();
      render(
        <CameraCapture onCapture={mockOnCapture} onCancel={mockOnCancel} />,
      );

      await user.click(screen.getByText('Activar cámara'));
      await waitFor(() => screen.getByLabelText('Capturar foto'));
      await user.click(screen.getByLabelText('Capturar foto'));

      await waitFor(() => {
        expect(screen.getByText('Repetir')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Repetir'));

      await waitFor(() => {
        expect(screen.getByLabelText('Capturar foto')).toBeInTheDocument();
      });
      expect(screen.queryByText('Confirmar')).not.toBeInTheDocument();
    });
  });
});

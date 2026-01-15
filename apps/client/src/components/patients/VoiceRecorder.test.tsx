import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VoiceRecorder } from './VoiceRecorder';

class MockMediaRecorder {
  static isTypeSupported = vi.fn(() => true);
  ondataavailable: ((event: { data: Blob }) => void) | null = null;
  onstop: (() => void) | null = null;
  state = 'inactive';

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(_: MediaStream) {}

  start() {
    this.state = 'recording';
  }

  stop() {
    this.state = 'inactive';
    const blob = new Blob(['test-audio'], { type: 'audio/webm' });
    this.ondataavailable?.({ data: blob });
    this.onstop?.();
  }
}

const mockStream = {
  getTracks: () => [{ stop: vi.fn() }],
};

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('VoiceRecorder', () => {
  const mockOnRecordingComplete = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    Object.defineProperty(navigator, 'mediaDevices', {
      writable: true,
      value: {
        getUserMedia: vi.fn().mockResolvedValue(mockStream),
      },
    });

    Object.defineProperty(window, 'MediaRecorder', {
      writable: true,
      value: MockMediaRecorder,
    });

    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Idle state', () => {
    it('should render recording button in idle state', () => {
      render(
        <VoiceRecorder
          onRecordingComplete={mockOnRecordingComplete}
          onCancel={mockOnCancel}
        />,
      );

      expect(screen.getByText('Iniciar grabación')).toBeInTheDocument();
    });

    it('should have a microphone icon', () => {
      render(
        <VoiceRecorder
          onRecordingComplete={mockOnRecordingComplete}
          onCancel={mockOnCancel}
        />,
      );

      const button = screen.getByRole('button', { name: /iniciar grabación/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe('Recording state', () => {
    it('should show timer and stop button during recording', async () => {
      const user = userEvent.setup();

      render(
        <VoiceRecorder
          onRecordingComplete={mockOnRecordingComplete}
          onCancel={mockOnCancel}
        />,
      );

      const startButton = screen.getByText('Iniciar grabación');
      await user.click(startButton);

      await waitFor(() => {
        expect(screen.getByText('Grabando...')).toBeInTheDocument();
      });

      expect(screen.getByText('00:00')).toBeInTheDocument();
      expect(screen.getByText('Detener')).toBeInTheDocument();
      expect(screen.getByText('Cancelar')).toBeInTheDocument();
    });

    it('should request microphone permission on start', async () => {
      const user = userEvent.setup();

      render(
        <VoiceRecorder
          onRecordingComplete={mockOnRecordingComplete}
          onCancel={mockOnCancel}
        />,
      );

      const startButton = screen.getByText('Iniciar grabación');
      await user.click(startButton);

      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
        audio: true,
      });
    });
  });

  describe('Playback state', () => {
    it('should show playback controls after stopping recording', async () => {
      const user = userEvent.setup();

      render(
        <VoiceRecorder
          onRecordingComplete={mockOnRecordingComplete}
          onCancel={mockOnCancel}
        />,
      );

      const startButton = screen.getByText('Iniciar grabación');
      await user.click(startButton);

      await waitFor(() => {
        expect(screen.getByText('Grabando...')).toBeInTheDocument();
      });

      const stopButton = screen.getByText('Detener');
      await user.click(stopButton);

      await waitFor(() => {
        expect(screen.getByText('Grabación completada')).toBeInTheDocument();
      });

      expect(screen.getByText('Confirmar')).toBeInTheDocument();
      expect(screen.getByText('Volver a grabar')).toBeInTheDocument();
    });
  });

  describe('Callback behavior', () => {
    it('should fire onRecordingComplete callback with audio blob on confirm', async () => {
      const user = userEvent.setup();

      render(
        <VoiceRecorder
          onRecordingComplete={mockOnRecordingComplete}
          onCancel={mockOnCancel}
        />,
      );

      const startButton = screen.getByText('Iniciar grabación');
      await user.click(startButton);

      await waitFor(() => {
        expect(screen.getByText('Grabando...')).toBeInTheDocument();
      });

      const stopButton = screen.getByText('Detener');
      await user.click(stopButton);

      await waitFor(() => {
        expect(screen.getByText('Confirmar')).toBeInTheDocument();
      });

      const confirmButton = screen.getByText('Confirmar');
      await user.click(confirmButton);

      expect(mockOnRecordingComplete).toHaveBeenCalledTimes(1);
      expect(mockOnRecordingComplete).toHaveBeenCalledWith(expect.any(Blob));
    });

    it('should show transcription placeholder after confirmation', async () => {
      const user = userEvent.setup();

      render(
        <VoiceRecorder
          onRecordingComplete={mockOnRecordingComplete}
          onCancel={mockOnCancel}
        />,
      );

      const startButton = screen.getByText('Iniciar grabación');
      await user.click(startButton);

      await waitFor(() => {
        expect(screen.getByText('Grabando...')).toBeInTheDocument();
      });

      const stopButton = screen.getByText('Detener');
      await user.click(stopButton);

      await waitFor(() => {
        expect(screen.getByText('Confirmar')).toBeInTheDocument();
      });

      const confirmButton = screen.getByText('Confirmar');
      await user.click(confirmButton);

      await waitFor(() => {
        expect(
          screen.getByText('Transcripcion pendiente...'),
        ).toBeInTheDocument();
      });
    });

    it('should fire onCancel callback when cancel is clicked', async () => {
      const user = userEvent.setup();

      render(
        <VoiceRecorder
          onRecordingComplete={mockOnRecordingComplete}
          onCancel={mockOnCancel}
        />,
      );

      const startButton = screen.getByText('Iniciar grabación');
      await user.click(startButton);

      await waitFor(() => {
        expect(screen.getByText('Cancelar')).toBeInTheDocument();
      });

      const cancelButton = screen.getByText('Cancelar');
      await user.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });
  });
});

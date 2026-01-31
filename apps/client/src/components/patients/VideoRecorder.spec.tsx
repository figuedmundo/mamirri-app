import { render, screen, fireEvent, act } from '@testing-library/react';
import { VideoRecorder } from './VideoRecorder';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock useToast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('VideoRecorder', () => {
  const mockOnCapture = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock navigator.mediaDevices.getUserMedia
    Object.defineProperty(window.navigator, 'mediaDevices', {
      value: {
        getUserMedia: vi.fn().mockResolvedValue({
          getTracks: () => [{ stop: vi.fn() }],
        }),
      },
      writable: true,
    });

    // Mock MediaRecorder
    window.MediaRecorder = class {
      state = 'inactive';
      ondataavailable = vi.fn();
      onstop = vi.fn();
      start = vi.fn();
      stop = () => {
        // Trigger onstop when stop is called to simulate recording end
        if (this.onstop) this.onstop();
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      constructor(_stream: unknown, _options: unknown) {}
    } as unknown as typeof MediaRecorder;

    // Mock URL.createObjectURL
    (window as any).URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    (window as any).URL.revokeObjectURL = vi.fn();
  });

  it('renders initial idle state correctly', () => {
    render(<VideoRecorder onCapture={mockOnCapture} />);
    expect(screen.getByText('Video de Marcha')).toBeInTheDocument();
    expect(screen.getByText('Iniciar cámara')).toBeInTheDocument();
  });

  it('transitions to recording state when start button is clicked', async () => {
    render(<VideoRecorder onCapture={mockOnCapture} />);

    await act(async () => {
      fireEvent.click(screen.getByText('Iniciar cámara'));
    });

    // In recording state we show duration
    expect(screen.getByText('00:30')).toBeInTheDocument();
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(<VideoRecorder onCapture={mockOnCapture} onCancel={mockOnCancel} />);
    fireEvent.click(screen.getByText('Cancelar'));
    expect(mockOnCancel).toHaveBeenCalled();
  });
});

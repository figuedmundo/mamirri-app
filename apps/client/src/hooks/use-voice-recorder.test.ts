import { renderHook, act } from '@testing-library/react';
import { useVoiceRecorder } from './use-voice-recorder';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('useVoiceRecorder', () => {
  const mockStream = {
    getTracks: vi.fn().mockReturnValue([{ stop: vi.fn() }]),
  };

  const mockMediaRecorder = {
    start: vi.fn().mockImplementation(() => {
      mockMediaRecorder.state = 'recording';
    }),
    stop: vi.fn().mockImplementation(() => {
      mockMediaRecorder.state = 'inactive';
    }),
    state: 'inactive',
    ondataavailable: null,
    onstop: null,
  };

  beforeEach(() => {
    Object.defineProperty(navigator, 'mediaDevices', {
      value: {
        getUserMedia: vi.fn().mockResolvedValue(mockStream),
      },
      writable: true,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).MediaRecorder = vi.fn(function () {
      return mockMediaRecorder;
    });

    global.URL.createObjectURL = vi.fn().mockReturnValue('mock-url');
    global.URL.revokeObjectURL = vi.fn();

    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('should initialize with idle state', () => {
    const { result } = renderHook(() => useVoiceRecorder());
    expect(result.current.state).toBe('idle');
    expect(result.current.isRecording).toBe(false);
  });

  it('should start recording successfully', async () => {
    const { result } = renderHook(() => useVoiceRecorder());

    await act(async () => {
      await result.current.startRecording();
    });

    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
      audio: true,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((window as any).MediaRecorder).toHaveBeenCalled();
    expect(mockMediaRecorder.start).toHaveBeenCalled();
    expect(result.current.state).toBe('recording');
    expect(result.current.isRecording).toBe(true);
  });

  it('should handle recording duration', async () => {
    const { result } = renderHook(() => useVoiceRecorder());

    await act(async () => {
      await result.current.startRecording();
    });

    expect(result.current.duration).toBe(0);

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.duration).toBe(2);
  });

  it('should stop recording and set audio blob', async () => {
    const { result } = renderHook(() => useVoiceRecorder());

    await act(async () => {
      await result.current.startRecording();
    });

    act(() => {
      result.current.stopRecording();
    });

    expect(mockMediaRecorder.stop).toHaveBeenCalled();

    act(() => {
      if (mockMediaRecorder.onstop) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (mockMediaRecorder as any).onstop();
      }
    });

    expect(result.current.state).toBe('playback');
    expect(result.current.audioBlob).toBeInstanceOf(Blob);
    expect(result.current.audioUrl).toBe('mock-url');
  });

  it('should handle cancel recording', async () => {
    const { result } = renderHook(() => useVoiceRecorder());

    await act(async () => {
      await result.current.startRecording();
    });

    act(() => {
      result.current.cancelRecording();
    });

    expect(mockMediaRecorder.stop).toHaveBeenCalled();
    expect(result.current.state).toBe('idle');
    expect(result.current.audioBlob).toBeNull();
  });

  it('should handle getUserMedia error', async () => {
    const error = new Error('Permission denied');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (navigator.mediaDevices.getUserMedia as any).mockRejectedValue(error);

    const { result } = renderHook(() => useVoiceRecorder());

    await act(async () => {
      await result.current.startRecording();
    });

    expect(result.current.error).toBe(error);
    expect(result.current.state).toBe('idle');
  });

  it('should auto-save when autoSave option is true', async () => {
    const onRecordingComplete = vi.fn();
    const { result } = renderHook(() =>
      useVoiceRecorder({ autoSave: true, onRecordingComplete }),
    );

    await act(async () => {
      await result.current.startRecording();
    });

    act(() => {
      vi.advanceTimersByTime(3000);
      result.current.stopRecording();
    });

    act(() => {
      if (mockMediaRecorder.onstop) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (mockMediaRecorder as any).onstop();
      }
    });

    expect(onRecordingComplete).toHaveBeenCalledWith(expect.any(Blob), 3);
    expect(result.current.state).toBe('confirming');
  });
});

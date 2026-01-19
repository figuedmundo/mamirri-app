import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useTranscriptionPolling } from './use-transcription-polling';
import { mediaApi } from '../api/media';

vi.mock('../api/media', () => ({
  mediaApi: {
    getVoiceNoteStatus: vi.fn(),
  },
}));

describe('useTranscriptionPolling', () => {
  const defaultProps = {
    entityType: 'sessions' as const,
    entityId: '123',
    voiceNoteId: '456',
    enabled: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should start polling when enabled and id provided', async () => {
    (mediaApi.getVoiceNoteStatus as any).mockResolvedValue({
      transcriptionStatus: 'pending',
      transcription: null,
    });

    const { result } = renderHook(() => useTranscriptionPolling(defaultProps));

    expect(result.current.isPolling).toBe(true);
    expect(result.current.status).toBe('pending');

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(mediaApi.getVoiceNoteStatus).toHaveBeenCalledTimes(1);
    expect(mediaApi.getVoiceNoteStatus).toHaveBeenCalledWith(
      defaultProps.entityType,
      defaultProps.entityId,
      defaultProps.voiceNoteId,
    );
  });

  it('should continue polling every 3 seconds', async () => {
    (mediaApi.getVoiceNoteStatus as any).mockResolvedValue({
      transcriptionStatus: 'pending',
      transcription: null,
    });

    renderHook(() => useTranscriptionPolling(defaultProps));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(mediaApi.getVoiceNoteStatus).toHaveBeenCalledTimes(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });

    expect(mediaApi.getVoiceNoteStatus).toHaveBeenCalledTimes(2);
  });

  it('should stop polling when completed', async () => {
    (mediaApi.getVoiceNoteStatus as any)
      .mockResolvedValueOnce({
        transcriptionStatus: 'pending',
        transcription: null,
      })
      .mockResolvedValueOnce({
        transcriptionStatus: 'completed',
        transcription: 'Hello world',
      });

    const { result } = renderHook(() => useTranscriptionPolling(defaultProps));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });

    expect(result.current.status).toBe('completed');
    expect(result.current.transcription).toBe('Hello world');
    expect(result.current.isPolling).toBe(false);
  });

  it('should stop polling when failed', async () => {
    (mediaApi.getVoiceNoteStatus as any).mockResolvedValue({
      transcriptionStatus: 'failed',
      transcriptionError: 'Some error',
    });

    const { result } = renderHook(() => useTranscriptionPolling(defaultProps));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(result.current.status).toBe('failed');
    expect(result.current.error).toBe('Some error');
    expect(result.current.isPolling).toBe(false);
  });

  it('should retry max 10 times then fail', async () => {
    (mediaApi.getVoiceNoteStatus as any).mockResolvedValue({
      transcriptionStatus: 'pending',
      transcription: null,
    });

    const { result } = renderHook(() => useTranscriptionPolling(defaultProps));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    for (let i = 0; i < 9; i++) {
      await act(async () => {
        await vi.advanceTimersByTimeAsync(3000);
      });
    }

    expect(mediaApi.getVoiceNoteStatus).toHaveBeenCalledTimes(10);
    expect(result.current.isPolling).toBe(false);
    expect(result.current.status).toBe('failed');
    expect(result.current.error).toBe('Max attempts reached');
  });

  it('should reset attempts and start polling on retry', async () => {
    (mediaApi.getVoiceNoteStatus as any).mockResolvedValue({
      transcriptionStatus: 'failed',
      transcriptionError: 'Original error',
    });

    const { result } = renderHook(() => useTranscriptionPolling(defaultProps));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(result.current.status).toBe('failed');
    expect(result.current.isPolling).toBe(false);

    (mediaApi.getVoiceNoteStatus as any).mockResolvedValue({
      transcriptionStatus: 'completed',
      transcription: 'Retried success',
    });

    act(() => {
      result.current.retry();
    });

    expect(result.current.status).toBe('pending');
    expect(result.current.isPolling).toBe(true);
    expect(result.current.error).toBeNull();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(result.current.status).toBe('completed');
    expect(result.current.transcription).toBe('Retried success');
  });
});

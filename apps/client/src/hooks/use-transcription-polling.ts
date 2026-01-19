import { useState, useEffect, useCallback, useRef } from 'react';
import { mediaApi } from '../api/media';

interface UseTranscriptionPollingProps {
  entityType: 'evaluations' | 'sessions';
  entityId: string;
  voiceNoteId: string | null;
  enabled?: boolean;
}

interface UseTranscriptionPollingResult {
  transcription: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'idle';
  error: string | null;
  isPolling: boolean;
  retry: () => void;
}

export function useTranscriptionPolling({
  entityType,
  entityId,
  voiceNoteId,
  enabled = true,
}: UseTranscriptionPollingProps): UseTranscriptionPollingResult {
  const [transcription, setTranscription] = useState<string | null>(null);
  const [status, setStatus] =
    useState<UseTranscriptionPollingResult['status']>('idle');
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const stopPolling = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (mountedRef.current) {
      setIsPolling(false);
    }
  }, []);

  const poll = useCallback(async () => {
    if (!voiceNoteId || !mountedRef.current) return;

    try {
      const result = await mediaApi.getVoiceNoteStatus(
        entityType,
        entityId,
        voiceNoteId,
      );

      if (!mountedRef.current) return;

      setTranscription(result.transcription || null);
      setStatus(result.transcriptionStatus);

      if (result.transcriptionStatus === 'completed') {
        stopPolling();
      } else if (result.transcriptionStatus === 'failed') {
        setError(result.transcriptionError || 'Transcription failed');
        stopPolling();
      }
    } catch {
      if (!mountedRef.current) return;
    }
  }, [entityType, entityId, voiceNoteId, stopPolling]);

  const retry = useCallback(() => {
    setAttempts(0);
    setError(null);
    setStatus('pending');
    setIsPolling(true);
  }, []);

  useEffect(() => {
    if (!enabled || !voiceNoteId) {
      stopPolling();
      return;
    }

    if (isPolling) {
      if (attempts >= 10) {
        setError('Max attempts reached');
        setStatus('failed');
        stopPolling();
        return;
      }

      const executePoll = async () => {
        await poll();
        if (mountedRef.current) {
          setAttempts((prev) => prev + 1);
        }
      };

      const delay = attempts === 0 ? 0 : 3000;

      timeoutRef.current = setTimeout(executePoll, delay);

      return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      };
    }
  }, [isPolling, attempts, poll, enabled, voiceNoteId, stopPolling]);

  useEffect(() => {
    if (enabled && voiceNoteId && status === 'idle' && !isPolling) {
      setIsPolling(true);
      setStatus('pending');
    }
  }, [enabled, voiceNoteId, status, isPolling]);

  return {
    transcription,
    status,
    error,
    isPolling,
    retry,
  };
}

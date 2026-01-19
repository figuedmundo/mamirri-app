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
  const [attempts, setAttempts] = useState(0);
  const [prevVoiceNoteId, setPrevVoiceNoteId] = useState(voiceNoteId);

  if (voiceNoteId !== prevVoiceNoteId) {
    setPrevVoiceNoteId(voiceNoteId);
    setStatus('idle');
    setTranscription(null);
    setError(null);
    setAttempts(0);
  }

  const isPolling =
    enabled && !!voiceNoteId && status !== 'completed' && status !== 'failed';

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!isPolling) return;

    const poll = async () => {
      if (!mountedRef.current) return;

      if (attempts >= 10) {
        setStatus('failed');
        setError('Max attempts reached');
        return;
      }

      try {
        const result = await mediaApi.getVoiceNoteStatus(
          entityType,
          entityId,
          voiceNoteId!,
        );

        if (!mountedRef.current) return;

        if (result.transcriptionStatus === 'completed') {
          setTranscription(result.transcription || null);
          setStatus('completed');
        } else if (result.transcriptionStatus === 'failed') {
          setStatus('failed');
          setError(result.transcriptionError || 'Transcription failed');
        } else {
          setTranscription(result.transcription || null);
          setStatus(result.transcriptionStatus);
          setAttempts((prev) => prev + 1);
        }
      } catch {
        if (mountedRef.current) {
          setAttempts((prev) => prev + 1);
        }
      }
    };

    const delay = attempts === 0 ? 0 : 3000;
    const timeoutId = setTimeout(poll, delay);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isPolling, attempts, entityType, entityId, voiceNoteId]);

  const retry = useCallback(() => {
    setAttempts(0);
    setError(null);
    setStatus('pending');
  }, []);

  return {
    transcription,
    status,
    error,
    isPolling,
    retry,
  };
}

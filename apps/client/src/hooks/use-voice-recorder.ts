import * as React from 'react';

export type RecorderState = 'idle' | 'recording' | 'playback' | 'confirming';

export interface UseVoiceRecorderOptions {
  autoStart?: boolean;
  autoSave?: boolean;
  onRecordingComplete?: (blob: Blob, duration: number) => void;
  onCancel?: () => void;
}

export interface UseVoiceRecorderReturn {
  isRecording: boolean;
  state: RecorderState;
  duration: number;
  audioBlob: Blob | null;
  audioUrl: string | null;
  error: Error | null;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  cancelRecording: () => void;
  confirmRecording: () => void;
  resetRecording: () => void;
}

export function useVoiceRecorder({
  autoStart = false,
  autoSave = false,
  onRecordingComplete,
  onCancel,
}: UseVoiceRecorderOptions = {}): UseVoiceRecorderReturn {
  const [state, setState] = React.useState<RecorderState>('idle');
  const [audioBlob, setAudioBlob] = React.useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = React.useState<string | null>(null);
  const [duration, setDuration] = React.useState(0);
  const durationRef = React.useRef(0);
  const [error, setError] = React.useState<Error | null>(null);

  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);

  const cleanup = React.useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const stopRecording = React.useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== 'inactive'
    ) {
      mediaRecorderRef.current.stop();
    }
    cleanup();
  }, [cleanup]);

  const startRecording = React.useCallback(async () => {
    setError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('BROWSER_NOT_SUPPORTED');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        const finalDuration = Math.max(1, durationRef.current);
        if (autoSave) {
          onRecordingComplete?.(blob, finalDuration);
          setState('confirming');
        } else {
          setState('playback');
        }

        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.start();
      setState('recording');
      setDuration(0);
      durationRef.current = 0;

      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
        durationRef.current += 1;
      }, 1000);
    } catch (err) {
      if (err instanceof Error) {
        setError(err);
      } else {
        setError(new Error('UNKNOWN_ERROR'));
      }
      cleanup();
    }
  }, [cleanup, autoSave, onRecordingComplete]);

  const cancelRecording = React.useCallback(() => {
    if (state === 'recording') {
      stopRecording();
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setDuration(0);
    setState('idle');
    setError(null);
    onCancel?.();
  }, [state, stopRecording, audioUrl, onCancel]);

  const resetRecording = React.useCallback(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setDuration(0);
    setState('idle');
    setError(null);
  }, [audioUrl]);

  const confirmRecording = React.useCallback(() => {
    if (audioBlob) {
      const finalDuration = Math.max(1, duration);
      onRecordingComplete?.(audioBlob, finalDuration);
      setState('confirming');
    }
  }, [audioBlob, duration, onRecordingComplete]);

  React.useEffect(() => {
    if (autoStart) {
      void startRecording();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    return () => {
      cleanup();
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== 'inactive'
      ) {
        mediaRecorderRef.current.stop();
      }
    };
  }, [cleanup, audioUrl]);

  return {
    isRecording: state === 'recording',
    state,
    duration,
    audioBlob,
    audioUrl,
    error,
    startRecording,
    stopRecording,
    cancelRecording,
    confirmRecording,
    resetRecording,
  };
}

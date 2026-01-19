import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob, duration: number) => void;
  onCancel?: () => void;
  className?: string;
}

type RecorderState = 'idle' | 'recording' | 'playback' | 'confirming';

export function VoiceRecorder({
  onRecordingComplete,
  onCancel,
  className,
}: VoiceRecorderProps) {
  const [state, setState] = React.useState<RecorderState>('idle');
  const [audioBlob, setAudioBlob] = React.useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = React.useState<string | null>(null);
  const [duration, setDuration] = React.useState(0);
  const [transcriptionPlaceholder, setTranscriptionPlaceholder] =
    React.useState<string | null>(null);

  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const { toast } = useToast();

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast({
          title: 'No soportado',
          description:
            'Tu navegador no soporta grabación de audio. Intenta con Chrome o Safari.',
          variant: 'destructive',
        });
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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
        setState('playback');

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setState('recording');
      setDuration(0);

      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        toast({
          title: 'Permiso denegado',
          description:
            'Por favor, permite el acceso al micrófono para grabar notas de voz.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: 'No se pudo iniciar la grabación. Intenta de nuevo.',
          variant: 'destructive',
        });
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && state === 'recording') {
      mediaRecorderRef.current.stop();
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const handleConfirm = () => {
    if (audioBlob) {
      onRecordingComplete(audioBlob, duration);
      setTranscriptionPlaceholder('Transcripcion pendiente...');
      setState('confirming');
    }
  };

  const handleRestart = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setDuration(0);
    setState('idle');
  };

  const handleCancel = () => {
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
    onCancel?.();
  };

  React.useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (mediaRecorderRef.current && state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, [audioUrl, state]);

  if (state === 'confirming' && transcriptionPlaceholder) {
    return (
      <div
        className={cn(
          'bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4',
          className,
        )}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-teal-600 dark:text-teal-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Grabación guardada
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 italic">
              {transcriptionPlaceholder}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {state === 'idle' && (
        <Button
          onClick={startRecording}
          variant="outline"
          className="flex items-center gap-2"
        >
          <svg
            className="w-5 h-5 text-rose-500"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
          </svg>
          <span>Iniciar grabación</span>
        </Button>
      )}

      {state === 'recording' && (
        <div className="bg-rose-50 dark:bg-rose-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-rose-500 flex items-center justify-center animate-pulse">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                  </svg>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 rounded-full animate-ping" />
              </div>
              <div>
                <p className="text-sm font-medium text-rose-700 dark:text-rose-300">
                  Grabando...
                </p>
                <p className="text-2xl font-mono font-bold text-rose-800 dark:text-rose-200">
                  {formatDuration(duration)}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleCancel}
                variant="ghost"
                size="sm"
                className="text-slate-600 dark:text-slate-400"
              >
                Cancelar
              </Button>
              <Button
                onClick={stopRecording}
                variant="default"
                size="sm"
                className="bg-rose-600 hover:bg-rose-700"
              >
                Detener
              </Button>
            </div>
          </div>
          <div className="h-8 bg-rose-100 dark:bg-rose-900/40 rounded-md overflow-hidden">
            <div className="h-full flex items-center justify-center gap-1 px-2">
              {[
                40, 65, 85, 50, 70, 90, 35, 75, 60, 45, 80, 55, 70, 95, 40, 60,
                85, 50, 75, 65,
              ].map((height, i) => (
                <div
                  key={i}
                  className="w-1 bg-rose-400 dark:bg-rose-500 rounded-full animate-pulse"
                  style={{
                    height: `${height}%`,
                    animationDelay: `${i * 50}ms`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {state === 'playback' && audioUrl && (
        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-teal-600 dark:text-teal-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Grabación completada
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Duración: {formatDuration(duration)}
              </p>
            </div>
          </div>

          <audio
            ref={audioRef}
            src={audioUrl}
            controls
            className="w-full mb-3"
          />

          <div className="flex justify-end gap-2">
            <Button onClick={handleRestart} variant="outline" size="sm">
              Volver a grabar
            </Button>
            <Button
              onClick={handleConfirm}
              variant="default"
              size="sm"
              className="bg-teal-600 hover:bg-teal-700"
            >
              Confirmar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

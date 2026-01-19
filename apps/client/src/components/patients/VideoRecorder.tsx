import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Camera,
  RefreshCw,
  Repeat,
  Check,
  Video,
  AlertCircle,
} from 'lucide-react';
import type { VideoRecorderProps, VideoRecorderState } from '@/types/patient';

export function VideoRecorder({
  onCapture,
  onCancel,
  maxDuration = 30,
  className,
}: VideoRecorderProps) {
  const [state, setState] = React.useState<VideoRecorderState>('idle');
  const [stream, setStream] = React.useState<MediaStream | null>(null);
  const [videoBlob, setVideoBlob] = React.useState<Blob | null>(null);
  const [videoUrl, setVideoUrl] = React.useState<string | null>(null);
  const [duration, setDuration] = React.useState(maxDuration);
  const [facingMode, setFacingMode] = React.useState<'user' | 'environment'>(
    'environment',
  );
  const [error, setError] = React.useState<string | null>(null);

  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const videoChunksRef = React.useRef<Blob[]>([]);
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const { toast } = useToast();

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const stopStream = React.useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  const startCamera = React.useCallback(async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Tu navegador no soporta grabación de video');
      }

      setState('requesting');
      setError(null);

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: true,
      });

      setStream(newStream);
      setState('recording');

      const mediaRecorder = new MediaRecorder(newStream, {
        mimeType: 'video/webm;codecs=vp8,opus',
      });

      mediaRecorderRef.current = mediaRecorder;
      videoChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          videoChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(videoChunksRef.current, { type: 'video/webm' });
        setVideoBlob(blob);
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
        setState('preview');
        stopStream();
      };

      mediaRecorder.start();

      setDuration(maxDuration);
      timerRef.current = setInterval(() => {
        setDuration((prev) => {
          if (prev <= 1) {
            if (
              mediaRecorderRef.current &&
              mediaRecorderRef.current.state !== 'inactive'
            ) {
              mediaRecorderRef.current.stop();
            }
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: unknown) {
      console.error('Camera error:', err);
      let errorMessage = 'No se pudo iniciar la cámara.';

      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          errorMessage =
            'Permiso denegado. Por favor permite el acceso a la cámara y micrófono.';
        } else if (err.name === 'NotFoundError') {
          errorMessage = 'No se encontró ninguna cámara disponible.';
        }
      }

      setError(errorMessage);

      toast({
        title: 'Error de cámara',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  }, [facingMode, maxDuration, stopStream, toast]);

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== 'inactive'
    ) {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleToggleCamera = () => {
    stopRecording();
    stopStream();
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const handleConfirm = () => {
    if (videoBlob) {
      const metadata = {
        durationSeconds: maxDuration - duration,
        facingMode,
        width: 0,
        height: 0,
        timestamp: new Date(),
        type: 'gait' as const,
      };

      onCapture(videoBlob, metadata);
      setState('confirm');
    }
  };

  const handleRetake = () => {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
    setVideoBlob(null);
    setVideoUrl(null);
    setDuration(maxDuration);
    startCamera();
  };

  const handleCancel = () => {
    stopRecording();
    stopStream();
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
    setVideoBlob(null);
    setVideoUrl(null);
    setState('idle');
    onCancel?.();
  };

  React.useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  React.useEffect(() => {
    if (state === 'recording' && !stream && !error) {
      startCamera();
    }
  }, [facingMode, state, stream, startCamera, error]);

  React.useEffect(() => {
    return () => {
      stopStream();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [stopStream, videoUrl]);

  if (state === 'idle') {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center p-8 bg-slate-100 dark:bg-slate-900 rounded-xl h-[300px]',
          className,
        )}
      >
        <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
          <Video className="w-8 h-8 text-slate-500" />
        </div>
        <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
          Video de Marcha
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 text-center max-w-xs">
          Graba un video corto (máx {maxDuration}s) para analizar la marcha o
          postura dinámica.
        </p>
        <div className="flex gap-3">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button onClick={startCamera}>
            <Camera className="w-4 h-4 mr-2" />
            Iniciar cámara
          </Button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center p-8 bg-rose-50 dark:bg-rose-900/20 rounded-xl h-[300px]',
          className,
        )}
      >
        <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/40 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-rose-500" />
        </div>
        <h3 className="text-lg font-medium text-rose-700 dark:text-rose-300 mb-2">
          Error de cámara
        </h3>
        <p className="text-sm text-rose-600 dark:text-rose-400 mb-6 text-center max-w-xs">
          {error}
        </p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button onClick={startCamera}>Reintentar</Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative bg-black rounded-xl overflow-hidden shadow-xl aspect-video',
        className,
      )}
    >
      {state === 'preview' && videoUrl ? (
        <video
          src={videoUrl}
          controls
          className="w-full h-full object-contain"
        />
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={cn(
            'w-full h-full object-cover',
            facingMode === 'user' && 'scale-x-[-1]',
          )}
        />
      )}

      {state === 'recording' && (
        <>
          <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/50 rounded-full px-3 py-1 z-10">
            <div className="w-3 h-3 bg-rose-500 rounded-full animate-pulse" />
            <span className="text-white font-mono font-medium">
              {formatDuration(duration)}
            </span>
          </div>

          <div className="absolute top-4 left-4 z-10">
            <Button
              size="icon"
              variant="secondary"
              className="rounded-full bg-black/50 hover:bg-black/70 text-white border-0"
              onClick={handleToggleCamera}
              title="Cambiar cámara"
            >
              <RefreshCw className="w-5 h-5" />
            </Button>
          </div>

          <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-6 z-10">
            <Button
              variant="ghost"
              onClick={handleCancel}
              className="text-white hover:bg-white/10"
            >
              Cancelar
            </Button>

            <button
              onClick={stopRecording}
              className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center group focus:outline-none"
            >
              <div className="w-8 h-8 rounded-sm bg-rose-500 group-active:scale-90 transition-transform" />
            </button>

            <div className="w-20" />
          </div>
        </>
      )}

      {state === 'preview' && (
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent z-10">
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={handleRetake}
              className="flex-1 border-white/20 bg-white/10 text-white hover:bg-white/20"
            >
              <Repeat className="w-4 h-4 mr-2" />
              Repetir
            </Button>
            <Button
              onClick={handleConfirm}
              className="flex-1 bg-teal-600 hover:bg-teal-700 text-white"
            >
              <Check className="w-4 h-4 mr-2" />
              Confirmar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

import * as React from 'react';
import { Camera, RefreshCw, Repeat, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getCameraErrorMessage } from '@/utils/media';
import { PostureOverlay } from './overlays/PostureOverlay';
import type {
  CameraCaptureProps,
  CameraCaptureState,
  PhotoMetadata,
  PostureView,
} from '@/types/patient';

export function CameraCapture({
  onCapture,
  onCancel,
  overlayType = 'none',
  defaultFacingMode = 'environment',
  className,
}: CameraCaptureProps) {
  const [state, setState] = React.useState<CameraCaptureState>('idle');
  const [stream, setStream] = React.useState<MediaStream | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [facingMode, setFacingMode] = React.useState<'user' | 'environment'>(
    defaultFacingMode,
  );
  const [capturedImage, setCapturedImage] = React.useState<string | null>(null);
  const [imageBlob, setImageBlob] = React.useState<Blob | null>(null);
  const [activeOverlay, setActiveOverlay] = React.useState<
    PostureView | 'footprint' | 'none'
  >(overlayType);

  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const startCamera = React.useCallback(async () => {
    setState('requesting');
    setError(null);

    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      setStream(newStream);
      setState('previewing');
    } catch (err) {
      console.error('Camera error:', err);
      setError(getCameraErrorMessage(err));
      setState('error');
    }
  }, [facingMode]);

  const stopCamera = React.useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context = canvas.getContext('2d');
      if (context) {
        if (facingMode === 'user') {
          context.translate(canvas.width, 0);
          context.scale(-1, 1);
        }

        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        setCapturedImage(dataUrl);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              setImageBlob(blob);
              setState('captured');
            } else {
              setError('Error al procesar la imagen');
              setState('error');
            }
          },
          'image/jpeg',
          0.92,
        );
      }
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setImageBlob(null);
    setState('previewing');
  };

  const handleConfirm = () => {
    if (imageBlob) {
      const metadata: PhotoMetadata = {
        width: canvasRef.current?.width || 0,
        height: canvasRef.current?.height || 0,
        timestamp: new Date(),
        facingMode,
        overlayType: typeof activeOverlay === 'string' ? activeOverlay : 'none',
      };

      stopCamera();
      onCapture(imageBlob, metadata);
    }
  };

  const handleToggleCamera = () => {
    stopCamera();
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const handleOverlayChange = (view: PostureView) => {
    setActiveOverlay(view);
  };

  React.useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  React.useEffect(() => {
    if (state === 'previewing' && !stream) {
      startCamera();
    }
  }, [facingMode, state, startCamera, stream]);

  React.useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  if (state === 'idle') {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center p-8 bg-slate-100 dark:bg-slate-900 rounded-xl h-[400px]',
          className,
        )}
      >
        <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
          <Camera className="w-8 h-8 text-slate-500" />
        </div>
        <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
          Cámara lista
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 text-center max-w-xs">
          La cámara se activará para tomar una foto. Asegúrate de tener buena
          iluminación.
        </p>
        <div className="flex gap-3">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button onClick={startCamera}>Activar cámara</Button>
        </div>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center p-8 bg-rose-50 dark:bg-rose-900/20 rounded-xl h-[400px]',
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
          {onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              className="border-rose-200 text-rose-700 hover:bg-rose-100 hover:text-rose-800"
            >
              Cancelar
            </Button>
          )}
          <Button
            onClick={startCamera}
            className="bg-rose-600 hover:bg-rose-700 text-white"
          >
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  const isPostureOverlay =
    overlayType.startsWith('posture') || activeOverlay.startsWith('posture');

  return (
    <div
      className={cn(
        'relative bg-black rounded-xl overflow-hidden shadow-xl',
        className,
      )}
    >
      <div className="relative aspect-[3/4] w-full bg-black">
        {state === 'captured' && capturedImage ? (
          <img
            src={capturedImage}
            alt="Captured"
            className="w-full h-full object-cover"
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

        {state === 'previewing' &&
          isPostureOverlay &&
          (activeOverlay as string).startsWith('posture') && (
            <PostureOverlay view={activeOverlay as PostureView} />
          )}

        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="absolute top-4 right-4 flex gap-2">
        {state === 'previewing' && (
          <Button
            size="icon"
            variant="secondary"
            className="rounded-full bg-black/50 hover:bg-black/70 text-white border-0"
            onClick={handleToggleCamera}
            title="Cambiar cámara"
          >
            <RefreshCw className="w-5 h-5" />
          </Button>
        )}
      </div>

      {isPostureOverlay && state === 'previewing' && (
        <div className="absolute top-4 left-4 right-16 flex justify-center">
          <div className="flex bg-black/50 rounded-lg p-1 gap-1 overflow-x-auto max-w-full no-scrollbar">
            {[
              { id: 'posture-anterior', label: 'Ant.' },
              { id: 'posture-posterior', label: 'Post.' },
              { id: 'posture-lateral-left', label: 'Izq.' },
              { id: 'posture-lateral-right', label: 'Der.' },
            ].map((view) => (
              <button
                key={view.id}
                onClick={() => handleOverlayChange(view.id as PostureView)}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap',
                  activeOverlay === view.id
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-white/80 hover:bg-white/10',
                )}
              >
                {view.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-center justify-between gap-4">
          {state === 'captured' ? (
            <>
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
            </>
          ) : (
            <>
              {onCancel && (
                <Button
                  variant="ghost"
                  onClick={onCancel}
                  className="text-white hover:bg-white/10"
                >
                  Cancelar
                </Button>
              )}

              <div className="flex-1 flex justify-center">
                <button
                  onClick={handleCapture}
                  disabled={state === 'requesting'}
                  className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center group focus:outline-none focus:ring-4 focus:ring-teal-500/50"
                  aria-label="Capturar foto"
                >
                  <div className="w-12 h-12 rounded-full bg-white group-active:scale-90 transition-transform" />
                </button>
              </div>

              {onCancel && <div className="w-20" />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Image, AlertTriangle, Check, X } from 'lucide-react';
import type { QualityResult } from '@/utils/quality-validation';

interface GalleryUploadButtonProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export function GalleryUploadButton({
  onFileSelect,
  disabled,
}: GalleryUploadButtonProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
      // Reset input so same file can be selected again if needed
      e.target.value = '';
    }
  };

  return (
    <>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        ref={inputRef}
        onChange={handleChange}
        aria-label="Elegir de galería"
        disabled={disabled}
      />
      <Button
        variant="outline"
        className="flex-1"
        onClick={handleClick}
        disabled={disabled}
      >
        <Image className="w-4 h-4 mr-2" />
        Elegir de Galería
      </Button>
    </>
  );
}

interface PhotoPreviewWithSideProps {
  file: File;
  previewUrl: string;
  onConfirm: (side: 'left' | 'right') => void;
  onCancel: () => void;
}

export function PhotoPreviewWithSide({
  previewUrl,
  onConfirm,
  onCancel,
}: PhotoPreviewWithSideProps) {
  const [side, setSide] = React.useState<'left' | 'right' | null>(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="relative flex-1 bg-black min-h-[300px]">
          <img
            src={previewUrl}
            alt="Preview"
            className="absolute inset-0 w-full h-full object-contain"
          />
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-4">¿Qué pie es este?</h3>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setSide('left')}
                className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all w-32 ${
                  side === 'left'
                    ? 'border-teal-600 bg-teal-50 dark:bg-teal-900/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-teal-200'
                }`}
              >
                <span className="text-3xl mb-2">🦶</span>
                <span className="font-medium">Izquierdo</span>
              </button>
              <button
                onClick={() => setSide('right')}
                className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all w-32 ${
                  side === 'right'
                    ? 'border-teal-600 bg-teal-50 dark:bg-teal-900/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-teal-200'
                }`}
              >
                <span className="text-3xl mb-2 scale-x-[-1]">🦶</span>
                <span className="font-medium">Derecho</span>
              </button>
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg flex gap-3 text-sm text-amber-800 dark:text-amber-200">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <p>
              Esta foto no tiene guía de superposición. Asegúrate de que el pie
              esté claramente visible.
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={onCancel}>
              Atrás
            </Button>
            <Button
              className="flex-1 bg-teal-600 hover:bg-teal-700"
              disabled={!side}
              onClick={() => side && onConfirm(side)}
            >
              Continuar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface QualityCheckDialogProps {
  quality: QualityResult;
  onConfirm: () => void;
  onRetake: () => void;
  previewUrl: string;
}

export function QualityCheckDialog({
  quality,
  onConfirm,
  onRetake,
  previewUrl,
}: QualityCheckDialogProps) {
  const isBlock = quality.recommendation === 'block';
  const isAutoAccept = quality.recommendation === 'auto-accept';

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Validación de Calidad</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
            <img
              src={previewUrl}
              alt="Preview"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div className="flex items-center justify-between text-white">
                <span className="font-medium">Puntuación</span>
                <span
                  className={`text-lg font-bold ${
                    quality.finalScore >= 85
                      ? 'text-emerald-400'
                      : quality.finalScore >= 50
                        ? 'text-amber-400'
                        : 'text-rose-400'
                  }`}
                >
                  {quality.finalScore}/100
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <QualityMetricRow
              label="Resolución"
              status={quality.metrics.resolution.status}
              text={
                quality.metrics.resolution.status === 'good'
                  ? 'Alta calidad'
                  : 'Baja resolución'
              }
            />
            <QualityMetricRow
              label="Claridad"
              status={quality.metrics.blur.status}
              text={
                quality.metrics.blur.status === 'good' ? 'Nítida' : 'Borrosa'
              }
            />
            <QualityMetricRow
              label="Iluminación"
              status={quality.metrics.brightness.status}
              text={
                quality.metrics.brightness.status === 'good'
                  ? 'Correcta'
                  : quality.metrics.brightness.status === 'too-dark'
                    ? 'Muy oscura'
                    : 'Muy brillante'
              }
            />
          </div>

          {quality.issues.length > 0 && (
            <div className="bg-rose-50 dark:bg-rose-900/20 p-3 rounded-lg text-sm text-rose-700 dark:text-rose-300">
              <p className="font-medium mb-1">Problemas detectados:</p>
              <ul className="list-disc pl-4 space-y-1">
                {quality.issues.map((issue, i) => (
                  <li key={i}>{issue}</li>
                ))}
              </ul>
            </div>
          )}

          {isAutoAccept && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg text-sm text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
              <Check className="w-4 h-4" />
              <p>La imagen cumple con todos los criterios de calidad.</p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onRetake} className="flex-1">
            Elegir otra
          </Button>
          {!isBlock && (
            <Button
              onClick={onConfirm}
              className="flex-1 bg-teal-600 hover:bg-teal-700"
            >
              {quality.recommendation === 'explicit-confirm'
                ? 'Usar de todos modos'
                : 'Confirmar y subir'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function QualityMetricRow({
  label,
  status,
  text,
}: {
  label: string;
  status: string;
  text: string;
}) {
  const isGood = status === 'good';
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-slate-500">{label}</span>
      <div
        className={`flex items-center gap-1.5 ${isGood ? 'text-emerald-600' : 'text-amber-600'}`}
      >
        {isGood ? (
          <Check className="w-3.5 h-3.5" />
        ) : (
          <AlertTriangle className="w-3.5 h-3.5" />
        )}
        <span>{text}</span>
      </div>
    </div>
  );
}

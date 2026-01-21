import * as React from 'react';
import { CameraCapture } from '@/components/patients/CameraCapture';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Repeat, Save } from 'lucide-react';

interface SessionPhotoCaptureProps {
  onSave: (blob: Blob, caption?: string) => void;
  onCancel: () => void;
}

export function SessionPhotoCapture({
  onSave,
  onCancel,
}: SessionPhotoCaptureProps) {
  const [capturedBlob, setCapturedBlob] = React.useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [caption, setCaption] = React.useState('');

  const handleCapture = (blob: Blob) => {
    setCapturedBlob(blob);
    const url = URL.createObjectURL(blob);
    setPreviewUrl(url);
  };

  const handleRetake = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setCapturedBlob(null);
    setPreviewUrl(null);
    setCaption('');
  };

  const handleSave = () => {
    if (capturedBlob) {
      onSave(capturedBlob, caption.trim() || undefined);
    }
  };

  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  if (capturedBlob && previewUrl) {
    return (
      <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 rounded-xl overflow-hidden">
        <div className="relative flex-1 bg-black min-h-[300px]">
          <img
            src={previewUrl}
            alt="Preview"
            className="absolute inset-0 w-full h-full object-contain"
          />
        </div>

        <div className="p-4 space-y-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
          <Input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Añadir descripción (opcional)..."
            maxLength={140}
            className="w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
          />

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleRetake}
              className="flex-1 h-11 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <Repeat className="w-4 h-4 mr-2" />
              Repetir
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 h-11 bg-teal-600 hover:bg-teal-700 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              Guardar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <CameraCapture
      onCapture={handleCapture}
      onCancel={onCancel}
      overlayType="none"
      className="h-[500px]"
    />
  );
}

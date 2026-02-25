import { useEffect, useState } from 'react';
import { Button } from '../../ui/button';
import { clinicsApi } from '../../../api/clinics';

type LogoUploadProps = {
  value: string;
  onChange: (value: string) => void;
};

const MAX_FILE_SIZE = 2 * 1024 * 1024;

export function LogoUpload({ value, onChange }: LogoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    setPreviewUrl(value || '');
  }, [value]);

  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten archivos de imagen.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('El logo no puede superar 2MB.');
      return;
    }

    setError(null);
    setPreviewUrl(URL.createObjectURL(file));
    setIsUploading(true);

    try {
      const uploadedPath = await clinicsApi.uploadClinicLogo(file);
      onChange(uploadedPath);
    } catch {
      setError('No pudimos subir el logo. Intenta nuevamente.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="rounded-md border border-dashed border-slate-300 p-4">
        <label className="block text-sm font-medium">Logo de la clínica</label>
        <p className="mt-1 text-xs text-muted-foreground">
          PNG/JPG, tamaño máximo 2MB.
        </p>
        <input
          type="file"
          accept="image/*"
          className="mt-3 block w-full text-sm"
          aria-label="Subir logo"
          onChange={onFileChange}
        />
      </div>

      {previewUrl ? (
        <div className="rounded-md border p-3">
          <img
            src={previewUrl}
            alt="Vista previa del logo"
            className="h-20 w-20 rounded-md object-cover"
          />
        </div>
      ) : null}

      {isUploading ? (
        <Button type="button" variant="outline" disabled>
          Subiendo logo...
        </Button>
      ) : null}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

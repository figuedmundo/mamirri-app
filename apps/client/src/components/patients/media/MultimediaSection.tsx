import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import type { ClinicalCase } from '@/types/patient';
import { MediaLightbox } from '@/components/ui/media-lightbox';
import type { MediaItem } from '@/components/ui/media-lightbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  GalleryUploadButton,
  PhotoPreviewWithSide,
  QualityCheckDialog,
} from './GalleryUploadComponents';
import {
  validateImageFile,
  stripExifAndCompress,
} from '@/utils/image-processing';
import {
  calculateQualityScore,
  detectBlur,
  analyzeBrightness,
} from '@/utils/quality-validation';
import type { QualityResult } from '@/utils/quality-validation';
import { mediaApi } from '@/api/media';
import { useToast } from '@/hooks/use-toast';

interface MultimediaSectionProps {
  clinicalCase: ClinicalCase;
  onRefresh?: () => void;
}

type TabType = 'all' | 'footprints' | 'photos';

export function MultimediaSection({
  clinicalCase,
  onRefresh,
}: MultimediaSectionProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = React.useState<TabType>('all');
  const [isUploadOpen, setIsUploadOpen] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [uploadStep, setUploadStep] = React.useState<
    'preview' | 'quality' | 'uploading'
  >('preview');
  const [selectedSide, setSelectedSide] = React.useState<
    'left' | 'right' | 'unknown'
  >('unknown');
  const [qualityResult, setQualityResult] =
    React.useState<QualityResult | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = React.useState<number>(-1);

  // Flatten media
  const footprints = clinicalCase.evaluation?.footprints ?? [];

  // Transform to common media format for lightbox
  const mediaItems: MediaItem[] = footprints.map((fp) => ({
    id: fp.id,
    type: 'image',
    url: fp.url,
    date: fp.date,
    label:
      fp.side && fp.side !== 'unknown'
        ? `Pie ${fp.side === 'left' ? 'Izquierdo' : 'Derecho'}`
        : 'Huella',
  }));

  const handleFileSelect = async (file: File) => {
    // 1. Validate
    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast({
        title: 'Archivo inválido',
        description: validation.error,
        variant: 'destructive',
      });
      return;
    }

    // 2. Generate preview
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setSelectedFile(file);
    setUploadStep('preview');
    setIsUploadOpen(false); // Close selection dialog
  };

  const handleSideConfirm = async (side: 'left' | 'right') => {
    setSelectedSide(side);

    // 3. Run Quality Check
    if (!selectedFile) return;

    // Create blob for analysis (without compression yet for speed)
    // Actually stripExifAndCompress is fast enough and safer
    const processedBlob = await stripExifAndCompress(selectedFile);
    const processedFile = new File([processedBlob], selectedFile.name, {
      type: 'image/jpeg',
    });

    const [blur, brightness] = await Promise.all([
      detectBlur(processedFile),
      analyzeBrightness(processedFile),
    ]);

    // Mock resolution check since we resized to max 1920
    const img = new Image();
    img.src = URL.createObjectURL(processedBlob);
    await new Promise((r) => (img.onload = r));

    const resolution = {
      width: img.width,
      height: img.height,
      status:
        img.width >= 900 && img.height >= 900
          ? ('good' as const)
          : ('bad' as const),
    };

    const quality = calculateQualityScore({ blur, brightness, resolution });
    setQualityResult(quality);
    setUploadStep('quality');
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedSide) return;

    try {
      setUploadStep('uploading');

      // Get current evaluation or create fallback logic
      const targetEvaluation = clinicalCase.evaluation;
      if (!targetEvaluation) {
        throw new Error('No hay evaluación activa para subir la foto');
      }

      const processedBlob = await stripExifAndCompress(selectedFile);

      await mediaApi.uploadFootprint(
        targetEvaluation.id,
        processedBlob,
        'initial', // Default type, should be dynamic
        selectedSide,
      );

      toast({
        title: 'Foto subida exitosamente',
        description: `Se agregó al pie ${selectedSide === 'left' ? 'izquierdo' : 'derecho'}`,
      });

      // Cleanup
      setUploadStep('preview');
      setSelectedFile(null);
      setPreviewUrl(null);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error al subir',
        description: 'No se pudo guardar la imagen.',
        variant: 'destructive',
      });
      setUploadStep('preview'); // Go back
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Multimedia</CardTitle>
        <Button onClick={() => setIsUploadOpen(true)} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Agregar foto
        </Button>
      </CardHeader>
      <CardContent>
        {/* Simple Tabs */}
        <div className="flex gap-2 mb-4 border-b pb-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'all'
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Todo
          </button>
          <button
            onClick={() => setActiveTab('footprints')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'footprints'
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Huellas
          </button>
          <button
            onClick={() => setActiveTab('photos')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'photos'
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Fotos
          </button>
        </div>

        <div className="space-y-4">
          {mediaItems.length === 0 ? (
            <p className="text-center text-slate-500 py-8">
              No hay archivos multimedia.
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {mediaItems.map((item, index) => (
                <div
                  key={item.id}
                  className="relative aspect-square bg-slate-100 rounded-lg overflow-hidden group cursor-pointer hover:ring-2 ring-teal-500/50 transition-all"
                  onClick={() => setLightboxIndex(index)}
                >
                  <img
                    src={item.url}
                    alt={item.label || 'Media'}
                    className="w-full h-full object-cover"
                  />
                  {item.label && (
                    <span className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 text-white text-xs rounded-full capitalize">
                      {item.label}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lightbox */}
        <MediaLightbox
          open={lightboxIndex >= 0}
          initialIndex={lightboxIndex}
          items={mediaItems}
          onOpenChange={(open) => !open && setLightboxIndex(-1)}
        />

        {/* Upload Dialogs */}
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar Foto</DialogTitle>
              <DialogDescription className="sr-only">
                Opciones para subir una nueva foto a la galería
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3">
              <Button onClick={() => console.log('Camera flow placeholder')}>
                📷 Tomar foto
              </Button>
              <GalleryUploadButton onFileSelect={handleFileSelect} />
            </div>
          </DialogContent>
        </Dialog>

        {selectedFile && previewUrl && uploadStep === 'preview' && (
          <PhotoPreviewWithSide
            file={selectedFile}
            previewUrl={previewUrl}
            onConfirm={handleSideConfirm}
            onCancel={() => {
              setSelectedFile(null);
              setPreviewUrl(null);
            }}
          />
        )}

        {selectedFile &&
          previewUrl &&
          qualityResult &&
          uploadStep === 'quality' && (
            <QualityCheckDialog
              quality={qualityResult}
              previewUrl={previewUrl}
              onConfirm={handleUpload}
              onRetake={() => {
                setSelectedFile(null);
                setPreviewUrl(null);
                setUploadStep('preview');
                setIsUploadOpen(true);
              }}
            />
          )}
      </CardContent>
    </Card>
  );
}

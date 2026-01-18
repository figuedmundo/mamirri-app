import * as React from 'react';
import { Camera, Trash2, Image as ImageIcon, UploadCloud } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MediaLightbox } from '@/components/ui/media-lightbox';
import type { MediaItem } from '@/components/ui/media-lightbox';
import type { SessionPhoto } from '@/types/patient';
import type { PendingPhoto } from '@/lib/photo-queue';

interface SessionPhotoGalleryProps {
  photos: SessionPhoto[];
  pendingPhotos?: PendingPhoto[];
  onAdd?: () => void;
  onDelete?: (photoId: string) => void;
  readonly?: boolean;
}

export function SessionPhotoGallery({
  photos,
  pendingPhotos = [],
  onAdd,
  onDelete,
  readonly = false,
}: SessionPhotoGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = React.useState(false);
  const [initialIndex, setInitialIndex] = React.useState(0);

  const mediaItems: MediaItem[] = React.useMemo(
    () =>
      photos.map((photo) => ({
        id: photo.id,
        url: photo.url,
        type: 'image',
        date: photo.capturedAt,
        label: photo.caption,
      })),
    [photos],
  );

  const handlePhotoClick = (index: number) => {
    setInitialIndex(index);
    setLightboxOpen(true);
  };

  const handleDelete = (e: React.MouseEvent, photoId: string) => {
    e.stopPropagation();
    onDelete?.(photoId);
  };

  const hasPhotos = photos.length > 0 || pendingPhotos.length > 0;

  if (!hasPhotos && readonly) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50">
        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
          <ImageIcon className="w-6 h-6 text-slate-400" />
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
          No hay fotos para esta sesión
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
        {pendingPhotos.map((photo) => (
          <PendingPhotoThumbnail key={photo.id} photo={photo} />
        ))}

        {photos.map((photo, index) => (
          <div
            key={photo.id}
            className={cn(
              'group relative aspect-square rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 cursor-pointer shadow-sm hover:shadow-md transition-all border border-slate-200 dark:border-slate-700',
            )}
            onClick={() => handlePhotoClick(index)}
          >
            <img
              src={photo.url}
              alt={photo.caption || 'Foto de sesión'}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />

            {photo.caption && (
              <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-[10px] text-white font-medium line-clamp-1 truncate">
                  {photo.caption}
                </p>
              </div>
            )}

            {!readonly && onDelete && (
              <button
                onClick={(e) => handleDelete(e, photo.id)}
                className="absolute top-1 right-1 p-1.5 bg-black/50 hover:bg-rose-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-sm"
                title="Eliminar foto"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}

        {!readonly && onAdd && (
          <button
            onClick={onAdd}
            className={cn(
              'flex flex-col items-center justify-center aspect-square rounded-lg border-2 border-dashed border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-900/10 hover:bg-teal-100 dark:hover:bg-teal-900/30 text-teal-600 dark:text-teal-400 transition-all group',
            )}
          >
            <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Camera className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold">Añadir Foto</span>
          </button>
        )}
      </div>

      <MediaLightbox
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        items={mediaItems}
        initialIndex={initialIndex}
      />
    </>
  );
}

function PendingPhotoThumbnail({ photo }: { photo: PendingPhoto }) {
  const [previewUrl, setPreviewUrl] = React.useState<string>('');

  React.useEffect(() => {
    const url = URL.createObjectURL(photo.blob);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [photo.blob]);

  return (
    <div className="relative aspect-square rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-amber-300 dark:border-amber-700">
      {previewUrl && (
        <img
          src={previewUrl}
          alt="Subiendo..."
          className="w-full h-full object-cover opacity-70"
        />
      )}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-amber-100 dark:bg-amber-900/80 p-2 rounded-full shadow-sm">
          <UploadCloud className="w-5 h-5 text-amber-600 dark:text-amber-400 animate-pulse" />
        </div>
      </div>
      {photo.caption && (
        <div className="absolute inset-x-0 bottom-0 p-1 bg-black/50">
          <p className="text-[10px] text-white truncate">{photo.caption}</p>
        </div>
      )}
    </div>
  );
}

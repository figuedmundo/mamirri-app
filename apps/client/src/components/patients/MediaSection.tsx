import { Image } from 'lucide-react';
import { useState } from 'react';
import type { Footprint, PostureVideo } from '../../types/patient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface MediaSectionProps {
  footprints?: Footprint[];
  postureVideos?: PostureVideo[];
  className?: string;
}

export function MediaSection({
  footprints = [],
  postureVideos = [],
  className,
}: MediaSectionProps) {
  const [selectedMedia, setSelectedMedia] = useState<{
    type: 'image' | 'video';
    url: string;
    title: string;
  } | null>(null);

  if (footprints.length === 0 && postureVideos.length === 0) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getSideLabel = (side?: string) => {
    if (side === 'left') return 'Izquierdo';
    if (side === 'right') return 'Derecho';
    return '';
  };

  return (
    <Card className={cn('border-slate-200 dark:border-slate-800', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Image className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          Multimedia de la Evaluación
          <span className="ml-auto text-sm font-normal text-slate-500 dark:text-slate-400">
            {footprints.length + postureVideos.length} archivos
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Footprints Section */}
        {footprints.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">
              Huellas Plantares
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {footprints.map((footprint) => (
                <button
                  key={footprint.id}
                  onClick={() =>
                    setSelectedMedia({
                      type: 'image',
                      url: footprint.url,
                      title: `Huella ${getSideLabel(footprint.side)} - ${formatDate(footprint.date)}`,
                    })
                  }
                  className="group relative aspect-[3/4] bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 transition-all hover:ring-2 hover:ring-teal-500"
                >
                  <img
                    src={footprint.url}
                    alt="Huella"
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 pt-6 text-white text-xs text-left">
                    <p className="font-medium truncate">
                      {getSideLabel(footprint.side) || 'Huella'}
                    </p>
                    <p className="opacity-80 text-[10px]">
                      {formatDate(footprint.date)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Videos Section */}
        {postureVideos.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">
              Videos de Postura
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {postureVideos.map((video) => (
                <div
                  key={video.id}
                  className="relative aspect-video bg-slate-900 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700"
                >
                  <video
                    src={video.url}
                    controls
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                    {formatDate(video.date)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      <Dialog
        open={!!selectedMedia}
        onOpenChange={(open) => !open && setSelectedMedia(null)}
      >
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black border-0 max-h-[90vh] flex flex-col">
          <DialogTitle className="sr-only">Vista previa</DialogTitle>
          <div className="relative flex-1 flex items-center justify-center bg-black min-h-[50vh]">
            {selectedMedia?.type === 'image' && (
              <img
                src={selectedMedia.url}
                alt={selectedMedia.title}
                className="max-w-full max-h-[85vh] object-contain"
              />
            )}
          </div>
          <div className="bg-white dark:bg-slate-900 p-4">
            <h3 className="font-medium text-slate-900 dark:text-slate-100">
              {selectedMedia?.title}
            </h3>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

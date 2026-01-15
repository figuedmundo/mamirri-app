import { Camera, Play } from 'lucide-react';
import type { Footprint, PostureVideo } from '../../types/patient';

export interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  date: string;
  label?: string;
}

export interface MediaGalleryProps {
  footprints?: Footprint[];
  postureVideos?: PostureVideo[];
  onSelect?: (item: MediaItem, index: number) => void;
}

export function MediaGallery({
  footprints = [],
  postureVideos = [],
  onSelect,
}: MediaGalleryProps) {
  const mediaItems: MediaItem[] = [
    ...footprints.map((fp) => ({
      id: fp.id,
      url: fp.url,
      type: 'image' as const,
      date: fp.date,
      label: fp.type,
    })),
    ...postureVideos.map((pv) => ({
      id: pv.id,
      url: pv.url,
      type: 'video' as const,
      date: pv.date,
      label: pv.type,
    })),
  ];

  if (mediaItems.length === 0) {
    return (
      <div className="flex items-center justify-center gap-3 p-6 bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
        <Camera className="text-slate-400" size={20} />
        <span className="text-sm text-slate-500 dark:text-slate-400">
          No hay fotos o videos capturados
        </span>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto scrollbar-hide">
      <div className="flex gap-3 pb-2">
        {mediaItems.map((item, index) => (
          <button
            key={item.id}
            onClick={() => onSelect?.(item, index)}
            className="relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 border-transparent hover:border-teal-500 focus:border-teal-500 focus:outline-none transition-all group"
          >
            {item.type === 'image' ? (
              <img
                src={item.url}
                alt={item.label || 'Media'}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <>
                <video
                  src={item.url}
                  className="w-full h-full object-cover"
                  muted
                  preload="metadata"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                    <Play
                      className="text-slate-800 ml-0.5"
                      size={16}
                      fill="currentColor"
                    />
                  </div>
                </div>
              </>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

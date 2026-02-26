import { Square, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RecordingFloatingBarProps {
  isRecording: boolean;
  duration: number;
  onStop: () => void;
  onCancel: () => void;
}

export function RecordingFloatingBar({
  isRecording,
  duration,
  onStop,
  onCancel,
}: RecordingFloatingBarProps) {
  if (!isRecording) return null;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-4 rounded-full bg-slate-900 px-6 py-3 shadow-lg text-white transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center gap-3">
        <div
          data-testid="pulsing-indicator"
          className="h-3 w-3 rounded-full bg-red-500 animate-pulse"
        />
        <span className="text-sm font-medium">Grabando...</span>
      </div>

      <div className="w-px h-4 bg-slate-700" />

      <span className="font-mono text-sm tabular-nums">
        {formatDuration(duration)}
      </span>

      <div className="flex items-center gap-2 pl-2">
        <Button
          variant="destructive"
          size="icon"
          className="h-11 w-11 rounded-full shadow-md"
          onClick={onStop}
          aria-label="Detener grabación"
          data-testid="floating-stop-btn"
        >
          <Square className="h-5 w-5 fill-current" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-11 w-11 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
          onClick={onCancel}
          aria-label="Cancelar grabación"
          data-testid="floating-cancel-btn"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

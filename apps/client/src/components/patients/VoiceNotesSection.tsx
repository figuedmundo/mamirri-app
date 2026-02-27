import { Mic, FileAudio, Play, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import type { VoiceNote } from '../../types/patient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '../../hooks/use-toast';

interface VoiceNotesSectionProps {
  voiceNotes?: VoiceNote[];
  title?: string;
  className?: string;
}

export function VoiceNotesSection({
  voiceNotes = [],
  title = 'Notas de Voz',
  className,
}: VoiceNotesSectionProps) {
  const { toast } = useToast();
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(
    voiceNotes.length > 0 ? voiceNotes[0].id : null,
  );

  const toggleNote = (noteId: string) => {
    setExpandedNoteId((prev) => (prev === noteId ? null : noteId));
  };

  if (voiceNotes.length === 0) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTypeLabel = (type: VoiceNote['type']) => {
    switch (type) {
      case 'anamnesis':
        return 'Anamnesis';
      case 'evolution':
        return 'Evolución';
      case 'quick-note':
        return 'Nota Rápida';
      default:
        return 'Nota';
    }
  };

  const getStatusBadge = (status: VoiceNote['transcriptionStatus']) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Transcripción completa
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            Transcribiendo...
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            Pendiente
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            Error en transcripción
          </span>
        );
    }
  };

  return (
    <Card className={cn('border-slate-200 dark:border-slate-800', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Mic className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          {title}
          <span className="ml-auto text-sm font-normal text-slate-500 dark:text-slate-400">
            {voiceNotes.length} {voiceNotes.length === 1 ? 'nota' : 'notas'}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {voiceNotes.map((note) => (
          <div
            key={note.id}
            className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden"
          >
            {/* Header - always visible */}
            <button
              onClick={() => toggleNote(note.id)}
              className="w-full px-4 py-3 flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
            >
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                  note.transcriptionStatus === 'completed'
                    ? 'bg-teal-100 dark:bg-teal-900/30'
                    : 'bg-slate-200 dark:bg-slate-700',
                )}
              >
                <FileAudio
                  className={cn(
                    'w-5 h-5',
                    note.transcriptionStatus === 'completed'
                      ? 'text-teal-600 dark:text-teal-400'
                      : 'text-slate-500 dark:text-slate-400',
                  )}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {getTypeLabel(note.type)}
                  </span>
                  {getStatusBadge(note.transcriptionStatus)}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {formatDate(note.date)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                  {formatDuration(note.durationSeconds)}
                </span>
                {expandedNoteId === note.id ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </div>
            </button>

            {/* Expanded content */}
            {expandedNoteId === note.id && (
              <div className="px-4 py-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
                {/* Audio player */}
                <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 p-3 rounded-lg mb-4">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-full flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      const audio = document.getElementById(
                        `audio-${note.id}`,
                      ) as HTMLAudioElement;
                      if (audio) {
                        try {
                          if (audio.paused) {
                            audio.play().catch((err) => {
                              console.error('Audio playback error:', err);
                              toast({
                                variant: 'destructive',
                                title: 'Error de reproducción',
                                description:
                                  'No se pudo reproducir el audio. Verifica tu conexión.',
                              });
                            });
                          } else {
                            audio.pause();
                          }
                        } catch (err) {
                          console.error('Audio control error:', err);
                          toast({
                            variant: 'destructive',
                            title: 'Error de audio',
                            description:
                              'Ocurrió un problema al controlar el audio.',
                          });
                        }
                      }
                    }}
                  >
                    <Play className="w-4 h-4" />
                  </Button>
                  <audio
                    id={`audio-${note.id}`}
                    src={note.audioUrl}
                    controls
                    className="flex-1 h-8"
                    controlsList="nodownload"
                    onError={(e) => {
                      const audioEl = e.currentTarget;
                      const src =
                        audioEl.currentSrc || audioEl.src || note.audioUrl;
                      const sanitizedSrc = src ? src.split('?')[0] : 'unknown';
                      console.error('Audio loading error', {
                        noteId: note.id,
                        sanitizedSrc,
                        networkState: audioEl.networkState,
                        readyState: audioEl.readyState,
                        errorCode: audioEl.error?.code,
                        errorMessage: audioEl.error?.message,
                      });
                      toast({
                        variant: 'destructive',
                        title: 'Error de carga',
                        description:
                          'No se pudo cargar el archivo de audio. Verifica que el archivo exista y sea accesible.',
                      });
                    }}
                  />
                </div>

                {/* Transcription */}
                <div className="prose prose-sm prose-slate max-w-none">
                  <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300 leading-relaxed">
                    {note.transcription || 'Sin transcripción disponible.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

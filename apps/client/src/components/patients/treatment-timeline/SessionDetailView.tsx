import * as React from 'react';
import type { ClinicalCase, TreatmentSession } from '../../../types/patient';
import { TimelineSidebar } from './TimelineSidebar';
import { PosturogramViewer } from '../PosturogramViewer';
import { SessionPhotoGallery } from './SessionPhotoGallery';
import { SessionPhotoCapture } from './SessionPhotoCapture';
import { Play } from 'lucide-react';
import {
  getInitialEvaluation,
  getFinalEvaluation,
} from '../../../lib/evaluation-utils';
import { photoQueue, type PendingPhoto, isOnline } from '@/lib/photo-queue';
import { mediaApi } from '../../../api/media';
import { useToast } from '@/hooks/use-toast';

interface SessionDetailViewProps {
  clinicalCase: ClinicalCase;
  activeSessionId?: string;
  onSelectSession: (id: string) => void;
}

function getPainColor(level: number) {
  if (level <= 3) return 'text-emerald-500';
  if (level <= 6) return 'text-amber-500';
  return 'text-rose-500';
}

export function SessionDetailView({
  clinicalCase,
  activeSessionId,
  onSelectSession,
}: SessionDetailViewProps) {
  const { treatmentSessions } = clinicalCase;

  const activeSession = treatmentSessions.find((s) => s.id === activeSessionId);

  const initialEval = getInitialEvaluation(clinicalCase);
  const finalEval = getFinalEvaluation(clinicalCase);

  const initialFootprint = initialEval?.footprints?.find(
    (f) => f.type === 'initial',
  );
  const finalFootprint = finalEval?.footprints?.find((f) => f.type === 'final');

  const hasPosturogramImages = initialFootprint?.url && finalFootprint?.url;

  const activeSessionIndex = [...treatmentSessions]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .findIndex((s) => s.id === activeSessionId);

  const [pendingPhotos, setPendingPhotos] = React.useState<PendingPhoto[]>([]);
  const [showCamera, setShowCamera] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    if (activeSessionId) {
      photoQueue.getBySession(activeSessionId).then(setPendingPhotos);
    } else {
      setPendingPhotos([]);
    }
  }, [activeSessionId]);

  const handlePhotoCapture = async (blob: Blob, caption?: string) => {
    if (!activeSessionId) return;

    if (isOnline()) {
      try {
        await mediaApi.uploadSessionPhoto(activeSessionId, blob, caption);
        toast({
          title: 'Foto subida',
          description: 'La foto se ha guardado correctamente.',
        });
      } catch (error) {
        toast({
          title: 'Error al subir',
          description: 'No se pudo subir la foto. Intenta de nuevo.',
          variant: 'destructive',
        });
      }
    } else {
      await photoQueue.add(activeSessionId, blob, caption);
      const updatedPending = await photoQueue.getBySession(activeSessionId);
      setPendingPhotos(updatedPending);
      toast({
        title: 'Sin conexión',
        description: 'Foto guardada en cola. Se subirá cuando tengas internet.',
      });
    }
    setShowCamera(false);
  };

  return (
    <div className="flex-1 flex overflow-hidden relative">
      <TimelineSidebar
        clinicalCase={clinicalCase}
        activeSessionId={activeSessionId}
        onSelectSession={onSelectSession}
      />

      <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50 dark:bg-slate-950/50">
        <div className="max-w-4xl mx-auto space-y-8">
          {activeSession ? (
            <SessionReport
              session={activeSession}
              index={activeSessionIndex}
              pendingPhotos={pendingPhotos}
              onAddPhoto={() => setShowCamera(true)}
            />
          ) : (
            <div className="text-center py-20">
              <p className="text-slate-400">
                Selecciona una sesion para ver los detalles
              </p>
            </div>
          )}

          {hasPosturogramImages && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                Evolucion Postural (Sagital)
              </h3>
              <div className="max-w-md mx-auto">
                <PosturogramViewer
                  clinicalCase={clinicalCase}
                  initialPosturogramUrl={initialFootprint.url}
                  currentPosturogramUrl={finalFootprint.url}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {showCamera && (
        <div className="absolute inset-0 z-50 bg-black">
          <SessionPhotoCapture
            onSave={handlePhotoCapture}
            onCancel={() => setShowCamera(false)}
          />
        </div>
      )}
    </div>
  );
}

function SessionReport({
  session,
  index,
  pendingPhotos = [],
  onAddPhoto,
}: {
  session: TreatmentSession;
  index: number;
  pendingPhotos?: PendingPhoto[];
  onAddPhoto: () => void;
}) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
            Sesion {String(index + 1).padStart(3, '0')}
          </span>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Reporte de Evolucion
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {new Date(session.date).toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
          <span className="text-xs font-medium text-slate-500">Dolor END</span>
          <span
            className={`text-lg font-bold ${getPainColor(session.finalPainLevel)}`}
          >
            {session.finalPainLevel}/10
          </span>
        </div>
      </div>

      {session.voiceNotes && session.voiceNotes.length > 0 && (
        <div className="mb-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
          <div className="flex items-start gap-4">
            <button
              className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-md hover:bg-teal-700 transition-colors"
              aria-label="Reproducir nota de voz"
            >
              <Play size={18} className="ml-1" />
            </button>
            <div className="flex-1">
              <div className="h-10 flex flex-col justify-center">
                <div className="w-full h-8 bg-slate-200 dark:bg-slate-700 rounded overflow-hidden flex items-end gap-0.5 px-1 pb-1 opacity-50">
                  {[...Array(20)].map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-slate-400 dark:bg-slate-500"
                      style={{
                        height: `${20 + Math.sin(i * 0.5) * 40 + (i % 3) * 10}%`,
                      }}
                    />
                  ))}
                </div>
              </div>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 italic">
                "{session.voiceNotes[0].transcription}"
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
            Tecnicas Aplicadas
          </h4>
          {session.procedures.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {session.procedures.map((procedure) => (
                <span
                  key={procedure}
                  className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-sm"
                >
                  {procedure}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic">
              Sin tecnicas registradas
            </p>
          )}
        </div>

        <div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
            Respuesta del Paciente
          </h4>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            {session.patientResponse || (
              <span className="italic text-slate-400">
                Sin respuesta registrada
              </span>
            )}
          </p>
        </div>

        {session.observations && (
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
              Observaciones
            </h4>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              {session.observations}
            </p>
          </div>
        )}

        <div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
            Fotos de la Sesion
          </h4>
          <SessionPhotoGallery
            photos={session.photos || []}
            pendingPhotos={pendingPhotos}
            onAdd={onAddPhoto}
          />
        </div>
      </div>
    </div>
  );
}

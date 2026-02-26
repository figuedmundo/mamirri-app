import * as React from 'react';
import type { ClinicalCase, TreatmentSession } from '../../types/patient';
import { PhaseProgress } from './treatment-timeline/PhaseProgress';
import { SessionCard } from './treatment-timeline/SessionCard';
import { PainTrendChart } from './treatment-timeline/PainTrendChart';
import { SessionStatsSummary } from './treatment-timeline/SessionStatsSummary';
import { SessionForm } from './treatment-timeline/SessionForm';
import type { SessionFormData } from './treatment-timeline/session-form-schema';
import { Plus, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { patientsApi } from '../../api/patients';
import { mediaApi } from '../../api/media';
import { photoQueue, isOnline, onOnline } from '@/lib/photo-queue';

export interface TreatmentTimelineProps {
  clinicalCase: ClinicalCase;
  onSessionCreated?: (session: TreatmentSession) => void;
  onSessionUpdated?: (session: TreatmentSession) => void;
  onSessionDeleted?: (sessionId: string) => void;
  onSelectSession?: (sessionId: string) => void;
}

export function TreatmentTimeline({
  clinicalCase,
  onSessionCreated,
  onSessionUpdated,
  onSessionDeleted,
  onSelectSession,
}: TreatmentTimelineProps) {
  const [selectedPhase, setSelectedPhase] = React.useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingSession, setEditingSession] =
    React.useState<TreatmentSession | null>(null);
  const [deletingSessionId, setDeletingSessionId] = React.useState<
    string | null
  >(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const { toast } = useToast();

  const { treatmentPlan, treatmentSessions } = clinicalCase;

  if (!treatmentPlan) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
            Plan de tratamiento pendiente
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Define el diagnóstico en la evaluación SOAP para habilitar la
            planificación de fases y sesiones.
          </p>
        </div>
      </div>
    );
  }

  React.useEffect(() => {
    // Process queued photos when back online
    const cleanup = onOnline(async () => {
      const pending = await photoQueue.getAll();
      if (pending.length === 0) return;

      toast({
        title: 'Conexión restaurada',
        description: `Subiendo ${pending.length} fotos pendientes...`,
      });

      for (const photo of pending) {
        try {
          await mediaApi.uploadSessionPhoto(
            photo.sessionId,
            photo.blob,
            photo.caption,
          );
          await photoQueue.remove(photo.id);
        } catch (error) {
          console.error('Failed to upload queued photo:', error);
        }
      }

      toast({
        title: 'Sincronización completada',
        description: 'Todas las fotos pendientes se han subido.',
      });
      // Trigger refresh if needed, for now user might need to reload or we rely on parent update
    });

    return cleanup;
  }, [toast]);

  const currentPhase =
    treatmentSessions.length > 0
      ? Math.max(...treatmentSessions.map((s) => s.phaseNumber))
      : 1;

  const filteredSessions = selectedPhase
    ? treatmentSessions.filter((s) => s.phaseNumber === selectedPhase)
    : treatmentSessions;

  const sortedSessions = [...filteredSessions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const handleAddSession = () => {
    setEditingSession(null);
    setIsFormOpen(true);
  };

  const handleEditSession = (sessionId: string) => {
    const session = treatmentSessions.find((s) => s.id === sessionId);
    if (session) {
      setEditingSession(session);
      setIsFormOpen(true);
    }
  };

  const handleDeleteSession = (sessionId: string) => {
    setDeletingSessionId(sessionId);
  };

  const handleFormSubmit = async (
    data: SessionFormData,
    photos?: Array<{ blob: Blob; caption?: string }>,
    voiceNote?: { blob: Blob; duration: number },
  ) => {
    setIsSubmitting(true);
    try {
      if (editingSession) {
        await patientsApi.updateSession(editingSession.id, data);

        if (photos && photos.length > 0) {
          if (isOnline()) {
            await Promise.all(
              photos.map((photo) =>
                mediaApi.uploadSessionPhoto(
                  editingSession.id,
                  photo.blob,
                  photo.caption,
                ),
              ),
            );
          } else {
            await Promise.all(
              photos.map((photo) =>
                photoQueue.add(editingSession.id, photo.blob, photo.caption),
              ),
            );
            toast({
              title: 'Sin conexión',
              description:
                'Las fotos se subirán cuando vuelvas a tener internet.',
              variant: 'default', // Info/warning style
            });
          }
        }

        toast({
          title: 'Sesión actualizada',
          description: 'Los cambios se guardaron correctamente.',
        });
        onSessionUpdated?.({
          ...editingSession,
          ...data,
        });
      } else {
        const newSession = await patientsApi.addSession(clinicalCase.id, data);

        if (photos && photos.length > 0) {
          if (isOnline()) {
            await Promise.all(
              photos.map((photo) =>
                mediaApi.uploadSessionPhoto(
                  newSession.id,
                  photo.blob,
                  photo.caption,
                ),
              ),
            );
          } else {
            await Promise.all(
              photos.map((photo) =>
                photoQueue.add(newSession.id, photo.blob, photo.caption),
              ),
            );
            toast({
              title: 'Sin conexión',
              description:
                'Las fotos se subirán cuando vuelvas a tener internet.',
              variant: 'default',
            });
          }
        }

        if (voiceNote) {
          try {
            await mediaApi.uploadSessionVoiceNote(
              newSession.id,
              voiceNote.blob,
              voiceNote.duration,
            );
          } catch (error) {
            console.error('Failed to upload voice note:', error);
            toast({
              title: 'Advertencia',
              description:
                'La sesión se creó, pero la nota de voz no se pudo subir. Intenta agregarla editando la sesión.',
              variant: 'destructive',
            });
          }
        }

        if (photos && photos.length > 0 && !isOnline()) {
          toast({
            title: 'Sin conexión',
            description:
              'Las fotos se subirán cuando vuelvas a tener internet.',
            variant: 'default',
          });
        }

        toast({
          title: 'Sesión creada',
          description: 'La sesión se ha registrado correctamente.',
        });
        onSessionCreated?.(newSession);
      }
      setIsFormOpen(false);
      setEditingSession(null);
    } catch {
      toast({
        title: 'Error',
        description: 'No se pudo guardar la sesion. Intenta de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingSessionId) return;

    setIsDeleting(true);
    try {
      await patientsApi.deleteSession(deletingSessionId);
      toast({
        title: 'Sesión eliminada',
        description: 'La sesión se eliminó correctamente.',
      });
      onSessionDeleted?.(deletingSessionId);
    } catch {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la sesión. Intenta de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setDeletingSessionId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Cronograma de Tratamiento
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Historial de intervenciones y progreso
          </p>
        </div>
        <Button
          onClick={handleAddSession}
          className="bg-teal-600 hover:bg-teal-700 shadow-sm"
          data-testid="new-session-btn"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nueva Sesión
        </Button>
      </div>

      <SessionStatsSummary clinicalCase={clinicalCase} />

      <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <PhaseProgress
            phases={treatmentPlan.phases}
            currentPhase={currentPhase}
            sessions={treatmentSessions}
            selectedPhase={selectedPhase}
            onPhaseClick={setSelectedPhase}
          />
          <div className="flex-shrink-0">
            <PainTrendChart sessions={treatmentSessions} />
          </div>
        </div>
      </div>

      <div className="relative pl-8 border-l-2 border-slate-200 dark:border-slate-700 space-y-6">
        {sortedSessions.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
            <AlertCircle className="w-12 h-12 mx-auto text-slate-400 mb-4" />
            <p className="text-slate-500 dark:text-slate-400">
              {selectedPhase
                ? `No hay sesiones en la Fase ${selectedPhase}.`
                : 'No hay sesiones registradas.'}
            </p>
            <button
              onClick={handleAddSession}
              className="mt-4 text-teal-600 dark:text-teal-400 hover:underline"
            >
              Registrar la primera sesión
            </button>
          </div>
        ) : (
          sortedSessions.map((session) => (
            <div key={session.id} className="relative">
              <div className="absolute -left-[41px] top-4 w-5 h-5 rounded-full border-4 border-white dark:border-slate-900 bg-teal-500 shadow-sm" />
              <SessionCard
                session={session}
                onView={onSelectSession}
                onEdit={handleEditSession}
                onDelete={handleDeleteSession}
              />
            </div>
          ))
        )}
      </div>

      <SessionForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingSession(null);
        }}
        onSubmit={handleFormSubmit}
        phases={treatmentPlan.phases}
        initialData={editingSession || undefined}
        isLoading={isSubmitting}
      />

      <AlertDialog
        open={!!deletingSessionId}
        onOpenChange={(open) => !open && setDeletingSessionId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar sesión?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La sesión y todos sus datos
              serán eliminados permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

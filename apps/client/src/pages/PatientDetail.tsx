import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PatientProfile } from '../components/patients/PatientProfile';
import {
  PatientForm,
  type PatientFormData,
} from '../components/patients/PatientForm';
import {
  usePatientQuery,
  useUpdatePatient,
  useCreateCase,
} from '../hooks/use-patients';
import {
  useUploadEvaluationVoiceNote,
  useUploadPostureVideo,
} from '../hooks/use-media';
import type { VideoMetadata } from '../types/patient';
import { useToast } from '../hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import { RecordingFloatingBar } from '../components/patients/RecordingFloatingBar';
import { VideoRecorder } from '../components/patients/VideoRecorder';
import { useVoiceRecorder } from '../hooks/use-voice-recorder';
import { getActiveEvaluation } from '../lib/evaluation-utils';
import { ToastAction } from '@/components/ui/toast';

export default function PatientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: patient, isLoading, isError } = usePatientQuery(id!);
  const updatePatient = useUpdatePatient();
  const createCase = useCreateCase();
  const uploadVoiceNote = useUploadEvaluationVoiceNote();
  const uploadVideo = useUploadPostureVideo();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
  const [isCreateCaseOpen, setIsCreateCaseOpen] = useState(false);
  const [isCreateCaseConfirmOpen, setIsCreateCaseConfirmOpen] = useState(false);
  const [createCaseTitle, setCreateCaseTitle] = useState('');
  const [createCaseReason, setCreateCaseReason] = useState('');
  const [createCaseTitleError, setCreateCaseTitleError] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (isError) {
      toast({
        title: 'Error',
        description: 'No se pudo cargar el paciente',
        variant: 'destructive',
      });
      navigate('/pacientes');
    }
  }, [isError, navigate, toast]);

  const activeCase = patient?.clinicalCases?.find((c) => c.status === 'active');
  const activeEval = activeCase ? getActiveEvaluation(activeCase) : undefined;

  const handleVoiceRecordingComplete = async (blob: Blob, duration: number) => {
    if (!activeEval) return;

    try {
      toast({
        title: 'Subiendo nota de voz...',
        description: 'Guardando en la evaluación activa.',
      });

      await uploadVoiceNote.mutateAsync({
        evaluationId: activeEval.id,
        file: blob,
        durationSeconds: duration,
      });

      toast({
        title: 'Éxito',
        description: 'Nota de voz guardada correctamente.',
        action: (
          <ToastAction
            altText="Deshacer guardado"
            onClick={() => {
              toast({
                title: 'Acción cancelada',
                description: 'La nota no se ha guardado.',
              });
            }}
          >
            Deshacer
          </ToastAction>
        ),
      });
    } catch (error) {
      console.error('Voice upload error:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar la nota de voz.',
        variant: 'destructive',
      });
    }
  };

  const {
    isRecording,
    duration,
    startRecording,
    stopRecording,
    cancelRecording,
    error,
  } = useVoiceRecorder({
    autoSave: true,
    onRecordingComplete: handleVoiceRecordingComplete,
  });

  useEffect(() => {
    if (error) {
      if (
        error.name === 'NotAllowedError' ||
        error.message.includes('Permission denied')
      ) {
        toast({
          title: 'Permiso denegado',
          description:
            'Por favor, permite el acceso al micrófono para grabar notas de voz.',
          variant: 'destructive',
        });
      } else if (error.message === 'BROWSER_NOT_SUPPORTED') {
        toast({
          title: 'No soportado',
          description:
            'Tu navegador no soporta grabación de audio. Intenta con Chrome o Safari.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: 'No se pudo iniciar la grabación. Intenta de nuevo.',
          variant: 'destructive',
        });
      }
    }
  }, [error, toast]);

  const handleEdit = () => {
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (formData: PatientFormData) => {
    if (!id) return;
    await updatePatient.mutateAsync({ id, data: formData });
    setIsEditOpen(false);
  };

  const handleVoiceDictation = () => {
    if (!activeEval) {
      toast({
        title: 'Atención',
        description: 'Se necesita un caso clínico activo para grabar notas.',
        variant: 'destructive',
      });
      return;
    }
    void startRecording();
  };

  const handleCaptureFootprint = () => {
    // This is already handled by PatientProfile opening CameraCapture
  };

  const handleCaptureVideo = () => {
    if (!activeEval) {
      toast({
        title: 'Atención',
        description: 'Se necesita un caso clínico activo para grabar videos.',
        variant: 'destructive',
      });
      return;
    }
    setIsVideoDialogOpen(true);
  };

  const handleVideoRecordingComplete = async (
    blob: Blob,
    metadata: VideoMetadata,
  ) => {
    if (!activeEval) return;

    try {
      toast({
        title: 'Subiendo video...',
        description: 'Guardando en la evaluación activa.',
      });

      await uploadVideo.mutateAsync({
        evaluationId: activeEval.id,
        file: blob,
        type: (metadata.type || 'static') as 'gait' | 'static' | 'dynamic',
        duration: metadata.durationSeconds,
      });

      toast({
        title: 'Éxito',
        description: 'Video guardado correctamente.',
      });
      setIsVideoDialogOpen(false);
    } catch (error) {
      console.error('Video upload error:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar el video.',
        variant: 'destructive',
      });
    }
  };

  const handleSchedule = () => {
    if (patient) {
      const text = `Cita Fisioterapia - ${patient.name}`;
      const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
    }
  };

  const handleViewCase = (caseId: string) => {
    navigate(`/pacientes/${id}/casos/${caseId}`);
  };

  const resetCreateCaseForm = () => {
    setCreateCaseTitle('');
    setCreateCaseReason('');
    setCreateCaseTitleError(null);
  };

  const validateCreateCaseTitle = () => {
    const title = createCaseTitle.trim();
    if (title.length < 3) {
      setCreateCaseTitleError('El titulo debe tener al menos 3 caracteres.');
      return null;
    }
    if (title.length > 200) {
      setCreateCaseTitleError('El titulo no puede exceder 200 caracteres.');
      return null;
    }
    setCreateCaseTitleError(null);
    return title;
  };

  const submitCreateCase = async () => {
    if (!id) return;
    const title = validateCreateCaseTitle();
    if (!title) return;

    await createCase.mutateAsync({
      patientId: id,
      title,
      consultationReason: createCaseReason.trim() || undefined,
    });

    setIsCreateCaseConfirmOpen(false);
    setIsCreateCaseOpen(false);
    resetCreateCaseForm();
  };

  const handleCreateCaseSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = validateCreateCaseTitle();
    if (!title) return;

    if (
      patient?.clinicalCases.some(
        (clinicalCase) => clinicalCase.status === 'active',
      )
    ) {
      setIsCreateCaseConfirmOpen(true);
      return;
    }

    await submitCreateCase();
  };

  const handleCreateCase = () => {
    setCreateCaseTitleError(null);
    setIsCreateCaseOpen(true);
  };

  const closeCreateCaseDialog = () => {
    setIsCreateCaseOpen(false);
    setIsCreateCaseConfirmOpen(false);
    resetCreateCaseForm();
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 dark:text-slate-400">
            Cargando perfil...
          </p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return <div className="p-8 text-center">Paciente no encontrado</div>;
  }

  const initialEditData: Partial<PatientFormData> = {
    name: patient.name,
    occupation: patient.occupation,
    phone: patient.phone,
    email: patient.email || '',
    birthDate: patient.birthDate,
    gender: patient.gender || '',
    previousOccupation: patient.previousOccupation || '',
    emergencyContact: patient.emergencyContact,
    referralSource: patient.referralSource,
    medicalFlags: patient.medicalFlags,
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen">
      <PatientProfile
        patient={patient}
        onEdit={handleEdit}
        onCreateCase={handleCreateCase}
        onVoiceDictation={handleVoiceDictation}
        onCaptureFootprint={handleCaptureFootprint}
        onCaptureVideo={handleCaptureVideo}
        onSchedule={handleSchedule}
        onViewCase={handleViewCase}
        onRefresh={() => {}}
      />

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px] md:max-w-screen-md lg:max-w-screen-lg p-0">
          <DialogTitle className="sr-only">Editar Paciente</DialogTitle>
          <DialogDescription className="sr-only">
            Formulario para editar la información del paciente.
          </DialogDescription>
          <PatientForm
            mode="edit"
            initialData={initialEditData}
            onSubmit={handleEditSubmit}
            onCancel={() => setIsEditOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={isCreateCaseOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeCreateCaseDialog();
            return;
          }
          setIsCreateCaseOpen(true);
        }}
      >
        <DialogContent className="sm:max-w-[560px] p-0">
          <DialogHeader className="border-b p-6">
            <DialogTitle>Nuevo Caso Clinico</DialogTitle>
            <DialogDescription className="sr-only">
              Formulario para crear un nuevo caso clinico del paciente.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4 p-6" onSubmit={handleCreateCaseSubmit}>
            <div className="space-y-2">
              <label
                htmlFor="new-case-title"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Titulo *
              </label>
              <input
                id="new-case-title"
                type="text"
                value={createCaseTitle}
                onChange={(event) => {
                  setCreateCaseTitle(event.target.value);
                  if (createCaseTitleError) {
                    setCreateCaseTitleError(null);
                  }
                }}
                maxLength={200}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                placeholder="Ej: Rehabilitacion de hombro"
              />
              {createCaseTitleError && (
                <p className="text-xs text-rose-600 dark:text-rose-400">
                  {createCaseTitleError}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="new-case-reason"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Motivo de consulta
              </label>
              <textarea
                id="new-case-reason"
                value={createCaseReason}
                onChange={(event) => setCreateCaseReason(event.target.value)}
                rows={4}
                className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                placeholder="Describe brevemente el motivo de consulta"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={closeCreateCaseDialog}
                className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={createCase.isPending}
                className="inline-flex items-center justify-center rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {createCase.isPending ? 'Creando...' : 'Crear Caso'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isCreateCaseConfirmOpen}
        onOpenChange={setIsCreateCaseConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Este paciente ya tiene un caso activo
            </AlertDialogTitle>
            <AlertDialogDescription>
              Deseas crear uno nuevo de todas formas?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={createCase.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                void submitCreateCase();
              }}
              disabled={createCase.isPending}
            >
              {createCase.isPending ? 'Creando...' : 'Si, crear caso'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isVideoDialogOpen} onOpenChange={setIsVideoDialogOpen}>
        <DialogContent className="sm:max-w-[500px] h-[80vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-4 border-b">
            <DialogTitle>Grabar Video de Postura</DialogTitle>
            <DialogDescription className="sr-only">
              Interfaz de grabación de video para análisis de postura.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            <VideoRecorder
              onCapture={handleVideoRecordingComplete}
              onCancel={() => setIsVideoDialogOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>

      <RecordingFloatingBar
        isRecording={isRecording}
        duration={duration}
        onStop={stopRecording}
        onCancel={cancelRecording}
      />
    </div>
  );
}

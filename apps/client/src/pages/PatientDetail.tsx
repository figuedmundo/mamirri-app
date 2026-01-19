import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PatientProfile } from '../components/patients/PatientProfile';
import {
  PatientForm,
  type PatientFormData,
} from '../components/patients/PatientForm';
import { patientsApi } from '../api/patients';
import { mediaApi } from '../api/media';
import type { Patient, VideoMetadata } from '../types/patient';
import { useToast } from '../hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { VoiceRecorder } from '../components/patients/VoiceRecorder';
import { VideoRecorder } from '../components/patients/VideoRecorder';
import { getActiveEvaluation } from '../lib/evaluation-utils';

export default function PatientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isVoiceDialogOpen, setIsVoiceDialogOpen] = useState(false);
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);

  const loadPatient = useCallback(
    async (patientId: string) => {
      try {
        setLoading(true);
        const data = await patientsApi.findOne(patientId);
        setPatient(data);
      } catch (error) {
        console.error(error);
        toast({
          title: 'Error',
          description: 'No se pudo cargar el paciente',
          variant: 'destructive',
        });
        navigate('/pacientes');
      } finally {
        setLoading(false);
      }
    },
    [navigate, toast],
  );

  useEffect(() => {
    if (id) {
      void loadPatient(id);
    }
  }, [id, loadPatient]);

  const activeCase = patient?.clinicalCases?.find((c) => c.status === 'active');
  const activeEval = activeCase ? getActiveEvaluation(activeCase) : undefined;

  const handleEdit = () => {
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (formData: PatientFormData) => {
    if (!id) return;

    try {
      await patientsApi.update(id, formData);
      toast({
        title: 'Éxito',
        description: 'Paciente actualizado correctamente',
      });
      setIsEditOpen(false);
      loadPatient(id);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el paciente',
        variant: 'destructive',
      });
      throw error;
    }
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
    setIsVoiceDialogOpen(true);
  };

  const handleVoiceRecordingComplete = async (blob: Blob, duration: number) => {
    if (!activeEval) return;

    try {
      toast({
        title: 'Subiendo nota de voz...',
        description: 'Guardando en la evaluación activa.',
      });

      await mediaApi.uploadEvaluationVoiceNote(activeEval.id, blob, duration);

      toast({
        title: 'Éxito',
        description: 'Nota de voz guardada correctamente.',
      });
      setIsVoiceDialogOpen(false);
      if (id) void loadPatient(id);
    } catch (error) {
      console.error('Voice upload error:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar la nota de voz.',
        variant: 'destructive',
      });
    }
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

      await mediaApi.uploadPostureVideo(
        activeEval.id,
        blob,
        (metadata.type || 'static') as 'gait' | 'static' | 'dynamic',
        metadata.durationSeconds,
      );

      toast({
        title: 'Éxito',
        description: 'Video guardado correctamente.',
      });
      setIsVideoDialogOpen(false);
      if (id) void loadPatient(id);
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

  if (loading) {
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
    age: patient.age,
    occupation: patient.occupation,
    phone: patient.phone,
    email: patient.email || '',
    birthDate: patient.birthDate,
    address: patient.address || '',
    gender: patient.gender || '',
    previousOccupation: patient.previousOccupation || '',
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen">
      <PatientProfile
        patient={patient}
        onEdit={handleEdit}
        onVoiceDictation={handleVoiceDictation}
        onCaptureFootprint={handleCaptureFootprint}
        onCaptureVideo={handleCaptureVideo}
        onSchedule={handleSchedule}
        onViewCase={handleViewCase}
        onRefresh={() => id && void loadPatient(id)}
      />

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <PatientForm
            mode="edit"
            initialData={initialEditData}
            onSubmit={handleEditSubmit}
            onCancel={() => setIsEditOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isVoiceDialogOpen} onOpenChange={setIsVoiceDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-center">
              Grabar Nota de Voz
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <VoiceRecorder onRecordingComplete={handleVoiceRecordingComplete} />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isVideoDialogOpen} onOpenChange={setIsVideoDialogOpen}>
        <DialogContent className="sm:max-w-[500px] h-[80vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-4 border-b">
            <DialogTitle>Grabar Video de Postura</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            <VideoRecorder
              onCapture={handleVideoRecordingComplete}
              onCancel={() => setIsVideoDialogOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

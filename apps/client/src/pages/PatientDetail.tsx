import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PatientProfile } from '../components/patients/PatientProfile';
import {
  PatientForm,
  type PatientFormData,
} from '../components/patients/PatientForm';
import { patientsApi } from '../api/patients';
import type { Patient } from '../types/patient';
import { useToast } from '../hooks/use-toast';
import { Dialog, DialogContent } from '../components/ui/dialog';

export default function PatientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);

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
    toast({
      title: 'Dictado por Voz',
      description: 'Disponible próximamente',
    });
  };

  const handleCaptureFootprint = () => {
    toast({
      title: 'Capturar Huella',
      description: 'Disponible próximamente',
    });
  };

  const handleCaptureVideo = () => {
    toast({
      title: 'Video Postura',
      description: 'Disponible próximamente',
    });
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
    </div>
  );
}

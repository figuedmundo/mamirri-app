import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PatientProfile } from '../components/patients/PatientProfile';
import { patientsApi } from '../api/patients';
import type { Patient } from '../types/patient';
import { useToast } from '../hooks/use-toast';

export default function PatientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadPatient(id);
    }
  }, [id]);

  const loadPatient = async (patientId: string) => {
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
  };

  const handleEdit = () => {
    toast({
      title: 'Info',
      description: 'Función de editar pendiente de implementación',
    });
  };

  const handleVoiceDictation = () => {
    toast({
      title: 'Dictado por Voz',
      description: 'Simulando grabación y transcripción...',
    });
  };

  const handleCaptureFootprint = () => {
    toast({ title: 'Captura', description: 'Abrir cámara para huella' });
  };

  const handleCaptureVideo = () => {
    toast({
      title: 'Captura',
      description: 'Abrir cámara para video postural',
    });
  };

  const handleSchedule = () => {
    if (patient) {
      const text = `Cita Fisioterapia - ${patient.name}`;
      const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Cargando perfil...</div>;
  }

  if (!patient) {
    return <div className="p-8 text-center">Paciente no encontrado</div>;
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen">
      <PatientProfile
        patient={patient}
        onEdit={handleEdit}
        onVoiceDictation={handleVoiceDictation}
        onCaptureFootprint={handleCaptureFootprint}
        onCaptureVideo={handleCaptureVideo}
        onSchedule={handleSchedule}
      />
    </div>
  );
}

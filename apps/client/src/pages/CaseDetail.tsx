import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CaseDetailLayout } from '../components/patients/CaseDetailLayout';
import { usePatientQuery } from '../hooks/use-patients';
import type { ClinicalCase } from '../types/patient';
import { useToast } from '../hooks/use-toast';

export default function CaseDetail() {
  const { id, caseId } = useParams<{ id: string; caseId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: patient, isLoading, isError } = usePatientQuery(id!);

  useEffect(() => {
    if (isError) {
      toast({
        title: 'Error',
        description: 'No se pudo cargar el caso clínico',
        variant: 'destructive',
      });
      navigate('/pacientes');
    }
  }, [isError, navigate, toast]);

  const handleBack = () => {
    navigate(`/pacientes/${id}`);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-slate-950 z-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 dark:text-slate-400">
            Cargando caso clínico...
          </p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-slate-950 z-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 dark:text-slate-400 mb-4">
            Paciente no encontrado
          </p>
          <button
            onClick={() => navigate('/pacientes')}
            className="text-teal-600 hover:text-teal-700 font-medium"
          >
            Volver a pacientes
          </button>
        </div>
      </div>
    );
  }

  const clinicalCase: ClinicalCase | undefined = patient.clinicalCases.find(
    (c) => c.id === caseId,
  );

  if (!clinicalCase) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-slate-950 z-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 dark:text-slate-400 mb-4">
            Caso clínico no encontrado
          </p>
          <button
            onClick={handleBack}
            className="text-teal-600 hover:text-teal-700 font-medium"
          >
            Volver al perfil del paciente
          </button>
        </div>
      </div>
    );
  }

  return (
    <CaseDetailLayout
      patient={patient}
      clinicalCase={clinicalCase}
      onBack={handleBack}
      onOpenLibrary={(planId) => navigate(`/biblioteca?planId=${planId}`)}
    />
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PatientList } from '../components/patients/PatientList';
import {
  PatientForm,
  type PatientFormData,
} from '../components/patients/PatientForm';
import type { Patient } from '../types/patient';
import {
  usePatientsQuery,
  useCreatePatient,
  useUpdatePatient,
  useDeletePatient,
} from '../hooks/use-patients';
import {
  Dialog,
  DialogContent,
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
import { Loader2 } from 'lucide-react';

export default function Patients() {
  const navigate = useNavigate();
  const { data: patients = [], isLoading } = usePatientsQuery();
  const createPatient = useCreatePatient();
  const updatePatient = useUpdatePatient();
  const deletePatient = useDeletePatient();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editPatient, setEditPatient] = useState<Patient | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);

  const handleView = (id: string) => {
    navigate(`/pacientes/${id}`);
  };

  const handleEditClick = (id: string) => {
    const patient = patients.find((p) => p.id === id);
    if (patient) {
      setEditPatient(patient);
      setIsEditOpen(true);
    }
  };

  const handleEditSubmit = (formData: PatientFormData) => {
    if (!editPatient) return Promise.reject(new Error('No patient selected'));
    return updatePatient
      .mutateAsync({ id: editPatient.id, data: formData })
      .then(() => {
        setIsEditOpen(false);
        setEditPatient(null);
      });
  };

  const handleDeleteClick = (id: string) => {
    const patient = patients.find((p) => p.id === id);
    if (patient) {
      setPatientToDelete(patient);
      setIsDeleteOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!patientToDelete) return;
    await deletePatient.mutateAsync(patientToDelete.id);
    setIsDeleteOpen(false);
    setPatientToDelete(null);
  };

  const handleSchedule = (id: string) => {
    const patient = patients.find((p) => p.id === id);
    if (patient) {
      const text = `Cita Fisioterapia - ${patient.name}`;
      const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
    }
  };

  const getEditInitialData = (): Partial<PatientFormData> | undefined => {
    if (!editPatient) return undefined;
    return {
      name: editPatient.name,
      occupation: editPatient.occupation,
      phone: editPatient.phone,
      email: editPatient.email || '',
      birthDate: editPatient.birthDate,
      gender: editPatient.gender || '',
      previousOccupation: editPatient.previousOccupation || '',
      emergencyContact: editPatient.emergencyContact,
      referralSource: editPatient.referralSource,
      medicalFlags: editPatient.medicalFlags,
    };
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 dark:text-slate-400">
            Cargando pacientes...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PatientList
        patients={patients}
        onView={handleView}
        onCreate={() => setIsCreateOpen(true)}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
        onSchedule={handleSchedule}
      />

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[425px] md:max-w-screen-md lg:max-w-screen-lg p-0">
          <DialogTitle className="sr-only">Crear Nuevo Paciente</DialogTitle>
          <DialogDescription className="sr-only">
            Formulario para registrar un nuevo paciente en el sistema.
          </DialogDescription>
          <PatientForm
            mode="create"
            onSubmit={(formData) => {
              return createPatient
                .mutateAsync(formData)
                .then(() => setIsCreateOpen(false));
            }}
            onCancel={() => setIsCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px] md:max-w-screen-md lg:max-w-screen-lg p-0">
          <DialogTitle className="sr-only">Editar Paciente</DialogTitle>
          <DialogDescription className="sr-only">
            Formulario para editar la información del paciente existente.
          </DialogDescription>
          <PatientForm
            mode="edit"
            initialData={getEditInitialData()}
            onSubmit={handleEditSubmit}
            onCancel={() => {
              setIsEditOpen(false);
              setEditPatient(null);
            }}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar paciente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer.{' '}
              {patientToDelete && (
                <>
                  Se eliminarán todos los registros de{' '}
                  <span className="font-semibold">{patientToDelete.name}</span>,
                  incluyendo sus casos clínicos, evaluaciones y sesiones de
                  tratamiento.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletePatient.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deletePatient.isPending}
              className="bg-rose-600 hover:bg-rose-700 focus:ring-rose-600"
            >
              {deletePatient.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                'Eliminar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PatientList } from '../components/patients/PatientList';
import { patientsApi } from '../api/patients';
import type { Patient } from '../types/patient';
import { useToast } from '../hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

export default function Patients() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: '',
    age: '',
    occupation: '',
    phone: '',
    birthDate: '',
  });

  const loadPatients = async () => {
    try {
      setLoading(true);
      const data = await patientsApi.findAll();
      setPatients(data);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los pacientes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const handleCreate = async () => {
    try {
      await patientsApi.create({
        ...newPatient,
        age: parseInt(newPatient.age),
      });
      toast({ title: 'Éxito', description: 'Paciente creado correctamente' });
      setIsCreateOpen(false);
      loadPatients();
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'No se pudo crear el paciente',
        variant: 'destructive',
      });
    }
  };

  const handleView = (id: string) => {
    navigate(`/pacientes/${id}`);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este paciente?')) {
      try {
        await patientsApi.delete(id);
        toast({ title: 'Eliminado', description: 'Paciente eliminado' });
        loadPatients();
      } catch (error) {
        console.error(error);
        toast({
          title: 'Error',
          description: 'No se pudo eliminar el paciente',
          variant: 'destructive',
        });
      }
    }
  };

  if (loading)
    return <div className="p-8 text-center">Cargando pacientes...</div>;

  return (
    <>
      <PatientList
        patients={patients}
        onView={handleView}
        onCreate={() => setIsCreateOpen(true)}
        onEdit={(id) =>
          toast({ title: 'Editar', description: `Editar paciente ${id}` })
        }
        onDelete={handleDelete}
      />

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo Paciente</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nombre
              </Label>
              <Input
                id="name"
                value={newPatient.name}
                onChange={(e) =>
                  setNewPatient({ ...newPatient, name: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="age" className="text-right">
                Edad
              </Label>
              <Input
                id="age"
                type="number"
                value={newPatient.age}
                onChange={(e) =>
                  setNewPatient({ ...newPatient, age: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="occupation" className="text-right">
                Ocupación
              </Label>
              <Input
                id="occupation"
                value={newPatient.occupation}
                onChange={(e) =>
                  setNewPatient({ ...newPatient, occupation: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Teléfono
              </Label>
              <Input
                id="phone"
                value={newPatient.phone}
                onChange={(e) =>
                  setNewPatient({ ...newPatient, phone: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="birthDate" className="text-right">
                Fecha Nac.
              </Label>
              <Input
                id="birthDate"
                type="date"
                value={newPatient.birthDate}
                onChange={(e) =>
                  setNewPatient({ ...newPatient, birthDate: e.target.value })
                }
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

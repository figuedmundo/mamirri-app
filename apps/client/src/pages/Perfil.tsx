import React, { useEffect, useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useToast } from '../hooks/use-toast';
import { useAuth } from '../hooks/use-auth';
import { usersApi } from '../api/users';
import { Loader2, Camera, Trash2, User as UserIcon } from 'lucide-react';
import { ChangePasswordModal } from '../components/profile/ChangePasswordModal';
import PinSetupModal from '../components/auth/PinSetupModal';

export default function Perfil() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isPhotoLoading, setIsPhotoLoading] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    clinicName: '',
    licenseNumber: '',
    specialty: '',
    yearsExperience: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        clinicName: user.clinicName || '',
        licenseNumber: user.licenseNumber || '',
        specialty: user.specialty || '',
        yearsExperience: user.yearsExperience?.toString() || '',
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const updatedData = await usersApi.updateProfile({
        ...formData,
        yearsExperience: formData.yearsExperience
          ? parseInt(formData.yearsExperience)
          : undefined,
      });
      updateUser(updatedData);
      toast({
        title: 'Éxito',
        description: 'Perfil actualizado correctamente',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description:
          error.response?.data?.message || 'Error al actualizar el perfil',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsPhotoLoading(true);
    try {
      const updatedUser = await usersApi.uploadPhoto(file);
      updateUser(updatedUser);
      toast({
        title: 'Éxito',
        description: 'Foto de perfil actualizada',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Error al subir la foto',
        variant: 'destructive',
      });
    } finally {
      setIsPhotoLoading(false);
    }
  };

  const handlePhotoDelete = async () => {
    setIsPhotoLoading(true);
    try {
      const updatedUser = await usersApi.deletePhoto();
      updateUser(updatedUser);
      toast({
        title: 'Éxito',
        description: 'Foto de perfil eliminada',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Error al eliminar la foto',
        variant: 'destructive',
      });
    } finally {
      setIsPhotoLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-8">
        Mi Perfil
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Información Personal
          </h2>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-32 h-32 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-700 flex items-center justify-center border-2 border-slate-200 dark:border-slate-600">
                {user.profilePhotoUrl ? (
                  <img
                    src={user.profilePhotoUrl}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserIcon className="w-16 h-16 text-slate-400" />
                )}
                {isPhotoLoading && (
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-white" />
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    document.getElementById('photo-upload')?.click()
                  }
                  disabled={isPhotoLoading}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Cambiar
                </Button>
                {user.profilePhotoUrl && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:bg-red-50"
                    onClick={handlePhotoDelete}
                    disabled={isPhotoLoading}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
              </div>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+34 600 000 000"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Información Profesional
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clinicName">Nombre de clínica</Label>
              <Input
                id="clinicName"
                name="clinicName"
                value={formData.clinicName}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="licenseNumber">Número de colegiado</Label>
              <Input
                id="licenseNumber"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialty">Especialidad</Label>
              <Input
                id="specialty"
                name="specialty"
                value={formData.specialty}
                onChange={handleInputChange}
                placeholder="Ej. Fisioterapia Deportiva"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="yearsExperience">Años de experiencia</Label>
              <Input
                id="yearsExperience"
                name="yearsExperience"
                type="number"
                min="0"
                value={formData.yearsExperience}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </section>

        <section className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Seguridad
          </h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsPasswordModalOpen(true)}
            >
              Cambiar contraseña
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsPinModalOpen(true)}
            >
              Configurar PIN de acceso rápido
            </Button>
          </div>
        </section>

        <section className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Información de la Cuenta
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between p-2 rounded-md bg-slate-50 dark:bg-slate-900/50">
              <span className="text-slate-500">Fecha de registro</span>
              <span className="font-medium">
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString('es-ES')
                  : '-'}
              </span>
            </div>
            <div className="flex justify-between p-2 rounded-md bg-slate-50 dark:bg-slate-900/50">
              <span className="text-slate-500">Rol</span>
              <span className="font-medium">Terapeuta</span>
            </div>
          </div>
        </section>

        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            size="lg"
            disabled={isLoading}
            className="w-full md:w-auto"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar cambios
          </Button>
        </div>
      </form>

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
      <PinSetupModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
      />
    </div>
  );
}

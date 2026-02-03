import { useState, useEffect, useMemo } from 'react';
import { z } from 'zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Loader2 } from 'lucide-react';
import { SplitDatePicker } from '../ui/SplitDatePicker';
import { Checkbox } from '../ui/checkbox';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';

const patientSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  occupation: z.string().min(1, 'La ocupación es requerida'),
  phone: z.string().min(7, 'El teléfono debe tener al menos 7 dígitos'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  birthDate: z.string().refine((date) => {
    if (!date) return false;
    const parsed = new Date(date);
    return !isNaN(parsed.getTime()) && parsed <= new Date();
  }, 'Fecha de nacimiento inválida o futura'),
  gender: z.string().optional(),
  previousOccupation: z.string().optional(),
  emergencyContact: z.object({
    name: z.string().min(1, 'El nombre del contacto es requerido'),
    phone: z
      .string()
      .min(7, 'El teléfono del contacto debe tener al menos 7 dígitos'),
  }),
  referralSource: z.string().optional(),
  referralSourceDetails: z.string().optional(),
  medicalFlags: z.array(z.string()).default([]),
  medicalFlagsOther: z.string().optional(),
});

export type PatientFormData = z.infer<typeof patientSchema>;

const MEDICAL_FLAGS = [
  'Diabetes',
  'Hipertensión',
  'Marcapasos',
  'Embarazo',
  'Otro',
];

const REFERRAL_SOURCES = [
  'Doctor',
  'Recomendación',
  'Instagram',
  'Google',
  'Otro',
];

interface PatientFormProps {
  mode: 'create' | 'edit';
  initialData?: Partial<PatientFormData>;
  onSubmit: (data: PatientFormData) => Promise<void>;
  onCancel: () => void;
}

const calculateAge = (birthDate: string): number => {
  if (!birthDate) return 0;
  const today = new Date();
  const birth = new Date(birthDate);
  if (isNaN(birth.getTime())) return 0;

  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age >= 0 ? age : 0;
};

export function PatientForm({
  mode,
  initialData,
  onSubmit,
  onCancel,
}: PatientFormProps) {
  const [formData, setFormData] = useState<PatientFormData>({
    name: '',
    occupation: '',
    phone: '',
    email: '',
    birthDate: '',
    gender: '',
    previousOccupation: '',
    emergencyContact: {
      name: '',
      phone: '',
    },
    referralSource: '',
    referralSourceDetails: '',
    medicalFlags: [],
    medicalFlagsOther: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
        emergencyContact: {
          name: initialData.emergencyContact?.name || '',
          phone: initialData.emergencyContact?.phone || '',
        },
        medicalFlags: initialData.medicalFlags || [],
      }));
    }
  }, [initialData]);

  const age = useMemo(
    () => calculateAge(formData.birthDate),
    [formData.birthDate],
  );

  const handleChange = (
    field: keyof PatientFormData,
    value: string | string[],
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleEmergencyChange = (field: 'name' | 'phone', value: string) => {
    setFormData((prev) => ({
      ...prev,
      emergencyContact: {
        ...prev.emergencyContact,
        [field]: value,
      },
    }));
  };

  const handleFlagToggle = (flag: string) => {
    setFormData((prev) => {
      const currentFlags = prev.medicalFlags || [];
      const newFlags = currentFlags.includes(flag)
        ? currentFlags.filter((f) => f !== flag)
        : [...currentFlags, flag];
      return { ...prev, medicalFlags: newFlags };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = patientSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path.join('.');
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(result.data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = mode === 'create' ? 'Nuevo Paciente' : 'Editar Paciente';
  const description =
    mode === 'create'
      ? 'Ingresa los datos del nuevo paciente'
      : 'Actualiza los datos del paciente';
  const submitLabel = mode === 'create' ? 'Crear Paciente' : 'Guardar Cambios';

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[90vh]">
      <DialogHeader className="px-6 py-4 border-b">
        <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>

      <ScrollArea className="flex-1 px-6 py-6">
        <div className="grid gap-8 pb-4">
          <section>
            <h3 className="text-lg font-semibold mb-4 text-slate-800 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-teal-500 rounded-full" />
              Datos Personales
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Nombre completo *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Ej: Juan Pérez"
                  className={cn('h-12', errors.name && 'border-rose-500')}
                />
                {errors.name && (
                  <p className="text-xs text-rose-500">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthDate" className="text-sm font-medium">
                  Fecha de Nacimiento *
                </Label>
                <SplitDatePicker
                  value={formData.birthDate}
                  onChange={(date) => handleChange('birthDate', date)}
                  className={cn(
                    errors.birthDate && 'border-rose-500 rounded-md',
                  )}
                />
                {errors.birthDate && (
                  <p className="text-xs text-rose-500">{errors.birthDate}</p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-slate-500">
                    Edad calculada:
                  </span>
                  <span className="text-sm font-semibold bg-slate-100 px-2 py-1 rounded">
                    {age} años
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender" className="text-sm font-medium">
                  Género
                </Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => handleChange('gender', value)}
                >
                  <SelectTrigger
                    id="gender"
                    className="h-12"
                    data-testid="gender-select"
                  >
                    <SelectValue placeholder="Seleccionar género" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Masculino">Masculino</SelectItem>
                    <SelectItem value="Femenino">Femenino</SelectItem>
                    <SelectItem value="Otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="occupation" className="text-sm font-medium">
                  Ocupación actual *
                </Label>
                <Input
                  id="occupation"
                  value={formData.occupation}
                  onChange={(e) => handleChange('occupation', e.target.value)}
                  placeholder="Ej: Ingeniero"
                  className={cn('h-12', errors.occupation && 'border-rose-500')}
                />
                {errors.occupation && (
                  <p className="text-xs text-rose-500">{errors.occupation}</p>
                )}
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-4 text-slate-800 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-blue-500 rounded-full" />
              Contacto
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">
                  Teléfono *
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="Ej: 600 000 000"
                  className={cn('h-12', errors.phone && 'border-rose-500')}
                />
                {errors.phone && (
                  <p className="text-xs text-rose-500">{errors.phone}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="paciente@ejemplo.com"
                  className={cn('h-12', errors.email && 'border-rose-500')}
                />
                {errors.email && (
                  <p className="text-xs text-rose-500">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="ec-name" className="text-sm font-medium">
                  Contacto Emergencia (Nombre) *
                </Label>
                <Input
                  id="ec-name"
                  value={formData.emergencyContact.name}
                  onChange={(e) =>
                    handleEmergencyChange('name', e.target.value)
                  }
                  placeholder="Nombre del contacto"
                  className={cn(
                    'h-12',
                    errors['emergencyContact.name'] && 'border-rose-500',
                  )}
                />
                {errors['emergencyContact.name'] && (
                  <p className="text-xs text-rose-500">
                    {errors['emergencyContact.name']}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="ec-phone" className="text-sm font-medium">
                  Contacto Emergencia (Teléfono) *
                </Label>
                <Input
                  id="ec-phone"
                  value={formData.emergencyContact.phone}
                  onChange={(e) =>
                    handleEmergencyChange('phone', e.target.value)
                  }
                  placeholder="Teléfono del contacto"
                  className={cn(
                    'h-12',
                    errors['emergencyContact.phone'] && 'border-rose-500',
                  )}
                />
                {errors['emergencyContact.phone'] && (
                  <p className="text-xs text-rose-500">
                    {errors['emergencyContact.phone']}
                  </p>
                )}
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-4 text-slate-800 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-rose-500 rounded-full" />
              Información Médica
            </h3>
            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-sm font-medium">Flags Médicos</Label>
                <div className="flex flex-wrap gap-4">
                  {MEDICAL_FLAGS.map((flag) => (
                    <div
                      key={flag}
                      className="flex items-center space-x-2 bg-slate-50 p-3 rounded-lg border"
                    >
                      <Checkbox
                        id={`flag-${flag}`}
                        checked={formData.medicalFlags?.includes(flag)}
                        onCheckedChange={() => handleFlagToggle(flag)}
                      />
                      <Label
                        htmlFor={`flag-${flag}`}
                        className="text-sm font-medium cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {flag}
                      </Label>
                    </div>
                  ))}
                </div>
                {formData.medicalFlags?.includes('Otro') && (
                  <div className="mt-3 space-y-2 animate-in fade-in slide-in-from-top-1">
                    <Label
                      htmlFor="medicalFlagsOther"
                      className="text-xs text-slate-500"
                    >
                      Especifique otros flags médicos
                    </Label>
                    <Input
                      id="medicalFlagsOther"
                      value={formData.medicalFlagsOther}
                      onChange={(e) =>
                        handleChange('medicalFlagsOther', e.target.value)
                      }
                      placeholder="Ej: Alergia a la penicilina, Escoliosis grave"
                      className="h-10"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="referralSource"
                    className="text-sm font-medium"
                  >
                    ¿Cómo nos conoció? (Opcional)
                  </Label>
                  <Select
                    value={formData.referralSource}
                    onValueChange={(value) =>
                      handleChange('referralSource', value)
                    }
                  >
                    <SelectTrigger
                      id="referralSource"
                      className="h-12"
                      data-testid="referral-select"
                    >
                      <SelectValue placeholder="Seleccionar origen" />
                    </SelectTrigger>
                    <SelectContent>
                      {REFERRAL_SOURCES.map((source) => (
                        <SelectItem key={source} value={source}>
                          {source}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {(formData.referralSource === 'Otro' ||
                  formData.referralSource === 'Doctor') && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                    <Label
                      htmlFor="referralSourceDetails"
                      className="text-xs text-slate-500"
                    >
                      {formData.referralSource === 'Doctor'
                        ? 'Nombre del Doctor'
                        : 'Especifique el origen'}
                    </Label>
                    <Input
                      id="referralSourceDetails"
                      value={formData.referralSourceDetails}
                      onChange={(e) =>
                        handleChange('referralSourceDetails', e.target.value)
                      }
                      placeholder={
                        formData.referralSource === 'Doctor'
                          ? 'Ej: Dr. García'
                          : 'Especifique...'
                      }
                      className="h-10"
                    />
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </ScrollArea>

      <DialogFooter className="px-6 py-4 border-t gap-2 sm:gap-0">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="h-12 px-8"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-12 px-8 bg-teal-600 hover:bg-teal-700 text-white"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

import { useState, useEffect } from 'react';
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
import { Loader2 } from 'lucide-react';

const patientSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  age: z
    .number()
    .min(0, 'La edad no puede ser negativa')
    .max(150, 'Edad inválida'),
  occupation: z.string().min(1, 'La ocupación es requerida'),
  phone: z.string().min(8, 'El teléfono debe tener al menos 8 dígitos'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  birthDate: z.string().refine((date) => {
    if (!date) return true;
    const parsed = new Date(date);
    return !isNaN(parsed.getTime()) && parsed <= new Date();
  }, 'La fecha de nacimiento no puede ser futura'),
  address: z.string().optional(),
  gender: z.string().optional(),
  previousOccupation: z.string().optional(),
});

export type PatientFormData = z.infer<typeof patientSchema>;

interface PatientFormProps {
  mode: 'create' | 'edit';
  initialData?: Partial<PatientFormData>;
  onSubmit: (data: PatientFormData) => Promise<void>;
  onCancel: () => void;
}

export function PatientForm({
  mode,
  initialData,
  onSubmit,
  onCancel,
}: PatientFormProps) {
  const [formData, setFormData] = useState<PatientFormData>({
    name: '',
    age: 0,
    occupation: '',
    phone: '',
    email: '',
    birthDate: '',
    address: '',
    gender: '',
    previousOccupation: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
      }));
    }
  }, [initialData]);

  const handleChange = (
    field: keyof PatientFormData,
    value: string | number,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = patientSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      const issues = result.error.issues || [];
      issues.forEach((issue: z.ZodIssue) => {
        const field = issue.path[0] as string;
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
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
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">
            Nombre *
          </Label>
          <div className="col-span-3">
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Nombre completo"
              className={errors.name ? 'border-rose-500' : ''}
            />
            {errors.name && (
              <p className="text-xs text-rose-500 mt-1">{errors.name}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="age" className="text-right">
            Edad *
          </Label>
          <div className="col-span-3">
            <Input
              id="age"
              type="number"
              value={formData.age || ''}
              onChange={(e) =>
                handleChange('age', parseInt(e.target.value) || 0)
              }
              placeholder="Edad en años"
              className={errors.age ? 'border-rose-500' : ''}
            />
            {errors.age && (
              <p className="text-xs text-rose-500 mt-1">{errors.age}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="occupation" className="text-right">
            Ocupación *
          </Label>
          <div className="col-span-3">
            <Input
              id="occupation"
              value={formData.occupation}
              onChange={(e) => handleChange('occupation', e.target.value)}
              placeholder="Ocupación actual"
              className={errors.occupation ? 'border-rose-500' : ''}
            />
            {errors.occupation && (
              <p className="text-xs text-rose-500 mt-1">{errors.occupation}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="phone" className="text-right">
            Teléfono *
          </Label>
          <div className="col-span-3">
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+34 600 000 000"
              className={errors.phone ? 'border-rose-500' : ''}
            />
            {errors.phone && (
              <p className="text-xs text-rose-500 mt-1">{errors.phone}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="email" className="text-right">
            Email
          </Label>
          <div className="col-span-3">
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="paciente@email.com"
              className={errors.email ? 'border-rose-500' : ''}
            />
            {errors.email && (
              <p className="text-xs text-rose-500 mt-1">{errors.email}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="birthDate" className="text-right">
            Fecha Nac.
          </Label>
          <div className="col-span-3">
            <Input
              id="birthDate"
              type="date"
              value={formData.birthDate}
              onChange={(e) => handleChange('birthDate', e.target.value)}
              className={errors.birthDate ? 'border-rose-500' : ''}
            />
            {errors.birthDate && (
              <p className="text-xs text-rose-500 mt-1">{errors.birthDate}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="address" className="text-right">
            Dirección
          </Label>
          <div className="col-span-3">
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Dirección del paciente"
            />
          </div>
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="gender" className="text-right">
            Género
          </Label>
          <div className="col-span-3">
            <Input
              id="gender"
              value={formData.gender}
              onChange={(e) => handleChange('gender', e.target.value)}
              placeholder="Masculino / Femenino / Otro"
            />
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
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

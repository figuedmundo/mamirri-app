import { z } from 'zod';

export const sessionFormSchema = z.object({
  date: z
    .string()
    .min(1, 'La fecha es requerida')
    .refine(
      (d) => new Date(d) <= new Date(),
      'La fecha no puede ser en el futuro',
    ),
  phaseNumber: z
    .number()
    .min(1, 'Selecciona una fase')
    .max(10, 'Fase inválida'),
  procedures: z
    .array(z.string().min(1))
    .min(1, 'Agrega al menos un procedimiento'),
  patientResponse: z
    .string()
    .min(10, 'La respuesta debe tener al menos 10 caracteres'),
  finalPainLevel: z.number().min(0).max(10),
  observations: z.string().optional(),
});

export type SessionFormData = z.infer<typeof sessionFormSchema>;

export interface CreateSessionDto {
  date: string;
  phaseNumber: number;
  procedures: string[];
  patientResponse: string;
  finalPainLevel: number;
  observations?: string;
}

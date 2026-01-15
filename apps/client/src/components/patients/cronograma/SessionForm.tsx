import * as React from 'react';
import type { TreatmentPhase, TreatmentSession } from '../../../types/patient';
import { sessionFormSchema, type SessionFormData } from './session-form-schema';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Plus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SessionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SessionFormData) => Promise<void>;
  phases: TreatmentPhase[];
  initialData?: TreatmentSession;
  isLoading?: boolean;
}

const COMMON_PROCEDURES = [
  'Masaje terapéutico',
  'Estiramientos',
  'Movilizaciones',
  'Electroterapia',
  'Termoterapia',
  'Crioterapia',
  'Ultrasonido',
  'Ejercicios activos',
  'Ejercicios pasivos',
  'Técnica manual',
];

export function SessionForm({
  isOpen,
  onClose,
  onSubmit,
  phases,
  initialData,
  isLoading = false,
}: SessionFormProps) {
  const isEditing = !!initialData;

  const [formData, setFormData] = React.useState<SessionFormData>({
    date:
      initialData?.date?.split('T')[0] ||
      new Date().toISOString().split('T')[0],
    phaseNumber: initialData?.phaseNumber || phases[0]?.number || 1,
    procedures: initialData?.procedures || [],
    patientResponse: initialData?.patientResponse || '',
    finalPainLevel: initialData?.finalPainLevel ?? 5,
    observations: initialData?.observations || '',
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [procedureInput, setProcedureInput] = React.useState('');
  const [showSuggestions, setShowSuggestions] = React.useState(false);

  React.useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        date: initialData.date.split('T')[0],
        phaseNumber: initialData.phaseNumber,
        procedures: initialData.procedures,
        patientResponse: initialData.patientResponse,
        finalPainLevel: initialData.finalPainLevel,
        observations: initialData.observations || '',
      });
    } else if (isOpen && !initialData) {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        phaseNumber: phases[0]?.number || 1,
        procedures: [],
        patientResponse: '',
        finalPainLevel: 5,
        observations: '',
      });
    }
    setErrors({});
  }, [isOpen, initialData, phases]);

  const handleChange = <K extends keyof SessionFormData>(
    field: K,
    value: SessionFormData[K],
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

  const addProcedure = (procedure: string) => {
    const trimmed = procedure.trim();
    if (trimmed && !formData.procedures.includes(trimmed)) {
      handleChange('procedures', [...formData.procedures, trimmed]);
    }
    setProcedureInput('');
    setShowSuggestions(false);
  };

  const removeProcedure = (index: number) => {
    handleChange(
      'procedures',
      formData.procedures.filter((_, i) => i !== index),
    );
  };

  const handleProcedureKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && procedureInput.trim()) {
      e.preventDefault();
      addProcedure(procedureInput);
    } else if (
      e.key === 'Backspace' &&
      !procedureInput &&
      formData.procedures.length > 0
    ) {
      removeProcedure(formData.procedures.length - 1);
    }
  };

  const filteredSuggestions = COMMON_PROCEDURES.filter(
    (p) =>
      p.toLowerCase().includes(procedureInput.toLowerCase()) &&
      !formData.procedures.includes(p),
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = sessionFormSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0] as string] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    await onSubmit(result.data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Sesión' : 'Nueva Sesión'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="session-date"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                Fecha
              </label>
              <input
                id="session-date"
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className={cn(
                  'w-full px-3 py-2 rounded-lg border bg-white dark:bg-slate-900',
                  'focus:outline-none focus:ring-2 focus:ring-teal-500',
                  errors.date
                    ? 'border-red-500'
                    : 'border-slate-300 dark:border-slate-600',
                )}
              />
              {errors.date && (
                <p className="mt-1 text-xs text-red-500">{errors.date}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="session-phase"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                Fase
              </label>
              <select
                id="session-phase"
                value={formData.phaseNumber}
                onChange={(e) =>
                  handleChange('phaseNumber', Number(e.target.value))
                }
                className={cn(
                  'w-full px-3 py-2 rounded-lg border bg-white dark:bg-slate-900',
                  'focus:outline-none focus:ring-2 focus:ring-teal-500',
                  errors.phaseNumber
                    ? 'border-red-500'
                    : 'border-slate-300 dark:border-slate-600',
                )}
              >
                {phases.map((phase) => (
                  <option key={phase.number} value={phase.number}>
                    Fase {phase.number}: {phase.name}
                  </option>
                ))}
              </select>
              {errors.phaseNumber && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.phaseNumber}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Procedimientos
            </label>
            <div
              className={cn(
                'min-h-[80px] p-2 rounded-lg border bg-white dark:bg-slate-900',
                errors.procedures
                  ? 'border-red-500'
                  : 'border-slate-300 dark:border-slate-600',
              )}
            >
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.procedures.map((proc, idx) => (
                  <span
                    key={idx}
                    className="flex items-center gap-1 px-2 py-1 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-sm rounded-md"
                  >
                    {proc}
                    <button
                      type="button"
                      onClick={() => removeProcedure(idx)}
                      className="p-0.5 hover:bg-teal-200 dark:hover:bg-teal-800 rounded"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={procedureInput}
                  onChange={(e) => {
                    setProcedureInput(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() =>
                    setTimeout(() => setShowSuggestions(false), 200)
                  }
                  onKeyDown={handleProcedureKeyDown}
                  placeholder="Agregar procedimiento..."
                  className="w-full px-2 py-1 border-0 focus:outline-none bg-transparent"
                />
                {showSuggestions && filteredSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                    {filteredSuggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => addProcedure(suggestion)}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                      >
                        <Plus className="w-3 h-3" />
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {errors.procedures && (
              <p className="mt-1 text-xs text-red-500">{errors.procedures}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="session-response"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >
              Respuesta del Paciente
            </label>
            <textarea
              id="session-response"
              value={formData.patientResponse}
              onChange={(e) => handleChange('patientResponse', e.target.value)}
              rows={3}
              placeholder="¿Cómo respondió el paciente al tratamiento?"
              className={cn(
                'w-full px-3 py-2 rounded-lg border bg-white dark:bg-slate-900 resize-none',
                'focus:outline-none focus:ring-2 focus:ring-teal-500',
                errors.patientResponse
                  ? 'border-red-500'
                  : 'border-slate-300 dark:border-slate-600',
              )}
            />
            {errors.patientResponse && (
              <p className="mt-1 text-xs text-red-500">
                {errors.patientResponse}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Nivel de Dolor (END): {formData.finalPainLevel}
            </label>
            <div className="relative h-10">
              <div className="absolute inset-x-0 top-4 h-2 bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 rounded-full" />
              <input
                type="range"
                min="0"
                max="10"
                value={formData.finalPainLevel}
                onChange={(e) =>
                  handleChange('finalPainLevel', Number(e.target.value))
                }
                className="absolute inset-0 w-full appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-slate-400 [&::-webkit-slider-thumb]:shadow"
              />
            </div>
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>Sin dolor</span>
              <span>Máximo dolor</span>
            </div>
          </div>

          <div>
            <label
              htmlFor="session-observations"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >
              Observaciones (opcional)
            </label>
            <textarea
              id="session-observations"
              value={formData.observations}
              onChange={(e) => handleChange('observations', e.target.value)}
              rows={2}
              placeholder="Notas adicionales..."
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 resize-none focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-teal-600 hover:bg-teal-700"
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEditing ? 'Guardar Cambios' : 'Agregar Sesión'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

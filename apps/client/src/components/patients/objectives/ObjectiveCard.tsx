import { Heart, Shield, GraduationCap, Mic } from 'lucide-react';

type ObjectiveType = 'therapeutic' | 'prophylactic' | 'educational';

interface ObjectiveCardProps {
  type: ObjectiveType;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const OBJECTIVE_CONFIG: Record<
  ObjectiveType,
  {
    icon: typeof Heart;
    label: string;
    placeholder: string;
    bgColor: string;
    borderColor: string;
    textColor: string;
    iconBgColor: string;
  }
> = {
  therapeutic: {
    icon: Heart,
    label: 'Objetivo Terapéutico',
    placeholder:
      'Ej: Reducir dolor lumbar de 9/10 a 3/10. Recuperar movilidad en columna lumbar.',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/20',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    textColor: 'text-emerald-700 dark:text-emerald-300',
    iconBgColor: 'bg-emerald-100 dark:bg-emerald-900/50',
  },
  prophylactic: {
    icon: Shield,
    label: 'Objetivo Profiláctico',
    placeholder:
      'Ej: Prevenir recurrencia de dolor mediante fortalecimiento de core.',
    bgColor: 'bg-amber-50 dark:bg-amber-950/20',
    borderColor: 'border-amber-200 dark:border-amber-800',
    textColor: 'text-amber-700 dark:text-amber-300',
    iconBgColor: 'bg-amber-100 dark:bg-amber-900/50',
  },
  educational: {
    icon: GraduationCap,
    label: 'Objetivo Educativo',
    placeholder:
      'Ej: Enseñar postura ergonómica para trabajo. Programa de ejercicios en casa.',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    textColor: 'text-blue-700 dark:text-blue-300',
    iconBgColor: 'bg-blue-100 dark:bg-blue-900/50',
  },
};

export function ObjectiveCard({
  type,
  value,
  onChange,
  disabled = false,
}: ObjectiveCardProps) {
  const config = OBJECTIVE_CONFIG[type];
  const Icon = config.icon;

  return (
    <div
      className={`rounded-xl border p-4 ${config.bgColor} ${config.borderColor} transition-all`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${config.iconBgColor}`}>
            <Icon className={`w-5 h-5 ${config.textColor}`} />
          </div>
          <h3 className={`font-semibold ${config.textColor}`}>
            {config.label}
          </h3>
        </div>
        <button
          type="button"
          disabled
          className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed opacity-50"
          title="Dictado por voz (próximamente)"
        >
          <Mic className="w-4 h-4" />
        </button>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={config.placeholder}
        rows={4}
        className={`w-full px-3 py-2 rounded-lg border bg-white dark:bg-slate-900 
          border-slate-200 dark:border-slate-700 
          text-slate-900 dark:text-slate-100
          placeholder:text-slate-400 dark:placeholder:text-slate-500
          focus:outline-none focus:ring-2 focus:ring-offset-0 
          focus:ring-${type === 'therapeutic' ? 'emerald' : type === 'prophylactic' ? 'amber' : 'blue'}-500/50
          resize-none transition-colors
          disabled:opacity-50 disabled:cursor-not-allowed`}
      />
    </div>
  );
}

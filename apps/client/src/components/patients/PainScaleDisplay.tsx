import type { PainScale } from '../../types/patient';

interface PainScaleDisplayProps {
  painScale: PainScale;
}

export function PainScaleDisplay({ painScale }: PainScaleDisplayProps) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
        Escala de Dolor
      </h4>
      <div className="space-y-3">
        <PainBar label="Actividad" value={painScale.activity} />
        <PainBar label="Reposo" value={painScale.rest} />
        <PainBar label="Palpación" value={painScale.palpation} />
        <div className="text-xs text-slate-500 dark:text-slate-500 mt-2">
          Tipo:{' '}
          <span className="capitalize">
            {painScale.type === 'chronic' ? 'Crónico' : 'Agudo'}
          </span>
        </div>
      </div>
    </div>
  );
}

function PainBar({ label, value }: { label: string; value: number }) {
  const percentage = (value / 10) * 100;

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-slate-600 dark:text-slate-400">{label}</span>
        <span className="font-semibold text-teal-600 dark:text-teal-400">
          {value}/10
        </span>
      </div>
      <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

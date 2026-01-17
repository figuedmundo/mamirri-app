import type { TreatmentPhase } from '../../types/patient';

interface TreatmentPhaseCardProps {
  phase: TreatmentPhase;
}

export function TreatmentPhaseCard({ phase }: TreatmentPhaseCardProps) {
  const maxTechniques = 3;
  const visibleTechniques = phase.techniques.slice(0, maxTechniques);
  const remainingCount = phase.techniques.length - maxTechniques;

  return (
    <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
      <div className="flex-shrink-0 w-8 h-8 bg-teal-600 text-white rounded-lg flex items-center justify-center text-sm font-semibold">
        {phase.number}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-slate-900 dark:text-slate-100">
            {phase.name}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-500">
            {phase.durationWeeks} sem
          </span>
        </div>
        {phase.objectives && (
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
            {phase.objectives}
          </p>
        )}
        {phase.techniques.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {visibleTechniques.map((technique) => (
              <span
                key={technique}
                className="px-2 py-0.5 bg-white dark:bg-slate-700 text-xs text-slate-600 dark:text-slate-300 rounded"
              >
                {technique}
              </span>
            ))}
            {remainingCount > 0 && (
              <span className="px-2 py-0.5 bg-white dark:bg-slate-700 text-xs text-slate-500 dark:text-slate-400 rounded">
                +{remainingCount}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

import type { ClinicalCase } from '../../../types/patient';
import { Calendar, Activity, Target, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SessionStatsSummaryProps {
  clinicalCase: ClinicalCase;
}

function getPainLevelColor(level: number) {
  if (level <= 3)
    return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
  if (level <= 6)
    return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
  return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
}

export function SessionStatsSummary({
  clinicalCase,
}: SessionStatsSummaryProps) {
  const { treatmentSessions, treatmentPlan, startDate } = clinicalCase;

  const totalSessions = treatmentSessions.length;
  const avgPainLevel =
    totalSessions > 0
      ? treatmentSessions.reduce((sum, s) => sum + s.finalPainLevel, 0) /
        totalSessions
      : 0;

  const currentPhaseNumber =
    treatmentSessions.length > 0
      ? Math.max(...treatmentSessions.map((s) => s.phaseNumber))
      : 1;

  const currentPhase = treatmentPlan.phases.find(
    (p) => p.number === currentPhaseNumber,
  );

  const daysSinceStart = Math.floor(
    (new Date().getTime() - new Date(startDate).getTime()) /
      (1000 * 60 * 60 * 24),
  );

  const remainingPhases = treatmentPlan.phases.filter(
    (p) => p.number > currentPhaseNumber,
  ).length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Sesiones
          </span>
        </div>
        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {totalSessions}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          registradas
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Dolor Promedio
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'text-2xl font-bold px-2 py-0.5 rounded',
              getPainLevelColor(avgPainLevel),
            )}
          >
            {avgPainLevel.toFixed(1)}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            / 10
          </span>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Fase Actual
          </span>
        </div>
        <p className="text-lg font-bold text-slate-900 dark:text-slate-100 truncate">
          {currentPhase?.name || 'Sin iniciar'}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {remainingPhases > 0
            ? `${remainingPhases} fase${remainingPhases > 1 ? 's' : ''} restante${remainingPhases > 1 ? 's' : ''}`
            : 'Fase final'}
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Duración
          </span>
        </div>
        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {daysSinceStart}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          días en tratamiento
        </p>
      </div>
    </div>
  );
}

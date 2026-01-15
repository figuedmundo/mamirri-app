import * as React from 'react';
import type { TreatmentPhase, TreatmentSession } from '../../../types/patient';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PhaseProgressProps {
  phases: TreatmentPhase[];
  currentPhase: number;
  sessions: TreatmentSession[];
  selectedPhase: number | null;
  onPhaseClick: (phaseNumber: number | null) => void;
}

export function PhaseProgress({
  phases,
  currentPhase,
  sessions,
  selectedPhase,
  onPhaseClick,
}: PhaseProgressProps) {
  const getSessionCount = (phaseNumber: number) =>
    sessions.filter((s) => s.phaseNumber === phaseNumber).length;

  const isPhaseCompleted = (phaseNumber: number) => phaseNumber < currentPhase;
  const isPhaseActive = (phaseNumber: number) => phaseNumber === currentPhase;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Fases del Tratamiento
        </h3>
        {selectedPhase !== null && (
          <button
            onClick={() => onPhaseClick(null)}
            className="text-xs text-teal-600 dark:text-teal-400 hover:underline"
          >
            Ver todas
          </button>
        )}
      </div>

      <div className="flex items-start gap-2 overflow-x-auto pb-2">
        {phases.map((phase, index) => {
          const sessionCount = getSessionCount(phase.number);
          const completed = isPhaseCompleted(phase.number);
          const active = isPhaseActive(phase.number);
          const selected = selectedPhase === phase.number;

          return (
            <React.Fragment key={phase.number}>
              <button
                onClick={() => onPhaseClick(selected ? null : phase.number)}
                className={cn(
                  'flex flex-col items-center min-w-[80px] p-2 rounded-lg transition-all',
                  'focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2',
                  selected
                    ? 'bg-teal-50 dark:bg-teal-900/30 ring-2 ring-teal-500'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800',
                )}
                aria-pressed={selected}
                aria-label={`Fase ${phase.number}: ${phase.name}, ${sessionCount} sesiones`}
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors',
                    completed &&
                      'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
                    active &&
                      'bg-teal-500 text-white ring-4 ring-teal-200 dark:ring-teal-800',
                    !completed &&
                      !active &&
                      'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400',
                  )}
                >
                  {completed ? <Check className="w-5 h-5" /> : phase.number}
                </div>

                <span className="mt-2 text-xs font-medium text-slate-700 dark:text-slate-300 text-center line-clamp-1">
                  {phase.name}
                </span>

                <span className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                  {sessionCount} {sessionCount === 1 ? 'sesión' : 'sesiones'}
                </span>
              </button>

              {index < phases.length - 1 && (
                <div className="flex-shrink-0 w-8 h-0.5 bg-slate-200 dark:bg-slate-700 mt-5 self-start" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

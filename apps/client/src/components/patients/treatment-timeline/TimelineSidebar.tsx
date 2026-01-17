import type { ClinicalCase } from '../../../types/patient';
import { FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimelineSidebarProps {
  clinicalCase: ClinicalCase;
  activeSessionId?: string;
  onSelectSession: (id: string) => void;
}

export function TimelineSidebar({
  clinicalCase,
  activeSessionId,
  onSelectSession,
}: TimelineSidebarProps) {
  const { treatmentPlan, treatmentSessions } = clinicalCase;

  const sortedSessions = [...treatmentSessions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  return (
    <div className="h-full overflow-y-auto bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 w-80 flex-shrink-0">
      <div className="p-5 border-b border-slate-200 dark:border-slate-800">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
          Linea de Tiempo
        </h3>
        <p className="text-sm font-medium text-slate-900 dark:text-white">
          {clinicalCase.title}
        </p>
      </div>

      <div className="p-4 space-y-6">
        {treatmentPlan.phases.map((phase) => {
          const sessionsInPhase = sortedSessions.filter(
            (s) => s.phaseNumber === phase.number,
          );

          return (
            <div
              key={phase.number}
              className="relative pl-4 border-l-2 border-slate-200 dark:border-slate-800"
            >
              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-600 dark:text-teal-400 flex items-center justify-center text-[10px] font-bold border-2 border-white dark:border-slate-900">
                {phase.number}
              </div>

              <div className="mb-3 pl-2">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Fase {phase.number}: {phase.name}
                </h4>
                <p className="text-xs text-slate-500">
                  {phase.durationWeeks} semanas
                </p>
              </div>

              <div className="space-y-2">
                {sessionsInPhase.map((session) => {
                  const globalIndex = sortedSessions.findIndex(
                    (s) => s.id === session.id,
                  );
                  return (
                    <button
                      key={session.id}
                      onClick={() => onSelectSession(session.id)}
                      className={cn(
                        'w-full text-left p-3 rounded-lg text-sm transition-all border',
                        activeSessionId === session.id
                          ? 'bg-white dark:bg-slate-800 border-teal-500 shadow-sm ring-1 ring-teal-500'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-700',
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          Sesion {String(globalIndex + 1).padStart(3, '0')}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(session.date).toLocaleDateString('es-ES', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                        {session.observations || session.patientResponse}
                      </p>
                      {session.voiceNotes && session.voiceNotes.length > 0 && (
                        <div className="mt-2 flex items-center gap-1 text-[10px] text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 px-2 py-0.5 rounded w-fit">
                          <FileText size={10} />
                          Nota de voz
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

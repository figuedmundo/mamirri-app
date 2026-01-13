import type { CasoClinico } from '../types'
import { FileText } from 'lucide-react'

interface CaseTimelineProps {
  caso: CasoClinico
  activeSessionId?: string
  onSelectSession: (id: string) => void
}

export function CaseTimeline({ caso, activeSessionId, onSelectSession }: CaseTimelineProps) {
  return (
    <div className="h-full overflow-y-auto bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 w-80 flex-shrink-0">
      <div className="p-5 border-b border-slate-200 dark:border-slate-800">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
          Línea de Tiempo
        </h3>
        <p className="text-sm font-medium text-slate-900 dark:text-white">
          {caso.titulo}
        </p>
      </div>

      <div className="p-4 space-y-6">
        
        {caso.planDeTratamiento.fases.map((fase) => {
          const sessionsInPhase = caso.sesionesTratamiento.filter(s => s.faseNumero === fase.numero)
          
          return (
            <div key={fase.numero} className="relative pl-4 border-l-2 border-slate-200 dark:border-slate-800">
              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-600 dark:text-teal-400 flex items-center justify-center text-[10px] font-bold border-2 border-white dark:border-slate-900">
                {fase.numero}
              </div>
              
              <div className="mb-3 pl-2">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Fase {fase.numero}: {fase.nombre}
                </h4>
                <p className="text-xs text-slate-500">{fase.duracionSemanas} semanas</p>
              </div>

              <div className="space-y-2">
                {sessionsInPhase.map((sesion) => (
                  <button
                    key={sesion.id}
                    onClick={() => onSelectSession(sesion.id)}
                    className={`w-full text-left p-3 rounded-lg text-sm transition-all border ${
                      activeSessionId === sesion.id
                        ? 'bg-white dark:bg-slate-800 border-teal-500 shadow-sm ring-1 ring-teal-500'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        Sesión {sesion.id.split('-')[1]}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(sesion.fecha).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {sesion.observaciones}
                    </p>
                    {sesion.notasVoz && (
                      <div className="mt-2 flex items-center gap-1 text-[10px] text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 px-2 py-0.5 rounded w-fit">
                        <FileText size={10} />
                        Nota de voz
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )
        })}

      </div>
    </div>
  )
}

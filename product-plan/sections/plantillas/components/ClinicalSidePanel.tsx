import type { CasoClinico } from '../types'
import { FileText, Activity, AlertCircle, User } from 'lucide-react'

interface ClinicalSidePanelProps {
  caso: CasoClinico
}

export function ClinicalSidePanel({ caso }: ClinicalSidePanelProps) {
  return (
    <div className="w-80 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col h-full overflow-hidden shadow-xl z-20">
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Paciente</h2>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-full text-teal-700 dark:text-teal-400">
            <User size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg leading-tight">{caso.paciente}</h3>
            <span className="text-xs font-mono text-slate-500">{caso.edad} AÑOS • ID: {caso.id}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-8 custom-scrollbar">
        {/* Diagnosis Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400">
            <FileText size={16} />
            <h4 className="text-xs font-bold uppercase tracking-wider">Diagnóstico Médico</h4>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
            {caso.diagnostico}
          </p>
        </div>

        {/* Findings Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400">
            <Activity size={16} />
            <h4 className="text-xs font-bold uppercase tracking-wider">Hallazgos Biomecánicos</h4>
          </div>
          
          <div className="space-y-2">
            {caso.evaluacion.hallazgos.map((hallazgo, idx) => (
              <div key={idx} className="flex gap-3 items-start group">
                <AlertCircle size={14} className="mt-1 text-sky-500 shrink-0 group-hover:scale-110 transition-transform" />
                <span className="text-sm text-slate-600 dark:text-slate-400 leading-snug group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                  {hallazgo}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
             <div className="grid grid-cols-2 gap-2">
               <div className="aspect-[3/4] bg-slate-100 dark:bg-slate-800 rounded-lg relative overflow-hidden border border-slate-200 dark:border-slate-700">
                 <div className="absolute inset-0 flex items-center justify-center text-[10px] text-slate-400 uppercase tracking-widest font-medium">Posturograma</div>
               </div>
               <div className="aspect-[3/4] bg-slate-100 dark:bg-slate-800 rounded-lg relative overflow-hidden border border-slate-200 dark:border-slate-700">
                 <div className="absolute inset-0 flex items-center justify-center text-[10px] text-slate-400 uppercase tracking-widest font-medium">Huella</div>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}

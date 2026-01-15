import type { Paciente, CasoClinico } from '../types'
import { useState } from 'react'
import { CaseTimeline } from './CaseTimeline'
import { PosturogramViewer } from './PosturogramViewer'
import { Mic, Play, ArrowLeft } from 'lucide-react'

interface CaseDetailLayoutProps {
  paciente: Paciente
  caso: CasoClinico
  onBack: () => void
}

export function CaseDetailLayout({ paciente, caso, onBack }: CaseDetailLayoutProps) {
  const [activeSessionId, setActiveSessionId] = useState<string | undefined>(
    caso.sesionesTratamiento[caso.sesionesTratamiento.length - 1]?.id
  )

  const activeSession = caso.sesionesTratamiento.find(s => s.id === activeSessionId)

  const imgBefore = "https://images.unsplash.com/photo-1544367563-12123d8965cd?q=80&w=800&auto=format&fit=crop"
  const imgAfter = "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=800&auto=format&fit=crop"

  return (
    <div className="fixed inset-0 bg-white dark:bg-slate-950 z-50 flex flex-col">
      <div className="h-16 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 justify-between bg-white dark:bg-slate-900">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
            <ArrowLeft size={20} className="text-slate-600 dark:text-slate-400" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{paciente.nombre}</h2>
            <p className="text-xs text-slate-500">{caso.titulo} • {caso.estado}</p>
          </div>
        </div>
        
        <button className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-full font-medium shadow-lg transition-transform hover:scale-105">
          <Mic size={18} />
          <span>Grabar Evolución</span>
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <CaseTimeline 
          caso={caso} 
          activeSessionId={activeSessionId} 
          onSelectSession={setActiveSessionId} 
        />

        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {activeSession ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                      Sesión {activeSession.id}
                    </span>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                      Reporte de Evolución
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                      {new Date(activeSession.fecha).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
                    <span className="text-xs font-medium text-slate-500">Dolor END</span>
                    <span className={`text-lg font-bold ${activeSession.dolorFinal > 5 ? 'text-rose-500' : 'text-emerald-500'}`}>
                      {activeSession.dolorFinal}/10
                    </span>
                  </div>
                </div>

                {activeSession.notasVoz && activeSession.notasVoz.length > 0 && (
                  <div className="mb-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-start gap-4">
                      <button className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-md hover:bg-teal-700 transition-colors">
                        <Play size={18} className="ml-1" />
                      </button>
                      <div className="flex-1">
                        <div className="h-10 flex flex-col justify-center">
                          <div className="w-full h-8 bg-slate-200 dark:bg-slate-700 rounded overflow-hidden flex items-end gap-0.5 px-1 pb-1 opacity-50">
                            {[...Array(20)].map((_, i) => (
                              <div key={i} className="flex-1 bg-slate-400 dark:bg-slate-500" style={{ height: `${Math.random() * 100}%` }} />
                            ))}
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 italic">
                          "{activeSession.notasVoz[0].transcripcion}"
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Técnicas Aplicadas</h4>
                    <div className="flex flex-wrap gap-2">
                      {activeSession.tecnicasAplicadas.map(tec => (
                        <span key={tec} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-sm">
                          {tec}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Respuesta del Paciente</h4>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                      {activeSession.respuestaPaciente}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-slate-400">Selecciona una sesión para ver los detalles</p>
              </div>
            )}

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                Evolución Postural (Sagital)
              </h3>
              <div className="max-w-md mx-auto">
                <PosturogramViewer 
                  imageBefore={imgBefore} 
                  imageAfter={imgAfter} 
                />
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

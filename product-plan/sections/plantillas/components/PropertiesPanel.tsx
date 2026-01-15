import type { Plantilla, Material } from '../types'
import { Settings2, Layers, Sliders } from 'lucide-react'

interface PropertiesPanelProps {
  plantilla: Plantilla
  materiales: Material[]
  onUpdateParameter: (param: keyof Plantilla['parametros'], value: number | boolean) => void
  onUpdateLayer: (index: number, materialId: string) => void
}

export function PropertiesPanel({ plantilla, materiales, onUpdateParameter, onUpdateLayer }: PropertiesPanelProps) {
  return (
    <div className="w-80 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col h-full shadow-xl z-20">
      <div className="p-5 border-b border-slate-100 dark:border-slate-800">
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
          <Settings2 size={16} /> Propiedades
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-8 custom-scrollbar">
        
        <section className="space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 flex items-center gap-2">
            <Sliders size={14} /> Estructura
          </h3>
          
          <div className="space-y-5">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-300 font-medium">Altura Arco</span>
                <span className="font-mono text-teal-600 dark:text-teal-400">{plantilla.parametros.alturaArco}mm</span>
              </div>
              <input 
                type="range" 
                min="0" max="30" 
                value={plantilla.parametros.alturaArco}
                onChange={(e) => onUpdateParameter('alturaArco', Number(e.target.value))}
                className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-300 font-medium">Cuña Talón</span>
                <span className="font-mono text-teal-600 dark:text-teal-400">{plantilla.parametros.cuñaTalon}°</span>
              </div>
              <input 
                type="range" 
                min="0" max="15" 
                value={plantilla.parametros.cuñaTalon}
                onChange={(e) => onUpdateParameter('cuñaTalon', Number(e.target.value))}
                className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
              />
            </div>
             
             <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">Barra Metatarsal</span>
                <button 
                  onClick={() => onUpdateParameter('barrametatarsal', !plantilla.parametros.barrametatarsal)}
                  className={`w-11 h-6 flex items-center rounded-full transition-colors duration-200 focus:outline-none ${plantilla.parametros.barrametatarsal ? 'bg-teal-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                >
                  <span className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-200 ${plantilla.parametros.barrametatarsal ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
             </div>
          </div>
        </section>

        <div className="h-px bg-slate-100 dark:bg-slate-800" />

        <section className="space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 flex items-center gap-2">
            <Layers size={14} /> Materiales
          </h3>

          <div className="space-y-4">
            {plantilla.capas.map((capa, idx) => (
              <div key={idx} className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{capa.tipo}</label>
                <select 
                  value={capa.materialId}
                  onChange={(e) => onUpdateLayer(idx, e.target.value)}
                  className="w-full text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 
                           text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                >
                  {materiales.map(mat => (
                    <option key={mat.id} value={mat.id}>{mat.nombre}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}

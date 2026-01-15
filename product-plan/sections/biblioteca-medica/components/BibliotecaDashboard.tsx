import type { BibliotecaMedicaProps } from '../types'
import { SearchBar } from './SearchBar'
import { CategoryNav } from './CategoryNav'
import { ProtocolList } from './ProtocolList'
import { BibliographyPanel } from './BibliographyPanel'
import { useState } from 'react'
import { BrainCircuit } from 'lucide-react'

export function BibliotecaDashboard({
  categorias,
  protocolos,
  referencias,
  diagramas,
  onSearch,
  onSelectCategory,
  onSelectProtocol,
  onToggleLanguage
}: BibliotecaMedicaProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>()

  const handleCategorySelect = (id: string) => {
    setSelectedCategory(id)
    onSelectCategory(id)
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-xl text-teal-600 dark:text-teal-400">
              <BrainCircuit size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Asistente Clínico Inteligente</h1>
              <p className="text-slate-500 dark:text-slate-400">Consulta evidencia global y protocolos especializados</p>
            </div>
          </div>

          <SearchBar onSearch={onSearch} />
          
          <CategoryNav 
            categorias={categorias} 
            selectedCategoryId={selectedCategory}
            onSelectCategory={handleCategorySelect}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            <ProtocolList 
              protocolos={protocolos}
              onSelectProtocol={onSelectProtocol}
            />
            
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Referencia Anatómica</h3>
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {diagramas.map(diag => (
                  <div key={diag.id} className="min-w-[200px] aspect-[4/3] bg-slate-100 dark:bg-slate-900 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-700 relative overflow-hidden group cursor-pointer">
                    <span className="text-xs text-slate-400 font-mono z-10">{diag.titulo}</span>
                    <div className="absolute inset-0 bg-slate-200/50 dark:bg-slate-800/50 group-hover:bg-transparent transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <BibliographyPanel 
                referencias={referencias}
                onToggleLanguage={onToggleLanguage}
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

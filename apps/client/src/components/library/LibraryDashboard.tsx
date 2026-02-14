import { useState } from 'react';
import { BrainCircuit, Sparkles, Loader2 } from 'lucide-react';
import { LibrarySearchBar } from './LibrarySearchBar';
import { CategoryNav } from './CategoryNav';
import { ProtocolList } from './ProtocolList';
import { BibliographyPanel } from './BibliographyPanel';
import { ProtocolDetailModal } from './ProtocolDetailModal';
import type { 
  ClinicalCategory, 
  Protocol, 
  BibliographicReference, 
  SearchResult 
} from '@/types/library';

interface LibraryDashboardProps {
  categories: ClinicalCategory[];
  protocols: Protocol[];
  references: BibliographicReference[];
  searchResult: SearchResult | null;
  isLoading: boolean;
  onSearch: (query: string) => void;
  onSelectCategory: (id: string | undefined) => void;
  selectedCategoryId?: string;
}

export function LibraryDashboard({
  categories,
  protocols,
  references,
  searchResult,
  isLoading,
  onSearch,
  onSelectCategory,
  selectedCategoryId,
}: LibraryDashboardProps) {
  const [selectedProtocolId, setSelectedProtocolId] = useState<string | null>(null);

  const selectedProtocol = protocols.find(p => p.id === selectedProtocolId) || null;

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-12 lg:py-20 space-y-16 lg:space-y-24">
      <div className="relative text-center space-y-6 max-w-4xl mx-auto">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-teal-500/10 dark:bg-teal-500/5 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="inline-flex items-center justify-center p-5 rounded-[2rem] bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/30 dark:to-teal-800/20 text-teal-600 dark:text-teal-400 mb-4 shadow-inner ring-1 ring-teal-200/50 dark:ring-teal-700/30">
          <BrainCircuit size={48} strokeWidth={1} />
        </div>
        
        <h1 className="text-5xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.9]">
          Asistente Clínico <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500">Inteligente</span>
        </h1>
        
        <p className="max-w-2xl mx-auto text-xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed tracking-tight">
          Protocolos basados en evidencia y bibliografía médica actualizada para elevar tu práctica clínica.
        </p>
      </div>

      <div className="space-y-10">
        <LibrarySearchBar onSearch={onSearch} />
        <div className="max-w-3xl mx-auto">
          <CategoryNav 
            categories={categories} 
            selectedCategoryId={selectedCategoryId} 
            onSelectCategory={onSelectCategory} 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        <div className="lg:col-span-8 space-y-12">
          {searchResult && (
            <div className="flex items-center gap-4 p-6 rounded-3xl bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800 text-sky-800 dark:text-sky-300 shadow-sm transition-all hover:shadow-md">
              <div className="p-2 rounded-xl bg-white dark:bg-sky-900/40 shadow-sm text-sky-600">
                <Sparkles size={24} />
              </div>
              <span className="text-base font-bold tracking-tight">
                Se han encontrado {searchResult.protocols.length} protocolos relevantes para tu consulta clínica.
              </span>
            </div>
          )}
          
          <div className="relative">
            <div className="absolute -inset-4 bg-slate-50/50 dark:bg-slate-800/20 rounded-[3rem] -z-10 border border-slate-100 dark:border-slate-800" />
            <ProtocolList 
              protocols={protocols} 
              onSelectProtocol={setSelectedProtocolId} 
              isLoading={isLoading} 
            />
          </div>
        </div>

        <div className="lg:col-span-4 sticky top-12">
          <BibliographyPanel references={references} />
          
          {isLoading && (
            <div className="mt-8 flex items-center justify-center p-10 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-800/10 text-slate-400 transition-all">
              <Loader2 className="w-8 h-8 animate-spin mr-3 text-teal-500" />
              <span className="text-sm font-bold tracking-widest uppercase">Actualizando evidencia...</span>
            </div>
          )}
        </div>
      </div>

      <ProtocolDetailModal 
        protocol={selectedProtocol}
        open={!!selectedProtocolId}
        onClose={() => setSelectedProtocolId(null)}
      />
    </div>
  );
}

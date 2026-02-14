import { useState } from 'react';
import { BookOpen, ExternalLink, Globe, Languages } from 'lucide-react';
import type { BibliographicReference } from '@/types/library';

interface BibliographyPanelProps {
  references: BibliographicReference[];
}

export function BibliographyPanel({ references }: BibliographyPanelProps) {
  const [languageMap, setLanguageMap] = useState<Map<string, 'EN' | 'ES'>>(new Map());

  const toggleLanguage = (id: string) => {
    setLanguageMap((prev) => {
      const next = new Map(prev);
      const current = next.get(id) || 'ES';
      next.set(id, current === 'ES' ? 'EN' : 'ES');
      return next;
    });
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm transition-all hover:shadow-md hover:border-teal-100 dark:hover:border-teal-900">
      <div className="p-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex items-center gap-3">
        <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400">
          <BookOpen className="w-5 h-5" />
        </div>
        <h3 className="font-bold text-slate-900 dark:text-white tracking-tight">Bibliografía Relevante</h3>
      </div>
      
      <div className="divide-y divide-slate-100 dark:divide-slate-700">
        {references.length === 0 ? (
          <div className="p-10 text-center text-slate-400 dark:text-slate-500 text-sm italic">
            Selecciona un protocolo para ver sus referencias.
          </div>
        ) : (
          references.map((ref) => {
            const lang = languageMap.get(ref.id) || 'ES';
            const hasEnglish = ref.originalLanguage?.toLowerCase().includes('en') || 
                              ref.originalLanguage?.toLowerCase().includes('inglés');
            const showToggle = hasEnglish && ref.originalText;

            return (
              <div key={ref.id} className="p-5 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group relative">
                <div className="flex justify-between items-start gap-4 mb-3">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    {ref.title}
                  </h4>
                  {ref.url && (
                    <a 
                      href={ref.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors p-1.5 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/30"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
                
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400 mb-4">
                  <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{ref.author}</span>
                  <span className="opacity-30">•</span>
                  <span className="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400 font-medium">{ref.source}</span>
                  <span className="opacity-30">•</span>
                  <span>{ref.year}</span>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 bg-teal-50/30 dark:bg-teal-900/10 rounded-2xl -m-1 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                  <p className="relative text-xs text-slate-600 dark:text-slate-400 leading-relaxed italic border-l-2 border-slate-200 dark:border-slate-600 pl-4 py-1">
                    {lang === 'ES' ? ref.summaryEs : (ref.originalText || ref.summaryEs)}
                  </p>
                  
                  {showToggle && (
                    <button
                      onClick={() => toggleLanguage(ref.id)}
                      className="absolute -top-3 -right-2 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 shadow-sm text-[10px] font-black text-teal-600 dark:text-teal-400 hover:scale-105 active:scale-95 transition-all z-10"
                    >
                      <Languages className="w-3.5 h-3.5" />
                      {lang === 'ES' ? 'EN' : 'ES'}
                    </button>
                  )}
                </div>

                {ref.originalLanguage && (
                  <div className="mt-4 flex items-center gap-2 text-[10px] text-slate-400 uppercase tracking-widest font-black opacity-60">
                    <Globe className="w-3 h-3" />
                    {ref.originalLanguage}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

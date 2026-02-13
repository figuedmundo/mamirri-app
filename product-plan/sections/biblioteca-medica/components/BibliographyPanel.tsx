import type { ReferenciaBibliografica } from '../types';
import { BookOpen, Languages } from 'lucide-react';

interface BibliographyPanelProps {
  referencias: ReferenciaBibliografica[];
  onToggleLanguage: (id: string) => void;
}

export function BibliographyPanel({
  referencias,
  onToggleLanguage,
}: BibliographyPanelProps) {
  return (
    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-2 mb-6 text-slate-900 dark:text-white font-medium">
        <BookOpen className="w-5 h-5 text-teal-500" />
        <h2>Evidencia Científica</h2>
      </div>

      <div className="space-y-4">
        {referencias.map((ref) => (
          <div
            key={ref.id}
            className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm"
          >
            <div className="flex justify-between items-start gap-4 mb-3">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">
                  {ref.titulo}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {ref.autor} • <span className="italic">{ref.fuente}</span> (
                  {ref.anio})
                </p>
              </div>
              {ref.idiomaOriginal !== 'es' && (
                <button
                  onClick={() => onToggleLanguage(ref.id)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium 
                           bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 transition-colors"
                  title="Cambiar idioma"
                >
                  <Languages size={14} />
                  <span>{ref.idiomaOriginal.toUpperCase()} / ES</span>
                </button>
              )}
            </div>

            <div className="relative">
              <div className="pl-3 border-l-2 border-teal-500/30 dark:border-teal-500/50">
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {ref.resumenEs}
                </p>
                {ref.textoOriginal && (
                  <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                    <p className="text-xs text-slate-400 dark:text-slate-500 italic font-mono">
                      "{ref.textoOriginal.slice(0, 100)}..."
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { useMemo } from 'react';
import { BookOpen, Sparkles } from 'lucide-react';
import type { RagResult } from '@/types/library';

interface AnswersPanelProps {
  ragResults: RagResult[];
}

export function AnswersPanel({ ragResults }: AnswersPanelProps) {
  const topResults = useMemo(() => ragResults.slice(0, 3), [ragResults]);

  return (
    <section className="space-y-4" aria-label="Respuestas asistidas por IA">
      <div className="flex items-center gap-3 px-1">
        <div className="p-2 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-300">
          <Sparkles className="w-4 h-4" />
        </div>
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">
          Respuestas Asistidas
        </h3>
        <div className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent dark:from-slate-800" />
      </div>

      {topResults.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 p-6 text-sm text-slate-500 dark:text-slate-400">
          No encontramos respuestas semanticas para esta consulta. Prueba con
          sinonimos o explora categorias.
        </div>
      ) : (
        <div className="grid gap-4">
          {topResults.map((result) => (
            <article
              key={result.id}
              className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm"
            >
              <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                {result.content}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                <BookOpen className="w-3.5 h-3.5" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {result.documentTitle}
                </span>
                <span className="opacity-40">•</span>
                <span>{result.documentAuthor}</span>
                <span className="opacity-40">•</span>
                <span>p. {result.pageNumber}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

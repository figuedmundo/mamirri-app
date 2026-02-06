import { useState } from 'react';
import type { Citation } from '@/types/analysis';
import { BookOpen, Quote, ChevronDown, ChevronRight } from 'lucide-react';

interface CitationsSectionProps {
  citations: Citation[];
}

export function CitationsSection({ citations }: CitationsSectionProps) {
  if (!citations.length) return null;

  const sorted = [...citations].sort((a, b) => b.relevance - a.relevance);

  return (
    <div className="mt-6">
      <h3 className="text-sm font-semibold flex items-center gap-2 mb-3 text-slate-900 dark:text-slate-100">
        <BookOpen size={16} />
        Evidencia Literaria
      </h3>
      <div className="space-y-2">
        {sorted.map((citation, index) => (
          <CitationItem key={index} citation={citation} />
        ))}
      </div>
    </div>
  );
}

function CitationItem({ citation }: { citation: Citation }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-md">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
      >
        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
          {citation.documentTitle}
          {citation.pageNumber && (
            <span className="text-xs text-muted-foreground ml-2 font-normal">
              p. {citation.pageNumber}
            </span>
          )}
        </span>
        {isOpen ? (
          <ChevronDown size={16} className="text-slate-400" />
        ) : (
          <ChevronRight size={16} className="text-slate-400" />
        )}
      </button>
      {isOpen && (
        <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <div className="flex gap-2">
            <Quote size={14} className="text-slate-400 mt-1 shrink-0" />
            <p className="text-sm italic text-slate-600 dark:text-slate-300">
              {citation.quote}
            </p>
          </div>
          <div className="mt-2 text-xs text-right text-slate-400">
            Relevancia: {(citation.relevance * 100).toFixed(0)}%
          </div>
        </div>
      )}
    </div>
  );
}

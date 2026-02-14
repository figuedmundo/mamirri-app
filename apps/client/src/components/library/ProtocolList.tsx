import type { Protocol } from '@/types/library';
import { ChevronRight, ArrowRight, Search, Sparkles } from 'lucide-react';

interface ProtocolListProps {
  protocols: Protocol[];
  onSelectProtocol: (id: string) => void;
  isLoading?: boolean;
}

export function ProtocolList({
  protocols,
  onSelectProtocol,
  isLoading,
}: ProtocolListProps) {
  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-3 px-1">
          <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 animate-pulse rounded" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-700 animate-pulse"
            >
              <div className="flex gap-2 mb-6">
                <div className="h-6 w-20 bg-slate-100 dark:bg-slate-700 rounded-full" />
                <div className="h-6 w-24 bg-slate-100 dark:bg-slate-700 rounded-full" />
              </div>
              <div className="h-7 w-3/4 bg-slate-200 dark:bg-slate-700 rounded-xl mb-4" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-slate-100 dark:bg-slate-700/50 rounded-lg" />
                <div className="h-4 w-5/6 bg-slate-100 dark:bg-slate-700/50 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (protocols.length === 0) {
    return (
      <div className="text-center py-24 bg-slate-50/50 dark:bg-slate-800/20 rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-800">
        <div className="p-5 bg-white dark:bg-slate-800 shadow-xl rounded-[2rem] w-fit mx-auto mb-6 text-slate-300">
          <Search size={40} strokeWidth={1} />
        </div>
        <p className="text-xl text-slate-900 dark:text-white font-black tracking-tight mb-2">
          No se encontraron protocolos
        </p>
        <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xs mx-auto">
          Prueba con otros términos o explora las categorías para encontrar lo
          que buscas.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 px-1">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">
          Protocolos Sugeridos
        </h3>
        <div className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent dark:from-slate-800" />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {protocols.map((protocol) => (
          <div
            key={protocol.id}
            className="group relative bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-700 hover:border-teal-200 dark:hover:border-teal-900 hover:shadow-2xl hover:shadow-teal-500/5 hover:-translate-y-1 transition-all duration-500 cursor-pointer overflow-hidden"
            onClick={() => onSelectProtocol(protocol.id)}
          >
            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-10 transition-opacity">
              <Sparkles size={80} strokeWidth={0.5} />
            </div>

            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="flex flex-wrap gap-2">
                {protocol.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300 border border-sky-100 dark:border-sky-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-700 group-hover:bg-teal-500 group-hover:text-white transition-all duration-300">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            <h4 className="text-xl font-black text-slate-900 dark:text-white mb-3 tracking-tight group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors relative z-10">
              {protocol.title}
            </h4>

            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium line-clamp-2 mb-6 leading-relaxed relative z-10">
              {protocol.definition}
            </p>

            <div className="flex items-center text-xs font-black uppercase tracking-widest text-teal-600 dark:text-teal-400 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 relative z-10">
              Ver ficha completa <ArrowRight className="w-3.5 h-3.5 ml-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

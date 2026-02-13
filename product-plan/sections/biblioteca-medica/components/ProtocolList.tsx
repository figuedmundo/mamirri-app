import type { Protocolo } from '../types';
import { ChevronRight, ArrowRight } from 'lucide-react';

interface ProtocolListProps {
  protocolos: Protocolo[];
  onSelectProtocol: (id: string) => void;
}

export function ProtocolList({
  protocolos,
  onSelectProtocol,
}: ProtocolListProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 px-1">
        Protocolos Sugeridos
      </h3>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        {protocolos.map((protocolo) => (
          <div
            key={protocolo.id}
            className="group relative bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 
                     hover:border-teal-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
            onClick={() => onSelectProtocol(protocolo.id)}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex flex-wrap gap-2 mb-2">
                {protocolo.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-teal-500 transition-colors" />
            </div>

            <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
              {protocolo.titulo}
            </h4>

            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
              {protocolo.definicion}
            </p>

            <div className="flex items-center text-sm font-medium text-teal-600 dark:text-teal-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200">
              Ver ficha completa <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

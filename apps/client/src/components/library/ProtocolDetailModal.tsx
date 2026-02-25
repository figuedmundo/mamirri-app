import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ClipboardList,
  BookOpen,
  Languages,
  Info,
  Tag,
  Clock,
  Sparkles,
  PlusCircle,
} from 'lucide-react';
import type { Protocol } from '@/types/library';
import { useAddProtocolToPlan } from '@/hooks/use-library';

interface ProtocolDetailModalProps {
  protocol: Protocol | null;
  open: boolean;
  onClose: () => void;
  planId?: string;
}

export function ProtocolDetailModal({
  protocol,
  open,
  onClose,
  planId,
}: ProtocolDetailModalProps) {
  const [languageMap, setLanguageMap] = useState<Map<string, 'EN' | 'ES'>>(
    new Map(),
  );
  const [notes, setNotes] = useState('');
  const addProtocolToPlan = useAddProtocolToPlan();

  if (!protocol) return null;

  const toggleLanguage = (refId: string) => {
    setLanguageMap((prev) => {
      const next = new Map(prev);
      const current = next.get(refId) || 'ES';
      next.set(refId, current === 'ES' ? 'EN' : 'ES');
      return next;
    });
  };

  const handleAddToPlan = () => {
    if (!planId) {
      return;
    }

    addProtocolToPlan.mutate({
      planId,
      protocolId: protocol.id,
      notes: notes.trim() ? notes.trim() : undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0 border-none shadow-2xl rounded-3xl overflow-hidden">
        <div className="sticky top-0 z-10 bg-gradient-to-br from-teal-600 to-teal-700 dark:from-teal-800 dark:to-teal-900 p-8 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <span className="px-3 py-1 rounded-lg bg-white/20 text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-md border border-white/10">
              {protocol.category.name}
            </span>
          </div>
          <DialogHeader>
            <DialogTitle className="text-3xl font-black leading-tight tracking-tight">
              {protocol.title}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-wrap gap-2 mt-6">
            {protocol.tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 text-xs font-bold backdrop-blur-md transition-all hover:bg-white/20"
              >
                <Tag className="w-3.5 h-3.5" />
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="p-10 space-y-12 bg-white dark:bg-slate-900">
          <section>
            <div className="flex items-center gap-3 mb-5 text-teal-600 dark:text-teal-400">
              <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-900/30">
                <Info className="w-5 h-5" />
              </div>
              <h3 className="font-black uppercase tracking-[0.2em] text-xs">
                Definición
              </h3>
            </div>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xl font-medium italic pl-6 border-l-4 border-teal-500/20">
              "{protocol.definition}"
            </p>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-5 text-teal-600 dark:text-teal-400">
              <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-900/30">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-black uppercase tracking-[0.2em] text-xs">
                Justificación
              </h3>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/40 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Sparkles size={100} />
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed relative z-10 text-lg">
                {protocol.rationale}
              </p>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-8 text-teal-600 dark:text-teal-400">
              <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-900/30">
                <ClipboardList className="w-5 h-5" />
              </div>
              <h3 className="font-black uppercase tracking-[0.2em] text-xs">
                Procedimiento
              </h3>
            </div>
            <div className="grid gap-6">
              {protocol.procedure.map((step, index) => (
                <div key={index} className="flex gap-6 group">
                  <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 flex items-center justify-center font-black text-lg border border-slate-200 dark:border-slate-700 shadow-sm transition-all group-hover:bg-teal-600 group-hover:text-white group-hover:border-teal-600 group-hover:-translate-y-1">
                    {index + 1}
                  </div>
                  <div className="pt-2 text-slate-700 dark:text-slate-300 leading-relaxed text-lg font-medium">
                    {step}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {protocol.references.length > 0 && (
            <section className="pt-8 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3 mb-8 text-teal-600 dark:text-teal-400">
                <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-900/30">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="font-black uppercase tracking-[0.2em] text-xs">
                  Evidencia Científica
                </h3>
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                {protocol.references.map(({ reference: ref }) => {
                  const lang = languageMap.get(ref.id) || 'ES';
                  const hasEnglish =
                    ref.originalLanguage?.toLowerCase().includes('en') ||
                    ref.originalLanguage?.toLowerCase().includes('inglés');
                  const showToggle = hasEnglish && ref.originalText;

                  return (
                    <div
                      key={ref.id}
                      className="relative p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 group hover:border-teal-200 dark:hover:border-teal-900 transition-all hover:shadow-lg"
                    >
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">
                        {ref.author} • {ref.year}
                      </div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white mb-4 line-clamp-2 leading-snug">
                        {ref.title}
                      </h4>
                      <div className="relative">
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed italic border-l-2 border-teal-500/30 pl-4">
                          {lang === 'ES'
                            ? ref.summaryEs
                            : ref.originalText || ref.summaryEs}
                        </p>

                        {showToggle && (
                          <button
                            onClick={() => toggleLanguage(ref.id)}
                            className="absolute -top-12 right-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm text-[10px] font-black text-teal-600 dark:text-teal-400 hover:scale-105 active:scale-95 transition-all"
                          >
                            <Languages className="w-3.5 h-3.5" />
                            {lang === 'ES' ? 'EN' : 'ES'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          <section className="pt-8 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between gap-4">
              <h3 className="font-black uppercase tracking-[0.2em] text-xs text-teal-600 dark:text-teal-400">
                Añadir al plan
              </h3>
              <button
                type="button"
                onClick={handleAddToPlan}
                disabled={!planId || addProtocolToPlan.isPending}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                {addProtocolToPlan.isPending
                  ? 'Añadiendo...'
                  : 'Añadir al plan'}
              </button>
            </div>

            {!planId && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Abre la Biblioteca desde un caso clinico para añadir este
                protocolo al plan de tratamiento.
              </p>
            )}

            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Notas opcionales para este protocolo"
              className="w-full min-h-[90px] rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}

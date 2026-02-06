import { Sparkles } from 'lucide-react';

interface PatternRecognitionSectionProps {
  reasoning: {
    step1_understanding: string;
    step2_literature: string;
    step3_synthesis: string;
  };
}

export function PatternRecognitionSection({
  reasoning,
}: PatternRecognitionSectionProps) {
  return (
    <div className="bg-indigo-50 dark:bg-indigo-950/30 p-4 rounded-lg border border-indigo-100 dark:border-indigo-900/50 mb-6">
      <h3 className="text-sm font-semibold flex items-center gap-2 mb-2 text-indigo-900 dark:text-indigo-100">
        <Sparkles size={16} className="text-indigo-600 dark:text-indigo-400" />
        Análisis de Patrones (Chain-of-Thought)
      </h3>
      <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
        <div>
          <span className="font-medium text-indigo-800 dark:text-indigo-300 block mb-1">
            Comprensión del Caso:
          </span>
          {reasoning.step1_understanding}
        </div>
        <div>
          <span className="font-medium text-indigo-800 dark:text-indigo-300 block mb-1">
            Evidencia Consultada:
          </span>
          {reasoning.step2_literature}
        </div>
        <div>
          <span className="font-medium text-indigo-800 dark:text-indigo-300 block mb-1">
            Síntesis Clínica:
          </span>
          {reasoning.step3_synthesis}
        </div>
      </div>
    </div>
  );
}

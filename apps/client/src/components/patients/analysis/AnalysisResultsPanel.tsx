import type { AnalysisResult } from '@/types/analysis';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SuggestionCard } from './SuggestionCard';
import { CitationsSection } from './CitationsSection';
import { PatternRecognitionSection } from './PatternRecognitionSection';
import { ServiceStatusIndicator } from './ServiceStatusIndicator';
import { AnalysisDisclaimer } from './AnalysisDisclaimer';

interface AnalysisResultsPanelProps {
  analysisResult: AnalysisResult | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AnalysisResultsPanel({
  analysisResult,
  isOpen,
  onClose,
}: AnalysisResultsPanelProps) {
  if (!analysisResult) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex justify-between items-center mr-8">
            <DialogTitle>Análisis Clínico IA</DialogTitle>
            <ServiceStatusIndicator
              status={analysisResult.metadata.serviceStatus}
            />
          </div>
          <DialogDescription>
            Resultados basados en {analysisResult.citations.length} fuentes
            literarias y datos del paciente.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6">
          <PatternRecognitionSection reasoning={analysisResult.reasoning} />

          <h3 className="font-semibold mb-3">Recomendación Principal</h3>
          <SuggestionCard
            suggestion={analysisResult.primarySuggestion}
            type="primary"
          />

          {analysisResult.alternatives.length > 0 && (
            <>
              <h3 className="font-semibold mb-3 mt-6">Alternativas</h3>
              {analysisResult.alternatives.map((alt, i) => (
                <SuggestionCard key={i} suggestion={alt} />
              ))}
            </>
          )}

          <CitationsSection citations={analysisResult.citations} />

          <AnalysisDisclaimer />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

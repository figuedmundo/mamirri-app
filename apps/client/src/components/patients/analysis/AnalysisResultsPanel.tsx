import type { AnalysisResult } from '@/types/analysis';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle } from 'lucide-react';
import { SuggestionCard } from './SuggestionCard';
import { CitationsSection } from './CitationsSection';
import { PatternRecognitionSection } from './PatternRecognitionSection';
import { ServiceStatusIndicator } from './ServiceStatusIndicator';
import { AnalysisDisclaimer } from './AnalysisDisclaimer';
import { SummarySection } from './SummarySection';
import { RedFlagsSection } from './RedFlagsSection';
import { FollowUpQuestionsSection } from './FollowUpQuestionsSection';
import { DifferentialDiagnosisSection } from './DifferentialDiagnosisSection';
import { ConfidenceJustificationSection } from './ConfidenceJustificationSection';
import { useSuggestionFeedback } from '@/hooks/use-suggestion-feedback';

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
  const { feedbacks, submitFeedback, removeFeedback } = useSuggestionFeedback(
    analysisResult?.metadata.analysisId,
  );

  if (!analysisResult) return null;

  const handleFeedbackChange = (
    index: number,
    isPositive: boolean | null,
    comment?: string,
  ) => {
    if (isPositive === null) {
      removeFeedback(index);
    } else {
      submitFeedback(index, isPositive, comment);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl sm:max-w-3xl max-w-[95vw] h-[85vh] flex flex-col p-0 gap-0">
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

        {analysisResult.metadata.warnings &&
          analysisResult.metadata.warnings.length > 0 && (
            <div className="px-6 py-3 space-y-2">
              {analysisResult.metadata.warnings.map((warning, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 p-2 text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200 rounded-md dark:bg-amber-950/30 dark:text-amber-200 dark:border-amber-800"
                >
                  <AlertTriangle size={14} className="shrink-0" />
                  <span>{warning}</span>
                </div>
              ))}
            </div>
          )}

        <ScrollArea className="flex-1 p-6">
          <SummarySection summary={analysisResult.summary} />

          <RedFlagsSection redFlags={analysisResult.redFlags} />

          <PatternRecognitionSection reasoning={analysisResult.reasoning} />

          <DifferentialDiagnosisSection
            diagnoses={analysisResult.differentialDiagnosis}
          />

          <FollowUpQuestionsSection
            questions={analysisResult.followUpQuestions}
          />

          <h3 className="font-semibold mb-3">Recomendación Principal</h3>
          <SuggestionCard
            suggestion={analysisResult.primarySuggestion}
            type="primary"
            analysisId={analysisResult.metadata.analysisId}
            suggestionIndex={0}
            feedback={feedbacks.get(0)}
            onFeedbackChange={(isPositive, comment) =>
              handleFeedbackChange(0, isPositive, comment)
            }
          />

          <ConfidenceJustificationSection
            confidence={analysisResult.confidenceJustification}
          />

          {analysisResult.alternatives.length > 0 && (
            <>
              <h3 className="font-semibold mb-3 mt-6">Alternativas</h3>
              {analysisResult.alternatives.map((alt, i) => (
                <SuggestionCard
                  key={i}
                  suggestion={alt}
                  analysisId={analysisResult.metadata.analysisId}
                  suggestionIndex={i + 1}
                  feedback={feedbacks.get(i + 1)}
                  onFeedbackChange={(isPositive, comment) =>
                    handleFeedbackChange(i + 1, isPositive, comment)
                  }
                />
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

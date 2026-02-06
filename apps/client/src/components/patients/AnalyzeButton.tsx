import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, Check } from 'lucide-react';
import { useCaseAnalysis } from '@/hooks/use-case-analysis';
import type { AnalysisResult } from '@/types/analysis';

interface AnalyzeButtonProps {
  caseId: string;
  evaluationCount: number;
  onAnalysisComplete: (result: AnalysisResult) => void;
  onError?: (error: Error) => void;
}

export function AnalyzeButton({
  caseId,
  evaluationCount,
  onAnalysisComplete,
  onError,
}: AnalyzeButtonProps) {
  console.log(
    '[DEBUG] AnalyzeButton - evaluationCount:',
    evaluationCount,
    'disabled:',
    evaluationCount < 1,
  );
  const { analyzeCase, isAnalyzing } = useCaseAnalysis();
  const [showSuccess, setShowSuccess] = useState(false);

  const handleClick = async () => {
    const result = await analyzeCase(caseId);
    if (result) {
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onAnalysisComplete(result);
      }, 1000);
    } else if (onError) {
      onError(new Error('Analysis failed'));
    }
  };

  if (showSuccess) {
    return (
      <Button
        variant="outline"
        className="gap-2 text-green-600 border-green-200 bg-green-50"
      >
        <Check size={16} />
        <span>Analizado</span>
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-2 text-indigo-600 border-indigo-200 hover:bg-indigo-50 dark:text-indigo-400 dark:border-indigo-800 dark:hover:bg-indigo-900/20"
      disabled={evaluationCount < 1 || isAnalyzing}
      onClick={handleClick}
      title={
        evaluationCount < 1
          ? 'Se requiere al menos 1 evaluación'
          : 'Analizar con IA'
      }
    >
      {isAnalyzing ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <Sparkles size={16} />
      )}
      <span className="hidden sm:inline">
        {isAnalyzing ? 'Analizando...' : 'Analizar con IA'}
      </span>
    </Button>
  );
}

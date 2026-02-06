import { useState } from 'react';
import { aiAnalysisApi } from '@/api/ai-analysis';
import type { AnalysisResult } from '@/types/analysis';
import { useToast } from './use-toast';

interface UseCaseAnalysisReturn {
  analyzeCase: (caseId: string) => Promise<AnalysisResult | undefined>;
  isAnalyzing: boolean;
  error: Error | null;
  result: AnalysisResult | null;
}

export function useCaseAnalysis(): UseCaseAnalysisReturn {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const analyzeCase = async (caseId: string) => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const data = await aiAnalysisApi.analyzeCase(caseId);
      setResult(data);
      return data;
    } catch (err: any) {
      const errorObj =
        err instanceof Error ? err : new Error('Analysis failed');
      setError(errorObj);
      toast({
        title: 'Error de análisis',
        description:
          'No se pudo completar el análisis del caso. Por favor intente nuevamente.',
        variant: 'destructive',
      });
      return undefined;
    } finally {
      setIsAnalyzing(false);
    }
  };

  return { analyzeCase, isAnalyzing, error, result };
}

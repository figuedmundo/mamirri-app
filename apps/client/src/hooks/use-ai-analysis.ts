import { useQuery, useMutation } from '@tanstack/react-query';
import { aiAnalysisApi } from '../api/ai-analysis';
import { queryKeys } from '../lib/query-keys';
import { useToast } from './use-toast';

export function useAnalyzeCaseQuery(
  caseId: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: queryKeys.aiAnalysis.detail(caseId),
    queryFn: () => aiAnalysisApi.analyzeCase(caseId),
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useLatestAnalysisQuery(
  caseId: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: queryKeys.aiAnalysis.latest(caseId),
    queryFn: () => aiAnalysisApi.getLatestAnalysis(caseId),
    enabled: !!caseId && (options?.enabled ?? true),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useSubmitFeedbackMutation() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      analysisId,
      suggestionIndex,
      isPositive,
      comment,
    }: {
      analysisId: string;
      suggestionIndex: number;
      isPositive: boolean;
      comment?: string;
    }) =>
      aiAnalysisApi.submitFeedback(analysisId, suggestionIndex, {
        isPositive,
        comment,
      }),
    onSuccess: () => {
      toast({
        title: 'Gracias',
        description: 'Tu feedback nos ayuda a mejorar.',
      });
    },
  });
}

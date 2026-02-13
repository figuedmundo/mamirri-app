import { useState, useEffect, useCallback } from 'react';
import { aiAnalysisApi, type Feedback } from '@/api/ai-analysis';
import { useToast } from './use-toast';

export function useSuggestionFeedback(analysisId: string | undefined) {
  const [feedbacks, setFeedbacks] = useState<Map<number, Feedback>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchFeedbacks = useCallback(async () => {
    if (!analysisId) return;
    setIsLoading(true);
    try {
      const data = await aiAnalysisApi.getFeedbacks(analysisId);
      const feedbackMap = new Map<number, Feedback>();
      data.forEach((f) => feedbackMap.set(f.suggestionIndex, f));
      setFeedbacks(feedbackMap);
    } catch (error) {
      console.error('Failed to fetch feedbacks', error);
    } finally {
      setIsLoading(false);
    }
  }, [analysisId]);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  const submitFeedback = async (
    suggestionIndex: number,
    isPositive: boolean,
    comment?: string,
  ) => {
    if (!analysisId) return;

    const previousFeedback = feedbacks.get(suggestionIndex);

    const optimisticFeedback: Feedback = {
      id: previousFeedback?.id || 'temp-id',
      aiAnalysisId: analysisId,
      suggestionIndex,
      isPositive,
      comment,
    };

    setFeedbacks((prev) => {
      const next = new Map(prev);
      next.set(suggestionIndex, optimisticFeedback);
      return next;
    });

    try {
      const saved = await aiAnalysisApi.submitFeedback(
        analysisId,
        suggestionIndex,
        {
          isPositive,
          comment,
        },
      );
      setFeedbacks((prev) => {
        const next = new Map(prev);
        next.set(suggestionIndex, saved);
        return next;
      });
    } catch (error) {
      setFeedbacks((prev) => {
        const next = new Map(prev);
        if (previousFeedback) {
          next.set(suggestionIndex, previousFeedback);
        } else {
          next.delete(suggestionIndex);
        }
        return next;
      });

      toast({
        title: 'Error al enviar feedback',
        description:
          'No se pudo guardar tu calificación. Por favor intenta de nuevo.',
        variant: 'destructive',
      });
    }
  };

  const removeFeedback = async (suggestionIndex: number) => {
    if (!analysisId) return;

    const previousFeedback = feedbacks.get(suggestionIndex);
    if (!previousFeedback) return;

    setFeedbacks((prev) => {
      const next = new Map(prev);
      next.delete(suggestionIndex);
      return next;
    });

    try {
      await aiAnalysisApi.deleteFeedback(analysisId, suggestionIndex);
    } catch (error) {
      setFeedbacks((prev) => {
        const next = new Map(prev);
        next.set(suggestionIndex, previousFeedback);
        return next;
      });

      toast({
        title: 'Error al eliminar feedback',
        description:
          'No se pudo eliminar tu calificación. Por favor intenta de nuevo.',
        variant: 'destructive',
      });
    }
  };

  return {
    feedbacks,
    submitFeedback,
    removeFeedback,
    isLoading,
  };
}

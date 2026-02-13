import axios from '@/lib/axios';
import type { AnalysisResult } from '@/types/analysis';

export interface Feedback {
  id: string;
  aiAnalysisId: string;
  suggestionIndex: number;
  isPositive: boolean;
  comment?: string;
}

export const aiAnalysisApi = {
  analyzeCase: async (caseId: string): Promise<AnalysisResult> => {
    const { data } = await axios.post<AnalysisResult>(
      `/ai/cases/${caseId}/analyze`,
    );
    return data;
  },

  getFeedbacks: async (analysisId: string): Promise<Feedback[]> => {
    const { data } = await axios.get<Feedback[]>(
      `/ai/analyses/${analysisId}/feedback`,
    );
    return data;
  },

  submitFeedback: async (
    analysisId: string,
    suggestionIndex: number,
    body: { isPositive: boolean; comment?: string },
  ): Promise<Feedback> => {
    const { data } = await axios.put<Feedback>(
      `/ai/analyses/${analysisId}/suggestions/${suggestionIndex}/feedback`,
      body,
    );
    return data;
  },

  deleteFeedback: async (
    analysisId: string,
    suggestionIndex: number,
  ): Promise<void> => {
    await axios.delete(
      `/ai/analyses/${analysisId}/suggestions/${suggestionIndex}/feedback`,
    );
  },
};

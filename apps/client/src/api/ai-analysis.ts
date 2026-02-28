import axiosClient from '@/lib/axios';
import axios from 'axios';
import type { AnalysisResult } from '@/types/analysis';

export interface Feedback {
  id: string;
  aiAnalysisId: string;
  suggestionIndex: number;
  isPositive: boolean;
  comment?: string;
}

export interface RawAnalysisResponse {
  analysisId: string;
  rawModelResponse: string | null;
  createdAt: string;
  isRedacted: boolean;
}

export const aiAnalysisApi = {
  analyzeCase: async (caseId: string): Promise<AnalysisResult> => {
    const { data } = await axiosClient.post<AnalysisResult>(
      `/ai/cases/${caseId}/analyze`,
    );
    return data;
  },

  getLatestAnalysis: async (caseId: string): Promise<AnalysisResult | null> => {
    try {
      const { data } = await axiosClient.get<AnalysisResult>(
        `/ai/cases/${caseId}/analyses/latest`,
      );
      return data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  getRawModelResponse: async (
    analysisId: string,
    includeSensitive = false,
  ): Promise<RawAnalysisResponse> => {
    const { data } = await axiosClient.get<RawAnalysisResponse>(
      `/ai/analyses/${analysisId}/raw-response`,
      {
        params: { includeSensitive },
      },
    );
    return data;
  },

  getFeedbacks: async (analysisId: string): Promise<Feedback[]> => {
    const { data } = await axiosClient.get<Feedback[]>(
      `/ai/analyses/${analysisId}/feedback`,
    );
    return data;
  },

  submitFeedback: async (
    analysisId: string,
    suggestionIndex: number,
    body: { isPositive: boolean; comment?: string },
  ): Promise<Feedback> => {
    const { data } = await axiosClient.put<Feedback>(
      `/ai/analyses/${analysisId}/suggestions/${suggestionIndex}/feedback`,
      body,
    );
    return data;
  },

  deleteFeedback: async (
    analysisId: string,
    suggestionIndex: number,
  ): Promise<void> => {
    await axiosClient.delete(
      `/ai/analyses/${analysisId}/suggestions/${suggestionIndex}/feedback`,
    );
  },
};

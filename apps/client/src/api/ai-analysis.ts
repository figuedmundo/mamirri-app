import axios from '@/lib/axios';
import type { AnalysisResult } from '@/types/analysis';

export const aiAnalysisApi = {
  analyzeCase: async (caseId: string): Promise<AnalysisResult> => {
    const { data } = await axios.post<AnalysisResult>(
      `/ai/cases/${caseId}/analyze`,
    );
    return data;
  },
};

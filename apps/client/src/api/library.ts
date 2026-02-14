import axios from '../lib/axios';
import type {
  ClinicalCategory,
  Protocol,
  BibliographicReference,
  SearchResult,
  TreatmentPlanProtocol,
} from '../types/library';

export const libraryApi = {
  findAllCategories: async () => {
    const response = await axios.get<ClinicalCategory[]>('/library/categories');
    return response.data;
  },

  findAllProtocols: async (categoryId?: string) => {
    const params = categoryId ? { categoryId } : undefined;
    const response = await axios.get<Protocol[]>('/library/protocols', {
      params,
    });
    return response.data;
  },

  findOneProtocol: async (id: string) => {
    const response = await axios.get<Protocol>(`/library/protocols/${id}`);
    return response.data;
  },

  findAllReferences: async () => {
    const response = await axios.get<BibliographicReference[]>(
      '/library/references',
    );
    return response.data;
  },

  search: async (query: string) => {
    const response = await axios.get<SearchResult>('/library/protocols', {
      params: { q: query },
    });
    return response.data;
  },

  addProtocolToPlan: async (
    planId: string,
    protocolId: string,
    notes?: string,
  ) => {
    const response = await axios.post<TreatmentPlanProtocol>(
      `/library/treatment-plans/${planId}/protocols`,
      { protocolId, notes },
    );
    return response.data;
  },
};

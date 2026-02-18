import axios from '../lib/axios';
import type {
  ClinicalCategory,
  Protocol,
  ProtocolCreateInput,
  ProtocolUpdateInput,
  BibliographicReference,
  SearchResult,
  TreatmentPlanProtocol,
} from '../types/library';

export const libraryApi = {
  findAllCategories: async () => {
    const response = await axios.get<ClinicalCategory[]>('/library/categories');
    return response.data;
  },

  findAllProtocols: async (categoryId?: string, includeDeleted = false) => {
    const params = {
      ...(categoryId ? { categoryId } : {}),
      ...(includeDeleted ? { includeDeleted: true } : {}),
    };
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

  createProtocol: async (payload: ProtocolCreateInput) => {
    const response = await axios.post<Protocol>('/library/protocols', payload);
    return response.data;
  },

  updateProtocol: async (id: string, payload: ProtocolUpdateInput) => {
    const response = await axios.patch<Protocol>(
      `/library/protocols/${id}`,
      payload,
    );
    return response.data;
  },

  archiveProtocol: async (id: string) => {
    await axios.delete(`/library/protocols/${id}`);
  },

  restoreProtocol: async (id: string) => {
    const response = await axios.post<Protocol>(
      `/library/protocols/${id}/restore`,
    );
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

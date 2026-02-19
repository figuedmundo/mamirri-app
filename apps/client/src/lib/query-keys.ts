export const queryKeys = {
  patients: {
    all: ['patients'] as const,
    lists: () => [...queryKeys.patients.all, 'list'] as const,
    list: (filters?: string) =>
      [...queryKeys.patients.lists(), { filters }] as const,
    details: () => [...queryKeys.patients.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.patients.details(), id] as const,
  },
  users: {
    all: ['users'] as const,
    me: () => ['users', 'me'] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
  },
  media: {
    all: ['media'] as const,
    lists: () => [...queryKeys.media.all, 'list'] as const,
    list: (filters?: { patientId?: string; caseId?: string }) =>
      [...queryKeys.media.lists(), { filters }] as const,
    details: () => [...queryKeys.media.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.media.details(), id] as const,
  },
  aiAnalysis: {
    all: ['ai-analysis'] as const,
    lists: () => [...queryKeys.aiAnalysis.all, 'list'] as const,
    list: (filters?: { caseId?: string }) =>
      [...queryKeys.aiAnalysis.lists(), { filters }] as const,
    details: () => [...queryKeys.aiAnalysis.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.aiAnalysis.details(), id] as const,
  },
  library: {
    all: ['library'] as const,
    categories: () => [...queryKeys.library.all, 'categories'] as const,
    protocols: () => [...queryKeys.library.all, 'protocols'] as const,
    protocolList: (categoryId?: string, includeDeleted?: boolean) =>
      [
        ...queryKeys.library.protocols(),
        { categoryId, includeDeleted },
      ] as const,
    protocolDetail: (id: string) =>
      [...queryKeys.library.protocols(), id] as const,
    references: () => [...queryKeys.library.all, 'references'] as const,
    search: (query: string) =>
      [...queryKeys.library.all, 'search', query] as const,
  },
} as const;

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const RESOURCE_STALE_TIMES = {
  patients: { staleTime: 5 * 60 * 1000, gcTime: 10 * 60 * 1000 },
  users: { staleTime: 10 * 60 * 1000, gcTime: 15 * 60 * 1000 },
  media: { staleTime: 0, gcTime: 5 * 60 * 1000 },
  'ai-analysis': { staleTime: 1 * 60 * 1000, gcTime: 5 * 60 * 1000 },
  library: { staleTime: 30 * 60 * 1000, gcTime: 60 * 60 * 1000 },
} as const;

export type ResourceType = keyof typeof RESOURCE_STALE_TIMES;

export function getQueryOptions(resource: ResourceType) {
  return {
    ...RESOURCE_STALE_TIMES[resource],
    retry: 1,
    refetchOnWindowFocus: false,
  } as const;
}

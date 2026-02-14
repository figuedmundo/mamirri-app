import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { libraryApi } from '../api/library';
import { queryKeys } from '../lib/query-keys';
import { getQueryOptions } from '../lib/query-client';
import { useToast } from './use-toast';

export function useCategoriesQuery() {
  return useQuery({
    queryKey: queryKeys.library.categories(),
    queryFn: libraryApi.findAllCategories,
    ...getQueryOptions('library'),
  });
}

export function useProtocolsQuery(categoryId?: string) {
  return useQuery({
    queryKey: queryKeys.library.protocolList(categoryId),
    queryFn: () => libraryApi.findAllProtocols(categoryId),
    ...getQueryOptions('library'),
  });
}

export function useProtocolQuery(id: string) {
  return useQuery({
    queryKey: queryKeys.library.protocolDetail(id),
    queryFn: () => libraryApi.findOneProtocol(id),
    enabled: !!id,
    ...getQueryOptions('library'),
  });
}

export function useReferencesQuery() {
  return useQuery({
    queryKey: queryKeys.library.references(),
    queryFn: libraryApi.findAllReferences,
    ...getQueryOptions('library'),
  });
}

export function useLibrarySearch(query: string) {
  return useQuery({
    queryKey: queryKeys.library.search(query),
    queryFn: () => libraryApi.search(query),
    enabled: query.length >= 3,
    ...getQueryOptions('library'),
    staleTime: 0,
  });
}

export function useAddProtocolToPlan() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      planId,
      protocolId,
      notes,
    }: {
      planId: string;
      protocolId: string;
      notes?: string;
    }) => libraryApi.addProtocolToPlan(planId, protocolId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.patients.lists() });
      toast({
        title: 'Éxito',
        description: 'Protocolo añadido al plan de tratamiento',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo añadir el protocolo al plan',
        variant: 'destructive',
      });
    },
  });
}

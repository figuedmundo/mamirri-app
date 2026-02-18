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
  return useProtocolsWithDeletedQuery(categoryId, false);
}

export function useProtocolsWithDeletedQuery(
  categoryId?: string,
  includeDeleted = false,
) {
  return useQuery({
    queryKey: queryKeys.library.protocolList(categoryId, includeDeleted),
    queryFn: () => libraryApi.findAllProtocols(categoryId, includeDeleted),
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

export function useCreateProtocol() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: libraryApi.createProtocol,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.library.protocols(),
      });
      toast({ title: 'Éxito', description: 'Protocolo creado correctamente' });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo crear el protocolo',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateProtocol() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Parameters<typeof libraryApi.updateProtocol>[1];
    }) => libraryApi.updateProtocol(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.library.protocols(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.library.protocolDetail(variables.id),
      });
      toast({
        title: 'Éxito',
        description: 'Protocolo actualizado correctamente',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el protocolo',
        variant: 'destructive',
      });
    },
  });
}

export function useArchiveProtocol() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => libraryApi.archiveProtocol(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.library.protocols(),
      });
      toast({
        title: 'Archivado',
        description: 'Protocolo archivado correctamente',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo archivar el protocolo',
        variant: 'destructive',
      });
    },
  });
}

export function useRestoreProtocol() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => libraryApi.restoreProtocol(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.library.protocols(),
      });
      toast({
        title: 'Restaurado',
        description: 'Protocolo restaurado correctamente',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo restaurar el protocolo',
        variant: 'destructive',
      });
    },
  });
}

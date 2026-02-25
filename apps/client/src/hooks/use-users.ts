import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  usersApi,
  type UpdateUserDto,
  type ChangePasswordDto,
} from '../api/users';
import { queryKeys } from '../lib/query-keys';
import { useToast } from './use-toast';
import { isAxiosError } from 'axios';

export function useUserQuery() {
  return useQuery({
    queryKey: queryKeys.users.me(),
    queryFn: () => usersApi.getMe(),
  });
}

export function useUpdateUserMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: UpdateUserDto) => usersApi.updateProfile(data),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(queryKeys.users.me(), updatedUser);
      toast({
        title: 'Éxito',
        description: 'Perfil actualizado correctamente',
      });
    },
    onError: (error) => {
      const message =
        isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : 'Error al actualizar el perfil';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    },
  });
}

export function useChangePasswordMutation() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: ChangePasswordDto) => usersApi.changePassword(data),
    onSuccess: () => {
      toast({
        title: 'Éxito',
        description: 'Contraseña actualizada correctamente',
      });
    },
    onError: (error) => {
      const message =
        isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : 'Error al cambiar la contraseña';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    },
  });
}

export function useUploadPhotoMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (file: File) => usersApi.uploadPhoto(file),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(queryKeys.users.me(), updatedUser);
      toast({
        title: 'Éxito',
        description: 'Foto de perfil actualizada',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Error al subir la foto',
        variant: 'destructive',
      });
    },
  });
}

export function useDeletePhotoMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: () => usersApi.deletePhoto(),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(queryKeys.users.me(), updatedUser);
      toast({
        title: 'Éxito',
        description: 'Foto de perfil eliminada',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Error al eliminar la foto',
        variant: 'destructive',
      });
    },
  });
}

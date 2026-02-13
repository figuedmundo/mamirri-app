import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { mediaApi } from '../api/media';
import { queryKeys } from '../lib/query-keys';
import { useToast } from './use-toast';

export function useUploadPatientPhoto() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ patientId, file }: { patientId: string; file: Blob }) =>
      mediaApi.uploadPatientPhoto(patientId, file),
    onSuccess: (_, { patientId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.patients.detail(patientId),
      });
      toast({ title: 'Éxito', description: 'Foto del paciente actualizada' });
    },
  });
}

export function useUploadFootprint() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      evaluationId,
      file,
      type,
      side,
    }: {
      evaluationId: string;
      file: Blob;
      type: 'initial' | 'final' | 'followup';
      side?: 'left' | 'right' | 'unknown';
    }) => mediaApi.uploadFootprint(evaluationId, file, type, side),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.patients.all });
      toast({ title: 'Éxito', description: 'Huella subida correctamente' });
    },
  });
}

export function useUploadPostureVideo() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      evaluationId,
      file,
      type,
      duration,
    }: {
      evaluationId: string;
      file: Blob;
      type: 'gait' | 'static' | 'dynamic';
      duration: number;
    }) => mediaApi.uploadPostureVideo(evaluationId, file, type, duration),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.patients.all });
      toast({ title: 'Éxito', description: 'Video de postura subido' });
    },
  });
}

export function useUploadSessionPhoto() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      sessionId,
      file,
      caption,
    }: {
      sessionId: string;
      file: Blob;
      caption?: string;
    }) => mediaApi.uploadSessionPhoto(sessionId, file, caption),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.patients.all });
      toast({ title: 'Éxito', description: 'Foto de sesión subida' });
    },
  });
}

export function useUploadEvaluationVoiceNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      evaluationId,
      file,
      durationSeconds,
    }: {
      evaluationId: string;
      file: Blob;
      durationSeconds: number;
    }) =>
      mediaApi.uploadEvaluationVoiceNote(evaluationId, file, durationSeconds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.patients.all });
    },
  });
}

export function useUploadSessionVoiceNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      sessionId,
      file,
      durationSeconds,
    }: {
      sessionId: string;
      file: Blob;
      durationSeconds: number;
    }) => mediaApi.uploadSessionVoiceNote(sessionId, file, durationSeconds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.patients.all });
    },
  });
}

export function useVoiceNoteStatus(
  entityType: 'evaluations' | 'sessions',
  entityId: string,
  voiceNoteId: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: [...queryKeys.media.all, 'voice-note', voiceNoteId],
    queryFn: () =>
      mediaApi.getVoiceNoteStatus(entityType, entityId, voiceNoteId),
    refetchInterval: (query) => {
      return query.state.data?.transcriptionStatus === 'processing'
        ? 2000
        : false;
    },
    ...options,
  });
}

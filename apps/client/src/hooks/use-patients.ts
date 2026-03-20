import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { patientsApi } from '../api/patients';
import type {
  CreateClinicalCaseDto,
  CreatePatientDto,
  CreateTreatmentSessionDto,
  UpdateClinicalCaseDto,
  UpdateEvaluationDto,
  UpdateTreatmentSessionDto,
  UpdateTreatmentPlanObjectivesDto,
} from '../api/patients';
import { queryKeys } from '../lib/query-keys';
import { getQueryOptions } from '../lib/query-client';
import { useToast } from './use-toast';

export function usePatientsQuery() {
  return useQuery({
    queryKey: queryKeys.patients.list(),
    queryFn: patientsApi.findAll,
    ...getQueryOptions('patients'),
  });
}

export function usePatientQuery(id: string) {
  return useQuery({
    queryKey: queryKeys.patients.detail(id),
    queryFn: () => patientsApi.findOne(id),
    enabled: !!id,
    ...getQueryOptions('patients'),
  });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreatePatientDto) => patientsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.patients.lists() });
      toast({ title: 'Éxito', description: 'Paciente creado correctamente' });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo crear el paciente',
        variant: 'destructive',
      });
    },
  });
}

export function useCreateCase() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateClinicalCaseDto) => patientsApi.createCase(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.patients.lists() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.patients.detail(variables.patientId),
      });
      toast({
        title: 'Exito',
        description: 'Caso clinico creado correctamente',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo crear el caso clinico',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateCase() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      patientId: string;
      data: UpdateClinicalCaseDto;
    }) => patientsApi.updateCase(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.patients.lists() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.patients.detail(variables.patientId),
      });
      toast({
        title: 'Éxito',
        description: 'Caso clínico actualizado correctamente',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el caso clínico',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdatePatient() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreatePatientDto>;
    }) => patientsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.patients.lists() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.patients.detail(variables.id),
      });
      toast({
        title: 'Éxito',
        description: 'Paciente actualizado correctamente',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el paciente',
        variant: 'destructive',
      });
    },
  });
}

export function useDeletePatient() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => patientsApi.delete(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.patients.lists() });
      queryClient.removeQueries({
        queryKey: queryKeys.patients.detail(deletedId),
      });
      toast({
        title: 'Eliminado',
        description: 'El paciente ha sido eliminado',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el paciente',
        variant: 'destructive',
      });
    },
  });
}

export function useAddSession() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      caseId,
      data,
    }: {
      caseId: string;
      data: CreateTreatmentSessionDto;
    }) => patientsApi.addSession(caseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.patients.lists() });
      toast({ title: 'Éxito', description: 'Sesión agregada correctamente' });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo agregar la sesión',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateSession() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      sessionId,
      data,
    }: {
      sessionId: string;
      data: UpdateTreatmentSessionDto;
    }) => patientsApi.updateSession(sessionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.patients.lists() });
      toast({
        title: 'Éxito',
        description: 'Sesión actualizada correctamente',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la sesión',
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteSession() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (sessionId: string) => patientsApi.deleteSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.patients.lists() });
      toast({ title: 'Eliminado', description: 'La sesión ha sido eliminada' });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la sesión',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateEvaluation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEvaluationDto }) =>
      patientsApi.updateEvaluation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.patients.all });
    },
  });
}

export function useUpdateTreatmentPlanObjectives() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      planId,
      data,
    }: {
      planId: string;
      data: UpdateTreatmentPlanObjectivesDto;
    }) => patientsApi.updateTreatmentPlanObjectives(planId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.patients.lists() });
      toast({
        title: 'Éxito',
        description: 'Objetivos del plan actualizados correctamente',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudieron actualizar los objetivos',
        variant: 'destructive',
      });
    },
  });
}

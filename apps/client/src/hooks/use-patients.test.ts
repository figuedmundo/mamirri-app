import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as React from 'react';
import {
  usePatientsQuery,
  usePatientQuery,
  useCreatePatient,
  useCreateCase,
  useUpdatePatient,
  useDeletePatient,
} from './use-patients';
import { patientsApi } from '../api/patients';

vi.mock('../api/patients');

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const createWrapper = (client: QueryClient) => {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client }, children);
  };
};

describe('use-patients', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('usePatientsQuery', () => {
    it('returns patient data on successful fetch', async () => {
      const mockPatients = [
        {
          id: '1',
          name: 'John Doe',
          occupation: 'Engineer',
          phone: '123456789',
          birthDate: '1990-01-01',
          emergencyContact: { name: 'Jane Doe', phone: '987654321' },
          medicalFlags: [],
          isActive: true,
          createdAt: '2023-01-01',
          clinicalCases: [],
        },
      ];
      vi.mocked(patientsApi.findAll).mockResolvedValue(mockPatients);

      const queryClient = createQueryClient();
      const { result } = renderHook(() => usePatientsQuery(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockPatients);
      expect(patientsApi.findAll).toHaveBeenCalledOnce();
    });
  });

  describe('usePatientQuery', () => {
    it('returns single patient by id', async () => {
      const mockPatient = {
        id: '1',
        name: 'Jane Smith',
        occupation: 'Doctor',
        phone: '555123456',
        birthDate: '1985-05-15',
        emergencyContact: { name: 'Bob Smith', phone: '555789123' },
        medicalFlags: [],
        isActive: true,
        createdAt: '2023-01-01',
        clinicalCases: [],
      };
      vi.mocked(patientsApi.findOne).mockResolvedValue(mockPatient);

      const queryClient = createQueryClient();
      const { result } = renderHook(() => usePatientQuery('1'), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockPatient);
      expect(patientsApi.findOne).toHaveBeenCalledWith('1');
    });

    it('does not fetch when id is empty', () => {
      const queryClient = createQueryClient();
      const { result } = renderHook(() => usePatientQuery(''), {
        wrapper: createWrapper(queryClient),
      });

      expect(result.current.isPending).toBe(true);
      expect(patientsApi.findOne).not.toHaveBeenCalled();
    });
  });

  describe('useCreatePatient', () => {
    it('creates patient and invalidates queries', async () => {
      const newPatient = {
        name: 'New Patient',
        occupation: 'Teacher',
        phone: '111222333',
        birthDate: '1995-10-20',
        emergencyContact: { name: 'Emergency', phone: '999888777' },
        medicalFlags: [],
      };
      const createdPatient = {
        ...newPatient,
        id: '2',
        isActive: true,
        createdAt: '2023-02-01',
        clinicalCases: [],
      };
      vi.mocked(patientsApi.create).mockResolvedValue(createdPatient);

      const queryClient = createQueryClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useCreatePatient(), {
        wrapper: createWrapper(queryClient),
      });

      await result.current.mutateAsync(newPatient);

      expect(patientsApi.create).toHaveBeenCalledWith(newPatient);
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['patients', 'list'],
      });
    });
  });

  describe('useCreateCase', () => {
    it('creates case and invalidates list and detail queries', async () => {
      const createdCase = {
        id: 'case-1',
        patientId: '1',
        title: 'Dolor de hombro',
        status: 'active',
        startDate: '2026-03-01',
        consultationReason: 'Dolor en rotacion externa',
      };

      vi.mocked(patientsApi.createCase).mockResolvedValue(createdCase as never);

      const queryClient = createQueryClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useCreateCase(), {
        wrapper: createWrapper(queryClient),
      });

      await result.current.mutateAsync({
        patientId: '1',
        title: 'Dolor de hombro',
        consultationReason: 'Dolor en rotacion externa',
      });

      expect(patientsApi.createCase).toHaveBeenCalledWith({
        patientId: '1',
        title: 'Dolor de hombro',
        consultationReason: 'Dolor en rotacion externa',
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['patients', 'list'],
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['patients', 'detail', '1'],
      });
    });

    it('returns error state when create case fails', async () => {
      vi.mocked(patientsApi.createCase).mockRejectedValue(new Error('boom'));

      const queryClient = createQueryClient();
      const { result } = renderHook(() => useCreateCase(), {
        wrapper: createWrapper(queryClient),
      });

      await expect(
        result.current.mutateAsync({
          patientId: '1',
          title: 'x',
        }),
      ).rejects.toThrow('boom');
    });
  });

  describe('useUpdatePatient', () => {
    it('updates patient and invalidates queries', async () => {
      const updateData = {
        name: 'Updated Name',
      };
      const updatedPatient = {
        id: '1',
        name: 'Updated Name',
        occupation: 'Engineer',
        phone: '123456789',
        birthDate: '1990-01-01',
        emergencyContact: { name: 'Jane Doe', phone: '987654321' },
        medicalFlags: [],
        isActive: true,
        createdAt: '2023-01-01',
        clinicalCases: [],
      };
      vi.mocked(patientsApi.update).mockResolvedValue(updatedPatient);

      const queryClient = createQueryClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useUpdatePatient(), {
        wrapper: createWrapper(queryClient),
      });

      await result.current.mutateAsync({ id: '1', data: updateData });

      expect(patientsApi.update).toHaveBeenCalledWith('1', updateData);
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['patients', 'list'],
      });
    });
  });

  describe('useDeletePatient', () => {
    it('deletes patient and invalidates queries', async () => {
      vi.mocked(patientsApi.delete).mockResolvedValue(undefined);

      const queryClient = createQueryClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
      const removeSpy = vi.spyOn(queryClient, 'removeQueries');

      const { result } = renderHook(() => useDeletePatient(), {
        wrapper: createWrapper(queryClient),
      });

      await result.current.mutateAsync('1');

      expect(patientsApi.delete).toHaveBeenCalledWith('1');
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['patients', 'list'],
      });
      expect(removeSpy).toHaveBeenCalledWith({
        queryKey: ['patients', 'detail', '1'],
      });
    });
  });
});

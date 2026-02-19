import { useMemo } from 'react';
import { useAuth } from './use-auth';
import type { ClinicContext } from '../context/types';

export const useClinic = (): ClinicContext => {
  const { user } = useAuth();

  return useMemo(
    () => ({
      clinicId: user?.clinicId ?? null,
      clinicName: user?.clinicName ?? null,
      role: user?.role ?? null,
      isAdmin: user?.role === 'ADMIN',
      isClinicOwner: user?.role === 'CLINIC_OWNER',
    }),
    [user],
  );
};

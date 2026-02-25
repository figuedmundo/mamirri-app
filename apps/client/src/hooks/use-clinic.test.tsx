import { describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import React from 'react';
import { AuthContext } from '../context/auth-context-base';
import { useClinic } from './use-clinic';
import type { AuthContextType } from '../context/types';

const baseContext: AuthContextType = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  hasPinSet: null,
  login: () => undefined,
  logout: async () => undefined,
  checkPinStatus: async () => false,
  updateUser: () => undefined,
};

describe('useClinic', () => {
  it('returns clinic context from authenticated user', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthContext.Provider
        value={{
          ...baseContext,
          user: {
            id: 'u-1',
            email: 'owner@test.com',
            name: 'Owner',
            role: 'CLINIC_OWNER',
            clinicId: 'clinic-1',
            clinicName: 'Mamirri Clinic',
          },
          isAuthenticated: true,
        }}
      >
        {children}
      </AuthContext.Provider>
    );

    const { result } = renderHook(() => useClinic(), { wrapper });

    expect(result.current.clinicId).toBe('clinic-1');
    expect(result.current.clinicName).toBe('Mamirri Clinic');
    expect(result.current.isClinicOwner).toBe(true);
    expect(result.current.isAdmin).toBe(false);
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useUserQuery, useUpdateUserMutation } from './use-users';
import { usersApi } from '../api/users';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

vi.mock('../api/users', () => ({
  usersApi: {
    getMe: vi.fn(),
    updateProfile: vi.fn(),
  },
}));

vi.mock('./use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('use-users hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useUserQuery', () => {
    it('fetches current user', async () => {
      const mockUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
      };
      vi.mocked(usersApi.getMe).mockResolvedValue(
        mockUser as unknown as Awaited<ReturnType<typeof usersApi.getMe>>,
      );

      const { result } = renderHook(() => useUserQuery(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockUser);
    });
  });

  describe('useUpdateUserMutation', () => {
    it('updates user profile', async () => {
      const updatedUser = { id: '1', name: 'Updated Name' };
      vi.mocked(usersApi.updateProfile).mockResolvedValue(
        updatedUser as unknown as Awaited<
          ReturnType<typeof usersApi.updateProfile>
        >,
      );

      const { result } = renderHook(() => useUpdateUserMutation(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ name: 'Updated Name' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(updatedUser);
      expect(usersApi.updateProfile).toHaveBeenCalledWith({
        name: 'Updated Name',
      });
    });
  });
});

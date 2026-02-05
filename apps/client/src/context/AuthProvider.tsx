import React, { useEffect, useState } from 'react';
import { api } from '../lib/axios';
import { AuthContext } from './auth-context-base';
import type { User } from './types';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPinSet, setHasPinSet] = useState<boolean | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('access_token');
      const storedUser = localStorage.getItem('user_data');

      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          // Check PIN status if we have a token
          try {
            const response = await api.get('/auth/pin/status');
            setHasPinSet(response.data.hasPinSet);
          } catch (e) {
            console.error('Failed to fetch PIN status:', e);
          }
        } catch (error) {
          console.error('Failed to parse stored user data:', error);
          localStorage.removeItem('access_token');
          localStorage.removeItem('user_data');
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (userData: User, token: string) => {
    setUser(userData);
    localStorage.setItem('access_token', token);
    localStorage.setItem('user_data', JSON.stringify(userData));
    localStorage.setItem('last_user_email', userData.email);
    localStorage.setItem('last_user_name', userData.name);
    checkPinStatus();
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await api.post('/auth/logout');
    } finally {
      setUser(null);
      setHasPinSet(null);
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_data');
      setIsLoading(false);
    }
  };

  const checkPinStatus = async () => {
    try {
      const response = await api.get('/auth/pin/status');
      setHasPinSet(response.data.hasPinSet);
      return response.data.hasPinSet;
    } catch (e) {
      console.error('Failed to check PIN status:', e);
      return false;
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    localStorage.setItem('user_data', JSON.stringify(updatedUser));
    if (userData.email) {
      localStorage.setItem('last_user_email', userData.email);
    }
    if (userData.name) {
      localStorage.setItem('last_user_name', userData.name);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        hasPinSet,
        login,
        logout,
        checkPinStatus,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

import axios from '../lib/axios';
import type { User } from '../context/types';

export interface UpdateUserDto {
  email?: string;
  name?: string;
  phone?: string;
  clinicName?: string;
  licenseNumber?: string;
  specialty?: string;
  yearsExperience?: number;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export const usersApi = {
  getMe: async () => {
    const response = await axios.get<User>('/users/me');
    return response.data;
  },

  updateProfile: async (data: UpdateUserDto) => {
    const response = await axios.patch<User>('/users/me', data);
    return response.data;
  },

  changePassword: async (data: ChangePasswordDto) => {
    await axios.patch('/users/me/password', data);
  },

  uploadPhoto: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post<User>('/users/me/photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deletePhoto: async () => {
    const response = await axios.delete<User>('/users/me/photo');
    return response.data;
  },
};

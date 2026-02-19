import axios from '../lib/axios';

export interface ClinicSummary {
  id: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    users: number;
    patients: number;
  };
}

export interface TherapistSummary {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

export interface InviteTherapistPayload {
  email: string;
  role?: 'THERAPIST' | 'CLINIC_OWNER';
}

export interface AcceptInvitePayload {
  token: string;
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
}

export const clinicsApi = {
  listAll: async () => {
    const response = await axios.get<ClinicSummary[]>('/clinics/admin/all');
    return response.data;
  },

  getById: async (clinicId: string) => {
    const response = await axios.get<ClinicSummary>(`/clinics/${clinicId}`);
    return response.data;
  },

  updateById: async (
    clinicId: string,
    payload: Partial<
      Pick<ClinicSummary, 'name' | 'address' | 'phone' | 'email'>
    >,
  ) => {
    const response = await axios.patch<ClinicSummary>(
      `/clinics/${clinicId}`,
      payload,
    );
    return response.data;
  },

  listTherapists: async (clinicId: string) => {
    const response = await axios.get<TherapistSummary[]>(
      `/clinics/${clinicId}/therapists`,
    );
    return response.data;
  },

  inviteTherapist: async (
    clinicId: string,
    payload: InviteTherapistPayload,
  ) => {
    const response = await axios.post(`/clinics/${clinicId}/invite`, payload);
    return response.data;
  },

  updateTherapist: async (
    clinicId: string,
    userId: string,
    payload: { role?: 'THERAPIST' | 'CLINIC_OWNER' },
  ) => {
    const response = await axios.patch(
      `/clinics/${clinicId}/therapists/${userId}`,
      payload,
    );
    return response.data;
  },

  removeTherapist: async (clinicId: string, userId: string) => {
    await axios.delete(`/clinics/${clinicId}/therapists/${userId}`);
  },

  getInvitation: async (token: string) => {
    const response = await axios.get(`/auth/invite/${token}`);
    return response.data;
  },

  acceptInvitation: async (payload: AcceptInvitePayload) => {
    const response = await axios.post('/auth/invite/accept', payload);
    return response.data;
  },
};

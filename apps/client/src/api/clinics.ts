import axios from '../lib/axios';

export interface ClinicSummary {
  id: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  logoUrl?: string | null;
  subdomain?: string | null;
  businessHours?: Record<string, unknown> | null;
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
  token: string;
  createdAt: string;
}

export interface InvitationSummary {
  id: string;
  email: string;
  role: string;
  token: string;
  createdAt: string;
  usedAt: string | null;
  expiresAt: string;
  status: 'ACCEPTED' | 'PENDING' | 'EXPIRED';
}

export interface InviteTherapistResponse {
  id: string;
  clinicId: string;
  email: string;
  role: string;
  token: string;
  expiresAt: string;
  inviteUrl: string;
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
  licenseNumber?: string;
}

export interface CreateClinicResponse {
  clinic: ClinicSummary;
  accessToken?: string;
  refreshToken?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  token: string;
    clinicId: string | null;
    clinicName: string | null;
  };
}

export interface CreateClinicPayload {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  logoUrl?: string;
  businessHours?: Record<string, unknown>;
  subdomain?: string;
  initialInvitations?: Array<{
    email: string;
    role?: 'THERAPIST' | 'CLINIC_OWNER';
  }>;
}

export const clinicsApi = {
  uploadClinicLogo: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', 'clinics/logos');

    const response = await axios.post<{ path: string }>(
      '/storage/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );

    return response.data.path;
  },

  listAll: async () => {
    const response = await axios.get<ClinicSummary[]>('/clinics/admin/all');
    return response.data;
  },

  getById: async (clinicId: string) => {
    const response = await axios.get<ClinicSummary>(`/clinics/${clinicId}`);
    return response.data;
  },

  create: async (payload: CreateClinicPayload) => {
    const response = await axios.post<CreateClinicResponse>('/clinics', payload);
    return response.data;
  },

  checkNameAvailability: async (name: string) => {
    const response = await axios.get<{ available: boolean }>(
      '/clinics/check-name',
      {
        params: { name },
      },
    );
    return response.data;
  },

  updateById: async (
    clinicId: string,
    payload: Partial<
      Pick<
        ClinicSummary,
        | 'name'
        | 'address'
        | 'phone'
        | 'email'
        | 'logoUrl'
        | 'subdomain'
        | 'businessHours'
      >
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
    const response = await axios.post<InviteTherapistResponse>(
      `/clinics/${clinicId}/invite`,
      payload,
    );
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

  migrateSoloPatients: async (clinicId: string) => {
    const response = await axios.post<{
      clinicId: string;
      migratedCount: number;
    }>(`/clinics/${clinicId}/migrate-solo-patients`);
    return response.data;
  },

  listInvitations: async (clinicId: string) => {
    const response = await axios.get<InvitationSummary[]>(
      `/clinics/${clinicId}/invitations`,
    );
    return response.data;
  },

  getInvitation: async (token: string) => {
    const response = await axios.get(`/auth/invite/${token}`);
    return response.data;
  },

  acceptInvitation: async ({ confirmPassword, ...payload }: AcceptInvitePayload) => {
    const response = await axios.post('/auth/invite/accept', payload);
    return response.data;
  },
};

import { api } from '../lib/axios';

export interface ClinicOnboardingData {
  clinicName: string;
  clinicEmail: string;
  clinicPhone?: string;
  clinicAddress?: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
  adminLicenseNumber?: string;
}

export interface OnboardingResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    clinicId: string;
    clinicName: string;
    licenseNumber: string | null;
  };
  clinic: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    isActive: boolean;
    createdAt: string;
  };
  accessToken: string;
  refreshToken: string;
}

export interface CheckNameResponse {
  available: boolean;
}

export const onboardingApi = {
  async createClinicWithAdmin(
    data: ClinicOnboardingData,
  ): Promise<OnboardingResponse> {
    const response = await api.post<OnboardingResponse>(
      '/onboarding/clinic',
      data,
    );
    return response.data;
  },

  async checkNameAvailability(name: string): Promise<CheckNameResponse> {
    const response = await api.get<CheckNameResponse>(
      '/onboarding/check-name',
      {
        params: { name },
      },
    );
    return response.data;
  },
};

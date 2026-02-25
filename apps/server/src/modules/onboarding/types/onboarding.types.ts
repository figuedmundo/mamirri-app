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
    createdAt: Date;
  };
  accessToken: string;
  refreshToken: string;
}

export interface CheckNameResponse {
  available: boolean;
}

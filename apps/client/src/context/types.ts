export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  clinicId?: string | null;
  phone?: string;
  profilePhotoUrl?: string;
  clinicName?: string;
  licenseNumber?: string;
  specialty?: string;
  yearsExperience?: number;
  profileNudgeDismissed?: boolean;
  createdAt?: string;
}

export interface ClinicContext {
  clinicId: string | null;
  clinicName: string | null;
  role: string | null;
  isAdmin: boolean;
  isClinicOwner: boolean;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasPinSet: boolean | null;
  login: (user: User, accessToken: string) => void;
  logout: () => void;
  checkPinStatus: () => Promise<boolean>;
  updateUser: (userData: Partial<User>) => void;
}

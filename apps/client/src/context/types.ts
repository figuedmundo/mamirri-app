export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasPinSet: boolean | null;
  login: (user: User, accessToken: string) => void;
  logout: () => void;
  checkPinStatus: () => Promise<boolean>;
}

import type { Role } from '../../../common/constants/roles';

export type AuthUser = {
  userId: string;
  email: string;
  role: Role;
  clinicId: string | null;
};

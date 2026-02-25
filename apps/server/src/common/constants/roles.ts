export const ROLES = {
  ADMIN: 'ADMIN',
  CLINIC_OWNER: 'CLINIC_OWNER',
  THERAPIST: 'THERAPIST',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

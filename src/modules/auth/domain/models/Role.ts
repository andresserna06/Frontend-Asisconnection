import type { RoleCode } from '@/shared/domain/models/RoleCode';

// Backend role codes (same for every course project).
export type { RoleCode } from '@/shared/domain/models/RoleCode';

export type Role = {
  code: RoleCode;
  // User-facing label (Spanish).
  label: string;
  // Lower number wins when a user has several roles.
  priority: number;
};

// Single source of truth for every role attribute: change roles only here.
export const ROLES: Record<RoleCode, Role> = {
  ADMIN: { code: 'ADMIN', label: 'Administrador', priority: 1 },
  MODERATOR: { code: 'MODERATOR', label: 'Moderador', priority: 2 },
  VOLUNTARIO: { code: 'VOLUNTARIO', label: 'Voluntario', priority: 3 },
  ACUDIENTE: { code: 'ACUDIENTE', label: 'Acudiente', priority: 4 },
  BENEFICIARIO: { code: 'BENEFICIARIO', label: 'Beneficiario', priority: 5 },
  INVERSOR: { code: 'INVERSOR', label: 'Inversor', priority: 6 },
};

// Narrows a role string sent by the backend to a known code.
export function isRoleCode(value: string): value is RoleCode {
  return Object.prototype.hasOwnProperty.call(ROLES, value);
}

// Role shown next to a user's name.
export function getPrimaryRole(codes: readonly RoleCode[]): Role | null {
  return codes
    .map((code) => ROLES[code])
    .reduce<Role | null>(
      (best, role) => (best === null || role.priority < best.priority ? role : best),
      null,
    );
}

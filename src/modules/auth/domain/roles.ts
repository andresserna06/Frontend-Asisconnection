// Backend roles (same for every course project). Ordered by display priority:
// when a user has several roles, the first one in this list is shown.
export const ROLES = ['ADMIN', 'TALLERISTA', 'ESTUDIANTE', 'ACUDIENTE', 'DONANTE'] as const;

export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: 'Administrador',
  TALLERISTA: 'Tallerista',
  ESTUDIANTE: 'Estudiante',
  ACUDIENTE: 'Acudiente',
  DONANTE: 'Donante',
};

export function getPrimaryRole(roles: readonly Role[]): Role | null {
  return ROLES.find((role) => roles.includes(role)) ?? null;
}

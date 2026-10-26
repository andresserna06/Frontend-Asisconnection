// Backend role codes (same for every course project).
export type RoleCode = 'ADMIN' | 'TALLERISTA' | 'ESTUDIANTE' | 'ACUDIENTE' | 'DONANTE';

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
  TALLERISTA: { code: 'TALLERISTA', label: 'Tallerista', priority: 2 },
  ESTUDIANTE: { code: 'ESTUDIANTE', label: 'Estudiante', priority: 3 },
  ACUDIENTE: { code: 'ACUDIENTE', label: 'Acudiente', priority: 4 },
  DONANTE: { code: 'DONANTE', label: 'Donante', priority: 5 },
};

// Role shown next to a user's name.
export function getPrimaryRole(codes: readonly RoleCode[]): Role | null {
  return codes
    .map((code) => ROLES[code])
    .reduce<Role | null>(
      (best, role) => (best === null || role.priority < best.priority ? role : best),
      null,
    );
}

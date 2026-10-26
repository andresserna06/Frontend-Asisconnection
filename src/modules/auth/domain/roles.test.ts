import { getPrimaryRole, ROLE_LABELS, ROLES } from './roles';

describe('getPrimaryRole', () => {
  it('returns the only role a user has', () => {
    expect(getPrimaryRole(['DONANTE'])).toBe('DONANTE');
  });

  it('picks the highest-priority role regardless of input order', () => {
    expect(getPrimaryRole(['ACUDIENTE', 'TALLERISTA'])).toBe('TALLERISTA');
    expect(getPrimaryRole(['DONANTE', 'ESTUDIANTE', 'ADMIN'])).toBe('ADMIN');
  });

  it('returns null when there are no roles', () => {
    expect(getPrimaryRole([])).toBeNull();
  });
});

describe('ROLE_LABELS', () => {
  it('has a Spanish label for every role', () => {
    ROLES.forEach((role) => expect(ROLE_LABELS[role]).toBeTruthy());
  });
});

import { getPrimaryRole, ROLES, type RoleCode } from './Role';

describe('getPrimaryRole', () => {
  it('returns the only role a user has', () => {
    expect(getPrimaryRole(['INVERSOR'])).toBe(ROLES.INVERSOR);
  });

  it('picks the highest-priority role regardless of input order', () => {
    expect(getPrimaryRole(['ACUDIENTE', 'VOLUNTARIO'])).toBe(ROLES.VOLUNTARIO);
    expect(getPrimaryRole(['INVERSOR', 'MODERATOR', 'ADMIN'])).toBe(ROLES.ADMIN);
  });

  it('returns null when there are no roles', () => {
    expect(getPrimaryRole([])).toBeNull();
  });
});

describe('ROLES', () => {
  const codes = Object.keys(ROLES) as RoleCode[];

  it('keys each role by its own code', () => {
    codes.forEach((code) => expect(ROLES[code].code).toBe(code));
  });

  it('has a label and a unique priority for every role', () => {
    const priorities = codes.map((code) => ROLES[code].priority);
    codes.forEach((code) => expect(ROLES[code].label).toBeTruthy());
    expect(new Set(priorities).size).toBe(codes.length);
  });
});

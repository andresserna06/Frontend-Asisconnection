import { AuthError } from '@/modules/auth/domain/models/AuthError';

import { mapFieldErrors, mapLoginResponse, mapProfileResponse, parseRoles } from './authMappers';

describe('mapLoginResponse', () => {
  it('reads the token at the top level or inside a wrapper', () => {
    expect(mapLoginResponse({ token: 'abc', roles: ['DONANTE'] })).toBe('abc');
    expect(mapLoginResponse({ data: { accessToken: 'xyz' } })).toBe('xyz');
  });

  it('fails with an unknown error when there is no token', () => {
    expect(() => mapLoginResponse({ ok: true })).toThrow(AuthError);
    expect(() => mapLoginResponse(null)).toThrow(AuthError);
  });
});

describe('mapProfileResponse', () => {
  it('maps a flat profile', () => {
    expect(
      mapProfileResponse({ username: 'maria', email: 'maria@prueba.com', roles: ['ACUDIENTE'] }),
    ).toEqual({ username: 'maria', email: 'maria@prueba.com', roles: ['ACUDIENTE'] });
  });

  it('maps a wrapped profile with Spanish field names and role objects', () => {
    expect(
      mapProfileResponse({
        usuario: {
          nombreUsuario: 'ana',
          correo: 'ana@prueba.com',
          roles: [{ nombre: 'TALLERISTA' }],
        },
      }),
    ).toEqual({ username: 'ana', email: 'ana@prueba.com', roles: ['TALLERISTA'] });
  });

  it('fails when required fields are missing', () => {
    expect(() => mapProfileResponse({ username: 'x' })).toThrow(AuthError);
  });
});

describe('parseRoles', () => {
  it('normalizes case, drops unknown roles and duplicates', () => {
    expect(parseRoles(['acudiente', 'ACUDIENTE', 'SUPERUSER', 42, { name: 'donante' }])).toEqual([
      'ACUDIENTE',
      'DONANTE',
    ]);
  });
});

describe('mapFieldErrors', () => {
  it('maps an object of backend fields to form fields', () => {
    expect(mapFieldErrors({ errores: { email: 'Correo inválido', clave: ['Requerida'] } })).toEqual(
      { email: 'Correo inválido', password: 'Requerida' },
    );
  });

  it('maps a list of field errors and ignores unknown fields', () => {
    expect(
      mapFieldErrors({
        errors: [
          { campo: 'clave', mensaje: 'Muy corta' },
          { field: 'rol', message: 'No permitido' },
        ],
      }),
    ).toEqual({ password: 'Muy corta' });
  });

  it('returns no field errors for an unexpected body', () => {
    expect(mapFieldErrors('Bad Request')).toEqual({});
  });
});

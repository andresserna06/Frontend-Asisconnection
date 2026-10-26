import { validateLoginForm } from './validateLoginForm';

describe('validateLoginForm', () => {
  it('accepts a valid email and any non-empty password', () => {
    expect(validateLoginForm({ email: 'maria@prueba.com', password: 'abc' })).toEqual({});
  });

  it('ignores surrounding spaces in the email', () => {
    expect(validateLoginForm({ email: '  maria@prueba.com ', password: 'x' })).toEqual({});
  });

  it('requires both fields', () => {
    expect(validateLoginForm({ email: '', password: '' })).toEqual({
      email: 'emailRequired',
      password: 'passwordRequired',
    });
  });

  it('flags a document number or malformed email as not an email', () => {
    expect(validateLoginForm({ email: '1053123456', password: 'x' }).email).toBe('emailNotEmail');
    expect(validateLoginForm({ email: 'maria@prueba', password: 'x' }).email).toBe('emailNotEmail');
  });

  it('does not enforce a minimum password length on login', () => {
    expect(
      validateLoginForm({ email: 'maria@prueba.com', password: '1' }).password,
    ).toBeUndefined();
  });
});

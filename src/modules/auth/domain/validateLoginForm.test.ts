import { validateLoginForm } from './validateLoginForm';

describe('validateLoginForm', () => {
  it('accepts a valid email, any non-empty password and express consent', () => {
    expect(
      validateLoginForm({ email: 'maria@prueba.com', password: 'abc', acceptConsent: true }),
    ).toEqual({});
  });

  it('ignores surrounding spaces in the email', () => {
    expect(
      validateLoginForm({ email: '  maria@prueba.com ', password: 'x', acceptConsent: true }),
    ).toEqual({});
  });

  it('requires email, password and consent', () => {
    expect(validateLoginForm({ email: '', password: '', acceptConsent: false })).toEqual({
      email: 'emailRequired',
      password: 'passwordRequired',
      acceptConsent: 'consentRequired',
    });
  });

  it('flags a document number or malformed email as not an email', () => {
    expect(
      validateLoginForm({ email: '1053123456', password: 'x', acceptConsent: true }).email,
    ).toBe('emailNotEmail');
    expect(
      validateLoginForm({ email: 'maria@prueba', password: 'x', acceptConsent: true }).email,
    ).toBe('emailNotEmail');
  });

  it('does not enforce a minimum password length on login', () => {
    expect(
      validateLoginForm({ email: 'maria@prueba.com', password: '1', acceptConsent: true }).password,
    ).toBeUndefined();
  });
});

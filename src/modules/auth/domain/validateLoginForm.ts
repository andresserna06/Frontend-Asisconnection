import type { LoginCredentials, LoginField } from './models/LoginCredentials';

export type LoginFormIssue =
  'emailRequired' | 'emailNotEmail' | 'passwordRequired' | 'consentRequired';

export type LoginFormIssues = Partial<Record<LoginField, LoginFormIssue>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Minimal client-side checks. Password length is NOT checked here: the 12-character
// rule applies only to sign-up.
export function validateLoginForm({
  email,
  password,
  acceptConsent,
}: LoginCredentials): LoginFormIssues {
  const issues: LoginFormIssues = {};
  const trimmedEmail = email.trim();

  if (trimmedEmail === '') {
    issues.email = 'emailRequired';
  } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
    // The field says "Correo o documento", but the backend only accepts email for now.
    issues.email = 'emailNotEmail';
  }

  if (password === '') {
    issues.password = 'passwordRequired';
  }

  // The backend requires express consent (Ley 1581 de 2012) on every login.
  if (!acceptConsent) {
    issues.acceptConsent = 'consentRequired';
  }

  return issues;
}

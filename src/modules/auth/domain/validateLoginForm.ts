import type { LoginCredentials, LoginField } from './models/LoginCredentials';

export type LoginFormIssue = 'emailRequired' | 'emailNotEmail' | 'passwordRequired';

export type LoginFormIssues = Partial<Record<LoginField, LoginFormIssue>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Minimal client-side checks. Password length is NOT checked here: the 12-character
// rule applies only to sign-up.
export function validateLoginForm({ email, password }: LoginCredentials): LoginFormIssues {
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

  return issues;
}

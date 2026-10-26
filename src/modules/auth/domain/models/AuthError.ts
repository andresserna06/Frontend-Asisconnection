import type { LoginField } from './LoginCredentials';

export type AuthErrorKind =
  'invalidCredentials' | 'sessionExpired' | 'forbidden' | 'network' | 'validation' | 'unknown';

// Field messages come from the backend (400 responses) and are shown as-is.
export type FieldErrors = Partial<Record<LoginField, string>>;

export class AuthError extends Error {
  readonly kind: AuthErrorKind;
  readonly fieldErrors: FieldErrors;

  constructor(kind: AuthErrorKind, fieldErrors: FieldErrors = {}) {
    super(kind);
    this.name = 'AuthError';
    this.kind = kind;
    this.fieldErrors = fieldErrors;
  }
}

export function toAuthError(error: unknown): AuthError {
  return error instanceof AuthError ? error : new AuthError('unknown');
}

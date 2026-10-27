// An expired session (401) is handled by auth (it signs out), so it is not listed here.
export type ProfileErrorKind = 'network' | 'unknown';

export class ProfileError extends Error {
  readonly kind: ProfileErrorKind;

  constructor(kind: ProfileErrorKind) {
    super(kind);
    this.name = 'ProfileError';
    this.kind = kind;
  }
}

export function toProfileError(error: unknown): ProfileError {
  return error instanceof ProfileError ? error : new ProfileError('unknown');
}

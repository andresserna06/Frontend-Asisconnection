export type PublicProfileErrorKind = 'conflict' | 'forbidden' | 'network' | 'notFound' | 'unknown';

export class PublicProfileError extends Error {
  readonly kind: PublicProfileErrorKind;

  constructor(kind: PublicProfileErrorKind) {
    super(kind);
    this.name = 'PublicProfileError';
    this.kind = kind;
  }
}

export function toPublicProfileError(error: unknown): PublicProfileError {
  return error instanceof PublicProfileError ? error : new PublicProfileError('unknown');
}

export type AdminErrorKind =
  'network' | 'forbidden' | 'invalidInput' | 'notFound' | 'conflict' | 'unknown';

export class AdminError extends Error {
  constructor(public readonly kind: AdminErrorKind) {
    super(kind);
    this.name = 'AdminError';
  }
}

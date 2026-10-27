export type ForumErrorKind = 'sessionExpired' | 'forbidden' | 'network' | 'unknown';

export class ForumError extends Error {
  constructor(readonly kind: ForumErrorKind) {
    super(kind);
    this.name = 'ForumError';
  }
}

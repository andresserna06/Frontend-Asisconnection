import type { RemovalTarget } from './models/RemovalTarget';

export type RemovalService = {
  // Direct backend deletion (DELETE /v1/posts/:id or DELETE /v1/comments/:id).
  deleteContent?(target: RemovalTarget): Promise<void>;
  // Moderators only: rejects the content, which removes it from every public list.
  hideForEveryone(target: RemovalTarget): Promise<void>;
  // Registered owners: marks it in their own profile, which hides it for everyone.
  removeOwnContent(target: RemovalTarget): Promise<void>;
  // Guests have no profile: they ask the moderators to do it.
  requestRemoval(target: RemovalTarget): Promise<void>;
};

export type RemovalErrorKind = 'limitReached' | 'rateLimited' | 'unavailable';

export class RemovalError extends Error {
  readonly kind: RemovalErrorKind;

  constructor(kind: RemovalErrorKind) {
    super(kind);
    this.name = 'RemovalError';
    this.kind = kind;
  }
}
